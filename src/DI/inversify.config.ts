import { Container } from "inversify";
import { authModule } from "./module/auth";
import userModule from "./module/user";
import { foodieModule } from "./module/foodie";
import { adminModule } from "./module/admin";
import chefModule from "./module/chef";
import recipeModule from "./module/recipe";



const container=new Container();
 
authModule(container);
userModule(container);
foodieModule(container);
adminModule(container);
chefModule(container);
recipeModule(container);

export default container;