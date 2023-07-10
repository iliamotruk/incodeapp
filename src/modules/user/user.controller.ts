import { Request, Controller, Get, UseGuards, Post, Body } from '@nestjs/common';
import { UserService } from './user.service';
import { RolesGuard } from 'src/guards/roleGuards';
import { ChangeUserSupervisorDTO } from './dto/changeSupervisorTdo';
import { User } from 'src/models/user.model';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';


@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @ApiBearerAuth()
    @ApiTags("API")
    @UseGuards(RolesGuard)
    @Get()
    test(@Request() req: Request): Promise<User[]|User> {
        return this.userService.getUsers(req)
    }
    
    @ApiBearerAuth()
    @ApiTags("API")
    @UseGuards(RolesGuard)
    @Post("change-supervisor")
    changeUserSupervisor(@Request() req: Request, @Body() dto: ChangeUserSupervisorDTO): Promise<User|void> {
        return this.userService.changeUserSupervisor(req, dto)
    }
}
