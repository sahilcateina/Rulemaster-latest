// 


import { Engine } from 'json-rules-engine';
import * as rulesDAO from '../dao/rules.dao';
import { v4 as uuidv4 } from 'uuid';
import * as NLPService from './nlp.service';

export interface ParsedRule {
    name: string;
    description: string; // <- make required
    conditions: any;
    event: {
      type: string;
      params: Record<string, any>;
    };
    priority?: number;
  }
  

interface Rule {
    id: string;
    tenant_id: string;
    name: string;
    description: string;
    conditions: any;
    actions: any;
    priority: number;
    is_active: boolean;
}

export const parseAndSave = async (prompt: string, tenant_id: string) => {
    const parsed: ParsedRule = await NLPService.parseToRule(prompt);

    const rule: Rule = {
        id: uuidv4(),
        tenant_id,
        name: parsed.name,
        description: parsed.description,
        conditions: parsed.conditions,
        actions: parsed.event,
        priority: parsed.priority || 0,
        is_active: true
    };

    const { data, error } = await rulesDAO.createRule(rule);
    if (error) throw error;

    return { rule: data };
};

export const createRule = async (rule: Rule) => rulesDAO.createRule(rule);
export const updateRule = async (id: string, updates: Partial<Rule>) => rulesDAO.updateRule(id, updates);
export const deleteRule = async (id: string) => rulesDAO.deleteRule(id);
export const getAllRules = async (tenantId?: string) => rulesDAO.getAllRules(tenantId);

export const applyRules = async (tenantId: string, inputData: any) => {
    const { data: rules, error } = await rulesDAO.getAllRules(tenantId);
    if (error) throw new Error('Failed to fetch rules');

    const engine = new Engine();

    for (const rule of rules) {
        engine.addRule({
            conditions: rule.conditions,
            event: rule.actions,
            name: rule.name,
            priority: rule.priority
        });
    }

    const results = await engine.run(inputData);
    return results.events;
};





// import { Engine } from 'json-rules-engine';
// import * as rulesDAO from '../dao/rules.dao';
// import { v4 as uuidv4 } from 'uuid';
// import * as NLPService from './nlp.service';

// interface ParsedRule {
//   name: string;
//   description: string;
//   conditions: any;
//   event: any;
//   priority?: number;
// }

// interface Rule {
//   id: string;
//   tenant_id: string;
//   name: string;
//   description: string;
//   conditions: any;
//   actions: any;
//   priority: number;
//   is_active: boolean;
// }

// export const parseAndSave = async (prompt: string, tenant_id: string) => {
//   const parsed: ParsedRule = await NLPService.parseToRule(prompt);

//   const rule: Rule = {
//     id: uuidv4(),
//     tenant_id,
//     name: parsed.name,
//     description: parsed.description,
//     conditions: parsed.conditions,
//     actions: parsed.event,
//     priority: parsed.priority || 0,
//     is_active: true
//   };

//   const { data, error } = await rulesDAO.createRule(rule);
//   if (error) throw error;

//   return { rule: data };
// };

// export const createRule = async (rule: Rule) => rulesDAO.createRule(rule);
// export const updateRule = async (id: string, updates: Partial<Rule>) => rulesDAO.updateRule(id, updates);
// export const deleteRule = async (id: string) => rulesDAO.deleteRule(id);
// export const getAllRules = async (tenantId?: string) => rulesDAO.getAllRules(tenantId);

// export const applyRules = async (tenantId: string, inputData: any) => {
//   const { data: rules, error } = await rulesDAO.getAllRules(tenantId);
//   if (error) throw new Error('Failed to fetch rules');

//   const engine = new Engine();

//   for (const rule of rules) {
//     engine.addRule({
//       name: rule.name,
//       priority: rule.priority,
//       conditions: rule.conditions,
//       event: rule.actions
//     });
//   }

//   const results = await engine.run(inputData);
//   return results.events;
// };
