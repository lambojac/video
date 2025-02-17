import express from 'express';
import { loginUser,registerUser,logOut, getUserById, searchUsers} from '../Controllers/userController.js';
import { protect } from '../Middlewares/auth.js';
const router = express.Router();
//Routes
router.post('/register', registerUser);
router.post("/login",loginUser)
router.get("/logout",logOut)
router.get("/search",searchUsers)
router.get("/",protect,getUserById)
export default router; 
