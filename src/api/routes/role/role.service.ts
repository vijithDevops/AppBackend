//TODO: changes for role and role mapping
// import { Injectable } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { CreateRoleDto } from './dto/create-role.dto';
// import { UpdateRoleDto } from './dto/update-role.dto';
// import { Role } from '../../../models/role/role.entity';

// @Injectable()
// export class RoleService {
//   constructor(
//     @InjectRepository(Role)
//     private roleRepository: Repository<Role>,
//   ) {}

//   create(createRoleDto: CreateRoleDto) {
//     return 'This action adds a new role';
//   }

//   findAll() {
//     return `This action returns all role`;
//   }

//   async findById(id: string) {
//     return await this.roleRepository.findOne({ id });
//   }
//   async findRoleByName(name: string): Promise<Role> {
//     return await this.roleRepository.findOne({
//       where: { name },
//     });
//   }

//   update(id: number, updateRoleDto: UpdateRoleDto) {
//     return `This action updates a #${id} role`;
//   }

//   remove(id: number) {
//     return `This action removes a #${id} role`;
//   }

//   async getRolesEnum() {
//     const roles = await this.roleRepository.find();
//     const rolesEnum = {};
//     roles.forEach((role) => {
//       rolesEnum[role.name] = role.name;
//     });
//     return rolesEnum;
//   }
// }
