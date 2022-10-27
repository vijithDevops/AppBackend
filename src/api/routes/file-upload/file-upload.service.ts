import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { File } from '../../../models/file/entity/file.entity';
import { FileModelService } from '../../../models/file/file.model.service';
import { User } from 'src/models/user/entity/user.entity';
import { Role } from 'src/models/user/entity/user.enum';
import { CaretakerInfoModelService } from '../../../models/caretaker_info/caretaker_info.model.service';

@Injectable()
export class FileUploadService {
  constructor(
    private readonly fileModelService: FileModelService,
    private readonly caretakerInfoModelService: CaretakerInfoModelService,
  ) {}

  async validateFileAndCheckUserAccessPermission(
    fileId: string,
    reqUser: User,
  ): Promise<File> {
    try {
      let success = false;
      const file = await this.fileModelService.findOne(fileId);
      if (file) {
        if (reqUser.role === Role.ADMIN) {
          success = true;
        } else if (!file.organizationId) {
          //admin uploaded file
          //TODO: Add Permission for admin uploaded file
          success = true;
        } else if (reqUser.organizationId !== file.organizationId) {
          throw new ForbiddenException();
        } else if (
          reqUser.role === Role.DOCTOR ||
          reqUser.role === Role.NURSE
        ) {
          success = true;
        } else if (reqUser.role === Role.PATIENT) {
          if (file.user.role !== Role.PATIENT || file.user.id === reqUser.id) {
            success = true;
          }
        } else if (reqUser.role === Role.CARETAKER) {
          if (file.user.role !== Role.PATIENT || file.userId === reqUser.id) {
            success = true;
          } else {
            if (reqUser.caretakersPatient) {
              if (reqUser.caretakersPatient.patientId === file.userId)
                success = true;
            } else {
              const caretakerInfo = await this.caretakerInfoModelService.getOneByCaretakerId(
                reqUser.id,
              );
              if (
                caretakerInfo.patientId &&
                caretakerInfo.patientId === file.userId
              )
                success = true;
            }
          }
        }
        if (!success) {
          throw new HttpException('Permission denied', HttpStatus.FORBIDDEN);
        }
        return file;
      } else {
        throw new HttpException('Invalid id', HttpStatus.NOT_FOUND);
      }
    } catch (err) {
      throw err;
    }
  }
}
