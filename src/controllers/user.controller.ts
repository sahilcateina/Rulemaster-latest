import { Request, Response } from 'express';
import * as service from '../services/user.service';
import { User } from '../types/User';

const createUser = async (req: Request, res: Response) => {
  try {
    const { data, error } = await service.createUser(req.body);
    if (error) throw error;
    res.json({ status: 200, data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getUsers = async (req: Request, res: Response) => {
    try {
      const { data, error } = await service.getUsers(req.params.id);
      if (error) throw error;
      res.json({ status: 200, data });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  };
  
  export const updateUser = async (req: Request, res: Response) => {
    try {
      const { data, error } = await service.updateUser(req.params.id, req.body);
      if (error) throw error;
      res.json({ status: 200, data });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  };
  
  export const deleteUser = async (req: Request, res: Response) => {
    try {
      const { error } = await service.deleteUser(req.params.id);
      if (error) throw error;
      res.json({ status: 200, message: 'User deleted successfully' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  };

export default {
  createUser,
  getUsers,
  updateUser,
  deleteUser,
};
