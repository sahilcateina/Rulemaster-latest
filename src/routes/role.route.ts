import express from 'express';
import { getRoleById } from '../controllers/role.controller';

const router = express.Router();

router.get('/getRoles/:id', getRoleById);

export default router;
