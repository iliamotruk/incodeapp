import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from 'src/models/user.model';
import { Sequelize } from "sequelize-typescript"
import * as bcrypt from "bcrypt"
import { CreateUserDTO } from 'src/modules/user/dto';
import { Op, Transaction } from 'sequelize';
import { ConfigService } from '@nestjs/config';
import { ChangeUserSupervisorDTO } from './dto/changeSupervisorTdo';

@Injectable()
export class UserService implements OnModuleInit {
    constructor(@InjectModel(User) private readonly user: typeof User, private readonly configService: ConfigService, private sequelize: Sequelize) { }

    async hashPassword(password): Promise<string>{
        try {
            return await bcrypt.hash(password, 10)
        } catch (error) {
            throw new BadRequestException(`ERROR:${error}`)
        }
    }

    async findUserByUsername(username: string): Promise<User>{
        try {
            return await this.user.findOne({ where: { username } })
        } catch (error) {
            throw new BadRequestException(`ERROR:${error}`)
        }
    }
    async findUsersBySupervisor(username: string): Promise<User[]> {
        try {
            return await this.user.findAll({ where: { supervisor: username } })

        } catch (error) {
            throw new BadRequestException(`ERROR:${error}`)

        }
    }
    async getUserRole(username: string): Promise<string> {
        try {
            const user = await this.user.findOne({ where: { username } })
            return user.role
        } catch (error) {
            throw new BadRequestException(`ERROR:${error}`)
        }
    }



    async createAdmin(): Promise<void> {
        try {
            const admin = await this.findUserByUsername("admin")
            if (!admin) {
                const adminPassword = await this.hashPassword(this.configService.get("admin_password"))
                await this.user.create({
                    role: "admin",
                    username: "admin",
                    password: adminPassword,
                    supervisor: null,
                })
            } 
        } catch (error) {
            throw new BadRequestException(`ERROR:${error}`)
        }
    }
    async createUser(dto: CreateUserDTO): Promise<CreateUserDTO> {
        try {
            dto.password = await this.hashPassword(dto.password)
            await this.user.create({
                role: "user",
                username: dto.username,
                password: dto.password,
                supervisor: dto.supervisor,
            })

            return dto
        } catch (error) {
            throw new BadRequestException(`ERROR:${error}`)
        }
    }
    async getUsers(req): Promise<User[]|User> {
        const { username, role } = req.user
        try {
            if (role === "admin") {
                return await this.user.findAll()
            }
            if (role === "boss") {
                return await this.getAllUserSubordinates(username)
            }
            if (role === "user") {
                return await this.user.findAll({ where: { username } })
            }
        } catch (error) {
            throw new BadRequestException(`ERROR:${error}`)
        }
    }

    
    async changeUserToBoss(dto: CreateUserDTO): Promise<void> {
        try {
            if (dto.supervisor) {
                const supervisor = await this.user.findOne({ where: { username: { [Op.eq]: dto.supervisor } } })
                if (!supervisor) throw new BadRequestException("there is no such supervisor")

                supervisor.set({
                    role: "boss"
                })
                await supervisor.save()
            }
        } catch (error) {
            throw new BadRequestException(`ERROR:${error}`)
        }

    }
    async changeUserSupervisor(req, dto: ChangeUserSupervisorDTO): Promise<User|void> {
        try {
            return await this.sequelize.transaction(async (t) => {
                const { username } = req.user
                const userToChange = await this.findUserByUsername(dto.username)
                if (!userToChange) throw new BadRequestException("there is no such user")
                const subordinates: string[] = await (await this.getAllUserSubordinates(username)).map(e=>e.dataValues.username)
                if (!subordinates.includes(dto.username)) throw new BadRequestException("you are not allowed to change user supervisor")

                const newSupervisor = await this.findUserByUsername(dto.supervisor)
                if (!newSupervisor) throw new BadRequestException("there is no such supervisor")

                userToChange.set({
                    supervisor: newSupervisor.username
                })
                await userToChange.save({ transaction: t })

                this.checkIfStilSupervisor(username, t)

                return userToChange
            })
            
        } catch (error) {
            throw new BadRequestException(`ERROR:${error}`)
        }
    }
    async checkIfStilSupervisor(username: string, t: Transaction): Promise<void> {
        try {
            const subordinate = await this.findUsersBySupervisor(username)
            if (!subordinate) {
                const userToChange = await this.findUserByUsername(username)
                userToChange.set({
                    role: "user"
                })
                await userToChange.save({ transaction: t })
            }
        } catch (error) {
            throw new BadRequestException(`ERROR:${error}`)
        }
    }
    async getAllUserSubordinates(username: string): Promise<User[]> {
        try {
            let resultArray: User[] = []
            let boss: User = await this.findUserByUsername(username)
            resultArray.push(boss)
            await recursiveSubordinatesFind.bind(this)(boss.username)
            return resultArray

            async function recursiveSubordinatesFind(boss: string): Promise<void> {
                const subordinates = await this.findUsersBySupervisor(boss)
                if (subordinates) {
                    resultArray = resultArray.concat(subordinates)
                    for await (const subordinate of subordinates) {
                        await recursiveSubordinatesFind.bind(this)(subordinate.dataValues.username)
                    }
                }
            }
        } catch (error) {
            throw new BadRequestException(`ERROR:${error}`)
        }
    }
    onModuleInit() {
        this.createAdmin()
    } 
}
