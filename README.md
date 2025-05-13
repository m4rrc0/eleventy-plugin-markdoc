# @m4rrc0/eleventy-plugin-markdoc

> An Eleventy plugin to add support for Markdoc as a template language

This plugin allows you to use [Markdoc](https://markdoc.dev/) in your Eleventy projects. Markdoc extends Markdown with a powerful component system and custom tags, making it ideal for documentation sites and content-heavy applications.

## Features

- Use `.mdoc` or `.markdoc` files in your Eleventy project
- Write content using Markdoc's extended Markdown syntax
- Access Eleventy's data cascade within your Markdoc files
- Use Eleventy's universal filters and shortcodes directly in your Markdoc content (⚠️ We haven't figured Async stuff out yet)
- Preserve HTML within Markdoc files (enabled by default, can be disabled)
- Customize rendering with your own tags, nodes, and functions

## Installation

```bash
npm install @m4rrc0/eleventy-plugin-markdoc
```

## Usage

### Basic Setup

Add the plugin to your [Eleventy configuration file](https://www.11ty.io/docs/config/) (probably `eleventy.config.js` or `.eleventy.js`):

```js
import markdocPlugin from '@m4rrc0/eleventy-plugin-markdoc';

export default function(eleventyConfig) {
  eleventyConfig.addPlugin(markdocPlugin);
  
  // Rest of your Eleventy config...
  return {
    // Your Eleventy config options
  };
}
```

### Creating Markdoc Files

Create files with the `.mdoc` or `.markdoc` extension in your Eleventy project:

```markdoc
---
layout: base.njk
title: My Markdoc Page
---

# Welcome to Markdoc

This is a paragraph with **bold** and *italic* text.

{% callout type="note" %}
This is a callout component
{% /callout %}

## Variables

Accessing variables: {% $title %}

<div class="custom-html">
  HTML is preserved by default!
</div>
```

## Configuration Options

The plugin accepts the following configuration options:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `html` | Boolean | `true` | Whether to preserve HTML in Markdoc files |
| `allowComments` | Boolean | `true` | Whether to allow HTML comments in Markdoc files |
| `documentRenderTag` | String\|null | `null` | Custom tag to render the document node |
| `transform` | Object | `{}` | Custom [Markdoc transform configuration](https://markdoc.dev/docs/config) |
| `extensions` | Array | `["mdoc", "markdoc"]` | Custom extensions to process |
| `includeTags.htmlTagProxy` | Boolean\|String | `"html-tag"` | Whether to include the HTML tag proxy, with an option to set a custom tag name |
| `includeTags.htmlElements` | Boolean | `false` | Whether to include all HTML elements as Markdoc tags |

### Configuration Example

```js
import markdocPlugin from '@m4rrc0/eleventy-plugin-markdoc';

export default function(eleventyConfig) {
  eleventyConfig.addPlugin(markdocPlugin, {
    html: true, // Default: true
    allowComments: true, // Default: true
    documentRenderTag: 'article', // Default: null
    extensions: ["mdoc", "markdoc"], // Default: ["mdoc", "markdoc"]
    deferTags: ["for-loop"], // Default: []
    includeTags: {
        htmlTagProxy: "html-tag", // Default: "html-tag"
        htmlElements: true // Default: false
    },
    // Default: No default value for transform
    transform: {
      nodes: {
        // Custom node definitions
      },
      tags: {
        callout: {
          render: 'div',
          attributes: {
            type: { type: String, default: 'note' }
          }
        }
      },
      functions: {
        // Custom function definitions
      },
      variables: {
        site: {
          title: 'My Site'
        }
      }
    }
  });
}
```

## Integration with Eleventy

This plugin automatically integrates Eleventy's features with Markdoc:


### Data Cascade

All data from Eleventy's data cascade is available as variables in your Markdoc files:

```markdoc
# {% $title %}

Author: {% $author.name %}
11ty version; {% $eleventy.version %}
```

## HTML Support

By default, the plugin preserves HTML in your Markdoc files:

```markdoc
# My Title

<div class="custom-component">
  <p>This HTML will be preserved</p>
</div>
```

You can disable this feature by setting `html: false` in the plugin options.

### ⚠️ Warning about mixing HTML and Markdoc syntax

There are some funky stuff going on when mixing HTML and Markdoc syntax.

For example, this won't work:

```html
<strong>
  *Markdoc*
</strong>

<div>
  ![Image](https://placehold.co/600x400)
</div>
```

While this will work (more or less) as expected:

```markdoc
<strong>*Markdoc*</strong>

<div>

  ![Image](https://placehold.co/600x400)

</div>
```


### Filters

All Eleventy universal filters are available as Markdoc functions:

```markdoc
{% slugify($myString) %}
```

⚠️ **Note**: Async filters are not supported (yet?).

### Shortcodes

Eleventy shortcodes are available as both Markdoc functions and tags:

```markdoc
<!-- As function -->
{% user($firstName, $lastName) %}

<!-- As tag: pass an array as unnamed first argument -->
{% user [$firstName, $lastName] %}

<!-- As tag: pass a string value as unnamed first argument -->
{% user $firstName %}

<!-- As tag: pass named attributes -->
{% user firstName=$firstName lastName=$lastName %}

```

When using the tag syntax, you have multiple ways of passing arguments to your shortcode function:

1. **No unnamed attribute(s)**

```markdoc
{% user [$firstName, $lastName] %}
```

The list of arguments will be passed to the shortcode function as `fn(firstName, lastName)`

Optionally, you can pass a string value as the first argument:

```markdoc
{% user $firstName %}
```

This will be passed as `fn(firstName)`

2. **Named attributes**

```markdoc
{% user firstName=$firstName lastName=$lastName %}
```

If some named attributes are passed, they will be passed as an object as the first argument to the shortcode function:

```js
fn({ firstName, lastName })
```

ℹ️ **Note**: If you need to pass an array as the first argument, do `{% shortcode [["array", "argument"]] %}` (or use the function notation).

⚠️ **Note**: Paired shortcodes are in test phase. Please report any issues you may encounter.  
⚠️ **Note**: Async shortcodes are not supported (yet?).

#### Paired Shortcodes

Paired shortcodes are always converted to Markdoc tags, following the same convention as simple shortcodes but the content is always passed as the first argument as a markdoc-processed HTML string.

So a full example would be:

```markdoc
{% user [$firstName, $lastName] role=$role %}
  <p>Content</p>
{% /user %}
```

This will be passed to the shortcode function as `fn("<p>Content</p>", { role }, firstName, lastName)`.

## Requirements

- Eleventy 3.0.0 or higher

## Credits

- [Markdoc](https://markdoc.dev/) - The underlying Markdoc library
- HTML preservation technique based on [this solution](https://github.com/markdoc/markdoc/issues/10#issuecomment-1492560830)
- [Eleventy](https://www.11ty.io/) (of course!) - The awesome SSG we all love ❤️

## License

ISC

## TODO List

### Documentation

- [ ] `deferTags`
- [ ] `includeTags.htmlTagProxy`
- [ ] `includeTags.htmlElements`
- [ ] `{% html-tag %}`
- [ ] `{% htmlElement %}`

### Features

- [ ] Figure out what is going on when mixing HTML and Markdoc syntax => Seems related to how inline Vs block elements are handled


