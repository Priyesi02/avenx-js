import { AvenxComponent } from './AvenxComponent.js';

/**
 * AvenxPage is a specialized component that can host child components.
 * It automatically mounts child components defined in its template via [data-avenx-comp].
 */
export class AvenxPage extends AvenxComponent {
    /** @type {Map<string, typeof AvenxComponent>} @private */
    #componentRegistry;
    /** @type {Map<Element, AvenxComponent>} @private */
    #childComponents = new Map();

    /**
     * @param {Object} initialState - Initial state.
     * @param {Object} computed - Computed properties.
     * @param {Object} bridges - Shared bridges.
     * @param {string} template - HTML template.
     * @param {Object} methods - Component methods.
     * @param {Map<string, typeof AvenxComponent>} componentRegistry - Registry of available components.
     */
    constructor(initialState = {}, computed = {}, bridges = {}, template = '', methods = {}, componentRegistry = new Map()) {
        super(initialState, computed, bridges, template, methods);
        this.#componentRegistry = componentRegistry;
    }

    /**
     * Updates the page and then mounts/updates child components.
     */
    update() {
        super.update();
        this.#mountChildComponents();
    }

    /**
     * Unmounts the page and all child components.
     */
    unmount() {
        for (const compInstance of this.#childComponents.values()) {
            if (typeof compInstance.unmount === 'function') {
                compInstance.unmount();
            }
        }
        this.#childComponents.clear();
        super.unmount();
    }

    /**
     * Finds all mount points for child components and initializes or updates them.
     * @private
     */
    #mountChildComponents() {
        const root = this._getElement();
        if (!root) return;

        const mountPoints = root.querySelectorAll('[data-avenx-comp]');
        const currentElements = new Set(mountPoints);

        // 1. Clean up/unmount child components whose elements are no longer in the DOM/page
        for (const [el, compInstance] of this.#childComponents.entries()) {
            if (!currentElements.has(el) || !root.contains(el)) {
                if (typeof compInstance.unmount === 'function') {
                    compInstance.unmount();
                }
                this.#childComponents.delete(el);
            }
        }

        // 2. Instantiate new components or update existing ones
        mountPoints.forEach(el => {
            const compName = el.getAttribute('data-avenx-comp');
            const CompClass = this.#componentRegistry.get(compName);
            
            if (CompClass) {
                if (this.#childComponents.has(el)) {
                    const compInstance = this.#childComponents.get(el);
                    if (typeof compInstance.update === 'function') {
                        compInstance.update();
                    }
                } else {
                    const compInstance = new CompClass(this._getBridges());
                    compInstance.mount(el);
                    this.#childComponents.set(el, compInstance);
                }
            } else {
                console.warn(`[AvenxPage] Component '${compName}' not found in registry.`);
            }
        });
    }
}

