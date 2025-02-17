import express from 'express';
import  multer from 'multer';
import {uploadVideo,getVideos} from '../controllers/videoController.js'
import upload from '../Middlewares/videoMulter.js';
const router = express.Router();


router.post('/upload', upload.single('file'), uploadVideo);
router.get('/', getVideos);

export default router
