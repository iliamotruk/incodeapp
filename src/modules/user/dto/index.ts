import { ApiProperty } from "@nestjs/swagger";
import {IsOptional, IsString, NotContains } from "class-validator";

export class CreateUserDTO{
    @ApiProperty()
    @IsString()
    username: string
    
    @ApiProperty()
    @IsString()
    password: string
    
    @ApiProperty()
    @IsOptional() 
    @IsString()
    @NotContains("admin")
    supervisor: string
} 


