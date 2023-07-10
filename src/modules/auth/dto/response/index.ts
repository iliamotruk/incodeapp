import { IsString } from "class-validator";

export class AuthUserResponseDTO {
    @IsString()
    role: string

    @IsString()
    username: string

    @IsString()
    password: string

    @IsString()
    supervisor: string

    @IsString()
    token: string
}