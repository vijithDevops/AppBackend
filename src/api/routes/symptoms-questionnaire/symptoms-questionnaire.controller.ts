import { PatientResourceGuard } from 'src/common/guards/patient_resource.guard';
import { CalendarModelService } from 'src/models/calendar/calendar.model.service';
import { PatientQuestionnaireInputModelService } from './../../../models/patient_questionnaire_input/patient_questionnaire_input.model.service';
import { UserModelService } from 'src/models/user/user.model.service';
import { OrganizationFilterGuard } from './../../../common/guards/organization_filter.guard';
import { SymptomsQuestionnnaireModelService } from './../../../models/symptoms-questionnaire/symptoms_questionnaire.model.service';
import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  Query,
  UnauthorizedException,
  Delete,
  Param,
  BadRequestException,
  Patch,
  Put,
} from '@nestjs/common';

import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { Roles } from '../../../common/decorators/role.decorator';
import { Role } from '../../../models/user/entity/user.enum';
import { RolesGuard } from '../../../common/guards/role.guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { LogService } from '../../../services/logger/logger.service';
import { SymptomsQuestionnnaireService } from './symptoms-questionnaire.service';
import { OrganizationService } from '../organization/organization.service';
import { OrganizationSymptomsQuestionnaires } from 'src/models/symptoms-questionnaire/entity/organization_questionnaires.view.entity';
import {
  CreatePatientQuestionnaireInputsDto,
  CreateSymptomsQuestionnaireDto,
  GetPatientQuestionnaireInputsDto,
  UpdatePatientQuestionnaireInputsDto,
  UpdateSymptomsQustionnaireDto,
} from './dto';
import { checkObjectIsEmpty } from 'src/common/utils/helpers';

@Controller('symptoms-questionnaire')
@ApiTags('Symptoms-Questionnaire')
@ApiBearerAuth()
export class SymptomsQuestionnaireController {
  constructor(
    private logService: LogService,
    private readonly symptomsQuestionnnaireService: SymptomsQuestionnnaireService,
    private readonly symptomsQuestionnnaireModelService: SymptomsQuestionnnaireModelService,
    private readonly calendarModelService: CalendarModelService,
    private readonly userModelService: UserModelService,
    private readonly patientQuestionnaireInputModelService: PatientQuestionnaireInputModelService,
    private readonly organizationService: OrganizationService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('/')
  @ApiQuery({ name: 'organizationId', type: String, required: true })
  async getSymptomsQuestionnaires(
    @Request() req,
    @Query('organizationId') organizationId: string,
  ): Promise<OrganizationSymptomsQuestionnaires[]> {
    const organization = await this.organizationService.validateOrganization(
      organizationId,
    );
    const reqUser = req.user;
    if (
      reqUser.role === Role.ADMIN ||
      reqUser.organizationId === organization.id
    ) {
      const filters = {
        organizationId,
      };
      if (reqUser.role === Role.PATIENT) {
        filters['isActive'] = true;
      }
      return await this.symptomsQuestionnnaireModelService.getOrganizationSymptomsQuestionnairs(
        filters,
      );
    } else {
      throw new UnauthorizedException();
    }
  }

  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE)
  @UseGuards(JwtAuthGuard, RolesGuard, OrganizationFilterGuard)
  @Post()
  @ApiBody({
    type: CreateSymptomsQuestionnaireDto,
    description: 'Create symptoms questionnaire for organization',
  })
  async create(@Body() body: CreateSymptomsQuestionnaireDto) {
    try {
      const questionnaire = await this.symptomsQuestionnnaireModelService.createQuestionnaire(
        {
          ...body,
          isDefault: false,
        },
      );
      await this.symptomsQuestionnnaireModelService.createOrganizationQuestionnaireMapping(
        {
          organizationId: body.organizationId,
          questionnaireId: questionnaire.id,
        },
      );
      return questionnaire;
    } catch (error) {
      throw error;
    }
  }

