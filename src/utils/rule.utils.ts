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
  