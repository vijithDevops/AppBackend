//TODO: changes for role and role mapping
// import {
//   Controller,
//   Get,
//   Post,
//   Body,
//   Put,
//   Param,
//   Delete,
// } from '@nestjs/common';
// import { RoleService } from './role.service';
// import { CreateRoleDto } from './dto/create-role.dto';
// import { UpdateRoleDto } from './dto/update-role.dto';

// @Controller('role')
// export class RoleController {
//   constructor(private readonly roleService: RoleService) {}

//   @Post()
//   create(@Body() createRoleDto: CreateRoleDto) {
//     return this.roleService.create(createRoleDto);
//   }

//   @Get()
//   findAll() {
//     return this.roleService.findAll();
//   }

//   @Get(':id')
//   findOne(@Param('id') id: string) {
//     return this.roleService.findById(id);
//   }

//   @Put(':id')
//   update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
//     return this.roleService.update(+id, updateRoleDto);
//   }

//   @Delete(':id')
//   remove(@Param('id') id: string) {
//     return this.roleService.remove(+id);
//   }
// }
