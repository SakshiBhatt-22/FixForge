import test from 'node:test';import assert from 'node:assert/strict';
import {scenarios} from './scenarios.js';import {analyzeScenario} from './engine.js';
for(const scenario of scenarios){test(`${scenario.id}: patch improves failing tests`,()=>{
 const r=analyzeScenario(scenario.id);
 assert.ok(r.summary.beforePassed<r.summary.total);
 assert.equal(r.summary.afterPassed,r.summary.total);
});}
test('unknown fixture rejected',()=>assert.equal(analyzeScenario('unknown'),null));
