import Markdoc from "@markdoc/markdoc";

const commonAttributes = {
    class: { type: String },
    id: { type: String },
    style: { type: String },
    title: { type: String },
    lang: { type: String },
    dir: { type: String },
    hidden: { type: Boolean },
    tabindex: { type: Number },
    accesskey: { type: String },
    draggable: { type: Boolean },
    contenteditable: { type: Boolean },
    spellcheck: { type: Boolean },
    translate: { type: Boolean },
}

// Form-related common attributes
const formAttributes = {
    autofocus: { type: Boolean },
    disabled: { type: Boolean },
    form: { type: String },
    name: { type: String },
}

// Input-specific common attributes
const inputAttributes = {
    ...formAttributes,
    autocomplete: { type: String },
    placeholder: { type: String },
    readonly: { type: Boolean },
    required: { type: Boolean },
}

function createTag(render, attributes) {
    return {
        render,
        attributes: {
            ...commonAttributes,
            ...attributes,
        },
        transform: (node, config) => {
            const attributes = node.transformAttributes(config);
            const children = node.transformChildren(config);
            const attrs = {
                ...node.attributes,
                ...attributes,
            }
            return new Markdoc.Tag(render, attrs, children);
        },
    }
}

// Main root
export const html = createTag('html', {
    xmlns: { type: String },
});

// Document metadata
export const head = createTag('head');

export const title = createTag('title');

export const base = createTag('base', {
    href: { type: String },
    target: { type: String },
});

export const link = createTag('link', {
    href: { type: String },
    rel: { type: String },
    type: { type: String },
    media: { type: String },
    sizes: { type: String },
    crossorigin: { type: String },
    integrity: { type: String },
    referrerpolicy: { type: String },
    as: { type: String },
    hreflang: { type: String },
    imagesizes: { type: String },
    imagesrcset: { type: String },
});

export const meta = createTag('meta', {
    name: { type: String },
    content: { type: String },
    charset: { type: String },
    http_equiv: { type: String },
    property: { type: String },
});

export const style = createTag('style', {
    media: { type: String },
    type: { type: String },
});

// Sectioning root
export const body = createTag('body', {
    onafterprint: { type: String },
    onbeforeprint: { type: String },
    onbeforeunload: { type: String },
    onhashchange: { type: String },
    onlanguagechange: { type: String },
    onmessage: { type: String },
    onoffline: { type: String },
    ononline: { type: String },
    onpopstate: { type: String },
    onredo: { type: String },
    onresize: { type: String },
    onstorage: { type: String },
    onundo: { type: String },
    onunload: { type: String },
});

// Content sectioning
export const address = createTag('address');

export const article = createTag('article');

export const aside = createTag('aside');

export const footer = createTag('footer');

export const header = createTag('header');

export const h1 = createTag('h1');

export const h2 = createTag('h2');

export const h3 = createTag('h3');

export const h4 = createTag('h4');

export const h5 = createTag('h5');

export const h6 = createTag('h6');

export const hgroup = createTag('hgroup');

export const main = createTag('main');

export const nav = createTag('nav');

export const section = createTag('section');

// Text content
export const blockquote = createTag('blockquote', {
    cite: { type: String },
});

export const dd = createTag('dd');

export const div = createTag('div');

export const dl = createTag('dl');

export const dt = createTag('dt');

export const figcaption = createTag('figcaption');

export const figure = createTag('figure');

export const hr = createTag('hr');

export const li = createTag('li', {
    value: { type: Number },
});

export const ol = createTag('ol', {
    reversed: { type: Boolean },
    start: { type: Number },
    type: { type: String },
});

export const p = createTag('p');

export const pre = createTag('pre');

export const ul = createTag('ul');

// Inline text semantics
export const a = createTag('a', {
    href: { type: String, required: true },
    target: { type: String },
    rel: { type: String },
    download: { type: String },
    ping: { type: String },
    referrerpolicy: { type: String },
    shape: { type: String },
    coords: { type: String },
    name: { type: String },
    hreflang: { type: String },
    type: { type: String },
    text: { type: String },
});

