import {Router} from 'express'
import {demoController, demoError} from '../controllers/implementation/demo.controller'

const router=Router(); 

router.get('/',demoController.getMessage);

router.get('/fail',demoError.getError);

export default router;