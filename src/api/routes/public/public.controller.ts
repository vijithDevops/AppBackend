import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { getPagination } from 'src/common/utils/entity_metadata';
import { PublicDoctorListPaginated } from '../user/dto';
import { UserModelService } from '../../../models/user/user.model.service';
import { OrganizationModelService } from '../../../models/organization/organization.model.service';
import { PublicOrganizationListPaginated } from './dto';
import { OrganizationType } from 'src/models/organization/entity/organization.enum';

@ApiTags('Public')
@Controller('public')
export class PublicController {
  constructor(
    private readonly userModelService: UserModelService,
    private readonly organizationModelService: OrganizationModelService,
  ) {}

  @Get('/doctors-list')
  async publicDoctorsList(@Query() queryParams: PublicDoctorListPaginated) {
    const { search, organizationId, ...paginateParams } = queryParams;
    const { limit, skip } = getPagination(paginateParams);
    return await this.userModelService.findPublicDoctorsListPaginated({
      skip,
      limit,
      search,
      organizationId,
    });
  }

  @Get('/organizations')
  async publicOrganizationList(
    @Query() queryParams: PublicOrganizationListPaginated,
  ) {
    const { search, ...paginateParams } = queryParams;
    const { limit, skip } = getPagination(paginateParams);
    return await this.organizationModelService.findPublicOrganizationListPaginated(
      {
        skip,
        limit,
        search,
        types: [OrganizationType.HOSPITAL],
      },
    );
  }

  // @Get('/patient-id-int')
  // @ApiQuery({ name: 'username', type: String, required: true })
  // async getPatientIdInteger(@Query('username') username: string) {
  //   try {
  //     const patientInfo = await this.userModelService.getPatientInfoByUsername(
  //       username,
  //     );
  //     return patientInfo.patientId;
  //   } catch (error) {
  //     throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
  //   }
  // }
}
