import express from 'express';
import controller from '../controllers/user.controller';

const router = express.Router();

router.post('/', controller.createUser);
router.get('/', controller.getUsers);
router.put('/:id', controller.updateUser);
router.delete('/:id', controller.deleteUser);

export default router;
