
// rules.controller.ts
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import * as service from '../services/realm.service';


export const createRealmController = async (req: Request, res: Response): Promise<void> => {
  try {
    const realmData = req.body;


    const result = await service.createRealm(realmData);
    
    // Check if the service returned an error
    if (result.error) {
      res.status(400).json({ 
        status: 400,
        error: true,
        message: result.msg,
        data: result.data || null
      });
      return;
    }

    // Success response
    res.status(201).json({ 
      status: 201,
      error: false,
      message: result.msg,
      data: result.data
    });

  } catch (err: any) {
    console.error('Error in createRealmController:', err);
    res.status(500).json({ 
      status: 500,
      error: true,
      message: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

export const getRealms = async (req: Request, res: Response) => {
    try {
      const { data, error } = await service.getRealmsevice(req.params.id,);
      if (error) throw error;
      res.json({ status: 200, data });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  };