import { ApiProperty } from "@nestjs/swagger"
import { IsString } from "class-validator"

export class UserLoginDTO{
    @ApiProperty()
    @IsString()
    username: string

    @ApiProperty()
    @IsString()
    password:string
}