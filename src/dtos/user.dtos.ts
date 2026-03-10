
export interface IUserDto{
     _id: string;
    name: string;
    email: string;
    role: string;
    isVerified: boolean;
    isBlocked:boolean;
    createdAt?: Date;
    updatedAt?: Date;
}


