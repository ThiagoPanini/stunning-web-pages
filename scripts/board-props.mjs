// The tweaks of a board, read and set in its own text.
//
// A board declares its tweaks in the data-props attribute of its script (<script type="text/x-dc"
// data-dc-script data-props='{"name":{"editor":"enum","options":[...],"default":"..."}}'>). Outside the
// editor the runtime renders the root board with each tweak's `default`, so serving a copy of the board
// whose defaults were changed renders the board with those values, the way the editor would after the
// author picked them in the panel. Imported boards (<dc-import>) are separate files and stay as they are.

const DATA_PROPS = /(<script\b[^>]*\bdata-dc-script\b[^>]*\bdata-props=)(["'])([\s\S]*?)\2/;

const ENTITIES = { '&quot;': '"', '&#39;': "'", '&#x27;': "'", '&lt;': '<', '&gt;': '>', '&amp;': '&' };

function unescapeAttribute(text) {
  return text.replace(/&(?:quot|#39|#x27|lt|gt|amp);/g, (entity) => ENTITIES[entity]);
}

function escapeAttribute(text, quote) {
  const escaped = text.replace(/&/g, '&amp;');
  return quote === '"' ? escaped.replace(/"/g, '&quot;') : escaped.replace(/'/g, '&#39;');
}

// The tweaks the board declares, as parsed from data-props; keys starting with "$" (such as $preview) are
// the editor's, not tweaks.
export function readBoardProps(html) {
  const match = DATA_PROPS.exec(html);
  if (!match) throw new Error('the board has no data-props on its script');
  return JSON.parse(unescapeAttribute(match[3]));
}

// The board's text with the `default` of each given tweak set to the given value. A tweak the board does
// not declare, or a value outside an enum tweak's options, is an error: the capture would silently show
// the board's own default.
export function withPropDefaults(html, values) {
  const match = DATA_PROPS.exec(html);
  if (!match) throw new Error('the board has no data-props on its script');
  const [whole, head, quote, body] = match;
  const props = JSON.parse(unescapeAttribute(body));
  for (const [name, value] of Object.entries(values)) {
    const prop = props[name];
    if (name.startsWith('$') || !prop || typeof prop !== 'object') {
      throw new Error(`the board declares no tweak "${name}"`);
    }
    if (Array.isArray(prop.options) && !prop.options.includes(value)) {
      throw new Error(`tweak "${name}" has no option ${JSON.stringify(value)} (options: ${prop.options.join(', ')})`);
    }
    prop.default = value;
  }
  const attribute = `${head}${quote}${escapeAttribute(JSON.stringify(props), quote)}${quote}`;
  return html.slice(0, match.index) + attribute + html.slice(match.index + whole.length);
}
