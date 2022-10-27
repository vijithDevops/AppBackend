import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as moment from 'moment';
import * as sharp from 'sharp';
import { FileModelService } from 'src/models/file/file.model.service';
import { FileUploadService } from '../file-upload/file-upload.service';
import { File } from '../../models/file/entity/file.entity';
import {
  IMAGE_THUMBNAIL_WIDTH,
  S3_THUMBNAIL_FOLDER_NAME,
} from '../../config/constants';
import { LogService } from '../logger/logger.service';
import { User } from 'src/models/user/entity/user.entity';
import { Role } from 'src/models/user/entity/user.enum';

@Injectable()
export class StorageService {
  constructor(
    private logService: LogService,
    private readonly configService: ConfigService,
    private readonly fileModelService: FileModelService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  // S3
  async saveFileToCloud(file: Express.Multer.File, user: User): Promise<File> {
    try {
      const key = `${user.id}_${moment().format('YYYY-MM-DDTHH:mm:ss')}_${
        file.originalname
      }`;
      const uploadPromises = [
        this.fileUploadService.singleUploadToS3({
          Bucket: this.configService.get('AWS_PUBLIC_BUCKET_NAME'),
          Key: key,
          Body: file.buffer,
        }),
      ];
      if (file.mimetype && file.mimetype.split('/')[0] === 'image') {
        uploadPromises.push(
          this.fileUploadService.singleUploadToS3({
            Bucket: this.configService.get('AWS_PUBLIC_THUMBNAIL_BUCKET'),
            Key: `${S3_THUMBNAIL_FOLDER_NAME}/${key}`,
            Body: await this.createThumbnail(file.buffer),
          }),
        );
      }
      const [uploadFile, thumbnailFile] = await Promise.all(uploadPromises);
      return await this.fileModelService.create({
        userId: user.id,
        organizationId: user.role !== Role.ADMIN ? user.organizationId : null,
        id: uploadFile.Key,
        location: uploadFile.Location,
        thumbnail: thumbnailFile ? thumbnailFile.Location : null,
        mimeType: file.mimetype,
        size: file.size,
        originalName: file.originalname,
        createdAt: uploadFile.Key.split('_')[1],
      });
    } catch (err) {
      this.logService.logError('Error saving FileToCloud', err);
      throw err;
    }
  }

  async deleteFromCloud(fileId: string) {
    try {
      await this.fileUploadService.deleteFromS3({
        Bucket: this.configService.get('AWS_PUBLIC_BUCKET_NAME'),
        Key: fileId,
      });
      return await this.fileModelService.softDelete(fileId);
    } catch (err) {
      throw err;
    }
  }

  async downloadFromCloud(fileId: string) {
    try {
      return await this.fileUploadService.downloadFromS3({
        Bucket: this.configService.get('AWS_PUBLIC_BUCKET_NAME'),
        Key: fileId,
      });
    } catch (err) {
      throw err;
    }
  }

  async createThumbnail(file: Buffer): Promise<Buffer> {
    try {
      return await sharp(file).resize(IMAGE_THUMBNAIL_WIDTH).toBuffer();
    } catch (err) {
      throw err;
    }
  }
}
