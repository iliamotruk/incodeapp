import { BadRequestException, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { CreateUserDTO } from 'src/modules/user/dto';
import { UserLoginDTO } from './dto';
import * as bcrypt from "bcrypt"
import { TokenService } from '../token/token.service';
import { AuthUserResponseDTO } from './dto/response';


@Injectable()
export class AuthService {
    constructor(private readonly userService: UserService,
        private readonly tokenService: TokenService
    ) { }

    async registerUsers(dto: CreateUserDTO): Promise<CreateUserDTO> {
        const existUser = await this.userService.findUserByUsername(dto.username)
        if (existUser) throw new BadRequestException("username is taken")
        await this.userService.changeUserToBoss(dto)

        return this.userService.createUser(dto)
    } 

    async loginUser(dto: UserLoginDTO): Promise<AuthUserResponseDTO> {
        const existUser = await this.userService.findUserByUsername(dto.username)
        if (!existUser) throw new BadRequestException("no username found")
        
        const validatePassword = await bcrypt.compare(dto.password,existUser.password)
        if (!validatePassword) throw new BadRequestException("wrong data")

        const role = await this.userService.getUserRole(dto.username)
        const token = await this.tokenService.generateJwtToken({ username:dto.username,role:role })
        return {...existUser,token}
    }
}
