import { AvenxErrorCodes, formatMessage } from '../runtime/AvenxError.js';

/**
 * Handles the rendering of HTML templates by resolving interpolation expressions.
 */
export class TemplateRenderer {
    /**
     * Renders the template by replacing {{ expression }} with evaluated values.
     * @param {string} template - The HTML template string.
     * @param {function(string): any} resolveExpression - Function to evaluate expressions.
     * @returns {string} The rendered HTML string.
     */
    render(template, resolveExpression) {
        return template.replace(/\{\{\s*(.*?)\s*\}\}/g, (_, expression) => {
            try {
                const value = resolveExpression(expression);
                return value == null ? '' : String(value);
            } catch (error) {
                console.warn(formatMessage(AvenxErrorCodes.TEMPLATE_RENDER_ERROR, expression, error));
                return '';
            }
        });
    }
}
