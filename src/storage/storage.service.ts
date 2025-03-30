import { Injectable } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { v4 as uuid } from 'uuid';
import * as mime from 'mime-types';

@Injectable()
export class StorageService {
  private s3: S3Client;
  private readonly bucket = process.env.AWS_S3_BUCKET;
  private readonly region = process.env.AWS_S3_REGION;

  constructor() {
    if (
      !process.env.AWS_ACCESS_KEY_ID ||
      !process.env.AWS_SECRET_ACCESS_KEY ||
      !process.env.AWS_S3_BUCKET ||
      !process.env.AWS_S3_REGION
    ) {
      throw new Error(
        'AWS credentials are not defined in environment variables',
      );
    }

    this.s3 = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }

  async uploadFile(
    fileBuffer: Buffer,
    originalName: string,
    folder = 'uploads',
  ): Promise<string> {
    const extension = mime.extension(
      mime.lookup(originalName) || 'application/octet-stream',
    );
    const key = `${folder}/${uuid()}.${extension}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: fileBuffer,
      ContentType: mime.lookup(originalName) || 'application/octet-stream',
      ACL: 'public-read',
    });

    await this.s3.send(command);

    if (!process.env.CDN_URL) {
      return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
    } else {
      return `${process.env.CDN_URL}/${key}`;
    }
  }

  async replaceFile(
    oldFileUrl: string,
    newBuffer: Buffer,
    originalName: string,
    folder = 'uploads',
  ): Promise<string> {
    if (oldFileUrl) {
      await this.deleteFile(oldFileUrl);
    }
    return this.uploadFile(newBuffer, originalName, folder);
  }

  async deleteFile(fileUrl: string): Promise<void> {
    const key = this.extractKeyFromUrl(fileUrl);
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    await this.s3.send(command);
  }

  private extractKeyFromUrl(url: string): string {
    let prefix = '';
    if (!process.env.CDN_URL) {
      prefix = `https://${this.bucket}.s3.${this.region}.amazonaws.com/`;
    } else {
      prefix = `${process.env.CDN_URL}/`;
    }
    return url.replace(prefix, '');
  }
}
