// rules.route.ts
import express from 'express';
import * as controller from '../controllers/rules.controller';

const router = express.Router();

router.put('/:id', controller.updateRule);
router.delete('/:id', controller.deleteRule);
router.get('/', controller.getAllRules);
// router.post('/apply', controller.applyRules);
router.post('/create', controller.parseAndCreateRule);
router.post('/apply',controller.applyRules);

export default router;

