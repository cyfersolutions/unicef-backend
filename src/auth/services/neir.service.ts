import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

interface NeirUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role?: 'vaccinator' | 'supervisor';
  cnic: string;
}

interface NeirCallbackResponse {
  success: boolean;
  session_id: string;
  user_token: string;
  user_id: string;
  email: string;
}

@Injectable()
export class NeirService {
  private readonly axiosInstance: AxiosInstance;
  private readonly baseUrl: string;

  constructor(private configService: ConfigService) {
    this.baseUrl = this.configService.get<string>('NEIR_SSO_URL', 'http://localhost:4002');
    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      timeout: 10000,
    });
  }

  async verifyCallback(sessionId: string, neirToken: string): Promise<NeirCallbackResponse> {
    try {
      const response = await this.axiosInstance.post<NeirCallbackResponse>('/auth/callback', {
        session_id: sessionId,
        user_token: neirToken,
      });

      if (!response.data.success) {
        throw new HttpException('Invalid NEIR session or token', HttpStatus.UNAUTHORIZED);
      }

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new HttpException(
          error.response?.data?.error || 'Failed to verify NEIR callback',
          error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      throw new HttpException('Failed to verify NEIR callback', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getUserProfile(userId: string): Promise<NeirUser> {
    try {
      const response = await this.axiosInstance.get<NeirUser>(`/users/${userId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new HttpException(
          error.response?.data?.error || 'Failed to fetch user profile from NEIR',
          error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      throw new HttpException('Failed to fetch user profile from NEIR', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}

