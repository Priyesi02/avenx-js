import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import fs from 'fs';
import path from 'path';
import { performance } from 'perf_hooks';

// Load the runtime bundle
const runtimeCode = fs.readFileSync(path.join(__dirname, '../dist/runtime.js'), 'utf-8');
eval(runtimeCode);
const AvenxComponent = globalThis.AvenxComponent;

/**
 *
 */
function benchmark() {
  const iterations = 10000;

  const template = `
    <div class="user-card">
        <h2>{{ name }}</h2>
        <p>Age: {{ age }}</p>
        <p>Status: {{ age >= 18 ? 'Adult' : 'Minor' }}</p>
        <p>Double Age: {{ age * 2 }}</p>
    </div>
    `;

  const initialState = { name: 'John Doe', age: 25 };
  const computed = {};

  const component = new AvenxComponent(initialState, computed, {}, template, {});

  console.log(`Running AvenxComponent.render() benchmark with ${iterations} iterations...`);

  // Warmup
  for (let i = 0; i < 100; i++) {
    component.render();
  }

  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    component.render();
  }
  const end = performance.now();

  const totalTime = end - start;
  const avgTime = totalTime / iterations;

  console.log(`Total time: ${totalTime.toFixed(2)}ms`);
  console.log(`Average time per render: ${avgTime.toFixed(4)}ms`);
  console.log(`Ops/sec: ${Math.round(1000 / avgTime)}`);
}

benchmark();
