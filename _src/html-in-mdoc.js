// Explanation: This helps Markdoc engine keep html inside Markdoc files
// This method is described here: https://github.com/markdoc/markdoc/issues/10#issuecomment-1492560830
// The code comes from here: https://gist.github.com/rpaul-stripe/941eb22c4779ea87b1adf7715d76ca08
// I have forked it here (just in case...): https://gist.github.com/m4rrc0/2681d2a76099af95691e360f7d5465e0
// NOTE: With this method, html tags are properly parsed and handled by Markdoc, so should benefit of all the logic we implement

import Markdoc from "@markdoc/markdoc";
import { Parser } from "htmlparser2";

export const tags = {
    "html-tag": {
      attributes: {
        name: { type: String, required: true },
        attrs: { type: Object },
      },
      transform(node, config) {
        const { name, attrs } = node.attributes;
        const children = node.transformChildren(config);
        return new Markdoc.Tag(name, attrs, children);
      },
    },
}

export function processTokens(tokens) {
  const output = [];

  const parser = new Parser({
    onopentag(name, attrs) {
      output.push({
        type: "tag_open",
        nesting: 1,
        meta: {
          tag: "html-tag",
          attributes: [
            { type: "attribute", name: "name", value: name },
            { type: "attribute", name: "attrs", value: attrs },
          ],
        },
      });
    },

    ontext(content) {
      if (typeof content === "string" && content.trim().length > 0)
        output.push({ type: "text", content });
    },

    onclosetag(name) {
      output.push({
        type: "tag_close",
        nesting: -1,
        meta: { tag: "html-tag" },
      });
    },
  });

  for (const token of tokens) {
    if (token.type.startsWith("html")) {
      parser.write(token.content);
      continue;
    }

    if (token.type === "inline")
      token.children = processTokens(token.children);

    output.push(token);
  }

  return output;
}

