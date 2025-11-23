export interface IRecipe {
    chefId:object;
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
    status:string;

}