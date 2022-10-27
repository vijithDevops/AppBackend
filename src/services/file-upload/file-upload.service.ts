import { Inject, Injectable } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import { FILE_UPLOAD_CLIENT } from '../../config/constants';
import { LogService } from '../logger/logger.service';
import { IDeleteFromS3, IDownloadFromS3, IUploadToS3 } from './interfaces';

@Injectable()
export class FileUploadService {
  constructor(
    private logService: LogService,
    @Inject(FILE_UPLOAD_CLIENT) private readonly client: S3,
  ) {}

  /**
   * upload single file to s3
   *
   * @param {IUploadToS3} params
   * @returns {Promise<void>}
   */
  async singleUploadToS3(params: IUploadToS3) {
    return await this.client
      .upload(params)
      .promise()
      .catch((err) => {
        throw new Error(err.message);
      });
  }

  async deleteFromS3(params: IDeleteFromS3) {
    try {
      await this.client.deleteObject(params).promise();
    } catch (err) {
      this.logService.logError('Error deleting file from S3', err);
      throw err;
    }
  }

  async downloadFromS3(params: IDownloadFromS3) {
    try {
      const stream = this.client.getObject(params).createReadStream();
      return stream;
    } catch (err) {
      this.logService.logError('Error downloading file from S3', err);
      throw err;
    }
  }
}
