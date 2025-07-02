// import { Engine } from 'json-rules-engine';
// import * as rulesDAO from '../dao/rules.dao';
// import { v4 as uuidv4 } from 'uuid';
// import * as NLPService from './nlp.service';
// import { normalizeOperators } from '../utils/rule.utils';

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


// export const applyRules = async (tenantId: string, inputData: any) => {
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

























import { Engine } from 'json-rules-engine';
import * as rulesDAO from '../dao/rules.dao';
import { v4 as uuidv4 } from 'uuid';
import * as NLPService from './nlp.service';
import { normalizeOperators } from '../utils/rule.utils';
import axios from 'axios';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { CopilotBackend } from '@copilotkit/backend';
import { HumanMessage } from '@langchain/core/messages';
import { CopilotRuntime, LangChainAdapter } from '@copilotkit/runtime';


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


async function callGeminiAPI(prompt: string): Promise<string> {
  try {
      const response = await axios.post(
          'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
          {
              contents: [{ parts: [{ text: prompt }] }]
          },
          {
              params: { key: process.env.GEMINI_API_KEY },
              headers: { 'Content-Type': 'application/json' }
          }
      );

      const raw = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!raw) throw new Error('Gemini did not return valid response');

      return raw
          .replace(/```json|```/g, '')
          .replace(/^\s*\/\/.*$/gm, '')
          .trim();
  } catch (err: any) {
      console.error('Gemini API error:', err.message);
      throw new Error(`Gemini API call failed: ${err.message}`);
  }
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

  
  // const applyJsonRules = async (tenantId: string, inputData: any) => {
  //   const { data: rules, error } = await rulesDAO.getAllRules(tenantId);
  //   if (error) throw new Error('Failed to fetch rules');
  
  //   const engine = new Engine();
  //   for (const rule of rules) {
  //     const normalizedConditions = normalizeOperators(rule.conditions);
  //     engine.addRule({
  //       conditions: normalizedConditions,
  //       event: rule.actions,
  //       name: rule.name,
  //       priority: rule.priority
  //     });
  //   }
  //   const results = await engine.run(inputData);
  //   return results.events;
  // };


  export const applyRules = async (tenantId: string, ruleName: string, input: string) => {
    try {
        // Get rule from database
        const { data: rules, error } = await rulesDAO.getAllRules(tenantId);
        if (error) throw error;
        
        const rule = rules.find(r => r.name === ruleName);
        if (!rule) {
            throw new Error(`Rule "${ruleName}" not found`);
        }

        // Prepare prompt for Gemini
        const geminiPrompt = `
        Given this business rule:
        - Name: ${rule.name}
        - Description: ${rule.description}
        - Conditions: ${JSON.stringify(rule.conditions)}
        - Actions: ${JSON.stringify(rule.actions)}
        
        And this input: "${input}"
        
        Please:
        1. Extract the products sold count and salary amount from the input
        2. Apply the rule conditions to determine if the action should be taken
        3. If conditions are met, calculate the bonus amount based on the salary
        4. Return a JSON response with:
           - applied: boolean
           - message: explanation
           - extractedValues: { productsSold: number, salary: number }
           - result: { bonusAmount: number, newSalary: number }
        
        Return only valid JSON, no additional text or markdown.
        Example response:
        {
          "applied": true,
          "message": "Bonus applied for 16 products sold",
          "extractedValues": {
            "productsSold": 16,
            "salary": 7000
          },
          "result": {
            "bonusAmount": 700,
            "newSalary": 7700
          }
        }
        `;

        const geminiResponse = await callGeminiAPI(geminiPrompt);
        const result = JSON.parse(geminiResponse);

        // Also apply with json-rules-engine for verification
        const engineResult = await applyWithEngine(rule, input);
        
        return {
            geminiResponse: result,
            engineVerification: engineResult,
            ruleDetails: {
                name: rule.name,
                description: rule.description
            }
        };
    } catch (err: any) {
        console.error('Error applying rule:', err);
        throw new Error(`Failed to apply rule: ${err.message}`);
    }
};

