import { v2 as cloudinary } from 'cloudinary';
import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';
import { lookup } from 'mime-types';

// Configure Cloudinary
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (cloudName && apiKey && apiSecret) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });
}

export interface UploadResult {
  publicId: string;
  url: string;
  secureUrl: string;
  width?: number;
  height?: number;
  format?: string;
  bytes: number;
}

export interface ImageProcessingOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'jpg' | 'png' | 'webp';
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
}

export class ImageUploadService {
  private static readonly ALLOWED_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
  ];

  private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  /**
   * Validate file type and size
   */
  static validateFile(file: Buffer | string, mimeType?: string): void {
    // Determine mime type if not provided
    const detectedMimeType = mimeType || lookup(typeof file === 'string' ? file : 'temp.jpg');

    if (!detectedMimeType || !this.ALLOWED_TYPES.includes(detectedMimeType)) {
      throw new Error(`Invalid file type. Allowed types: ${this.ALLOWED_TYPES.join(', ')}`);
    }

    // For buffer, check size
    if (Buffer.isBuffer(file) && file.length > this.MAX_FILE_SIZE) {
      throw new Error(`File size too large. Maximum size: ${this.MAX_FILE_SIZE / (1024 * 1024)}MB`);
    }
  }

  /**
   * Process image buffer with Sharp
   */
  static async processImage(
    buffer: Buffer,
    options: ImageProcessingOptions = {}
  ): Promise<Buffer> {
    const {
      width,
      height,
      quality = 80,
      format = 'jpg',
      fit = 'cover',
    } = options;

    let sharpInstance = sharp(buffer);

    // Resize if dimensions provided
    if (width || height) {
      sharpInstance = sharpInstance.resize(width, height, {
        fit,
        withoutEnlargement: true,
      });
    }

    // Convert format and set quality
    switch (format) {
      case 'jpg':
        sharpInstance = sharpInstance.jpeg({ quality });
        break;
      case 'png':
        sharpInstance = sharpInstance.png({ quality });
        break;
      case 'webp':
        sharpInstance = sharpInstance.webp({ quality });
        break;
    }

    return sharpInstance.toBuffer();
  }

  /**
   * Upload buffer to Cloudinary
   */
  static async uploadToCloudinary(
    buffer: Buffer,
    folder: string = 'properties',
    publicId?: string
  ): Promise<UploadResult> {
    if (!cloudName) {
      throw new Error('Cloudinary not configured');
    }

    return new Promise((resolve, reject) => {
      const uploadOptions: any = {
        folder,
        resource_type: 'image',
        quality: 'auto',
        fetch_format: 'auto',
      };

      if (publicId) {
        uploadOptions.public_id = publicId;
      }

      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            reject(error);
          } else if (result) {
            resolve({
              publicId: result.public_id,
              url: result.url,
              secureUrl: result.secure_url,
              width: result.width,
              height: result.height,
              format: result.format,
              bytes: result.bytes,
            });
          } else {
            reject(new Error('Upload failed'));
          }
        }
      );

      uploadStream.end(buffer);
    });
  }

  /**
   * Upload and process image with multiple sizes
   */
  static async uploadImage(
    file: Buffer,
    folder: string = 'properties',
    options: {
      generateThumbnail?: boolean;
      thumbnailSize?: { width: number; height: number };
      originalOptions?: ImageProcessingOptions;
    } = {}
  ): Promise<{
    original: UploadResult;
    thumbnail?: UploadResult;
  }> {
    this.validateFile(file);

    const {
      generateThumbnail = true,
      thumbnailSize = { width: 300, height: 200 },
      originalOptions = { quality: 85 },
    } = options;

    // Process original image
    const processedOriginal = await this.processImage(file, originalOptions);

    // Upload original
    const original = await this.uploadToCloudinary(processedOriginal, folder);

    let thumbnail: UploadResult | undefined;

    if (generateThumbnail) {
      // Process thumbnail
      const processedThumbnail = await this.processImage(file, {
        ...thumbnailSize,
        quality: 80,
        format: 'jpg',
      });

      // Upload thumbnail
      thumbnail = await this.uploadToCloudinary(
        processedThumbnail,
        `${folder}/thumbnails`,
        `${original.publicId}_thumb`
      );
    }

    return { original, thumbnail };
  }

  /**
   * Delete image from Cloudinary
   */
  static async deleteImage(publicId: string): Promise<void> {
    if (!cloudName) {
      throw new Error('Cloudinary not configured');
    }

    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Generate optimized image URLs
   */
  static getOptimizedUrl(publicId: string, options: ImageProcessingOptions = {}): string {
    if (!cloudName) {
      throw new Error('Cloudinary not configured');
    }

    const { width, height, quality = 80, format = 'auto' } = options;

    let transformations = `f_${format},q_${quality}`;

    if (width) transformations += `,w_${width}`;
    if (height) transformations += `,h_${height}`;

    return `https://res.cloudinary.com/${cloudName}/image/upload/${transformations}/${publicId}`;
  }

  /**
   * Extract image metadata
   */
  static async getImageMetadata(buffer: Buffer): Promise<{
    width: number;
    height: number;
    format: string;
    size: number;
  }> {
    const metadata = await sharp(buffer).metadata();
    return {
      width: metadata.width || 0,
      height: metadata.height || 0,
      format: metadata.format || 'unknown',
      size: buffer.length,
    };
  }

  /**
   * Clean up temporary files
   */
  static async cleanupTempFile(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.warn('Failed to cleanup temp file:', error);
    }
  }
}

// For local development fallback (if Cloudinary not configured)
export class LocalImageUploadService {
  private static readonly UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

  static async uploadImage(
    file: Buffer,
    filename: string
  ): Promise<{ url: string; path: string }> {
    // Ensure upload directory exists
    await fs.mkdir(this.UPLOAD_DIR, { recursive: true });

    const filePath = path.join(this.UPLOAD_DIR, filename);
    await fs.writeFile(filePath, file);

    return {
      url: `/uploads/${filename}`,
      path: filePath,
    };
  }

  static async deleteImage(filename: string): Promise<void> {
    const filePath = path.join(this.UPLOAD_DIR, filename);
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.warn('Failed to delete local image:', error);
    }
  }
}

// Export the appropriate service based on configuration
export const imageUploadService = cloudName
  ? ImageUploadService
  : LocalImageUploadService;