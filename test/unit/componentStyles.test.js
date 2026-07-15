import assert from 'assert';
import fs from 'fs';
import path from 'path';
import '../helpers/register-happy-dom.js';
import { AvenxComponent } from '../../lib/core/runtime/AvenxComponent.js';
import { AvenxPage } from '../../lib/core/runtime/AvenxPage.js';
import ComponentParser from '../../lib/compiler/ComponentParser.js';
import StyleProcessor from '../../lib/compiler/StyleProcessor.js';

/**
 * Tests manual component instantiation with style variables mapping.
 */
function testComponentStylesMapping() {
  console.log('🧪 Testing CSS variables mapping in component...');

  class StyledComponent extends AvenxComponent {
    constructor(bridges, props) {
      super(
        {},
        {},
        bridges,
        '<div>Color: {{ styles["primary-color"] }}</div>',
        {
          getColor() {
            return this.styles['primary-color'];
          },
        },
        props,
        { 'primary-color': '#ff0000', 'bg-color': '#ffffff' },
      );
    }
  }

  const comp = new StyledComponent({}, {});
  const root = document.createElement('div');
  comp.mount(root);
  comp.runUpdate();

  // Test 1: Readable in JS logic
  assert.strictEqual(comp.styles['primary-color'], '#ff0000', 'primary-color should be mapped correctly');
  assert.strictEqual(comp.styles['bg-color'], '#ffffff', 'bg-color should be mapped correctly');
  assert.strictEqual(comp.getColor(), '#ff0000', 'styles should be readable in component methods');

  // Test 2: Readable in template binding
  assert.strictEqual(root.innerHTML, '<div>Color: #ff0000</div>', 'styles should render correctly in template');

  console.log('  ✅ CSS variables mapping in component passed.');
}

/**
 * Tests end-to-end compiler extraction and serialization of CSS design tokens.
 */
function testCompilerIntegration() {
  console.log('🧪 Testing compiler extraction of design tokens (@def)...');

  const sp = new StyleProcessor();
  const cp = new ComponentParser(sp);

  const jsPath = path.resolve('test/unit/tempStyled.component.js');
  const cssPath = path.resolve('test/unit/tempStyled.component.css');

  try {
    fs.writeFileSync(
      jsPath,
      `
      <state count="0" />
      <div>{{ styles['primary-color'] }}</div>
    `,
    );
    fs.writeFileSync(
      cssPath,
      `
      <@global>
        @def primary-color #ff0000;
        @def bg-color #00ff00;
      </@global>
    `,
    );

    const compiledJs = cp.parse(jsPath, 'component');

    // Verify compiled code contains serialized styles
    assert.ok(compiledJs.includes('"primary-color":"#ff0000"'), 'Compiled JS should serialize primary-color');
    assert.ok(compiledJs.includes('"bg-color":"#00ff00"'), 'Compiled JS should serialize bg-color');

    // Evaluate compiled class dynamically
    const evalClass = new Function(
      'AvenxComponent',
      'AvenxPage',
      `
      ${compiledJs}
      return TempStyled;
    `,
    );

    const TempStyledClass = evalClass(AvenxComponent, AvenxPage);
    const instance = new TempStyledClass({}, {});
    assert.strictEqual(instance.styles['primary-color'], '#ff0000', 'Compiled instance styles should be readable');
  } finally {
    if (fs.existsSync(jsPath)) fs.unlinkSync(jsPath);
    if (fs.existsSync(cssPath)) fs.unlinkSync(cssPath);
  }

  console.log('  ✅ Compiler @def extraction and instantiation integration test passed.');
}

function runTests() {
  try {
    testComponentStylesMapping();
    testCompilerIntegration();
    console.log('✅ All component CSS variables mapping tests passed!');
  } catch (error) {
    console.error('❌ Component CSS variables mapping tests failed!');
    console.error(error);
    process.exit(1);
  }
}

runTests();
