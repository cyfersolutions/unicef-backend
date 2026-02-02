import { Controller, Post, Get, Body, Query, UseGuards, HttpCode, HttpStatus, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { CheckAuthResponseDto } from './dto/check-auth-response.dto';
import { NeirCallbackDto } from './dto/neir-callback.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AuthProfileResponseDto } from './dto/auth-profile-response.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtUserGuard } from './guards/jwt-user.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { Admin } from '../admins/entities/admin.entity';
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login admin' })
  @ApiResponse({ status: 200, description: 'Login successful', type: LoginResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('admin/logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Logout admin' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async logoutAdmin(@Headers('authorization') authHeader?: string) {
    // Extract token from Authorization header
    const token = authHeader?.replace('Bearer ', '');
    return this.authService.logout(token);
  }

  @Get('check')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Check authentication status' })
  @ApiResponse({ status: 200, description: 'Admin is authenticated', type: CheckAuthResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async checkAuth(@CurrentUser() admin: Admin) {
    return this.authService.checkAuth(admin);
  }

  @Post('neir/callback')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'NEIR SSO callback - verify session and create/update user' })
  @ApiResponse({ status: 200, description: 'Authentication successful' })
  @ApiResponse({ status: 401, description: 'Invalid NEIR session or token' })
  async neirCallback(
    @Body() neirCallbackDto: NeirCallbackDto,
    @Query('role') role?: 'vaccinator' | 'supervisor',
  ) {
    // Merge role from query params if not in body
    if (role && !neirCallbackDto.role) {
      neirCallbackDto.role = role;
    }
    return this.authService.neirCallback(neirCallbackDto);
  }

  @Get('profile')
  @UseGuards(JwtUserGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user profile (vaccinator/supervisor)' })
  @ApiResponse({ status: 200, description: 'User profile', type: AuthProfileResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@CurrentUser() user: { userId: string; role: 'vaccinator' | 'supervisor' }) {
    return this.authService.getProfile(user.userId, user.role);
  }

  @Post('logout')
  @UseGuards(JwtUserGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Logout user and clear NEIR token' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async logoutUser(
    @CurrentUser() user: { userId: string },
    @Headers('authorization') authHeader?: string,
  ) {
    // Extract token from Authorization header
    const token = authHeader?.replace('Bearer ', '');
    return this.authService.logoutUser(user.userId, token);
  }

  @Post('update-profile')
  @UseGuards(JwtUserGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update user profile (vaccinator/supervisor)' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully', type: AuthProfileResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateProfile(
    @CurrentUser() user: { userId: string; role: 'vaccinator' | 'supervisor' },
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.authService.updateProfile(user.userId, user.role, updateProfileDto);
  }
}
