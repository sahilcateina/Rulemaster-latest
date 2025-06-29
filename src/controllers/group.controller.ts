import { Request, Response } from 'express';
import * as groupService from '../services/group.service';


export const getGroupById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { data, error } = await groupService.getGroupById(id);
  
      if (error || !data) {
        res.status(404).json({ status: 404, error: 'Group not found' });
        return;
      }
  
      res.status(200).json({ status: 200, data });
    } catch (err: any) {
      res.status(500).json({ status: 500, error: err.message });
    }
  };
