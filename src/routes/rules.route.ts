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


// import express from 'express';
// import {
//   updateRule,
//   deleteRule,
//   getAllRules,
//   applyRules,
//   parseAndCreateRule
// } from '../controllers/rules.controller';

// const router = express.Router();

// router.put('/:id', updateRule);
// router.delete('/:id', deleteRule);
// router.get('/', getAllRules);
// router.post('/apply',applyRules);
// router.post('/create', parseAndCreateRule);

// export default router;
