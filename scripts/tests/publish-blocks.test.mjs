import assert from 'node:assert/strict';
import { test } from 'node:test';
import { blockOf } from '../publish.mjs';

test('a block file names its block on its own element', () => {
  const file = `export function Hero() {
  return (
    <section data-block="hero" className="pt-24">
      <h1>Title</h1>
    </section>
  );
}
`;
  assert.equal(blockOf(file), 'hero');
});

test('a block file may pass its block to a component that writes it', () => {
  const file = `import { Section } from "./section";

export function Faq() {
  return (
    <Section block="faq" id="questions" labelledBy="faq-title">
      <h2 id="faq-title">Questions</h2>
    </Section>
  );
}
`;
  assert.equal(blockOf(file), 'faq');
});

test('a block named again, in a comment for instance, is still one block', () => {
  const file = `// The cycle (data-block="cycle"): four steps.
export function Cycle() {
  return <section data-block="cycle" />;
}
`;
  assert.equal(blockOf(file), 'cycle');
});

test('a file that names no block, or two, names none', () => {
  assert.equal(blockOf('export function Pill() {\n  return <span className="pill" />;\n}\n'), undefined);
  assert.equal(blockOf('<header data-block="header" />\n<Section block="intro" />\n'), undefined);
});

test('the component that writes the block it is given names none of its own', () => {
  const file = `export function Section({ block, children }) {
  return <section data-block={block}>{children}</section>;
}
`;
  assert.equal(blockOf(file), undefined);
});

test('a prop that only ends in "block" is not the block', () => {
  assert.equal(blockOf('<Card codeblock="x" data-block="card" />\n'), 'card');
});
