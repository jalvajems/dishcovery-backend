import { Container } from "inversify";
import { authModule } from "./module/auth.di";
import userModule from "./module/user.di";
import { foodieModule } from "./module/foodie.di";
import { adminModule } from "./module/admin.di";
import chefModule from "./module/chef.di";
import recipeModule from "./module/recipe.di";
import { reviewModule } from "./module/review.di";



const container=new Container();
 
authModule(container);
userModule(container);
foodieModule(container);
adminModule(container);
chefModule(container);
recipeModule(container);
reviewModule(container)


export default container;