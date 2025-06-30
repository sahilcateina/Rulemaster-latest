import express from 'express';
import controller from '../controllers/user.controller';

const router = express.Router();

router.post('/:id', controller.createUser);
router.get('/getUsers/:id', controller.getUsers);
router.put('/:id', controller.updateUser);
router.delete('/:id', controller.deleteUser);

export default router;
