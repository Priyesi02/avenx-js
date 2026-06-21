const assert = require('assert');
const StyleProcessor = require('../../lib/compiler/StyleProcessor');

try {
    console.log('🧪 Testing StyleProcessor...');
    const sp = new StyleProcessor();
    
    sp.addVariable('primary-color', '#ff0000');
    assert.strictEqual(sp.cssVariables['primary-color'], '#ff0000');
    
    sp.addGlobalCSS('body { background: white; }');
    assert.ok(sp.rawGlobalCSS.has('body { background: white; }'));
    
    const processed = sp.process('<div @css my-class></div>', { 'my-class': 'color: red;' }, 'MyComp');
    assert.ok(processed.includes('class="avenx-'));
    
    console.log('  ✅ StyleProcessor tests passed!');
} catch (error) {
    console.error('❌ StyleProcessor tests failed!');
    console.error(error);
    process.exit(1);
}
