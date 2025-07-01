import express from 'express';
import { getGroupById } from '../controllers/group.controller';
import { create } from 'domain';
import { createGroup } from '../controllers/group.controller';

const router = express.Router();

router.get('/getGroups/:id', getGroupById);
router.post('/createGroup', createGroup);

export default router;