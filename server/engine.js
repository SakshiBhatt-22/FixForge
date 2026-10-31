import vm from 'node:vm';
import { scenarios } from './scenarios.js';

// IMPORTANT: vm is NOT a security boundary. Only hardcoded, reviewed fixture
// code from scenarios.js is evaluated here. Never evaluate user/LLM code.
export function evaluateFixture(code, scenario) {
  return scenario.tests.map(test => {
    try {
      const context = vm.createContext({args: structuredClone(test.args)});
      const actual = vm.runInContext(`${code}\n${scenario.functionName}(...args)`,context,{timeout:100});
      const passed = JSON.stringify(actual) === JSON.stringify(test.expected);
      return {name:test.label,passed,expected:test.expected,actual};
    } catch(err) {return {name:test.label,passed:false,error:String(err.message)}}
  });
}
export function analyzeScenario(id) {
  const scenario=scenarios.find(s=>s.id===id);
  if(!scenario) return null;
  const before=evaluateFixture(scenario.original,scenario);
  const after=evaluateFixture(scenario.fixed,scenario);
  return {scenarioId:id,title:scenario.title,issue:scenario.issue,original:scenario.original,
    fixed:scenario.fixed,explanation:scenario.explanation,
    before,after,summary:{beforePassed:before.filter(t=>t.passed).length,afterPassed:after.filter(t=>t.passed).length,total:after.length},
    validation:'Controlled fixture tests only; no arbitrary repository execution.'};
}
