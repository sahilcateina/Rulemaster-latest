// rules.route.ts
import express from 'express';
import * as controller from '../controllers/realm.controller';

const router = express.Router();
router.post('/createRealm',controller.createRealmController);

export default router;

