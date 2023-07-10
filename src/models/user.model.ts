import { Column, Model, Table } from "sequelize-typescript";


@Table
export class User extends Model {
    @Column
    role:string

    @Column
    username: string
    
    @Column
    password: string 

    @Column
    supervisor: string|null 
}