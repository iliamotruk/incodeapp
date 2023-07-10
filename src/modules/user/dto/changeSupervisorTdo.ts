import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString, NotContains } from "class-validator";

export class ChangeUserSupervisorDTO{
    @ApiProperty()
    @IsString()
    username: string

    @ApiProperty()
    @IsString()
    @NotContains("admin")
    supervisor: string
} 