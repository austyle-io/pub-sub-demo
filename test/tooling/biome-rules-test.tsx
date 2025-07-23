import React, { useEffect, useState } from 'react';

// Test 1: React.FC violation
const MyComponent: React.FC<{ name: string }> = ({ name }) => {
  return <div>Hello {name}</div>;
};

// Test 2: Direct FC usage
const _AnotherComponent: FC = () => {
  return <div>Test</div>;
};

// Test 3: Interface violation
// biome-ignore lint/correctness/noUnusedVariables: Test case for interface violation
interface User {
  id: string;
  name: string;
}

// Test 4: any type violation
// biome-ignore lint/suspicious/noExplicitAny: Test case for any type violation
const data: any = { foo: 'bar' };
// biome-ignore lint/suspicious/noExplicitAny: Test case for any type violation
const _processData = (input: any) => input;

// Test 5: Switch statement violation
function _getColorForStatus(status: string) {
  switch (status) {
    case 'success':
      return 'green';
    case 'error':
      return 'red';
    default:
      return 'gray';
  }
}

// Test 6: Boolean naming violation
const _active = true;
const _enabled: boolean = false;
const _visible = true;

// Test 7: Double type assertion violation
const _value = data as unknown as string;

// Test 8: React namespace violations
const TestHooks = () => {
  const [count, _setCount] = React.useState(0);

  React.useEffect(() => {
    console.log('Effect ran');
  }, []);

  const _memoized = React.useMemo(() => count * 2, [count]);
  const _callback = React.useCallback(() => {}, []);

  return (
    <React.Fragment>
      <div>{count}</div>
      <React.StrictMode>
        <span>Strict</span>
      </React.StrictMode>
    </React.Fragment>
  );
};

// Test 9: Unknown without type guard
function _processUnknown(data: unknown) {
  return data.toString();
}

// Test 10: Console.log violations
console.log('Debug message');
console.error('Error message');

// Test 11: var usage
const _oldStyle = 'bad';

// Test 12: Non-const variable that could be const
const _neverReassigned = 'should be const';

// Test 13: == instead of ===
if (data == null) {
  console.log('loose equality');
}

// Test 14: Unused variables
const _unusedVar = 'not used';
function _unusedFunction() {}

// Test 15: Missing exhaustive deps
const _DepComponent = () => {
  const [state, setState] = useState(0);
  const [other, _setOther] = useState(0);

  useEffect(() => {
    setState(other + 1);
  }, [other]); // Missing 'other' dependency

  return <div>{state}</div>;
};

// Test 16: Large component (would trigger size warning)
const LargeComponent = () => {
  // Imagine this has 100+ lines
  return (
    <div>
      <h1>Title</h1>
      <p>Paragraph 1</p>
      <p>Paragraph 2</p>
      {/* ... many more elements ... */}
    </div>
  );
};

// Test 17: String concatenation instead of template
const _greeting = `Hello ${name}!`;

// Test 18: Array index as key
const items = ['a', 'b', 'c'];
const _ListComponent = () => (
  <ul>
    {items.map((item, index) => (
      // biome-ignore lint/suspicious/noArrayIndexKey: Test case for array index key violation
      <li key={index}>{item}</li>
    ))}
  </ul>
);

// Test 19: Function instead of arrow function
function _oldStyleFunction() {
  return 'should be arrow function';
}

// Test 20: Formatting issues
const _unformatted = { foo: 'bar', baz: 'qux' };
const _badSpacing = () => {
  return 'no spaces';
};

// Test 22: Namespace usage
// biome-ignore lint/correctness/noUnusedVariables: Test case for namespace violation
namespace MyNamespace {
  export const value = 1;
}

// Test 23: Non-null assertion
// biome-ignore lint/style/noNonNullAssertion: Test case for non-null assertion violation
const _element = document.getElementById('test')!;

// Test 24: For-in loop instead of for-of
for (const key in items) {
  console.log(items[key]);
}

// Test 25: Nested ternary
// biome-ignore lint/correctness/noConstantCondition: Test case for constant condition
const _nested = true ? (false ? 'a' : 'b') : 'c';

export { MyComponent, TestHooks, LargeComponent };