const applyWithEngine = async (rule: Rule, input: string) => {
  try {
      // Extract both products sold and salary from input
      const productsMatch = input.match(/sold the (\d+) products/i);
      const salaryMatch = input.match(/salary which is (\d+)/i) || 
                        input.match(/salary (\d+)/i);
      
      const productsSold = productsMatch ? parseInt(productsMatch[1]) : 0;
      const salary = salaryMatch ? parseInt(salaryMatch[1]) : 0;

      const engine = new Engine();
      engine.addRule({
          conditions: normalizeOperators(rule.conditions),
          event: rule.actions,
          name: rule.name,
          priority: rule.priority
      });

      // Create input data with both values
      const inputData = {
          productsSold,
          salary
      };

      const results = await engine.run(inputData);
      
      return {
          applied: results.events.length > 0,
          events: results.events,
          inputDataUsed: inputData
      };
  } catch (err) {
      console.error('Engine verification failed:', err);
      return { 
          error: 'Engine verification failed'
      };
  }
};
  
  // const processRuleApplication = async (rule: Rule, prompt?: string) => {
  //   try {
  //     // If no prompt provided, just return rule details
  //     if (!prompt) {
  //       return {
  //         ruleName: rule.name,
  //         description: rule.description,
  //         conditions: rule.conditions,
  //         actions: rule.actions
  //       };
  //     }
  
  //     // Extract values from prompt
  //     const salesMatch = prompt.match(/sold the (\d+) products/i);
  //     const salaryMatch = prompt.match(/salary which is (\w+) thousand/i);
      
  //     const salesUnits = salesMatch ? parseInt(salesMatch[1]) : undefined;
  //     const salaryText = salaryMatch ? salaryMatch[1] : undefined;
  //     const salary = salaryText ? convertWordsToNumber(salaryText) * 1000 : undefined;
  
  //     // Validate extracted values
  //     if (salesUnits === undefined || salary === undefined) {
  //       throw new Error('Could not extract required values from prompt');
  //     }
  
  //     // Apply the rule
  //     const engine = new Engine();
  //     engine.addRule({
  //       conditions: normalizeOperators(rule.conditions),
  //       event: rule.actions,
  //       name: rule.name,
  //       priority: rule.priority
  //     });
  
  //     const results = await engine.run({ salesUnits, salary });
  
  //     // Process results
  //     if (!results.events || results.events.length === 0) {
  //       return {
  //         message: "Rule conditions not met",
  //         salesUnits,
  //         requiredUnits: rule.conditions.all[0].value,
  //         bonusApplied: false
  //       };
  //     }
  
  //     const firstEvent = results.events[0];
  //     if (!firstEvent.params || typeof firstEvent.params.discountPercentage !== 'number') {
  //       throw new Error('Rule action parameters are invalid');
  //     }
  
  //     const discountPercentage = firstEvent.params.discountPercentage;
  //     const bonusAmount = (salary * discountPercentage) / 100;
  
  //     return {
  //       message: "Bonus calculated successfully",
  //       ruleName: rule.name,
  //       salesUnits,
  //       salary,
  //       discountPercentage: `${discountPercentage}%`,
  //       bonusAmount,
  //       newSalary: salary + bonusAmount
  //     };
  
  //   } catch (err: any) {
  //     console.error('Error in processRuleApplication:', err);
  //     throw err;
  //   }
  // };
  
  // // Helper function remains the same
  // const convertWordsToNumber = (words: string): number => {
  //   const wordToNum: Record<string, number> = {
  //     twenty: 20,
  //     thirty: 30,
  //     forty: 40,
  //     // Add more as needed
  //   };
  //   const lowerWords = words.toLowerCase();
  //   return wordToNum[lowerWords] || parseInt(lowerWords) || 0;
  // };

