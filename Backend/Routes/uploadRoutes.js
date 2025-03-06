
import express from 'express';
import upload from '../Middlewares/multer.js';
import { banner, profilePic } from '../Controllers/uploads.js';
import { protect } from '../Middlewares/auth.js';
const router = express.Router();
router.post("/banner/:id", protect, upload.single("banner"), banner);
router.post("/avatar/:id", protect, upload.single("avatar"), profilePic);
export default router; 