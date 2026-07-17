import assert from 'assert';
import { AvenxComponent } from '../../lib/core/runtime/AvenxComponent.js';
import { MockDOMElement, setupDOMMock, teardownDOMMock } from '../helpers/dom-mock.js';

async function testOnBeforeMount() {
  console.log('🧪 Testing onBeforeMount lifecycle hook...');
  setupDOMMock();

  try {
    const history = [];
    const comp = new AvenxComponent({ count: 0 }, {}, {}, '', {
      onBeforeMount() {
        history.push('beforeMount');
        // Mutate state inside onBeforeMount
        this.state.count = 42;
      },
      onMount() {
        history.push('mount');
      },
    });

    // Override render to trace when it is called
    comp.render = function() {
      history.push('render');
      return `<div>Counter: ${this.state.count}</div>`;
    };

    const mockEl = new MockDOMElement('div');
    comp.mount(mockEl);

    // 1. Assert execution order: beforeMount -> render -> mount
    assert.deepStrictEqual(history, ['beforeMount', 'render', 'mount'], 'Execution order should be beforeMount -> render -> mount');

    // 2. Assert state mutations inside onBeforeMount are reflected in the initial render
    const childText = mockEl.childNodes[0] && mockEl.childNodes[0].childNodes[0];
    const textContent = childText ? childText.textContent : '';
    assert.ok(textContent.includes('Counter: 42'), `Rendered content should reflect mutated state (42), got: ${textContent}`);

    // Wait a tick to ensure no double updates are scheduled or executed
    await new Promise(resolve => setTimeout(resolve, 10));

    // 3. Assert no double rendering/updates occurred
    assert.deepStrictEqual(history, ['beforeMount', 'render', 'mount'], 'Should not trigger any subsequent double updates');

    console.log('  ✅ onBeforeMount lifecycle hook tests passed successfully!');
  } finally {
    teardownDOMMock();
  }
}

(async () => {
  try {
    await testOnBeforeMount();
    process.exit(0);
  } catch (error) {
    console.error('❌ onBeforeMount lifecycle hook tests failed!');
    console.error(error);
    process.exit(1);
  }
})();