export const abbr = createTag('abbr');

export const b = createTag('b');

export const bdi = createTag('bdi');

export const bdo = createTag('bdo');

export const br = createTag('br');

export const cite = createTag('cite');

export const code = createTag('code');

export const data = createTag('data', {
    value: { type: String, required: true },
});

export const dfn = createTag('dfn');

export const em = createTag('em');

export const i = createTag('i');

export const kbd = createTag('kbd');

export const mark = createTag('mark');

export const q = createTag('q', {
    cite: { type: String },
});

export const rp = createTag('rp');

export const rt = createTag('rt');

export const ruby = createTag('ruby');

export const s = createTag('s');

export const samp = createTag('samp');

export const small = createTag('small');

export const span = createTag('span');

export const strong = createTag('strong');

export const sub = createTag('sub');

export const sup = createTag('sup');

export const time = createTag('time', {
    datetime: { type: String },
});

export const u = createTag('u');

export const var_ = createTag('var');

export const wbr = createTag('wbr');

// Image and multimedia
export const area = createTag('area', {
    alt: { type: String },
    coords: { type: String },
    download: { type: String },
    href: { type: String },
    hreflang: { type: String },
    ping: { type: String },
    referrerpolicy: { type: String },
    rel: { type: String },
    shape: { type: String },
    target: { type: String },
});

export const audio = createTag('audio', {
    autoplay: { type: Boolean },
    controls: { type: Boolean },
    crossorigin: { type: String },
    loop: { type: Boolean },
    muted: { type: Boolean },
    preload: { type: String },
    src: { type: String },
});

export const img = createTag('img', {
    src: { type: String, required: true },
    alt: { type: String },
    width: { type: Number },
    height: { type: Number },
    loading: { type: String },
    referrerpolicy: { type: String },
    crossorigin: { type: String },
    srcset: { type: String },
    sizes: { type: String },
    usemap: { type: String },
    ismap: { type: Boolean },
});

export const map = createTag('map', {
    name: { type: String, required: true },
});

export const track = createTag('track', {
    default: { type: Boolean },
    kind: { type: String },
    label: { type: String },
    src: { type: String, required: true },
    srclang: { type: String },
});

export const video = createTag('video', {
    autoplay: { type: Boolean },
    controls: { type: Boolean },
    crossorigin: { type: String },
    height: { type: Number },
    loop: { type: Boolean },
    muted: { type: Boolean },
    poster: { type: String },
    preload: { type: String },
    src: { type: String },
    width: { type: Number },
});

// Embedded content
export const embed = createTag('embed', {
    height: { type: Number },
    src: { type: String, required: true },
    type: { type: String },
    width: { type: Number },
});

export const iframe = createTag('iframe', {
    allow: { type: String },
    allowfullscreen: { type: Boolean },
    height: { type: Number },
    loading: { type: String },
    name: { type: String },
    referrerpolicy: { type: String },
    sandbox: { type: String },
    src: { type: String },
    srcdoc: { type: String },
    width: { type: Number },
});

export const object = createTag('object', {
    data: { type: String },
    form: { type: String },
    height: { type: Number },
    name: { type: String },
    type: { type: String },
    usemap: { type: String },
    width: { type: Number },
});

export const param = createTag('param', {
    name: { type: String, required: true },
    value: { type: String },
});

export const picture = createTag('picture');

export const source = createTag('source', {
    media: { type: String },
    sizes: { type: String },
    src: { type: String },
    srcset: { type: String },
    type: { type: String },
});

// Scripting
export const canvas = createTag('canvas', {
    height: { type: Number },
    width: { type: Number },
});

export const noscript = createTag('noscript');

export const script = createTag('script', {
    async: { type: Boolean },
    crossorigin: { type: String },
    defer: { type: Boolean },
    integrity: { type: String },
    nomodule: { type: Boolean },
    referrerpolicy: { type: String },
    src: { type: String },
    type: { type: String },
});

