import { annotateVideo, getVideoById } from '../Controllers/annotation.js';
import express from 'express';
const router = express.Router();

router.get('/:id', getVideoById);
router.post('/annotate', annotateVideo);
export default router