#!/usr/bin/env node
/*
  The ultimate-stop-slop checker.

  Runs the rules a regular expression can catch, over markdown or plain text. The rest of the
  skill needs a reader. No dependencies; Node 18 or later.

    node scripts/check.mjs [--headline-full-stop] <file...>
    cat draft.md | node scripts/check.mjs

  Prints one line per hit and exits 1 when any rule fails. Warnings print and never fail: they
  cover patterns a regex cannot judge, such as "follow" in its time sense.

  Fenced code, inline code, link targets, URLs and HTML comments are removed before any rule
  runs, so a README can quote a banned phrase inside backticks.
*/
import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

/* A paragraph break. Patterns that span words use this so a match never crosses paragraphs. */
const SAME_PARA = "(?:(?!\\n\\s*\\n)[^.;!?])";

const BRITISH = new RegExp(
  "\\b(?:" +
    [
      "(?:colour|behaviour|favour|honour|labour|neighbour|flavour|humour|rumour|endeavour|harbour|vigour|odour|armour|parlour|savour)(?:s|ed|ing|ite|ites|able|ful|hood|less)?",
      "(?:centre|metre|litre|theatre|fibre|calibre|spectre|sombre|lustre|meagre)(?:s|d)?",
      "centring",
      "(?:licence|defence|offence|pretence)s?",
      "(?:analy|paraly|cataly)s(?:e|es|ed|ing)",
      "(?:organi|recogni|optimi|summari|prioriti|customi|reali|apologi|authori|categori|minimi|maximi|utili|visuali|finali|emphasi|speciali|standardi|normali|personali|capitali|moneti|critici|memori|characteri|stabili|moderni|digiti|mobili|locali|synchroni|centrali|generali|familiari|itemi|saniti|randomi|tokeni|seriali|initiali)s(?:e|es|ed|ing|ation|ations|er|ers)",
      "(?:cancel|label|travel|model|level|fuel|signal|total|counsel|channel|dial|tunnel|funnel|pedal|equal)l(?:ed|ing|er|ers)",
      "grey(?:s|ed|ish|er|est|ness)?",
      "programmes?",
      "catalogue(?:s|d)?",
      "analogues?",
      "enquir(?:y|ies|e|es|ed|ing)",
      "whilst",
      "amongst",
      "learnt",
      "spelt",
      "fulfil(?:s|ment)?",
      "enrol(?:s|ment|ments)?",
      "judgements?",
      "ageing",
      "cheques?",
      "tyres?",
      "aluminium",
      "jeweller(?:y|s)?",
      "sceptic(?:al|ism|s)?",
      "practis(?:e|es|ed|ing)",
    ].join("|") +
    ")\\b",
  "gi",
);

/* Nouns a product puts in labels, headings and link text. "Every day" and "every plan" are a
   cadence and a scope, so the word alone is never matched. */
const EVERY_NOUN =
  /\bevery\s+(?:\w+\s+)?(?:answers?|sources?|items?|sites?|states?|runs?|checks?|clients?|drafts?|pages?|questions?|names?|tools?|workspaces?|types?|users?|members?|files?|projects?|reports?|results?|records?|tasks?|messages?|orders?|invoices?|accounts?|options?|filters?|prompts?|scans?|mentions?|suggestions?|competitors?|spellings?)\b/gi;

