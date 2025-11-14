export enum Role{
    USER='user',
    CHEF='chef',
    ADMIN='admin'
}
export interface IUser{
    name: string;
    email: string;
    password: string;
    role: Role;
    isVarified: boolean;
    isBlocked:boolean;
    createdAt?: Date;
    updatedAt?: Date;
}