import { annotateVideo, getVideoById, videoComparison } from '../Controllers/annotation.js';
import express from 'express';
const router = express.Router();

router.get('/:id', getVideoById);
router.post('/annotate', annotateVideo);
router.get('/:id/comparison',videoComparison)
export default router