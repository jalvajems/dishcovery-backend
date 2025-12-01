import { Container } from "inversify";
import { authModule } from "./module/auth";
import userModule from "./module/user.di";
import { foodieModule } from "./module/foodie";
import { adminModule } from "./module/admin.di";
import chefModule from "./module/chef.di";
import recipeModule from "./module/recipe.di";
import { reviewModule } from "./module/review.di";
import blogModule from "./module/blog.di";



const container=new Container();
 
authModule(container);
userModule(container);
foodieModule(container);
adminModule(container);
chefModule(container);
recipeModule(container);
reviewModule(container)
blogModule(container);


export default container;