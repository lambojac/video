
import express from 'express';
import upload from '../Middlewares/multer';
import { banner, profilePic } from '../Controllers/uploads';
const router = express.Router();
router.post("/upload/banner/:id",upload.single("avatar"),profilePic)
router.post("/upload/avatar/:id",upload.single("banner"),banner)
export default router; 