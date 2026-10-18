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

import {sampleAccumulation} from '../src/math.js';
import {sequencePresets} from '../src/sequence-presets.js';
test('partial sums and products accumulate from the first term',()=>{
 assert.deepEqual(sampleAccumulation('1/n','sum',1,3),[[1,1],[2,1.5],[3,1+1/2+1/3]]);
 assert.deepEqual(sampleAccumulation('n','product',4,6),[[4,24],[5,120],[6,720]]);
 assert.deepEqual(sampleAccumulation('a*n','sum',2,3,2),[[2,6],[3,12]]);
 assert.ok(Math.abs(sampleAccumulation('1/(n*(n+1))','sum',1,20).at(-1)[1]-20/21)<1e-12);
});
test('accumulations fail clearly on invalid terms, overflow and excess computation',()=>{
 assert.throws(()=>sampleAccumulation('1/(n-2)','sum',1,3));
 assert.throws(()=>sampleAccumulation('n','product',1,171));
 assert.throws(()=>sampleAccumulation('n','sum',1999,2001));
 assert.throws(()=>sampleAccumulation('n','unknown',1,2));
});
test('every sequence preset produces finite values within its default plot range',()=>{
 for(const p of sequencePresets){
  const kind=p[8]??(p[6]?'recurrence':'explicit'),[xmin,xmax,ymin,ymax]=p[3];
  const points=kind==='recurrence'?sampleRecurrence(p[2][0],p[6],xmin,xmax):kind==='explicit'?sample(p[2][0],'sequence',xmin,xmax):sampleAccumulation(p[2][0],kind,xmin,xmax);
  assert.ok(points.length>0,p[0]);
  assert.ok(points.every(([n,v])=>Number.isInteger(n)&&Number.isFinite(v)&&v>=ymin&&v<=ymax),p[0]);
 }
 assert.deepEqual(sample('(n-1)%3+1','sequence',1,6).map(p=>p[1]),[1,2,3,1,2,3]);
});
