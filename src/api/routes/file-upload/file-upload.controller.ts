import {
  Controller,
  Get,
  Post,
  UploadedFiles,
  UseInterceptors,
  UseGuards,
  Request,
  Param,
  Res,
  HttpException,
  HttpStatus,
  Delete,
  Query,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiParam,
  ApiBearerAuth,
  ApiTags,
  ApiConsumes,
  ApiOkResponse,
} from '@nestjs/swagger';

import { diskStorage, memoryStorage } from 'multer';

import { UserResourceGuard } from '../../../common/guards/user_resource.guard';
import { getPagination } from '../../../common/utils/entity_metadata';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { ApiMultiFile } from '../../../common/decorators/api-file.decorator';
import { FileUploadService } from './file-upload.service';
import { FileListPaginated, CreateFileResponseDto } from './dto';
import { FileModelService } from '../../../models/file/file.model.service';
import { EditFileName } from './utils';
import * as fs from 'fs';
import * as path from 'path';
import { StorageService } from '../../../services/storage-service/storage-service.service';
import { Role } from 'src/models/user/entity/user.enum';
import { OrganizationUserResourceGuard } from 'src/common/guards/organization_user_resource.guard';
import { LogService } from '../../../services/logger/logger.service';

@Controller('file-upload')
@ApiBearerAuth()
@ApiTags('File-Upload')
export class FileUploadController {
  constructor(
    private readonly fileUploadService: FileUploadService,
    private readonly fileModelService: FileModelService,
    private readonly storageService: StorageService,
    private readonly logService: LogService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('/')
  @ApiConsumes('multipart/form-data')
  @ApiMultiFile('files')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: diskStorage({
        destination: './files',
        filename: EditFileName,
      }),
      limits: { fileSize: 20000000 },
    }),
  )
  async uploadFilesLocal(
    @Request() req,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const res = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const data = {
        id: file.filename,
        userId: req.user.id,
        organizationId:
          req.user.role !== Role.ADMIN ? req.user.organizationId : null,
        location: file.path,
        originalName: file.originalname,
        createdAt: file.filename.split('_')[1],
      };
      const uploadedFile = await this.fileModelService.create(data);
      res.push(uploadedFile);
    }
    return res;
  }

  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({
    type: CreateFileResponseDto,
  })
  @Post('/s3')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: memoryStorage(),
      // limits: { fileSize: 20000000 },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiMultiFile('files')
  async uploadFilesS3(
    @Request() req,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    try {
      this.logService.logInfo('S3 file upload is processing');
      return await Promise.all(
        files.map((file) => {
          return this.storageService.saveFileToCloud(file, req.user);
        }),
      );
    } catch (error) {
      this.logService.logError('Failed at S3 file upload API', error);
      throw error;
    }
  }

  @Get(':id')
  @ApiParam({ name: 'id', type: String, required: true })
  async serveFile(@Request() req, @Param() params, @Res() res) {
    const file = await this.fileUploadService.validateFileAndCheckUserAccessPermission(
      params.id,
      req.user,
    );
    if (file) {
      const filePath = path.join(__dirname, '../../../../..', file.location);
      fs.createReadStream(filePath).pipe(res);
    } else {
      throw new HttpException('Invalid id', HttpStatus.NOT_FOUND);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('/s3/:id')
  @ApiParam({ name: 'id', type: String, required: true })
  async downloadS3(@Request() req, @Param() params, @Res() res) {
    const file = await this.fileUploadService.validateFileAndCheckUserAccessPermission(
      params.id,
      req.user,
    );
    res.attachment(file.originalName);
    const stream = await this.storageService.downloadFromCloud(file.id);
    stream.pipe(res);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/:id')
  @ApiParam({ name: 'id', type: String, required: true })
  async deleteFile(@Request() req, @Param() params): Promise<void> {
    await this.fileUploadService.validateFileAndCheckUserAccessPermission(
      params.id,
      req.user,
    );
    return await this.fileModelService.softDelete(params.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/s3/:id')
  @ApiParam({ name: 'id', type: String, required: true })
  async deleteS3(@Request() req, @Param() params): Promise<void> {
    await this.fileUploadService.validateFileAndCheckUserAccessPermission(
      params.id,
      req.user,
    );
    return await this.storageService.deleteFromCloud(params.id);
  }

  @UseGuards(JwtAuthGuard, UserResourceGuard, OrganizationUserResourceGuard)
  @Get('/')
  async getAllFilesDetails(@Query() queryParams: FileListPaginated) {
    const { userId, sort, ...paginateParams } = queryParams;
    const { skip, limit } = getPagination(paginateParams);
    return await this.fileModelService.findAll(
      {
        skip,
        limit,
        sort,
      },
      userId,
    );
  }
}
