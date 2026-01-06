import { Container } from "inversify";
import { authModule } from "./module/auth";
import userModule from "./module/user.di";
import { foodieModule } from "./module/foodie";
import { adminModule } from "./module/admin.di";
import chefModule from "./module/chef.di";
import recipeModule from "./module/recipe.di";
import { reviewModule } from "./module/review.di";
import blogModule from "./module/blog.di";
import fileModule from "./module/file.di";
import { foodSpotModule } from "./module/foodSpot.di";
import { workshopModule } from "./module/workshop.di";



const container=new Container();
 
authModule(container);
userModule(container);
foodieModule(container);
adminModule(container);
chefModule(container);
recipeModule(container);
reviewModule(container)
blogModule(container);
fileModule(container);
foodSpotModule(container);
workshopModule(container);


export default container;