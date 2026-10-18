import {test} from 'node:test';
import assert from 'node:assert/strict';
import {compileExpression,sample,validateRange} from '../src/math.js';
test('functions, constants, implicit multiplication and parameter',()=>{assert.equal(compileExpression('a*x^2')(3,2),18);assert.ok(Math.abs(compileExpression('sin(pi/2)')(0)-1)<1e-10);assert.equal(compileExpression('2x')(4),8);});
test('sequence uses positive integer indices and alternating values',()=>{assert.deepEqual(sample('(-1)^n/n','sequence',0,3),[[1,-1],[2,0.5],[3,-1/3]]);assert.throws(()=>sample('n','sequence',0,3000));});
test('undefined and non-real values are gaps',()=>{assert.ok(Number.isNaN(compileExpression('1/x')(0)));assert.ok(Number.isNaN(compileExpression('sqrt(x)')(-1)));});
test('unsafe syntax and invalid symbols are rejected',()=>{for(const expr of ['x=3','import("x")','[1,2]','random()','foo(x)','a.b','5!']) assert.throws(()=>compileExpression(expr),expr);});
test('range and malformed expression validation',()=>{assert.throws(()=>validateRange(2,1));assert.throws(()=>validateRange(NaN,1));assert.throws(()=>compileExpression('sin('));validateRange(-5,5);});

import {sampleRecurrence} from '../src/math.js';
test('Fibonacci recurrence and non-default initial terms',()=>{
 assert.deepEqual(sampleRecurrence('a(n-1)+a(n-2)','1, 1',1,8).map(p=>p[1]),[1,1,2,3,5,8,13,21]);
 assert.deepEqual(sampleRecurrence('a(n-1)+a(n-2)','2, 1',5,7),[[5,7],[6,11],[7,18]]);
});
test('recurrence supports n, parameter and previous-term notation',()=>{
 assert.deepEqual(sampleRecurrence('a*a[n-1]+n','1',1,3,2),[[1,1],[2,4],[3,11]]);
 assert.deepEqual(sampleRecurrence('a_{n-1}+1','0',1,3),[[1,0],[2,1],[3,2]]);
});
test('recurrence rejects missing seeds, future terms, invalid values and excessive work',()=>{
 for(const [expr,seeds] of [['a(n-2)','1'],['a(n)','1'],['a(n+1)','1'],['a(n-0)','1'],['a(n-1)',''],['a(n-1)','abc'],['1/a(n-1)','0'],['random()+a(n-1)','1']]) assert.throws(()=>sampleRecurrence(expr,seeds,1,5));
 assert.throws(()=>sampleRecurrence('a(n-1)+1','1',1990,2001));
 assert.equal(sampleRecurrence('a(n-1)+1','1',1999,2000).at(-1)[1],2000);
});
test('conic branch expressions satisfy their defining equations',()=>{
 for(const x of [-2,-1,0,1,2]){
  const circle=compileExpression('sqrt(9-x^2)')(x);assert.ok(Math.abs(x*x+circle*circle-9)<1e-10);
  const ellipse=compileExpression('2*sqrt(1-x^2/16)')(x);assert.ok(Math.abs(x*x/16+ellipse*ellipse/4-1)<1e-10);
 }
 const y=compileExpression('sqrt(x^2/4-1)')(4);assert.ok(Math.abs(16/4-y*y-1)<1e-10);
 assert.equal(compileExpression('2*sqrt(x)')(4)**2,16);
});
