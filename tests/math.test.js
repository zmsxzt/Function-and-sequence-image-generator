import {test} from 'node:test';
import assert from 'node:assert/strict';
import {compileExpression,sample,validateRange} from '../src/math.js';
test('functions, constants, implicit multiplication and parameter',()=>{assert.equal(compileExpression('a*x^2')(3,2),18);assert.ok(Math.abs(compileExpression('sin(pi/2)')(0)-1)<1e-10);assert.equal(compileExpression('2x')(4),8);});
test('sequence uses positive integer indices and alternating values',()=>{assert.deepEqual(sample('(-1)^n/n','sequence',0,3),[[1,-1],[2,0.5],[3,-1/3]]);assert.throws(()=>sample('n','sequence',0,3000));});
test('undefined and non-real values are gaps',()=>{assert.ok(Number.isNaN(compileExpression('1/x')(0)));assert.ok(Number.isNaN(compileExpression('sqrt(x)')(-1)));});
test('unsafe syntax and invalid symbols are rejected',()=>{for(const expr of ['x=3','import("x")','[1,2]','random()','foo(x)','a.b','5!']) assert.throws(()=>compileExpression(expr),expr);});
test('range and malformed expression validation',()=>{assert.throws(()=>validateRange(2,1));assert.throws(()=>validateRange(NaN,1));assert.throws(()=>compileExpression('sin('));validateRange(-5,5);});
