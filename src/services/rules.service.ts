import { Engine } from 'json-rules-engine';
import * as rulesDAO from '../dao/rules.dao';
import { v4 as uuidv4 } from 'uuid';
import * as NLPService from './nlp.service';
import { normalizeOperators } from '../utils/rule.utils';

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

// export const applyRules = async (tenantId: string, inputData: any) => {
//     const { data: rules, error } = await rulesDAO.getAllRules(tenantId);
//     if (error) throw new Error('Failed to fetch rules');

//     const engine = new Engine();

//     for (const rule of rules) {
//         engine.addRule({
//             conditions: rule.conditions,
//             event: rule.actions,
//             name: rule.name,
//             priority: rule.priority
//         });
//     }

//     const results = await engine.run(inputData);
//     return results.events;
// };


export const applyRules = async (tenantId: string, inputData: any) => {
    const { data: rules, error } = await rulesDAO.getAllRules(tenantId);
    if (error) throw new Error('Failed to fetch rules');
  
    const engine = new Engine();
  
    for (const rule of rules) {
      const normalizedConditions = normalizeOperators(rule.conditions);
  
      engine.addRule({
        conditions: normalizedConditions,
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
// import { normalizeOperators } from '../utils/rule.utils';
// import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
// import { CopilotBackend } from '@copilotkit/backend';
// import { HumanMessage } from '@langchain/core/messages';
// import { CopilotRuntime, LangChainAdapter } from '@copilotkit/runtime';

// const copilotBackend = new CopilotBackend();

// // Initialize CopilotKit
// const model = new ChatGoogleGenerativeAI({
//   model: "gemini-1.5-flash",
//   temperature: 0,
//   apiKey: process.env.GEMINI_API_KEY || '',
// });

// const copilotRuntime = new CopilotRuntime();
// const serviceAdapter = new LangChainAdapter({
//   chainFn: async ({ messages, tools, threadId }) => {
//     const modelWithTools = model.bindTools(tools);
//     return modelWithTools.stream(messages, { 
//       tools, 
//       metadata: { conversation_id: threadId } 
//     });
//   },
// });

// export interface ParsedRule {
//     name: string;
//     description: string; // <- make required
//     conditions: any;
//     event: {
//       type: string;
//       params: Record<string, any>;
//     };
//     priority?: number;
//   }
  

// interface Rule {
//     id: string;
//     tenant_id: string;
//     name: string;
//     description: string;
//     conditions: any;
//     actions: any;
//     priority: number;
//     is_active: boolean;
// }

// export const parseAndSave = async (prompt: string, tenant_id: string) => {
//     const parsed: ParsedRule = await NLPService.parseToRule(prompt);

//     const rule: Rule = {
//         id: uuidv4(),
//         tenant_id,
//         name: parsed.name,
//         description: parsed.description,
//         conditions: parsed.conditions,
//         actions: parsed.event,
//         priority: parsed.priority || 0,
//         is_active: true
//     };

//     const { data, error } = await rulesDAO.createRule(rule);
//     if (error) throw error;

//     return { rule: data };
// };

// export const createRule = async (rule: Rule) => rulesDAO.createRule(rule);
// export const updateRule = async (id: string, updates: Partial<Rule>) => rulesDAO.updateRule(id, updates);
// export const deleteRule = async (id: string) => rulesDAO.deleteRule(id);
// export const getAllRules = async (tenantId?: string) => rulesDAO.getAllRules(tenantId);

// // export const applyRules = async (tenantId: string, inputData: any) => {
// //     const { data: rules, error } = await rulesDAO.getAllRules(tenantId);
// //     if (error) throw new Error('Failed to fetch rules');

// //     const engine = new Engine();

// //     for (const rule of rules) {
// //         engine.addRule({
// //             conditions: rule.conditions,
// //             event: rule.actions,
// //             name: rule.name,
// //             priority: rule.priority
// //         });
// //     }

// //     const results = await engine.run(inputData);
// //     return results.events;
// // };


// // export const applyRules = async (tenantId: string, inputData: any) => {
// //     const { data: rules, error } = await rulesDAO.getAllRules(tenantId);
// //     if (error) throw new Error('Failed to fetch rules');
  
// //     const engine = new Engine();
  
// //     for (const rule of rules) {
// //       const normalizedConditions = normalizeOperators(rule.conditions);
  
// //       engine.addRule({
// //         conditions: normalizedConditions,
// //         event: rule.actions,
// //         name: rule.name,
// //         priority: rule.priority
// //       });
// //     }
  
// //     const results = await engine.run(inputData);
// //     return results.events;
// //   };


//   // export const applyRules = async (tenantId: string, input: any) => {
//   //   try {
//   //     // If input is a string prompt (e.g., "use the SalesBonus rule on this spreadsheet")
//   //     if (typeof input === 'string') {
//   //       return await applyRuleByName(tenantId, input);
//   //     }
//   //     // If input is data for JSON rules engine
//   //     else {
//   //       return await applyJsonRules(tenantId, input);
//   //     }
//   //   } catch (err: any) {
//   //     throw new Error(`Failed to apply rules: ${err.message}`);
//   //   }
//   // };
  
//   const applyJsonRules = async (tenantId: string, inputData: any) => {
//     const { data: rules, error } = await rulesDAO.getAllRules(tenantId);
//     if (error) throw new Error('Failed to fetch rules');
  
//     const engine = new Engine();
//     for (const rule of rules) {
//       const normalizedConditions = normalizeOperators(rule.conditions);
//       engine.addRule({
//         conditions: normalizedConditions,
//         event: rule.actions,
//         name: rule.name,
//         priority: rule.priority
//       });
//     }
//     const results = await engine.run(inputData);
//     return results.events;
//   };
  
//   // const applyRuleByName = async (tenantId: string, prompt: string) => {
//   //   // Extract rule name from prompt
//   //   const ruleNameMatch = prompt.match(/use\s+the\s+(\w+)\s+rule/i);
//   //   if (!ruleNameMatch || !ruleNameMatch[1]) {
//   //     throw new Error('Please specify a rule name in the format "use the [ruleName] rule"');
//   //   }
//   //   const ruleName = ruleNameMatch[1];
  
//   //   // Get rule from database
//   //   const { data: rules, error } = await rulesDAO.getAllRules(tenantId);
//   //   if (error) throw error;
    
//   //   const rule = rules.find(r => r.name === ruleName);
//   //   if (!rule) {
//   //     throw new Error(`Rule "${ruleName}" not found`);
//   //   }
  
//   //   // Prepare CopilotKit tools
//   //   const tools = [
//   //     {
//   //       name: "apply_rule_to_spreadsheet",
//   //       description: `Applies the ${ruleName} rule to spreadsheet data`,
//   //       parameters: {
//   //         type: "object",
//   //         properties: {
//   //           spreadsheetData: {
//   //             type: "array",
//   //             items: {
//   //               type: "object",
//   //               properties: {
//   //                 salesUnits: { type: "number" },
//   //                 // Add other relevant properties based on rule conditions
//   //               }
//   //             },
//   //             description: "The spreadsheet data to apply the rule to"
//   //           }
//   //         },
//   //         required: ["spreadsheetData"]
//   //       },
//   //       func: async ({ spreadsheetData }: any) => {
//   //         // Apply the rule using JSON rules engine
//   //         const engine = new Engine();
//   //         const normalizedConditions = normalizeOperators(rule.conditions);
//   //         engine.addRule({
//   //           conditions: normalizedConditions,
//   //           event: rule.actions,
//   //           name: rule.name,
//   //           priority: rule.priority
//   //         });
  
//   //         const results = [];
//   //         for (const row of spreadsheetData) {
//   //           const result = await engine.run(row);
//   //           if (result.events.length > 0) {
//   //             results.push({
//   //               row,
//   //               actions: result.events
//   //             });
//   //           }
//   //         }
//   //         return results;
//   //       }
//   //     }
//   //   ];
  
//   //   // Process with CopilotKit
//   //   const messages = [{
//   //     role: "user" as const,
//   //     content: prompt
//   //   }];
  
//   //   const response = await copilotRuntime.stream({
//   //     messages,
//   //     tools,
//   //   });
  
//   //   // Convert the stream to a string response
//   //   let fullResponse = "";
//   //   for await (const chunk of response) {
//   //     fullResponse += chunk;
//   //   }
  
//   //   return fullResponse;
//   // };



//   // const applyRuleByName = async (tenantId: string, prompt: string) => {
//   //   // Extract rule name from prompt
//   //   const ruleNameMatch = prompt.match(/use\s+the\s+(\w+)\s+rule/i);
//   //   if (!ruleNameMatch || !ruleNameMatch[1]) {
//   //     throw new Error('Please specify a rule name in the format "use the [ruleName] rule"');
//   //   }
//   //   const ruleName = ruleNameMatch[1];
  
//   //   // Get rule from database
//   //   const { data: rules, error } = await rulesDAO.getAllRules(tenantId);
//   //   if (error) throw error;
    
//   //   const rule = rules.find(r => r.name === ruleName);
//   //   if (!rule) {
//   //     throw new Error(`Rule "${ruleName}" not found`);
//   //   }
  
//   //   // Prepare the tool
//   //   const applyRuleTool = {
//   //     name: "apply_rule_to_spreadsheet",
//   //     description: `Applies the ${ruleName} rule to spreadsheet data`,
//   //     parameters: {
//   //       type: "object",
//   //       properties: {
//   //         spreadsheetData: {
//   //           type: "array",
//   //           items: {
//   //             type: "object",
//   //             properties: {
//   //               salesUnits: { type: "number" },
//   //               // Add other relevant properties
//   //             }
//   //           }
//   //         }
//   //       },
//   //       required: ["spreadsheetData"]
//   //     },
//   //     func: async ({ spreadsheetData }: any) => {
//   //       const engine = new Engine();
//   //       const normalizedConditions = normalizeOperators(rule.conditions);
//   //       engine.addRule({
//   //         conditions: normalizedConditions,
//   //         event: rule.actions,
//   //         name: rule.name,
//   //         priority: rule.priority
//   //       });
  
//   //       const results = [];
//   //       for (const row of spreadsheetData) {
//   //         const result = await engine.run(row);
//   //         if (result.events.length > 0) {
//   //           results.push({
//   //             row,
//   //             actions: result.events
//   //           });
//   //         }
//   //       }
//   //       return results;
//   //     }
//   //   };
  
//   //   // Process with CopilotKit
//   //   const messages = [new HumanMessage(prompt)];
    
//   //   const response = await model.invoke(messages, {
//   //     tools: [applyRuleTool],
//   //     tool_choice: "auto"
//   //   });
  
//   //   return response.content.toString();
//   // };


//   // const applyRuleByName = async (tenantId: string, prompt: string) => {
//   //   // Extract rule name from prompt
//   //   const ruleNameMatch = prompt.match(/SalesBonus/i);
//   //   if (!ruleNameMatch) {
//   //     throw new Error('Please specify a rule name containing "SalesBonus"');
//   //   }
//   //   const ruleName = ruleNameMatch[0];
  
//   //   // Get rule from database
//   //   const { data: rules, error } = await rulesDAO.getAllRules(tenantId);
//   //   if (error) throw error;
    
//   //   const rule = rules.find(r => r.name === ruleName);
//   //   if (!rule) {
//   //     throw new Error(`Rule "${ruleName}" not found`);
//   //   }
  
//   //   // Extract values from prompt
//   //   const salesMatch = prompt.match(/sold the (\d+) products/);
//   //   const salaryMatch = prompt.match(/salary which is (\w+) thousand/i);
    
//   //   if (!salesMatch || !salaryMatch) {
//   //     throw new Error('Could not extract required values from prompt');
//   //   }
  
//   //   const salesUnits = parseInt(salesMatch[1]);
//   //   const salaryText = salaryMatch[1];
//   //   const salary = convertWordsToNumber(salaryText) * 1000;
  
//   //   // Apply the rule using JSON rules engine
//   //   const engine = new Engine();
//   //   const normalizedConditions = normalizeOperators(rule.conditions);
//   //   engine.addRule({
//   //     conditions: normalizedConditions,
//   //     event: rule.actions,
//   //     name: rule.name,
//   //     priority: rule.priority
//   //   });
  
//   //   const inputData = { salesUnits, salary };
//   //   const results = await engine.run(inputData);
  
//   //   if (results.events.length === 0) {
//   //     return {
//   //       message: "Rule conditions not met",
//   //       salesUnits,
//   //       requiredUnits: rule.conditions.all[0].value,
//   //       bonusApplied: false
//   //     };
//   //   }
  
//   //   const discountPercentage = results.events[0].params.discountPercentage;
//   //   const bonusAmount = (salary * discountPercentage) / 100;
  
//   //   return {
//   //     message: "Bonus calculated successfully",
//   //     salesUnits,
//   //     salary,
//   //     discountPercentage: `${discountPercentage}%`,
//   //     bonusAmount,
//   //     newSalary: salary + bonusAmount
//   //   };
//   // };
  

//   // const applyRuleByName = async (tenantId: string, prompt: string) => {
//   //   try {
//   //     // Extract rule name from prompt
//   //     const ruleNameMatch = prompt.match(/SalesBonus/i);
//   //     if (!ruleNameMatch) {
//   //       throw new Error('Please specify a rule name containing "SalesBonus"');
//   //     }
//   //     const ruleName = ruleNameMatch[0];
  
//   //     // Get rule from database
//   //     const { data: rules, error } = await rulesDAO.getAllRules(tenantId);
//   //     if (error) throw error;
      
//   //     const rule = rules.find(r => r.name === ruleName);
//   //     if (!rule) {
//   //       throw new Error(`Rule "${ruleName}" not found`);
//   //     }
  
//   //     // Extract values from prompt
//   //     const salesMatch = prompt.match(/sold the (\d+) products/);
//   //     const salaryMatch = prompt.match(/salary which is (\w+) thousand/i);
      
//   //     if (!salesMatch || !salaryMatch) {
//   //       throw new Error('Could not extract required values from prompt');
//   //     }
  
//   //     const salesUnits = parseInt(salesMatch[1]);
//   //     const salaryText = salaryMatch[1];
//   //     const salary = convertWordsToNumber(salaryText) * 1000;
  
//   //     // Apply the rule using JSON rules engine
//   //     const engine = new Engine();
//   //     const normalizedConditions = normalizeOperators(rule.conditions);
//   //     engine.addRule({
//   //       conditions: normalizedConditions,
//   //       event: rule.actions,
//   //       name: rule.name,
//   //       priority: rule.priority
//   //     });
  
//   //     const inputData = { salesUnits, salary };
//   //     const results = await engine.run(inputData);
  
//   //     // Check if events exist and have the expected structure
//   //     if (!results.events || results.events.length === 0) {
//   //       return {
//   //         message: "Rule conditions not met",
//   //         salesUnits,
//   //         requiredUnits: rule.conditions.all[0].value,
//   //         bonusApplied: false
//   //       };
//   //     }
  
//   //     const firstEvent = results.events[0];
//   //     if (!firstEvent.params || typeof firstEvent.params.discountPercentage !== 'number') {
//   //       throw new Error('Rule action parameters are invalid');
//   //     }
  
//   //     const discountPercentage = firstEvent.params.discountPercentage;
//   //     const bonusAmount = (salary * discountPercentage) / 100;
  
//   //     return {
//   //       message: "Bonus calculated successfully",
//   //       salesUnits,
//   //       salary,
//   //       discountPercentage: `${discountPercentage}%`,
//   //       bonusAmount,
//   //       newSalary: salary + bonusAmount
//   //     };
  
//   //   } catch (err: any) {
//   //     console.error('Error in applyRuleByName:', err);
//   //     throw new Error(`Failed to apply rule: ${err.message}`);
//   //   }
//   // };
  

//   export const applyRules = async (tenantId: string, ruleName: string, input?: any) => {
//     try {
//       // Get rule from database
//       const { data: rules, error } = await rulesDAO.getAllRules(tenantId);
//       if (error) throw error;
      
//       const rule = rules.find(r => r.name === ruleName);
//       if (!rule) {
//         throw new Error(`Rule "${ruleName}" not found`);
//       }
  
//       // If input is provided as direct data
//       if (input && typeof input === 'object') {
//         return await applyJsonRules(tenantId, input);
//       }
  
//       // Process natural language input
//       return await processRuleApplication(rule, input);
//     } catch (err: any) {
//       throw new Error(`Failed to apply rules: ${err.message}`);
//     }
//   };
  
//   const processRuleApplication = async (rule: Rule, prompt?: string) => {
//     try {
//       // If no prompt provided, just return rule details
//       if (!prompt) {
//         return {
//           ruleName: rule.name,
//           description: rule.description,
//           conditions: rule.conditions,
//           actions: rule.actions
//         };
//       }
  
//       // Extract values from prompt
//       const salesMatch = prompt.match(/sold the (\d+) products/i);
//       const salaryMatch = prompt.match(/salary which is (\w+) thousand/i);
      
//       const salesUnits = salesMatch ? parseInt(salesMatch[1]) : undefined;
//       const salaryText = salaryMatch ? salaryMatch[1] : undefined;
//       const salary = salaryText ? convertWordsToNumber(salaryText) * 1000 : undefined;
  
//       // Validate extracted values
//       if (salesUnits === undefined || salary === undefined) {
//         throw new Error('Could not extract required values from prompt');
//       }
  
//       // Apply the rule
//       const engine = new Engine();
//       engine.addRule({
//         conditions: normalizeOperators(rule.conditions),
//         event: rule.actions,
//         name: rule.name,
//         priority: rule.priority
//       });
  
//       const results = await engine.run({ salesUnits, salary });
  
//       // Process results
//       if (!results.events || results.events.length === 0) {
//         return {
//           message: "Rule conditions not met",
//           salesUnits,
//           requiredUnits: rule.conditions.all[0].value,
//           bonusApplied: false
//         };
//       }
  
//       const firstEvent = results.events[0];
//       if (!firstEvent.params || typeof firstEvent.params.discountPercentage !== 'number') {
//         throw new Error('Rule action parameters are invalid');
//       }
  
//       const discountPercentage = firstEvent.params.discountPercentage;
//       const bonusAmount = (salary * discountPercentage) / 100;
  
//       return {
//         message: "Bonus calculated successfully",
//         ruleName: rule.name,
//         salesUnits,
//         salary,
//         discountPercentage: `${discountPercentage}%`,
//         bonusAmount,
//         newSalary: salary + bonusAmount
//       };
  
//     } catch (err: any) {
//       console.error('Error in processRuleApplication:', err);
//       throw err;
//     }
//   };
  
//   // Helper function remains the same
//   const convertWordsToNumber = (words: string): number => {
//     const wordToNum: Record<string, number> = {
//       twenty: 20,
//       thirty: 30,
//       forty: 40,
//       // Add more as needed
//     };
//     const lowerWords = words.toLowerCase();
//     return wordToNum[lowerWords] || parseInt(lowerWords) || 0;
//   };