const FAILURES = [
  {
    rule: "em-dash",
    pattern: /—| -- /g,
    fix: "Use a comma, a colon, parentheses or two sentences",
  },
  {
    rule: "british-spelling",
    pattern: BRITISH,
    fix: "Use the American spelling",
  },
  {
    rule: "rather-than",
    pattern: /\brather than\b/gi,
    fix: "A telegraphed reversal. State the thing directly",
  },
  {
    rule: "binary-contrast",
    pattern: new RegExp(
      [
        `\\bit'?s not\\b${SAME_PARA}{1,80}[,;.]\\s*it'?s\\b`,
        `\\bisn'?t\\b${SAME_PARA}{0,80}[,;.]\\s*(?:it|this|that)'?s\\b`,
        "\\bisn'?t the (?:problem|issue|point|question|answer)\\b",
        `\\bnot just\\b${SAME_PARA}{1,80}\\bbut\\b`,
        "\\bnot because\\b",
        `\\bstops? being\\b${SAME_PARA}{1,60}\\bstarts? being\\b`,
        `(?:^|[.!?]\\s+)not ${SAME_PARA}{1,60}\\.\\s+but\\b`,
      ].join("|"),
      "gim",
    ),
    fix: "State the second half directly and drop the negation",
  },
  {
    rule: "reader-homework",
    pattern: /\byou(?:'ll| will)? (?:have to|need to)\b|\byou must\b/gi,
    fix: "Tells the reader they have to do something. Write it as something we do",
  },
  {
    rule: "sell-by-refusal",
    pattern:
      /\bwhat we will not do\b|\bthings we do not do\b|\bno promise about\b|\bwhat this does not measure\b/gi,
    fix: "Sells by listing refusals. State what the product does",
  },
  {
    rule: "fabricated-proof",
    pattern:
      /\bmost popular\b|\btrusted by\b|\bloved by\b|\bjoin (?:over )?\d|\b\d[\d,.]*\s?[kKmM]?\+ (?:customers|users|companies|teams|businesses|brands)\b|\bused by (?:over )?\d/gi,
    fix: "Claims social proof. Cut it unless a real, checkable source backs it",
  },
  {
    rule: "internal-constraint",
    pattern:
      /\bour (?:budget|runway|headcount)\b|\bcosts (?:us )?real money\b|\bwe cannot afford\b|\bwe can'?t afford\b/gi,
    fix: "Explains a limit by our own business constraint. State the limit as a plain fact",
  },
  {
    rule: "servant-verb",
    pattern:
      /\b(?:obey(?:s|ed|ing)?|listen(?:s|ed|ing)?|heed(?:s|ed|ing)?|compl(?:y|ies|ied|ying)|submit(?:s|ted|ting)? to|does (?:what|as) (?:you say|you tell|you ask|it'?s told|it is told|told)|takes orders|at your command|(?:respects?|honou?rs?) your)\b/gi,
    fix: "Reads like the product is a servant. Say what the product does, with a real actor",
  },
  {
    rule: "read-it-as",
    pattern: /\bRead it as an?\b/gi,
    fix: 'Contorts a toggle. Name the view: "Table view", "Chart view"',
  },
  {
    rule: "throat-clearing",
    pattern:
      /\b(?:here's the thing|here's (?:what|why|this|that)\b|the uncomfortable truth is|it turns out|let me be clear|the truth is|i'll say it again|i'm going to be honest|can we talk about|the real (?:question|problem|issue|answer|story|reason|work|challenge) is)/gi,
    fix: "Throat-clearing. Cut it and state the point",
  },
  {
    rule: "emphasis-crutch",
    pattern:
      /\bfull stop\.|\blet that sink in\b|\bmake no mistake\b|\bthis matters because\b|\bhere's why that matters\b|(?:^|[.!?]\s+)period\.(?=\s|$)/gim,
    fix: "Adds no meaning. Delete it",
  },
  {
    rule: "jargon",
    pattern:
      /\b(?:unpack(?:s|ed|ing)? (?:this|that|what|why|how|the (?:idea|concept|question|problem|data|findings))|lean(?:s|ed|ing)? into|game[- ]changer|doubl(?:e|es|ed|ing) down|deep[- ]dive|take a step back|moving forward|circle back|on the same page|navigat(?:e|es|ed|ing) (?:the |these |those |this |through )?(?:challenges?|complexit(?:y|ies)|uncertaint(?:y|ies)|landscape)|(?:today's|the current|competitive|digital|evolving|changing|shifting) landscape)\b/gi,
    fix: "Business jargon. Use the plain word",
  },
  {
    rule: "buzzword",
    pattern:
      /\b(?:streamlin(?:e|es|ed|ing)|innovative|seamless(?:ly)?|robust|leverag(?:e|es|ed|ing)|empower(?:s|ed|ing|ment)?|unlock(?:s|ed|ing)?|elevat(?:e|es|ed|ing)|revolutioni[sz](?:e|es|ed|ing)|cutting[- ]edge|game[- ]changing|best[- ]in[- ]class|world[- ]class|synerg(?:y|ies))\b/gi,
    fix: "Claims an outcome without naming it. Name the outcome",
  },
  {
    rule: "exclamation",
    pattern: /(?<=[A-Za-z0-9)"'”])!+/g,
    fix: "No exclamation points. Let the fact carry it",
  },
  {
    rule: "percent-unit",
    pattern: /\b\d+(?:\.\d+)?\s?pts?\b/gi,
    fix: 'Use %, never "pts"',
  },
];

const WARNINGS = [
  {
    rule: "servant-follow",
    pattern: /\bfollow(?:s|ed|ing)?\b/gi,
    fix: 'If something "follows" the user, say what the product does. The time sense ("the steps that follow") is fine',
  },
  {
    rule: "technical-buzzword",
    pattern: /\b(?:optimi[sz](?:e|es|ed|ing)|transform(?:s|ed|ing|ative)?)\b/gi,
    fix: "Fine as a technical term. As a marketing claim, name the outcome",
  },
];

/* -ly words that are not adverbs, or adverbs that carry a fact. */
const NOT_FILLER = new Set(
  (
    "only daily weekly monthly yearly hourly quarterly nightly early family reply apply supply rely fly ally " +
    "july italy holy ugly friendly lovely costly timely elderly silly belly jelly bully anomaly assembly " +
    "butterfly multiply imply comply firefly lily rally tally curly surly orderly homely lonely lively " +
    "lowly chilly hilly oily woolly wily bubbly cuddly deadly monopoly unruly jolly folly gully dolly " +
    "emily kelly molly polly billy sally bodily"
  ).split(" "),
);
const ADVERB = /\b(?:[a-z]{2,}ly|really|very|just|quite|actually|simply|literally)\b/gi;

const PROPER = new Set([
  "I",
  ..."Monday Tuesday Wednesday Thursday Friday Saturday Sunday".split(" "),
  ..."January February March April May June July August September October November December".split(" "),
]);

/** True when a heading reads as Title Case instead of sentence case. */
function looksTitleCase(text) {
  const words = text
    .replace(/[`*_]/g, "")
    .split(/\s+/)
    .slice(1)
    .map((word) => word.replace(/^[^\p{L}]+|[^\p{L}.]+$/gu, ""))
    .filter((word) => word.length > 3);
  const capitalized = words.filter(
    (word) => /^\p{Lu}/u.test(word) && !PROPER.has(word) && word !== word.toUpperCase(),
  );
  return capitalized.length >= 2 && capitalized.length / Math.max(words.length, 1) > 0.34;
}

/* Blank out a span but keep its newlines, so line numbers survive. */
const blank = (s) => s.replace(/[^\n]/g, " ");

/**
 * The prose in a document, with line numbers intact. Everything that is not prose becomes
 * spaces: frontmatter, fenced code, HTML comments, inline code, images, link targets and URLs.
 */
export function prose(text) {
  let out = text.replace(/\r\n?/g, "\n");
  out = out.replace(/^---\n[\s\S]*?\n---\n/, blank);
  let fenced = false;
  out = out
    .split("\n")
    .map((line) => {
      if (/^\s*(```|~~~)/.test(line)) {
        fenced = !fenced;
        return "";
      }
      return fenced ? "" : line;
    })
    .join("\n");
  out = out.replace(/<!--[\s\S]*?-->/g, blank);
  out = out.replace(/`[^`\n]*`/g, (m) => " ".repeat(m.length));
  out = out.replace(/!\[[^\]\n]*\]\([^)\n]*\)/g, (m) => " ".repeat(m.length));
  out = out.replace(/\]\([^)\n]*\)/g, (m) => "]" + " ".repeat(m.length - 1));
  out = out.replace(/<https?:\/\/[^>\s]+>/g, (m) => " ".repeat(m.length));
  out = out.replace(/https?:\/\/\S+/g, (m) => " ".repeat(m.length));
  /* A lone em dash in a table cell, or on its own line, is an empty-value placeholder. */
  out = out.replace(/\|\s*—\s*(?=\|)/g, (m) => "|" + " ".repeat(m.length - 1));
  out = out.replace(/^\s*—\s*$/gm, (m) => " ".repeat(m.length));
  /* Curly apostrophes read as straight ones, so "here’s" and "here's" match the same rule. */
  return out.replace(/’/g, "'");
}

const lineOf = (text, index) => text.slice(0, index).split("\n").length;

/** Sentences with the line each starts on. Paragraphs are split on blank lines first. */
function sentences(text) {
  const out = [];
  const re = /[^.!?\n]+(?:\n(?!\s*\n)(?!\s*(?:[-*+>|]|\d+\.|#{1,6})\s)[^.!?\n]+)*[.!?]*/g;
  for (const m of text.matchAll(re)) {
    const sentence = m[0].replace(/\s+/g, " ").trim();
    if (!sentence) continue;
    out.push({ sentence, line: lineOf(text, m.index + (m[0].length - m[0].trimStart().length)) });
  }
  return out;
}

/* A heading, a table row, or a short line: where a label lives. */
const isLabelLine = (line) =>
  /^\s*#{1,6}\s/.test(line) ||
  /^\s*\|/.test(line) ||
  line.replace(/^\s*(?:[-*+]|\d+\.)\s+/, "").trim().split(/\s+/).length <= 6;

export function check(input, { headlineFullStop = false } = {}) {
  const text = prose(input);
  const lines = text.split("\n");
  const failures = [];
  const warnings = [];

  for (const { rule, pattern, fix } of FAILURES) {
    for (const m of text.matchAll(pattern)) {
      failures.push({ line: lineOf(text, m.index), rule, match: m[0].trim(), fix });
    }
  }
  for (const { rule, pattern, fix } of WARNINGS) {
    for (const m of text.matchAll(pattern)) {
      warnings.push({ line: lineOf(text, m.index), rule, match: m[0].trim(), fix });
    }
  }

  lines.forEach((line, i) => {
    for (const m of line.matchAll(EVERY_NOUN)) {
      if (isLabelLine(line)) {
        failures.push({ line: i + 1, rule: "every-noun", match: m[0], fix: 'Reads as a tic in a label. Use "all"' });
      } else {
        warnings.push({
          line: i + 1,
          rule: "every-noun",
          match: m[0],
          fix: 'Fine as a promise about each item. If it is a label or link text, use "all"',
        });
      }
    }
    for (const m of line.matchAll(ADVERB)) {
      if (NOT_FILLER.has(m[0].toLowerCase())) continue;
      warnings.push({
        line: i + 1,
        rule: "adverb",
        match: m[0],
        fix: "Cut it unless deleting it changes the fact",
      });
    }
    const heading = line.match(/^\s*#{1,6}\s+(.+?)\s*#*\s*$/);
    if (heading) {
      if (looksTitleCase(heading[1])) {
        warnings.push({ line: i + 1, rule: "title-case", match: heading[1], fix: "Use sentence case" });
      }
      if (headlineFullStop && !/[.?]$/.test(heading[1])) {
        failures.push({
          line: i + 1,
          rule: "headline-full-stop",
          match: heading[1],
          fix: "This project's headlines end with a full stop or a question mark",
        });
      }
    }
  });

  for (const { sentence, line } of sentences(text)) {
    const body = sentence.replace(/^\s*(?:#{1,6}|[-*+>]|\d+\.)\s+/, "");
    const words = body.split(/\s+/).filter((w) => /\w/.test(w));
    if (words.length > 30) {
      warnings.push({
        line,
        rule: "long-sentence",
        match: `${words.slice(0, 6).join(" ")}… (${words.length} words)`,
        fix: "Over 30 words. Split it or cut it",
      });
    }
    if (/^(?:What|When|Where|Which|Who|Why|How)\b/.test(body) && !/\?\s*$/.test(body)) {
      warnings.push({
        line,
        rule: "wh-opener",
        match: words.slice(0, 4).join(" "),
        fix: "A statement opening on a Wh- word. Lead with the subject or the verb",
      });
    }
  }

  const byLine = (a, b) => a.line - b.line || a.rule.localeCompare(b.rule);
  return { failures: failures.sort(byLine), warnings: warnings.sort(byLine) };
}

async function readStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf8");
}

async function main(argv) {
  const headlineFullStop = argv.includes("--headline-full-stop");
  const files = argv.filter((arg) => !arg.startsWith("--"));
  if (files.length === 0 && process.stdin.isTTY) {
    console.log("Usage: node scripts/check.mjs [--headline-full-stop] <file...>\n       cat draft.md | node scripts/check.mjs");
    return 2;
  }
  const inputs = files.length
    ? await Promise.all(files.map(async (file) => ({ file, text: await readFile(file, "utf8") })))
    : [{ file: "<stdin>", text: await readStdin() }];

  let failed = 0;
  let warned = 0;
  for (const { file, text } of inputs) {
    const { failures, warnings } = check(text, { headlineFullStop });
    for (const f of failures) console.log(`${file}:${f.line} [${f.rule}] "${f.match}": ${f.fix}`);
    for (const w of warnings) console.log(`${file}:${w.line} warning [${w.rule}] "${w.match}": ${w.fix}`);
    failed += failures.length;
    warned += warnings.length;
  }
  console.log(
    failed === 0 && warned === 0
      ? `ultimate-stop-slop: ${inputs.length} file(s) clean`
      : `ultimate-stop-slop: ${failed} failure(s), ${warned} warning(s) in ${inputs.length} file(s)`,
  );
  return failed > 0 ? 1 : 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exitCode = await main(process.argv.slice(2));
}
