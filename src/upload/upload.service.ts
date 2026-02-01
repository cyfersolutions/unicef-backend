import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { promises as fs } from 'fs';
import * as path from 'path';
import type { File } from 'multer';

@Injectable()
export class UploadService {
  private readonly uploadDir: string;
  private readonly backendUrl: string;

  // Allowed MIME type prefixes (actual validation done via magic numbers in checkMagicNumbers)
  private readonly allowedMimeTypePrefixes = ['image/', 'video/', 'audio/'];

  // Allowed file extensions
  private readonly allowedExtensions = {
    images: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff', '.tif', '.svg'],
    videos: ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.wmv', '.flv'],
    audio: ['.mp3', '.wav', '.ogg', '.aac', '.flac', '.m4a'],
  };

  constructor(private configService: ConfigService) {
    this.uploadDir = path.join(process.cwd(), 'uploads');
    let backendUrl = this.configService.get<string>('BACKENDURL', 'http://localhost:4000/');
    // Ensure BACKENDURL ends with /
    if (!backendUrl.endsWith('/')) {
      backendUrl += '/';
    }
    this.backendUrl = backendUrl;
    
    // Ensure upload directory exists
    this.ensureUploadDirectory();
  }

  private async ensureUploadDirectory() {
    try {
      await fs.access(this.uploadDir);
    } catch {
      await fs.mkdir(this.uploadDir, { recursive: true });
    }
  }

  /**
   * Check magic numbers (file headers) to validate file type
   */
  private checkMagicNumbers(buffer: Buffer, mimeType: string): boolean {
    if (buffer.length < 4) return false;

    const header = Array.from(buffer.slice(0, 12));

    // Image validations
    if (mimeType.startsWith('image/')) {
      // JPEG: FF D8 FF
      if (header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff) {
        return mimeType === 'image/jpeg';
      }
      // PNG: 89 50 4E 47
      if (header[0] === 0x89 && header[1] === 0x50 && header[2] === 0x4e && header[3] === 0x47) {
        return mimeType === 'image/png';
      }
      // GIF: 47 49 46 38
      if (header[0] === 0x47 && header[1] === 0x49 && header[2] === 0x46 && header[3] === 0x38) {
        return mimeType === 'image/gif';
      }
      // WebP: RIFF...WEBP
      if (
        header[0] === 0x52 &&
        header[1] === 0x49 &&
        header[2] === 0x46 &&
        header[3] === 0x46 &&
        buffer.length > 8 &&
        buffer.slice(8, 12).toString() === 'WEBP'
      ) {
        return mimeType === 'image/webp';
      }
      // BMP: 42 4D
      if (header[0] === 0x42 && header[1] === 0x4d) {
        return mimeType === 'image/bmp';
      }
      // TIFF: 49 49 2A 00 (little-endian) or 4D 4D 00 2A (big-endian)
      if (
        (header[0] === 0x49 && header[1] === 0x49 && header[2] === 0x2a && header[3] === 0x00) ||
        (header[0] === 0x4d && header[1] === 0x4d && header[2] === 0x00 && header[3] === 0x2a)
      ) {
        return mimeType === 'image/tiff';
      }
      // SVG: Check if it's valid XML/SVG content
      if (mimeType === 'image/svg+xml' || mimeType === 'image/svg') {
        const content = buffer.toString('utf-8');
        return content.trim().startsWith('<?xml') || content.trim().startsWith('<svg');
      }
    }

    // Video validations
    if (mimeType.startsWith('video/')) {
      // MP4: 00 00 00 ?? 66 74 79 70
      if (
        header[0] === 0x00 &&
        header[1] === 0x00 &&
        header[2] === 0x00 &&
        header[4] === 0x66 &&
        header[5] === 0x74 &&
        header[6] === 0x79 &&
        header[7] === 0x70
      ) {
        return mimeType === 'video/mp4' || mimeType === 'video/quicktime' || mimeType === 'audio/mp4';
      }
      // AVI: RIFF...AVI
      if (
        header[0] === 0x52 &&
        header[1] === 0x49 &&
        header[2] === 0x46 &&
        header[3] === 0x46 &&
        buffer.length > 8 &&
        buffer.slice(8, 12).toString().includes('AVI')
      ) {
        return mimeType === 'video/x-msvideo';
      }
      // MKV/WebM: 1A 45 DF A3
      if (header[0] === 0x1a && header[1] === 0x45 && header[2] === 0xdf && header[3] === 0xa3) {
        return mimeType === 'video/x-matroska' || mimeType === 'video/webm';
      }
      // WMV: 30 26 B2 75 8E 66 CF 11
      if (
        header[0] === 0x30 &&
        header[1] === 0x26 &&
        header[2] === 0xb2 &&
        header[3] === 0x75 &&
        header[4] === 0x8e &&
        header[5] === 0x66 &&
        header[6] === 0xcf &&
        header[7] === 0x11
      ) {
        return mimeType === 'video/x-ms-wmv';
      }
      // FLV: 46 4C 56 01
      if (header[0] === 0x46 && header[1] === 0x4c && header[2] === 0x56 && header[3] === 0x01) {
        return mimeType === 'video/x-flv';
      }
    }

    // Audio validations
    if (mimeType.startsWith('audio/')) {
      // MP3: FF FB, FF F3, FF F2, or starts with ID3
      if (
        (header[0] === 0xff && (header[1] === 0xfb || header[1] === 0xf3 || header[1] === 0xf2)) ||
        (header[0] === 0x49 && header[1] === 0x44 && header[2] === 0x33)
      ) {
        return mimeType === 'audio/mpeg';
      }
      // WAV: RIFF...WAVE
      if (
        header[0] === 0x52 &&
        header[1] === 0x49 &&
        header[2] === 0x46 &&
        header[3] === 0x46 &&
        buffer.length > 8 &&
        buffer.slice(8, 12).toString() === 'WAVE'
      ) {
        return mimeType === 'audio/wav' || mimeType === 'audio/x-wav';
      }
      // OGG: 4F 67 67 53
      if (header[0] === 0x4f && header[1] === 0x67 && header[2] === 0x67 && header[3] === 0x53) {
        return mimeType === 'audio/ogg';
      }
      // AAC: FF F1 or FF F9
      if (header[0] === 0xff && (header[1] === 0xf1 || header[1] === 0xf9)) {
        return mimeType === 'audio/aac';
      }
      // FLAC: 66 4C 61 43
      if (header[0] === 0x66 && header[1] === 0x4c && header[2] === 0x61 && header[3] === 0x43) {
        return mimeType === 'audio/flac';
      }
      // M4A: Same as MP4 header check above
      if (
        header[0] === 0x00 &&
        header[1] === 0x00 &&
        header[2] === 0x00 &&
        header[4] === 0x66 &&
        header[5] === 0x74 &&
        header[6] === 0x79 &&
        header[7] === 0x70
      ) {
        return mimeType === 'audio/mp4' || mimeType === 'audio/x-m4a';
      }
    }

    return false;
  }

