import { parse } from 'mathjs';
const allowedFunctions = new Set(['sin','cos','tan','asin','acos','atan','sinh','cosh','tanh','sqrt','abs','log','log10','exp','floor','ceil','round','min','max']);
export function compileExpression(expression, extraSymbols = []) {
  if (!expression.trim()) throw new Error('请输入表达式');
  if (expression.length > 300) throw new Error('表达式不能超过 300 个字符');
  const tree = parse(expression);
  tree.traverse(node => {
    if (!['OperatorNode','FunctionNode','SymbolNode','ConstantNode','ParenthesisNode'].includes(node.type)) throw new Error('只支持数学运算和常用函数');
    if (node.isSymbolNode && !['x','n','a','pi','e',...allowedFunctions,...extraSymbols].includes(node.name)) throw new Error(`不支持的变量：${node.name}`);
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

// Compute from the initial terms even when the visible range starts later.
export function sampleRecurrence(expression, initialText, min, max, parameter = 1) {
  const initial = initialText.split(/[,，\s]+/).filter(Boolean).map(Number);
  if (!initial.length || initial.length > 20 || initial.some(v => !Number.isFinite(v)))
    throw new Error('请输入 1 至 20 个有限初始值，用逗号分隔');
  const offsets = new Set();
  const normalized = expression.replace(/a\s*(?:\(\s*n\s*-\s*(\d+)\s*\)|\[\s*n\s*-\s*(\d+)\s*\]|_?\{\s*n\s*-\s*(\d+)\s*\})/g, (_, a, b, c) => {
    const offset = Number(a ?? b ?? c);
    if (offset < 1 || offset > initial.length) throw new Error('引用的前项超出初始值数量，请补充初始项');
    offsets.add(offset);
    return `prev${offset}`;
  });
  if (!offsets.size) throw new Error('递推式请使用 a(n-1)、a(n-2) 等前项引用');
  // Reuse the same restricted parser, then substitute previous terms as constants.
  compileExpression(normalized, [...offsets].map(k => `prev${k}`));
  const end = Math.floor(max), start = Math.max(1, Math.ceil(min));
  if (end > 2000) throw new Error('递推数列最多计算至第 2000 项');
  const values = [...initial];
  // Compile once with the previous-term symbols supplied through scope.
  const compiled = parse(normalized).compile();
  for (let n = initial.length + 1; n <= end; n++) {
    const scope = {n, x:n, a:parameter};
    offsets.forEach(k => { scope[`prev${k}`] = values[n-k-1]; });
    const value = compiled.evaluate(scope);
    if (typeof value !== 'number' || !Number.isFinite(value)) throw new Error(`第 ${n} 项不是有限实数，请缩小范围或检查递推式`);
    values.push(value);
  }
  const points = [];
  for (let n = start; n <= end; n++) points.push([n, values[n-1]]);
  return points;
}

export function sampleAccumulation(expression, kind, min, max, parameter = 1) {
  if (!['sum', 'product'].includes(kind)) throw new Error('不支持的累积类型');
  const end = Math.floor(max), start = Math.max(1, Math.ceil(min));
  if (end > 2000) throw new Error('累积数列最多计算至第 2000 项');
  const fn = compileExpression(expression);
  let value = kind === 'sum' ? 0 : 1;
  const points = [];
  for (let n = 1; n <= end; n++) {
    const term = fn(n, parameter);
    value = kind === 'sum' ? value + term : value * term;
    if (!Number.isFinite(term) || !Number.isFinite(value))
      throw new Error(`第 ${n} 项不是有限实数，请缩小范围或检查公式`);
    if (n >= start) points.push([n, value]);
  }
  return points;
}

// Keep the neighboring integer terms for segments crossing the viewport edges.
// Offscreen terms that cannot be computed must not invalidate visible terms.
export function sampleSequenceView(curve, min, max, parameter = 1, connected = false) {
  const evaluate = (lo, hi) => curve.kind === 'recurrence'
    ? sampleRecurrence(curve.expression, curve.initial ?? '1, 1', lo, hi, parameter)
    : ['sum', 'product'].includes(curve.kind)
      ? sampleAccumulation(curve.expression, curve.kind, lo, hi, parameter)
      : sample(curve.expression, 'sequence', lo, hi, parameter);
  const points = evaluate(min, max);
  if (!connected) return points;
  const neighbor = index => {
    if (index < 1 || (curve.kind && curve.kind !== 'explicit' && index > 2000)) return [];
    try { return evaluate(index, index); } catch { return []; }
  };
  if (!Number.isInteger(min)) points.unshift(...neighbor(Math.floor(min)));
  if (!Number.isInteger(max)) points.push(...neighbor(Math.ceil(max)));
  return points;
}
