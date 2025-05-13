import Markdoc from "@markdoc/markdoc";
import { processTokens } from './html-in-mdoc.js';

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
            transform(node, config) {
                const { primary } = node.transformAttributes(config);
                const { ...otherAttrs } = node.attributes
                // NOTE: Concerns: We cannot validate these attributes

                let html = '';
                // 2 possible cases for handling attributes:
                if (!otherAttrs) {
                    // 1. No named attributes
                    // The `primary` attribute should be an array containing all the attributes expected by the shortcode
                    // E.g. {% user ["Theo", "van der Wege"] %}
                    // We also support a string value for the `primary` attribute which is then passed as first argument to the shortcode function
                    // E.g. {% user "Theo" %}
                    // ⚠️ If user wants to pass an array as the first attributes, she will need to to write {% tag ["val1", "val2]] %}
                    html = Array.isArray(primary) ? fn(...primary) : fn(primary);
                } else {
                    // 2. Other named attributes
                    // We consider all other attributes as being key-value pairs of an object passed as first attribute of the shortcode function
                    // E.g. {% user firstName="Theo" lastName="van der Wege" %}
                    html = Array.isArray(primary) ? fn(otherAttrs, ...primary) : fn(otherAttrs, primary);
                }

                return html;
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
                const { primary } = node.transformAttributes(config);
                const { ...otherAttrs } = node.attributes
                const children = node.transformChildren(config);

                // Convert the inside of the paired shortcode to html
                const innerHtml = Markdoc.renderers.html(children);

                // Call the shortcode function to generate html
                let html = '';
                if (!otherAttrs) {
                    // NOTE: see notes in convertShortcodesToTags
                    html = Array.isArray(primary) ? fn(innerHtml, ...primary) : fn(innerHtml, primary);
                } else {
                    // NOTE: see notes in convertShortcodesToTags
                    html = Array.isArray(primary) ? fn(innerHtml, otherAttrs, ...primary) : fn(innerHtml, otherAttrs, primary);
                }

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
