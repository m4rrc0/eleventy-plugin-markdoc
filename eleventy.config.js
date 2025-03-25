import Markdoc from '@markdoc/markdoc';
import {
    convertUniversalFiltersToFunctions,
    convertShortcodesToFunctions,
    convertShortcodesToTags,
    convertPairedShortcodesToTags
} from './_src/utils.js';
import { tags as htmlTags, processTokens } from './_src/html-in-mdoc.js';

// TODO: validate pluginOptions (with zod?)
export default function(eleventyConfig, pluginOptions) {
    eleventyConfig.versionCheck(">=3.0.0-alpha.1");

    // Defaults plugin config
    const defaults = {
        html: true,
        documentRenderTag: null
    };
    // Plugin options
    const po = {
        ...defaults,
        ...pluginOptions,
    }

    // Add as a valid extension to process
	// Alternatively, add this to the list of formats you pass to the `--formats` CLI argument
	eleventyConfig.addTemplateFormats("mdoc");

    const filters = eleventyConfig.getFilters();
    const shortcodes = eleventyConfig.getShortcodes();
    const pairedShortcodes = eleventyConfig.getPairedShortcodes();

    // "mdoc" here means that the extension will apply to any .mdoc file
	eleventyConfig.addExtension(["mdoc", "markdoc", "markdoc.md"], {
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
        
            // Register universal filters
            let functions = {
                ...convertUniversalFiltersToFunctions(filters, po),
                ...convertShortcodesToFunctions(shortcodes, po),
            }
            let tags = {
                ...convertShortcodesToTags(shortcodes, po),
                ...convertPairedShortcodesToTags(pairedShortcodes, po),
            }

            let processed = inputContent
            if (po.html) {
                // Tokenize and process the input if we need to keep HTML
                const tokenizer = new Markdoc.Tokenizer({ html: true });
                const tokens = tokenizer.tokenize(inputContent);
                processed = processTokens(tokens);
            }
            const ast = Markdoc.parse(processed);
            
            // TODO: Register dependencies
            // https://www.11ty.dev/docs/languages/custom/#registering-dependencies
            // this.addDependencies(inputPath, result.loadedUrls);
            
            // This is the render function, `data` is the full data cascade
            return async (data) => {
                /** @type {import('@markdoc/markdoc').Config} */
                const transformConfig = {
                    ...po.transform || {},
                    nodes: {
                        document: {...Markdoc.nodes.document, render: po.documentRenderTag},
                        ...po.transform?.nodes || {}
                    },
                    variables: {
                        ...data,
                        ...po.transform?.variables
                    },
                    functions: {
                        ...functions,
                        ...po.transform?.functions
                    },
                    tags: {
                        ...(po.html ? htmlTags : {}),
                        ...tags,
                        ...po.transform?.tags
                    },
                };

                const content = Markdoc.transform(ast, transformConfig);
                const html = Markdoc.renderers.html(content);

                return html;
            };
        }
	});
}

// NOTES
// - ? Handle code blocks as pre > code ?
// - ? Paired shortcodes ?
