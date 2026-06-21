const assert = require('assert');
const StyleProcessor = require('../../lib/compiler/StyleProcessor');
const ComponentParser = require('../../lib/compiler/ComponentParser');

try {
    console.log('🧪 Testing ComponentParser...');
    const sp = new StyleProcessor();
    const cp = new ComponentParser(sp);
    
    const content = `
    <state count="0" />
    <action name="inc">count++</action>
    <div @css root>Hello</div>
    `;
    
    const state = cp.extractState(content);
    assert.strictEqual(state.count, 0);
    
    const methods = cp.extractMethods(content);
    assert.strictEqual(methods.inc, 'count++');
    
    console.log('  ✅ ComponentParser tests passed!');

    console.log('🧪 Testing List Rendering Compiler...');
    const contentList = `
    <ul>
        <@for item in list key="item.id">
            <li>{{ item.name }}</li>
        </@for>
    </ul>
    `;
    
    const template = cp.extractTemplate(contentList, {}, 'TestComp');
    assert.ok(template.includes('template data-ax-for="list"'));
    assert.ok(template.includes('data-ax-as="item"'));
    assert.ok(template.includes('data-ax-key="item.id"'));
    assert.ok(template.includes('<li>{% item.name %}</li>'));
    
    console.log('  ✅ List Rendering Compiler tests passed!');
} catch (error) {
    console.error('❌ ComponentParser tests failed!');
    console.error(error);
    process.exit(1);
}
