import path from 'node:path';
import assert from 'node:assert';
import Markdoc from '@markdoc/markdoc';
import {
    convertUniversalFiltersToFunctions,
    convertShortcodesToFunctions,
    convertShortcodesToTags,
    convertPairedShortcodesToTags
} from './_src/utils.js';
import { htmlTagProxy, processTokens } from './_src/html-in-mdoc.js';
import * as htmlElements from './_src/tags/html-elements/index.js';
import readPartials from './_src/partials/readPartials.js';

// TODO: validate pluginOptions (with assert or zod or ...?)
export default async function(eleventyConfig, pluginOptions) {
    eleventyConfig.versionCheck(">=3.0.0-alpha.1");
    const inputDir = eleventyConfig.dir?.input || ".";
    const includesDir = eleventyConfig.dir?.includes || "./_includes";

    // Defaults plugin config
    const defaultExtensions = ["mdoc", "markdoc"];
    const defaults = {
        html: true,
        allowComments: true,
        documentRenderTag: null,
        extensions: defaultExtensions,
        deferTags: [],
        includeTags: {
            htmlTagProxy: "html-tag",
            htmlElements: false
        },
        // Array of partial source configurations
        usePartials: [
            {
                // Working directory for glob patterns
                cwd: path.join(inputDir, includesDir),
                // Glob patterns to match files
                patterns: [`**/*.{${(pluginOptions?.extensions || defaultExtensions).join(',')}}`],
                // File reading options
                encoding: "utf8",
                // Path manipulation options
                // pathPrefix: "", // Add a prefix to all paths in the results
                // stripPrefix: "", // Remove a prefix from all paths in the results
                debug: true
            }
        ],
        debug: false
    };
    // Plugin options
    const po = {
        ...defaults,
        ...pluginOptions,
        // Handle usePartials configuration
        usePartials: Array.isArray(pluginOptions?.usePartials) 
            ? pluginOptions.usePartials 
            : (pluginOptions?.usePartials ? [pluginOptions.usePartials] : defaults.usePartials)
    }

    let MarkdocTokenizer;
    if (po.html) {
        // Tokenize and process the input if we need to keep HTML
        MarkdocTokenizer = new Markdoc.Tokenizer({ html: true });
    } else {
        MarkdocTokenizer = new Markdoc.Tokenizer({ allowComments: true });
    }

    let htpn = po.includeTags?.htmlTagProxy
    htpn = (typeof htpn === "string" && htpn) || (htpn === true && "html-tag") || htpn;

    // Add as a valid extension to process
	// Alternatively, add this to the list of formats you pass to the `--formats` CLI argument
	eleventyConfig.addTemplateFormats("mdoc");

    // Get universal stuff
    const filters = eleventyConfig.getFilters();
    const shortcodes = eleventyConfig.getShortcodes();
    const pairedShortcodes = eleventyConfig.getPairedShortcodes();

    // Register universal filters and shortcodes
    let functions = {
        ...convertUniversalFiltersToFunctions(filters, po),
        ...convertShortcodesToFunctions(shortcodes, po),
    }
    let tags = {
        ...convertShortcodesToTags(shortcodes, po),
        ...convertPairedShortcodesToTags(pairedShortcodes, po),
        ...(po.includeTags?.htmlElements ? htmlElements : {})
    }
    // Register includes (and other files) as partials
    let partials = {
        ...(await readPartials(po.usePartials, { debug: po.debug }, MarkdocTokenizer, htpn)),
        ...po.transform?.partials
    }

    // Check that all partials' content are AST
    for (const value of Object.values(partials)) {
        assert(typeof value === "object", `Partial is not an AST`);
    }

    /** @type {import('@markdoc/markdoc').Config} */
    const transformConfigGlobal = {
        ...(po.transform || {}),
        nodes: {
            document: {...Markdoc.nodes.document, render: po.documentRenderTag},
            ...(po.transform?.nodes || {})
        },
        variables: {
            ...po.transform?.variables
        },
        functions: {
            ...functions,
            ...po.transform?.functions
        },
        tags: {
            // Enforce the html tag proxy if html is enabled
            ...(po.html ? { [htpn || "html-tag"]: htmlTagProxy } : {}),
            ...tags,
            ...po.transform?.tags
        },
        partials: {
            ...partials,
        }
    };

    if (po.debug) {
        console.log({
            inputContent,
            functions,
            tags,
            partials,
        })
    }

    // "mdoc" here means that the extension will apply to any .mdoc file
	eleventyConfig.addExtension(po.extensions, {
		compile: async function(inputContent, inputPath) {
            if (typeof inputContent === "undefined") {
                // Can happen if `read: false` is set
                return;
            }
            // let parsedInputPath = path.parse(inputPath);
            // let includesFolder = this.config.dir.includes;
        
            // Skipping a template
            // if(parsedInputPath.name.startsWith("_")) {
            //     return;
            // }

            const tokens = MarkdocTokenizer.tokenize(inputContent);
            const processed = processTokens(tokens, htpn);
            const ast = Markdoc.parse(processed);

            // TODO: find a better solution for this
            // To be able to defer children rendering (useful for loops)
            // If we don't defer, the variables in children are statically rendered before the loop happens
            for (const node of ast.walk()) {
                if (po.deferTags.includes(node.tag)) {
                    node.rawChildren = [...node.children]; // save original ast
                }
            }
            
            // TODO: Register dependencies
            // https://www.11ty.dev/docs/languages/custom/#registering-dependencies
            // this.addDependencies(inputPath, result.loadedUrls);
            
            // This is the render function, `data` is the full data cascade
            return async (data) => {
                const transformConfig = {
                    ...transformConfigGlobal,
                    variables: {
                        ...data,
                        ...transformConfigGlobal?.variables
                    }
                }

                const content = Markdoc.transform(ast, transformConfig);
                const html = Markdoc.renderers.html(content);

                return html;
            };
        }
	});
}

// TODO:
// - ? Handle code blocks as pre > code ?
// - ? Paired shortcodes ?
// - ? Async filters and shortcodes ?
// - Support `.markdoc.md` extension
// - Explore combining this with WebC
