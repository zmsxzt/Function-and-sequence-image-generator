import { parse } from 'mathjs';
const allowedFunctions = new Set(['sin','cos','tan','asin','acos','atan','sinh','cosh','tanh','sqrt','abs','log','log10','exp','floor','ceil','round','min','max']);
export function compileExpression(expression) {
  if (!expression.trim()) throw new Error('请输入表达式');
  if (expression.length > 300) throw new Error('表达式不能超过 300 个字符');
  const tree = parse(expression);
  tree.traverse(node => {
    if (!['OperatorNode','FunctionNode','SymbolNode','ConstantNode','ParenthesisNode'].includes(node.type)) throw new Error('只支持数学运算和常用函数');
    if (node.isSymbolNode && !['x','n','a','pi','e',...allowedFunctions].includes(node.name)) throw new Error(`不支持的变量：${node.name}`);
    if (node.isFunctionNode && !allowedFunctions.has(node.fn.name)) throw new Error('不支持此函数');
    if (node.isOperatorNode && !['+','-','*','/','^','%','!'].includes(node.op)) throw new Error('不支持此运算');
    if (node.isOperatorNode && node.op === '!') throw new Error('请使用普通四则运算或幂运算');
  });
  const compiled = tree.compile();
  return (v, a = 1) => {
    const result = compiled.evaluate({x:v,n:v,a});
    return typeof result === 'number' && Number.isFinite(result) ? result : NaN;
  };
}
export function sample(expression, mode, min, max, a = 1, count = 1600) {
  const fn = compileExpression(expression);
  const points = [];
  if (mode === 'sequence') {
    const start = Math.max(1, Math.ceil(min)), end = Math.floor(max);
    if (end - start > 2000) throw new Error('数列最多显示 2000 项');
    for (let n = start; n <= end; n++) points.push([n,fn(n,a)]);
  } else for (let i = 0; i <= count; i++) { const x = min + (max-min)*i/count; points.push([x,fn(x,a)]); }
  return points;
}
export function validateRange(min,max) {
  if (!Number.isFinite(min) || !Number.isFinite(max) || min >= max) throw new Error('范围必须为有限数字，且最小值小于最大值');
}
