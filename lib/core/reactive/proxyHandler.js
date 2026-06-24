/**
 * Factory for creating proxy handlers used in reactive state.
 * Handles normal property access and computed property redirection.
 */

export const RAW_SYMBOL = Symbol('raw');

const mutatingArrayMethods = new Set([
    'push',
    'pop',
    'shift',
    'unshift',
    'splice',
    'sort',
    'reverse',
    'copyWithin',
    'fill'
]);

/**
 * Checks if the value is a candidate for reactive wrapping.
 * We restrict this to plain objects and arrays to avoid issues with
 * built-in classes (Date, RegExp, Map, Set, Promise) and custom class
 * instances that may contain private fields or internal slots.
 * 
 * @param {any} value - The value to check.
 * @returns {boolean} True if the value should be reactive, false otherwise.
 */
export function isReactiveTarget(value) {
    if (value === null || typeof value !== 'object') {
        return false;
    }
    const proto = Object.getPrototypeOf(value);
    return proto === null || proto === Object.prototype || proto === Array.prototype;
}

export class ProxyHandlerFactory {
    /**
     * @param {Object} [options={}] - Configuration options.
     * @param {string[]} [options.computedKeys=[]] - List of keys that should be treated as computed properties.
     * @param {function(): void} [options.onChange=() => {}] - Callback triggered when a property is set.
     * @param {function(string, Object): any} [options.getComputedValue=() => undefined] - Function to evaluate a computed property.
     */
    constructor({
        computedKeys = [],
        onChange = () => {},
        getComputedValue = () => undefined
    } = {}) {
        /** @type {Set<string>} @private */
        this.computedKeys = new Set(computedKeys);
        /** @type {function(): void} @private */
        this.onChange = onChange;
        /** @type {function(string, Object): any} @private */
        this.getComputedValue = getComputedValue;
        /** @type {WeakMap<Object, Proxy>} @private */
        this.proxyCache = new WeakMap();
    }

    /**
     * Creates the proxy handler object.
     * @returns {ProxyHandler<Object>}
     */
    create() {
        return {
            set: (target, key, value) => this.set(target, key, value),
            get: (target, key, receiver) => this.get(target, key, receiver),
            ownKeys: target => this.ownKeys(target),
            getOwnPropertyDescriptor: (target, key) => this.getOwnPropertyDescriptor(target, key),
            deleteProperty: (target, key) => this.deleteProperty(target, key)
        };
    }

    /**
     * Proxy 'set' trap.
     * @param {Object} target - The target object.
     * @param {string|symbol} key - The property key.
     * @param {any} value - The new value.
     * @returns {boolean}
     */
    set(target, key, value) {
        if (value && value[RAW_SYMBOL]) {
            value = value[RAW_SYMBOL];
        }
        target[key] = value;
        this.onChange();
        return true;
    }

    /**
     * Proxy 'get' trap.
     * Redirects to getComputedValue if the key is a computed property.
     * @param {Object} target - The target object.
     * @param {string|symbol} key - The property key.
     * @param {Object} receiver - The proxy or object inheriting from the proxy.
     * @returns {any}
     */
    get(target, key, receiver) {
        if (key === RAW_SYMBOL) {
            return target;
        }
        if (this.computedKeys.has(key)) {
            return this.getComputedValue(key, target);
        }
        const value = Reflect.get(target, key, receiver);
        if (typeof value === 'function') {
            if (Array.isArray(target) && mutatingArrayMethods.has(key)) {
                return (...args) => {
                    const result = target[key](...args);
                    this.onChange();
                    return result;
                };
            }
            return value.bind(receiver);
        }
        if (isReactiveTarget(value)) {
            return this.getOrCreateProxy(value);
        }
        return value;
    }

    /**
     * Proxy 'deleteProperty' trap.
     * @param {Object} target - The target object.
     * @param {string|symbol} key - The property key.
     * @returns {boolean}
     */
    deleteProperty(target, key) {
        const result = Reflect.deleteProperty(target, key);
        this.onChange();
        return result;
    }

    /**
     * Proxy 'ownKeys' trap.
     * Includes computed keys in the list of keys.
     * @param {Object} target - The target object.
     * @returns {Array<string|symbol>}
     */
    ownKeys(target) {
        return [...Reflect.ownKeys(target), ...this.computedKeys];
    }

    /**
     * Proxy 'getOwnPropertyDescriptor' trap.
     * Ensures computed properties appear as own properties.
     * @param {Object} target - The target object.
     * @param {string|symbol} key - The property key.
     * @returns {PropertyDescriptor|undefined}
     */
    getOwnPropertyDescriptor(target, key) {
        if (this.computedKeys.has(key)) {
            return { enumerable: true, configurable: true };
        }
        return Reflect.getOwnPropertyDescriptor(target, key);
    }

    /**
     * Returns a cached proxy or creates a new proxy for a nested object/array.
     * @param {Object|Array} val - The nested object or array.
     * @returns {Proxy} The reactive proxy.
     * @private
     */
    getOrCreateProxy(val) {
        if (this.proxyCache.has(val)) {
            return this.proxyCache.get(val);
        }
        const handler = {
            get: (target, key, receiver) => {
                if (key === RAW_SYMBOL) {
                    return target;
                }
                const value = Reflect.get(target, key, receiver);
                if (typeof value === 'function') {
                    if (Array.isArray(target) && mutatingArrayMethods.has(key)) {
                        return (...args) => {
                            const result = target[key](...args);
                            this.onChange();
                            return result;
                        };
                    }
                    return value.bind(receiver);
                }
                if (isReactiveTarget(value)) {
                    return this.getOrCreateProxy(value);
                }
                return value;
            },
            set: (target, key, value) => {
                if (value && value[RAW_SYMBOL]) {
                    value = value[RAW_SYMBOL];
                }
                target[key] = value;
                this.onChange();
                return true;
            },
            deleteProperty: (target, key) => {
                const result = Reflect.deleteProperty(target, key);
                this.onChange();
                return result;
            }
        };
        const proxy = new Proxy(val, handler);
        this.proxyCache.set(val, proxy);
        return proxy;
    }
}


