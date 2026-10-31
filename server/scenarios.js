// Controlled fixtures: only these pre-reviewed patches are ever executed.
export const scenarios = [
  {
    id: 'sum-cart', title: 'Cart total ignores item quantities', category: 'Array reduction',
    issue: 'The cart total only sums each item price once, even when quantity is greater than one.',
    original: `function calculateTotal(items) {\n  return items.reduce((sum, item) => sum + item.price, 0);\n}`,
    fixed: `function calculateTotal(items) {\n  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);\n}`,
    explanation: 'The reducer omitted quantity. Multiply each price by its quantity before summing.',
    tests: [
      {label:'Single item',args:[[{price:10,quantity:1}]],expected:10},
      {label:'Multiple quantities',args:[[{price:10,quantity:3},{price:5,quantity:2}]],expected:40},
      {label:'Empty cart',args:[[]],expected:0},
    ], functionName:'calculateTotal'
  },
  {
    id:'filter-active',title:'Inactive users appear in results',category:'Filtering',
    issue:'The active user filter is including accounts whose active property is false.',
    original:`function getActiveUsers(users) {\n  return users.filter(user => user.active !== undefined);\n}`,
    fixed:`function getActiveUsers(users) {\n  return users.filter(user => user.active === true);\n}`,
    explanation:'Checking whether the property exists is not the same as checking whether it is true.',
    tests:[
      {label:'Mixed users',args:[[{id:1,active:true},{id:2,active:false}]],expected:[{id:1,active:true}]},
      {label:'Missing property',args:[[{id:1},{id:2,active:true}]],expected:[{id:2,active:true}]},
      {label:'Empty users',args:[[]],expected:[]}
    ],functionName:'getActiveUsers'
  },
  {
    id:'off-by-one',title:'Last page is missing an item',category:'Pagination',
    issue:'Pagination skips the last item on a page because the end index is one too small.',
    original:`function paginate(items, page, pageSize) {\n  const start = (page - 1) * pageSize;\n  return items.slice(start, start + pageSize - 1);\n}`,
    fixed:`function paginate(items, page, pageSize) {\n  const start = (page - 1) * pageSize;\n  return items.slice(start, start + pageSize);\n}`,
    explanation:'Array.slice excludes the end index, so subtracting one discards the final page item.',
    tests:[
      {label:'First page',args:[[1,2,3,4,5],1,2],expected:[1,2]},
      {label:'Second page',args:[[1,2,3,4,5],2,2],expected:[3,4]},
      {label:'Partial final page',args:[[1,2,3,4,5],3,2],expected:[5]}
    ],functionName:'paginate'
  }
];
export const publicScenarios = scenarios.map(({id,title,category,issue,original})=>({id,title,category,issue,original}));
