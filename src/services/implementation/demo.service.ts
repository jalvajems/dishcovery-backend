import {demoRepo} from '../../repostories/implementation/demo.repository'

export const demoService={
    async getDemoMessage(){
        const data= await demoRepo.fetchMessage()
        return data;
    }
}