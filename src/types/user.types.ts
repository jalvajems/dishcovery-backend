export interface IUser{
    name: string;
    email: string;
    password: string;
    role: "admin"|"chef"|"foodie";
    isVarified: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}