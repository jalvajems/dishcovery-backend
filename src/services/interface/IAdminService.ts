import { IPaginationDto } from "../../dtos/IPaginationDto";
import { IRecipeDto } from "../../dtos/recipe.dtos";
import { IUserDto } from "../../dtos/user.dtos";
import { IRecipe } from "../../types/recipe.types";

export interface IAdminService{
    getAllFoodies(query:IPaginationDto):Promise<{data:IUserDto[],currentPage:number,totalPages:number}>;
    getAllChefs(query:IPaginationDto):Promise<{ data: IUserDto[]; currentPage: number; totalPages: number; }>;
    blockUserById(id:string):Promise<IUserDto>; 
    unBlockUserById(id:string):Promise<IUserDto>; 
    verifyChef(id:string):Promise<IUserDto>;
    unVerifyChef(id:string):Promise<IUserDto>;
    getAllRecipes(query:IPaginationDto):Promise<{data:IRecipeDto[],currentPage:number,totalPages:number}>;
    getAllRecipes(query:IPaginationDto):Promise<{data:IRecipeDto[],currentPage:number,totalPages:number}>;
    blockRecipe(id:string):Promise<IRecipeDto>;
    unblockRecipe(id:string):Promise<IRecipeDto>;
}