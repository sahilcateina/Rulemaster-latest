// utils/ruleUtils.ts
export const normalizeOperators = (conditions: any): any => {
    const OPERATOR_MAP: Record<string, string> = {
      '==': 'equal',
      '!=': 'notEqual',
      '>': 'greaterThan',
      '>=': 'greaterThanInclusive',
      '<': 'lessThan',
      '<=': 'lessThanInclusive'
    };
  
    const normalizeCondition = (cond: any) => {
      const op = cond.operator;
      return {
        ...cond,
        operator: OPERATOR_MAP[op] || op
      };
    };
  
    const normalizeGroup = (group: any) => {
      const key = group.all ? 'all' : 'any';
      return {
        [key]: group[key].map((c: any) =>
          c.all || c.any ? normalizeGroup(c) : normalizeCondition(c)
        )
      };
    };
  
    return normalizeGroup(conditions);
  };
  





// export const normalizeOperators = (conditions: any): any => {
//   if (!conditions) return conditions;
  
//   if (Array.isArray(conditions)) {
//     return conditions.map(normalizeOperators);
//   }
  
//   if (typeof conditions === 'object') {
//     const normalized: any = {};
//     for (const key in conditions) {
//       if (key === 'operator') {
//         normalized[key] = mapOperator(conditions[key]);
//       } else {
//         normalized[key] = normalizeOperators(conditions[key]);
//       }
//     }
//     return normalized;
//   }
  
//   return conditions;
// };

// const mapOperator = (op: string): string => {
//   const operatorMap: Record<string, string> = {
//     'greater than': 'greaterThan',
//     'less than': 'lessThan',
//     'equal to': 'equal',
//     'not equal to': 'notEqual',
//     '>': 'greaterThan',
//     '<': 'lessThan',
//     '==': 'equal',
//     '!=': 'notEqual'
//   };
//   return operatorMap[op.toLowerCase()] || op;
// };