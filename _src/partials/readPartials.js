import { readFile } from 'node:fs/promises';
import path from 'node:path';
import fg from 'fast-glob';
import Markdoc from '@markdoc/markdoc';
import { processTokens } from '../html-in-mdoc.js';

/**
 * Reads files matching glob patterns from multiple sources and returns their contents
 * @param {Array|Object} sources - Source configuration(s) for file reading
 * @param {Object} [globalOptions={}] - Global options that apply to all sources
 * @param {Markdoc.Tokenizer} [MarkdocTokenizer] - Markdoc tokenizer instance
 * @returns {Promise<Object>} - Object with file paths as keys and content as values
 */
export default async function readPartials(
    sources,
    globalOptions = {},
    MarkdocTokenizer = new Markdoc.Tokenizer({ allowComments: true }),
    htmlTagProxyName = "html-tag"
) {
  // Handle both array and single object formats
  const sourcesArray = Array.isArray(sources) ? sources : [sources];
  // Filter out any falsy sources
  const validSources = sourcesArray.filter(Boolean);
  
  if (validSources.length === 0) {
    if (globalOptions.debug) console.log('Plugin Markdoc: No valid partials sources provided');
    return {};
  }
  
  const results = {};
  
  // Process each source configuration
  for (const source of validSources) {
    // Skip if no patterns are defined
    if (!source.patterns) continue;
    
    // Normalize patterns to array
    const patterns = Array.isArray(source.patterns) ? source.patterns : [source.patterns];
    if (patterns.length === 0) continue;
    
    // Merge options with global options
    const options = {
      ...globalOptions,
      ...source
    };
    
    // Extract options with defaults
    const {
      cwd: rawCwd = process.cwd(),
      encoding = 'utf8',
      debug = false,
      // The path prefix to use for keys in the results object
      pathPrefix = '',
      // Strip this prefix from the result keys
      stripPrefix = '',
    } = options;
    
    // Handle both relative and absolute paths for cwd
    const cwd = path.isAbsolute(rawCwd) ? rawCwd : path.resolve(process.cwd(), rawCwd);
    
    // Remove our custom options from glob options
    const globOptions = { ...options };
    delete globOptions.encoding;
    delete globOptions.debug;
    delete globOptions.pathPrefix;
    delete globOptions.stripPrefix;
    delete globOptions.patterns; // Remove patterns from glob options
    
    // Ensure objectMode is false
    globOptions.objectMode = false;
    
    if (debug) console.log(`Plugin Markdoc: Searching for files in ${cwd} with patterns: ${patterns.join(', ')}`);
    
    try {
      // Find all files matching the patterns
      const files = await fg(patterns, {
        absolute: true,
        onlyFiles: true,
        ...globOptions,
        cwd // Ensure cwd is set correctly
      });
      
      if (debug) console.log(`Found ${files.length} files matching patterns in ${cwd}`);
      
      // Process each file
      await Promise.all(files.map(async (filePath) => {
        try {
          // Get the relative path from the cwd
          let relativePath = path.relative(cwd, filePath);
          
          // Apply strip prefix if specified
          if (stripPrefix && relativePath.startsWith(stripPrefix)) {
            relativePath = relativePath.slice(stripPrefix.length);
            // Remove leading slash if present
            if (relativePath.startsWith('/') || relativePath.startsWith('\\')) {
              relativePath = relativePath.slice(1);
            }
          }
          
          // Apply path prefix if specified
          const resultKey = pathPrefix ? path.join(pathPrefix, relativePath) : relativePath;
          
          // Read the file content
          const content = await readFile(filePath, encoding);
          
          // Parse partials content the same way we do for content
          const tokens = MarkdocTokenizer.tokenize(content);
          const processed = processTokens(tokens, htmlTagProxyName);
          const ast = Markdoc.parse(processed);
          
          // Add to results - the AST node is what Markdoc expects for partials
          results[resultKey] = ast;
          
          if (debug) {
            console.log(`Read file: ${resultKey} (from ${filePath})`);
          }
        } catch (error) {
          console.warn(`Error reading file ${filePath}: ${error.message}`);
        }
      })).finally(() => {
        if (debug) {
        //   console.log(`Successfully read ${Object.keys(results).length} files total`);
          console.log('Partials found: ', results);
        }
      });
    } catch (error) {
      console.error(`Error in glob pattern matching for ${cwd}: ${error.message}`);
    }
  }
  
  if (globalOptions.debug) {
    console.log(`Successfully read ${Object.keys(results).length} files total`);
  }
  
  return results;
}
