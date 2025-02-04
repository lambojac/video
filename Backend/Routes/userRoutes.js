import express from 'express';
import { loginUser,registerUser,logOut} from '../Controllers/userController.js';
const router = express.Router();
//Routes
router.post('/register', registerUser);
router.post("/login",loginUser)
router.get("/logout",logOut)
export default router; 
