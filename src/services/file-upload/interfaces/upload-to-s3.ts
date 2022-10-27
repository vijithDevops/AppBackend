export interface IUploadToS3 {
  Bucket: string;
  Key: string;
  Body: Buffer;
}

export interface IDownloadFromS3 {
  Bucket: string;
  Key: string;
}
export interface IDeleteFromS3 {
  Bucket: string;
  Key: string;
}
