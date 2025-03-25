import Markdoc from "@markdoc/markdoc";

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
            // render: "div",
            // children: ['paragraph', 'tag', 'list'],
            // selfClosing: true,
            attributes: {
                primary: {
                    type: Array,
                }
            },
            transform(node, config) {
                const attributes = node.transformAttributes(config);
                const children = node.transformChildren(config);
                // const newNode = node.transform(config);

                const { primary, ...attr1AsObject } = attributes;

                // TODO: Find a way to automatically convert paired shortcodes

                // const innerContent = Markdoc.parse(children)
                // const innerHtml = Markdoc.renderers.html(children)
                // console.log({ child: children[0], innerHtml })
                // return Array.isArray(primary) ? fn(innerHtml, ...primary) : fn(innerHtml, primary);

                // const innerContent = children.map(child => {
                //     // return new Markdoc.Tag(child.name, child.attributes, child.children)
                //     const html = Markdoc.renderers.html(child);
                //     return html
                // })
                // console.log({ node, children, innerContent })
                // return Array.isArray(primary) ? fn(innerContent, ...primary) : fn(innerContent, primary);
                
                // return Array.isArray(primary) ? fn(children, ...primary) : fn(children, primary);
                // return '<p>Hey there</p>'
                // return new Markdoc.Tag(name, attrs, children);
                
                return null
            }
        };
    }
    return tags
}
