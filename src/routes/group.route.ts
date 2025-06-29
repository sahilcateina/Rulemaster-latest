import express from 'express';
import { getGroupById } from '../controllers/group.controller';

const router = express.Router();

router.get('/:id', getGroupById);

export default router;