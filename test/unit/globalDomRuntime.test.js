import assert from 'assert';
import { AvenxComponent } from '../../lib/core/runtime/AvenxComponent.js';
import { AvenxApp } from '../../lib/core/runtime/AvenxApp.js';
import { AvenxPage } from '../../lib/core/runtime/AvenxPage.js';

// Helper to wait a microtask or event loop tick
const nextTick = () => new Promise((resolve) => setTimeout(resolve, 10));

// Define test components
class ClickComponent extends AvenxComponent {
  constructor(bridges, props) {
    super(
      { count: 0 },
      {},
      bridges || {},
      '<button id="btn" @click="count++">Clicks: {{ count }}</button>',
      {},
      props || {},
    );
  }
}

class HomePage extends AvenxPage {
  render() {
    return '<div id="home">Welcome Home</div>';
  }
}

class AboutPage extends AvenxPage {
  render() {
    return '<div id="about">About Us</div>';
  }
}

async function runTests() {
  console.log('🧪 Testing runtime with preloaded happy-dom global environment...');

  // Test 1: Component mounting & DOM initial state
  console.log('  Test 1: Mount component to DOM...');
  const mountTarget = document.createElement('div');
  document.body.appendChild(mountTarget);

  const clickComp = new ClickComponent();
  clickComp.mount(mountTarget);

  assert.strictEqual(mountTarget.innerHTML.includes('Clicks: 0'), true, 'Initial template rendered');
  console.log('  ✅ Test 1 passed: Component mounted and initial HTML matches');

  // Test 2: Event handling (clicks)
  console.log('  Test 2: Triggering DOM event...');
  const button = mountTarget.querySelector('#btn');
  assert.ok(button, 'Button exists in DOM');

  // Simulating user click on the button
  button.click();

  // Wait for reactive state updates to propagate
  await nextTick();

  assert.strictEqual(clickComp.state.count, 1, 'Component state counter incremented');
  assert.strictEqual(mountTarget.innerHTML.includes('Clicks: 1'), true, 'Updated HTML contains count 1');
  console.log('  ✅ Test 2 passed: Click event was delegated and reactive state updated');

  // Test 3: Reactive state updates directly
  console.log('  Test 3: Mutate component state directly...');
  clickComp.state.count = 10;
  await nextTick();

  assert.strictEqual(mountTarget.innerHTML.includes('Clicks: 10'), true, 'DOM patched with counter 10');
  console.log('  ✅ Test 3 passed: Direct state updates trigger DOM patches');

  // Test 4: App Routing integration
  console.log('  Test 4: Routing with hashchange navigation...');

  const appContainer = document.createElement('div');
  appContainer.id = 'app-root';
  document.body.appendChild(appContainer);

  const app = new AvenxApp({ target: '#app-root' });
  app.registerPage('home', HomePage);
  app.registerPage('about', AboutPage);

  app.initRouter({
    '#/': 'home',
    '#/about': 'about',
  });

  await nextTick();

  // Initially it should show Home Page (since no hash is set or default is #/)
  assert.ok(appContainer.querySelector('#home'), 'Home page rendered on initial load');

  // Navigate to About
  window.location.hash = '#/about';

  // Wait for happy-dom to fire the hashchange event and router to mount the new page
  await new Promise((resolve) => setTimeout(resolve, 50));

  assert.ok(appContainer.querySelector('#about'), 'About page rendered after hash navigation');
  console.log('  ✅ Test 4 passed: Routing works dynamically using window.location.hash');

  // Cleanup DOM
  document.body.removeChild(mountTarget);
  document.body.removeChild(appContainer);
}

(async () => {
  try {
    await runTests();
    console.log('✅ Global DOM Runtime tests passed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Global DOM Runtime tests failed!');
    console.error(error);
    process.exit(1);
  }
})();
