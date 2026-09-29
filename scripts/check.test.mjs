import { test } from "node:test";
import assert from "node:assert/strict";
import { check } from "./check.mjs";

const failed = (text, options) => check(text, options).failures.map((f) => f.rule);
const warned = (text, options) => check(text, options).warnings.map((w) => w.rule);

test("clean prose passes with no failures", () => {
  const text = [
    "# Pricing for small teams",
    "",
    "We check your site every day and email you when a number moves. Each report arrives with",
    "the sources behind it, so you can open any figure and read the record it came from.",
    "",
    "| Plan | Checks |",
    "|------|--------|",
    "| Free | — |",
  ].join("\n");
  assert.deepEqual(failed(text), []);
});

const FAILING = [
  ["em-dash", "The plan is simple — pick one."],
  ["em-dash", "The plan is simple -- pick one."],
  ["british-spelling", "We analyse the colour of the page."],
  ["british-spelling", "The order was cancelled."],
  ["british-spelling", "Our organisation prioritises speed."],
  ["rather-than", "We measure answers rather than rankings."],
  ["binary-contrast", "It's not a dashboard, it's a coach."],
  ["binary-contrast", "The answer isn't speed. It's accuracy."],
  ["binary-contrast", "This is not just fast but also cheap."],
  ["reader-homework", "You need to connect an account first."],
  ["reader-homework", "You must confirm your email."],
  ["sell-by-refusal", "What we will not do"],
  ["fabricated-proof", "Trusted by leading brands."],
  ["fabricated-proof", "Join 10,000+ teams today."],
  ["internal-constraint", "Our budget covers one engine."],
  ["servant-verb", "The draft obeys your rules."],
  ["servant-verb", "It listens to you."],
  ["servant-verb", "The agent heeds your feedback."],
  ["servant-verb", "The tool complies with your style."],
  ["servant-verb", "It does what you say."],
  ["servant-verb", "The assistant is at your command."],
  ["servant-verb", "It respects your settings."],
  ["read-it-as", "Read it as a table"],
  ["throat-clearing", "Here's the thing: pricing is hard."],
  ["throat-clearing", "It turns out pricing is hard."],
  ["emphasis-crutch", "Pricing is hard. Let that sink in."],
  ["jargon", "We take a deep dive into pricing."],
  ["buzzword", "A seamless, innovative workflow."],
  ["exclamation", "It works!"],
  ["percent-unit", "Visibility rose 4 pts this week."],
  ["every-noun", "## Every answer"],
  ["every-noun", "See every source"],
];

for (const [rule, text] of FAILING) {
  test(`${rule} fails on: ${text}`, () => {
    assert.ok(failed(text).includes(rule), `expected ${rule}, got ${JSON.stringify(failed(text))}`);
  });
}

const NOT_FAILING = [
  ["servant-verb", "No business that does what you do was named."],
  ["servant-verb", "These are the answers to one question."],
  ["british-spelling", "We emphasize the emphasis and fulfilled the order."],
  ["british-spelling", "The program is programmed and cancellation is free."],
  ["every-noun", "We check your site every day on every plan."],
  ["em-dash", "| Free | — |"],
  ["exclamation", "![A chart](chart.png)"],
];

for (const [rule, text] of NOT_FAILING) {
  test(`${rule} passes on: ${text}`, () => {
    assert.ok(!failed(text).includes(rule), `unexpected ${rule} in ${JSON.stringify(failed(text))}`);
  });
}

test("follow warns and never fails", () => {
  const text = "Edit a link and the list follows. The steps that follow are short.";
  assert.ok(!failed(text).includes("servant-follow"));
  assert.equal(warned(text).filter((rule) => rule === "servant-follow").length, 2);
});

test("every-noun in running prose warns instead of failing", () => {
  const text = "The report links every page on your site to the answer that named it, one row at a time.";
  assert.ok(!failed(text).includes("every-noun"));
  assert.ok(warned(text).includes("every-noun"));
});

test("fact-carrying adverbs do not warn", () => {
  const text = "We measure it daily, only on the paid plan.";
  assert.ok(!warned(text).includes("adverb"));
  assert.ok(warned("We really measure it quickly.").includes("adverb"));
});

test("title case headings warn", () => {
  assert.ok(warned("# How We Measure Your Results").includes("title-case"));
  assert.ok(!warned("# How we measure your results").includes("title-case"));
});

test("a statement opening on a Wh- word warns, a question does not", () => {
  assert.ok(warned("What makes this hard is the data.").includes("wh-opener"));
  assert.ok(!warned("How do I cancel?").includes("wh-opener"));
});

test("sentences over 30 words warn", () => {
  const long = `${"word ".repeat(31).trim()}.`;
  assert.ok(warned(long).includes("long-sentence"));
});

test("code, links and comments are not prose", () => {
  const text = [
    "Use `rather than` in a prompt.",
    "[A link](https://example.com/you-must-rather-than)",
    "<!-- You must not -- ever -->",
    "```",
    "The draft obeys — rather than guessing!",
    "```",
  ].join("\n");
  assert.deepEqual(failed(text), []);
});

test("line numbers survive stripped fences", () => {
  const text = ["```", "code", "```", "", "It works!"].join("\n");
  const [hit] = check(text).failures;
  assert.equal(hit.rule, "exclamation");
  assert.equal(hit.line, 5);
});

test("--headline-full-stop is off by default and fails bare headings when on", () => {
  assert.ok(!failed("## Two plans").includes("headline-full-stop"));
  assert.ok(failed("## Two plans", { headlineFullStop: true }).includes("headline-full-stop"));
  assert.ok(!failed("## Two plans.", { headlineFullStop: true }).includes("headline-full-stop"));
  assert.ok(!failed("## Is it working?", { headlineFullStop: true }).includes("headline-full-stop"));
});
