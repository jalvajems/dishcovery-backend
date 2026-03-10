export interface IRecipeDto{
    chefId:string;
    _id:string;
    title:string;
    cuisine:string;
    cookingTime:number;
    tags:object;
    dietType:object;
    ingredients:object;
    steps:object;
    images:object;
    isDraft:boolean;
    isBlock:boolean;
}