  @ApiOperation({
    description: 'API to delete symptoms questionnaire',
  })
  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE)
  @UseGuards(JwtAuthGuard, RolesGuard, OrganizationFilterGuard)
  @Delete('/:id/:organizationId')
  @ApiParam({ name: 'id', type: String, required: true })
  @ApiParam({ name: 'organizationId', type: String, required: true })
  async deleteOrganizationQuestionnaire(@Param() params): Promise<void> {
    try {
      const questionnaire = await this.symptomsQuestionnnaireService.validateAndGetOrganizationQuestionnair(
        params.id,
        params.organizationId,
      );
      if (questionnaire.isDefault) {
        throw new BadRequestException('Cannot delete default questionnaire');
      }
      return await this.symptomsQuestionnnaireModelService.softDeleteOrganizationQuestionnaire(
        questionnaire.id,
      );
    } catch (error) {
      throw error;
    }
  }

  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id/:organizationId')
  async update(
    @Request() req,
    @Param('id') id: string,
    @Param('organizationId') organizationId: string,
    @Body() updateDto: UpdateSymptomsQustionnaireDto,
  ) {
    try {
      if (checkObjectIsEmpty(updateDto)) {
        throw new BadRequestException('update object cannot be empty');
      }
      const questionnaire = await this.symptomsQuestionnnaireService.validateAndGetOrganizationQuestionnair(
        id,
        organizationId,
      );
      if (questionnaire.isDefault) {
        await this.symptomsQuestionnnaireService.updateDefaultQuestionnaireOfOrganization(
          questionnaire.id,
          organizationId,
          updateDto,
        );
      } else {
        await this.symptomsQuestionnnaireModelService.updateSymptomsQuestionnaire(
          questionnaire.id,
          updateDto,
        );
      }
      return await this.symptomsQuestionnnaireModelService.getOrganizationSymptomsQuestionnaireById(
        questionnaire.id,
        organizationId,
      );
    } catch (error) {
      throw error;
    }
  }

  @Roles(Role.PATIENT, Role.CARETAKER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('/patient-inputs/')
  @ApiBody({
    type: CreatePatientQuestionnaireInputsDto,
    description: 'Create patient symptoms questionnaires inputs',
  })
  async createPatientQuestionnaireInput(
    @Body() body: CreatePatientQuestionnaireInputsDto,
  ) {
    try {
      const patient = await this.userModelService.findOneUser(
        body.patientId,
        Role.PATIENT,
      );
      if (!patient) {
        throw new BadRequestException('Invalid patient');
      }
      const calendarId = (
        await this.calendarModelService.getCalendarDate(new Date())
      ).id;
      if (
        await this.patientQuestionnaireInputModelService.checkPatientInputExistForCalendarDate(
          patient.id,
          calendarId,
        )
      ) {
        throw new BadRequestException('Input already added for the date');
      }
      const {
        inputs: inputMaps,
        totalScore,
      } = await this.symptomsQuestionnnaireService.validatePatientInputsDtoAndGetInputObject(
        body.inputs,
        patient,
      );
      const inputMaster = await this.patientQuestionnaireInputModelService.createQuestionnaireInputMaster(
        {
          patientId: patient.id,
          calendarId,
          totalScore,
        },
      );
      const inputs = inputMaps.map((input) => {
        return {
          ...input,
          inputMasterId: inputMaster.id,
        };
      });
      const patientInputs = await this.patientQuestionnaireInputModelService.createPatientInputs(
        inputs,
      );
      inputMaster.patientInputs = patientInputs;
      this.symptomsQuestionnnaireService.SendPatientAlertForSymptomsScore(
        totalScore,
        patient,
      );
      return inputMaster;
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard, PatientResourceGuard)
  @Get('/patient-inputs/:patientId')
  async getPatientQuestionnaireInput(
    @Query() query: GetPatientQuestionnaireInputsDto,
  ) {
    try {
      const date = query.date || new Date();
      return await this.patientQuestionnaireInputModelService.getPatientQuestionnaireInputs(
        query.patientId,
        {
          calendarId: (await this.calendarModelService.getCalendarDate(date))
            .id,
        },
      );
    } catch (error) {
      throw error;
    }
  }

  @Roles(Role.PATIENT, Role.CARETAKER)
  @UseGuards(JwtAuthGuard, RolesGuard, PatientResourceGuard)
  @Put('/patient-input')
  async updatePatientInput(
    @Body() updatePatientInputDto: UpdatePatientQuestionnaireInputsDto,
  ) {
    try {
      const patient = await this.userModelService.findOneUser(
        updatePatientInputDto.patientId,
        Role.PATIENT,
      );
      if (!patient) {
        throw new BadRequestException('Invalid patient');
      }
      const patientInputMaster = await this.patientQuestionnaireInputModelService.getPaientInputsById(
        updatePatientInputDto.inputMasterId,
      );
      if (
        !patientInputMaster ||
        patientInputMaster.patientId !== updatePatientInputDto.patientId
      ) {
        throw new BadRequestException('Invalid input for patient');
      }
      const inputIdObjectMaps = {};
      const inputQuestionnaireIdObjectMaps = {};
      const newQuestionInputs = [];
      let updateRequired = false;
      let lastInputOrder = patientInputMaster.patientInputs.length;
      patientInputMaster.patientInputs.forEach((input) => {
        inputIdObjectMaps[input.id] = input;
        inputQuestionnaireIdObjectMaps[input.questionnaireId] = input;
      });
      const questionMaps = await this.symptomsQuestionnnaireService.getOrganizationSymptomsQuestionsMaps(
        patient.organizationId,
      );
      updatePatientInputDto.inputs.forEach((input) => {
        if (input.inputQuestionId) {
          if (!inputIdObjectMaps[input.inputQuestionId]) {
            throw new BadRequestException(
              'Invalid Input question for patient input',
            );
          }
          if (
            input.value !== undefined &&
            inputIdObjectMaps[input.inputQuestionId].input !== input.value
          ) {
            if (
              input.value >
              inputIdObjectMaps[input.inputQuestionId].scale.length
            ) {
              throw new BadRequestException(
                'Input value must match the question scale length',
              );
            }
            patientInputMaster.totalScore =
              patientInputMaster.totalScore -
              inputIdObjectMaps[input.inputQuestionId].input;
            inputIdObjectMaps[input.inputQuestionId].input = input.value;
            patientInputMaster.totalScore =
              patientInputMaster.totalScore + input.value;
            if (!updateRequired) updateRequired = true;
          }
        } else if (input.questionId) {
          // new question added
          if (inputQuestionnaireIdObjectMaps[input.questionId]) {
            throw new BadRequestException(
              `Input already added for questionId: ${input.questionId}`,
            );
          }
          if (!questionMaps[input.questionId]) {
            throw new BadRequestException(
              `Invalid Symptom questionId: ${input.questionId}`,
            );
          }
          const question = questionMaps[input.questionId];
          if (input.value > question.scale.length) {
            throw new BadRequestException(
              'Input value must match the question scale length',
            );
          }
          newQuestionInputs.push({
            input: input.value,
            inputMasterId: patientInputMaster.id,
            questionnaireId: question.id,
            question: question.question,
            keyword: question.keyword,
            scale: question.scale,
            type: question.type,
            order: lastInputOrder + 1,
          });
          lastInputOrder = lastInputOrder + 1;
          patientInputMaster.totalScore =
            patientInputMaster.totalScore + input.value;
          if (!updateRequired) updateRequired = true;
        } else {
          throw new BadRequestException(
            'inputQuestionId or questionId is required for each inputs',
          );
        }
      });
      if (updateRequired) {
        await Promise.all([
          this.patientQuestionnaireInputModelService.updatePatientInputMaster(
            patientInputMaster,
          ),
          this.patientQuestionnaireInputModelService.updatePatientInputs(
            patientInputMaster.patientInputs,
          ),
        ]);
      }
      if (newQuestionInputs.length > 0) {
        await this.patientQuestionnaireInputModelService.createPatientInputs(
          newQuestionInputs,
        );
      }
      return await this.patientQuestionnaireInputModelService.getPaientInputsById(
        updatePatientInputDto.inputMasterId,
      );
    } catch (error) {
      throw error;
    }
  }
}
