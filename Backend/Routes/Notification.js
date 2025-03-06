import { Notifications, TaggableUser, tagUser } from "../Controllers/Notification.js";
import {protect} from "../Middlewares/auth.js"
import express from 'express';
const router = express.Router();
router.get('/tagable-users',TaggableUser)
router.post('/:videoId/tag',tagUser)
router.get('/notifications/',protect,Notifications)

export default router