  /**
   * Validate file type by checking magic numbers (file headers)
   */
  private async validateFileContent(buffer: Buffer, originalMimeType: string): Promise<boolean> {
    // First check magic numbers
    const isValidMagicNumber = this.checkMagicNumbers(buffer, originalMimeType);
    
    if (!isValidMagicNumber) {
      // For SVG files, do additional content check
      if (originalMimeType === 'image/svg+xml' || originalMimeType === 'image/svg') {
        const content = buffer.toString('utf-8');
        return content.trim().startsWith('<?xml') || content.trim().startsWith('<svg');
      }
      return false;
    }

    return true;
  }

  /**
   * Validate file extension
   */
  private validateFileExtension(filename: string): boolean {
    const ext = path.extname(filename).toLowerCase();
    const allAllowedExtensions = [
      ...this.allowedExtensions.images,
      ...this.allowedExtensions.videos,
      ...this.allowedExtensions.audio,
    ];
    return allAllowedExtensions.includes(ext);
  }

  /**
   * Validate MIME type
   */
  private validateMimeType(mimeType: string): boolean {
    return this.allowedMimeTypePrefixes.some(prefix => mimeType.startsWith(prefix));
  }

  /**
   * Generate unique filename
   */
  private generateFilename(originalName: string): string {
    const ext = path.extname(originalName);
    const baseName = path.basename(originalName, ext);
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `${baseName}-${timestamp}-${random}${ext}`;
  }

  /**
   * Upload and validate file
   */
  async uploadFile(file: File): Promise<string> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Validate file extension
    if (!this.validateFileExtension(file.originalname)) {
      throw new BadRequestException(
        'Invalid file type. Only photos, videos, and audio files are allowed.',
      );
    }

    // Validate MIME type
    if (!this.validateMimeType(file.mimetype)) {
      throw new BadRequestException(
        'Invalid MIME type. Only photos, videos, and audio files are allowed.',
      );
    }

    // Validate file content using magic numbers
    const buffer = file.buffer;
    const isValidContent = await this.validateFileContent(buffer, file.mimetype);
    
    if (!isValidContent) {
      throw new BadRequestException(
        'File content validation failed. The file may be corrupted or not match its declared type.',
      );
    }

    // Generate unique filename
    const filename = this.generateFilename(file.originalname);
    const filePath = path.join(this.uploadDir, filename);

    // Save file
    try {
      await fs.writeFile(filePath, buffer);
    } catch (error) {
      throw new BadRequestException('Failed to save file');
    }

    // Return URL
    const fileUrl = `${this.backendUrl}uploads/${filename}`;
    return fileUrl;
  }
}

