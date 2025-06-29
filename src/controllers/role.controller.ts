import { Request, Response } from 'express';
import * as roleService from '../services/role.service';

export const getRoleById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { data, error } = await roleService.getRoleById(id);

    if (error || !data) {
       res.status(404).json({ status: 404, error: 'Role not found' });
    }

     res.status(200).json({ status: 200, data });
  } catch (err: any) {
     res.status(500).json({ status: 500, error: err.message });
  }
};
