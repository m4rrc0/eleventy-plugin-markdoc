import Markdoc from "@markdoc/markdoc";
import { tags as htmlTags, processTokens } from './html-in-mdoc.js';


export function convertUniversalFiltersToFunctions(filters, pluginOptions) {
    let functions = {};
    // TODO: How to account for async filters?
    // -> The naive approach does not work
    // await Promise.all(Object.entries(filters).map(async ([name, fn]) => {
    //     functions[name] = { async transform(parameters) {
    //         const args = Object.values(parameters);
    //         return await fn(...args);
    //     }};
    // }));
    for (const [name, fn] of Object.entries(filters)) {
        functions[name] = { transform(parameters) {
            const args = Object.values(parameters);
            return fn(...args);
        }};
    }
    return functions;
}

export function convertShortcodesToFunctions(shortcodes, pluginOptions) {
    // Register shortcodes as functions
    let functions = {};
    for (const [name, fn] of Object.entries(shortcodes)) {
        functions[name] = { transform(parameters) {
            const args = Object.values(parameters);
            return fn(...args);
        }};
    }
    return functions;
}

export function convertShortcodesToTags(shortcodes, pluginOptions) {
    let tags = {}
    // Register shortcodes as tags
    for (const [name, fn] of Object.entries(shortcodes)) {
        tags[name] = {
            children: [],
            selfClosing: true,
            attributes: {
                primary: {
                    type: Array,
                }
            },
            transform({ attributes }) {
                const { primary, ...attr1AsObject } = attributes;

                // TODO: Decide if we should implement A
                // A. Less predictable but more user-friendly solution
                // 3 possible cases:
                // 1. primary is an array / {% user ["Theo", "van der Wege"] %}
                // We consider this as the list of attributes to pass to the universal shortcode function
                // ⚠️ If user wants to pass an array as the first attributes, she will need to to write {% tag [["val1", "val2]] %}
                // 2. primary is not an array / {% user "Theo" %}
                // We consider the value as being the first and only attribute
                // 3. primary is undefined / {% user firstName="Theo" lastName="van der Wege" %}
                // We consider all other attributes as being key-value pairs of an object passed as first attribute of the universal shortcode function
                // Concerns:
                // - We cannot validate anything
                // - What if both primary and more attributes are defined?
                                            
                // B. More predictable but less user-friendly solution
                // primary must be an array or undefined
                // We consider this as the list of attributes to pass to the universal shortcode function
                // ⚠️ If user wants to pass an array as the first attributes, she will need to to write {% tag ["val1", "val2]] %}
                
                // Option B. is implemented right now.
                // The `primary` attribute should be an array containing all the attributes expected by the shortcode
                return Array.isArray(primary) ? fn(...primary) : fn(primary);
            }
        };
    }
    return tags
}

// TODO: This is not working!
export function convertPairedShortcodesToTags(pairedShortcodes, pluginOptions) {
    let tags = {}
    // Register paired shortcodes as tags
    for (const [name, fn] of Object.entries(pairedShortcodes)) {
        tags[name] = {
            attributes: {
                primary: {
                    type: Array,
                }
            },
            transform(node, config) {
                const attributes = node.transformAttributes(config);
                const { primary, ...attr1AsObject } = attributes;
                const children = node.transformChildren(config);
                // Convert the inside of the paired shortcode to html
                const innerHtml = Markdoc.renderers.html(children);
                // Call the shortcode function to generate html
                // The `primary` attribute should be an array containing all the attributes expected by the shortcode
                const html = Array.isArray(primary) ? fn(innerHtml, ...primary) : fn(innerHtml, primary);
                // Generate a renderable tree from the html
                const tokenizer = new Markdoc.Tokenizer({ html: true });
                const tokens = tokenizer.tokenize(html);
                const processed = processTokens(tokens);
                const ast = Markdoc.parse(processed);
                const renderableTree = Markdoc.transform(ast, config);

                return renderableTree;
            }
        };
    }
    return tags
}
