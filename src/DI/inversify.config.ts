import { Container } from "inversify";
import { authModule } from "./module/auth";
import userModule from "./module/user";


const container=new Container();
 
authModule(container);
userModule(container);

export default container;