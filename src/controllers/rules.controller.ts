// rules.controller.ts
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import * as service from '../services/rules.service';

export const createRule = async (req: Request, res: Response): Promise<void> => {
  try {
    const rule = {
      id: uuidv4(),
      tenant_id: req.body.tenant_id,
      name: req.body.name,
      description: req.body.description,
      conditions: req.body.conditions,
      actions: req.body.actions,
      priority: req.body.priority || 0,
      is_active: true
    };
    const { data, error } = await service.createRule(rule);
    if (error) throw error;
    res.json({ status: 200, data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};


export const updateRule = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const { data, error } = await service.updateRule(id, updates);
    if (error) throw error;
    res.json({ status: 200, data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteRule = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { error } = await service.deleteRule(id);
    if (error) throw error;
    res.json({ status: 200, message: 'Rule deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getAllRules = async (req: Request, res: Response): Promise<void> => {
  try {
    const tenant_id = req.query.tenant_id as string | undefined;
    const { data, error } = await service.getAllRules(tenant_id);
    if (error) throw error;
    res.json({ status: 200, data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const parseAndCreateRule = async (req: Request, res: Response): Promise<void> => {
    try {
        const prompt: string = req.body.prompt;
        const tenant_id: string = req.body.tenant_id || req.body['tenant-id'] || req.headers['tenant-id'];

        if (!prompt || !tenant_id) {
            res.status(400).json({ error: 'Prompt and tenant_id are required' });
            return;
        }

        const saved = await service.parseAndSave(prompt, tenant_id);
        res.status(200).json({ status: 200, data: saved.rule });
    } catch (err: any) {
        console.error('Rule creation failed:', err.message);
        res.status(500).json({ error: err.message });
    }
};

export const applyRules = async (req: Request, res: Response): Promise<void> => {
    try {
        const { tenant_id, input } = req.body;

        if (!tenant_id || !input) {
            res.status(400).json({ error: "tenant_id and input are required" });
            return;
        }

        const events = await service.applyRules(tenant_id, input);
        res.status(200).json({ status: 200, events });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export function createRealmController(arg0: string, createRealmController: any) {
    throw new Error('Function not implemented.');
}