// Demarcating edits
export const del = createTag('del', {
    cite: { type: String },
    datetime: { type: String },
});

export const ins = createTag('ins', {
    cite: { type: String },
    datetime: { type: String },
});

// Table content
export const caption = createTag('caption');

export const col = createTag('col', {
    span: { type: Number },
});

export const colgroup = createTag('colgroup', {
    span: { type: Number },
});

export const table = createTag('table');

export const tbody = createTag('tbody');

export const td = createTag('td', {
    colspan: { type: Number },
    headers: { type: String },
    rowspan: { type: Number },
});

export const tfoot = createTag('tfoot');

export const th = createTag('th', {
    abbr: { type: String },
    colspan: { type: Number },
    headers: { type: String },
    rowspan: { type: Number },
    scope: { type: String },
});

export const thead = createTag('thead');

export const tr = createTag('tr');

// Forms
export const button = createTag('button', {
    ...formAttributes,
    formaction: { type: String },
    formenctype: { type: String },
    formmethod: { type: String },
    formnovalidate: { type: Boolean },
    formtarget: { type: String },
    type: { type: String },
    value: { type: String },
});

export const datalist = createTag('datalist');

export const fieldset = createTag('fieldset', {
    disabled: { type: Boolean },
    form: { type: String },
    name: { type: String },
});

export const form = createTag('form', {
    accept_charset: { type: String },
    action: { type: String },
    autocomplete: { type: String },
    enctype: { type: String },
    method: { type: String },
    name: { type: String },
    novalidate: { type: Boolean },
    rel: { type: String },
    target: { type: String },
});

export const input = createTag('input', {
    ...inputAttributes,
    accept: { type: String },
    alt: { type: String },
    checked: { type: Boolean },
    dirname: { type: String },
    formaction: { type: String },
    formenctype: { type: String },
    formmethod: { type: String },
    formnovalidate: { type: Boolean },
    formtarget: { type: String },
    height: { type: Number },
    list: { type: String },
    max: { type: String },
    maxlength: { type: Number },
    min: { type: String },
    minlength: { type: Number },
    multiple: { type: Boolean },
    pattern: { type: String },
    size: { type: Number },
    src: { type: String },
    step: { type: String },
    type: { type: String },
    value: { type: String },
    width: { type: Number },
});

export const label = createTag('label', {
    for: { type: String },
    form: { type: String },
});

export const legend = createTag('legend');

export const meter = createTag('meter', {
    form: { type: String },
    high: { type: Number },
    low: { type: Number },
    max: { type: Number },
    min: { type: Number },
    optimum: { type: Number },
    value: { type: Number, required: true },
});

export const optgroup = createTag('optgroup', {
    disabled: { type: Boolean },
    label: { type: String, required: true },
});

export const option = createTag('option', {
    disabled: { type: Boolean },
    label: { type: String },
    selected: { type: Boolean },
    value: { type: String },
});

export const output = createTag('output', {
    for: { type: String },
    form: { type: String },
    name: { type: String },
});

export const progress = createTag('progress', {
    max: { type: Number },
    value: { type: Number },
});

export const select = createTag('select', {
    ...inputAttributes,
    multiple: { type: Boolean },
    size: { type: Number },
});

export const textarea = createTag('textarea', {
    ...inputAttributes,
    cols: { type: Number },
    dirname: { type: String },
    maxlength: { type: Number },
    minlength: { type: Number },
    rows: { type: Number },
    wrap: { type: String },
});

// Interactive elements
export const details = createTag('details', {
    open: { type: Boolean },
});

export const dialog = createTag('dialog', {
    open: { type: Boolean },
});

export const menu = createTag('menu');

export const summary = createTag('summary');

// Web Components
export const slot = createTag('slot', {
    name: { type: String },
});

export const template = createTag('template');
