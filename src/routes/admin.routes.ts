import {Router} from 'express';
import { verifyAccess } from '../middlewares/verifyAccess';
import { authorizeRole } from '../middlewares/authorizeRole';
const router=Router();

// router.get('/admin-dashboard',verifyAccess,authorizeRole('admin'),  (req, res) => {
//     res.status(200).json({ message: 'Welcome to the Admin Dashboard' });
//   })
// router.get('/user-listing')

export default router;