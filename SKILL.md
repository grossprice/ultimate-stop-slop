---
name: ultimate-stop-slop
description: Remove AI writing patterns from anything a person reads. Use when drafting, editing or reviewing prose, product and UI copy, marketing pages, articles, emails, docs, plans, replies, commit messages or PR descriptions. Catches filler, telegraphed contrasts, servant verbs, passive voice, claims a reader cannot check, British spelling, em dashes, UI labels written as sentences, and plans that drop a point or leave a question open.
license: MIT
metadata:
  author: "@grossprice"
  based_on: hardikpandya/stop-slop
  version: 1.0.0
---

# Ultimate Stop Slop

Write so a reader can check every sentence and finds nothing to cut.

## Scope

Apply this skill to everything a person reads: product and UI copy, marketing pages, articles,
emails, docs, plans, replies, commit messages and PR descriptions.

Four kinds of text are exempt:

- **Code comments.** A comment may quote a banned phrase to explain why it is banned.
- **Prompts sent to a model.** "Rather than" is the right phrase to a model, and no person
  reads it.
- **Legal and contract text.** "You must provide accurate information" is an obligation.
  Rewriting it to sound like a landing page edits the contract.
- **Verbatim quotes, stored records and screenshots of real UI.** Editing a quotation to pass
  a rule falsifies it.

## Precedence

1. A customer's stated tone, byline and required disclosures win for pages written for them.
2. A project's written house rules add to this skill and switch on its house options.
3. This skill.
4. Other writing skills. For sentence-level rules this skill wins, so a copywriting skill's
   advice to open with rhetorical questions or add humor loses to the rhetorical-setup rule
   here.

## Core rules

1. **Cut filler.** Throat-clearing openers, emphasis crutches, jargon, buzzwords, -ly adverbs,
   intensifiers, softeners and hedges. Keep an adverb that carries a fact: "measured daily",
   "only on the paid plan". See [references/phrases.md](references/phrases.md).
2. **Break formulaic structures.** Binary contrasts (including "X rather than Y" and "Y, not
   X"), negative listing, dramatic fragmentation, rhetorical setups, possessive flips and
   standalone facts. See [references/structures.md](references/structures.md).
3. **Name the actor.** Active voice. A person or a company does the thing. No passive
   constructions, and nothing inanimate performing a human verb.
4. **No servant verbs.** A product, page, draft or tool never obeys, follows, listens, heeds,
   complies, "does what you say", "respects your rules" or "answers to" anyone. It reads like
   the thing is a slave to the user. Say what the product does: "We write it in your tone."
5. **Give the reader no homework.** No "you have to", "you need to" or "you must". Write it as
   something we do, or something that happens.
6. **Sell with what the product does.** No sections listing what you refuse to do, promise or
   measure.
7. **Be specific.** No vague declaratives and no lazy extremes. "Every" is fine for a cadence
   ("every day") and for a promise about each item ("every number links to its source").
8. **Claim only what a reader can check.** Invent nothing. Derive a number, state what it is
   out of, and quote records exactly. No social proof that does not exist. See
   [references/claims.md](references/claims.md).
9. **Put the reader in the room.** "You" beats "people". No narrator watching from a distance.
10. **Vary rhythm.** Mix sentence lengths. Two items beat three. End paragraphs differently.
    Cut anything that sounds like a pull quote.
11. **Get the mechanics right.** American spelling, no em dashes, sentence case, no
    exclamation points. See [references/mechanics.md](references/mechanics.md).
12. **Interface copy names things.** A label is a noun phrase. An explanation sits behind an
    info hint or goes. See [references/ui-copy.md](references/ui-copy.md).
13. **Plans and answers drop nothing and leave nothing open.** Each point the person raised gets
    a line saying what happens to it. Missing information gets asked for, never parked as an
    open question. See [references/plans-and-answers.md](references/plans-and-answers.md).

## Quick checks

Run these before delivering:

- Adverbs? Cut -ly words, intensifiers, softeners and hedges. Keep the ones that carry a fact.
- Passive voice? Find the actor and make them the subject.
- Something inanimate doing a human verb? Name the person.
- A servant verb (obeys, follows, listens, complies, respects your)? Say what the product does.
- "You have to", "you need to", "you must"? Rewrite it as something we do.
- "Not X, it's Y", "X rather than Y", "Y, not X"? State Y.
- A section about what you do not do? Replace it with what you do.
- A statement starting with What, When, Where, Which, Who, Why or How? Restructure it.
  Questions a reader would ask (FAQ entries, search queries, form questions) keep their Wh-
  word.
- "Here's what", "here's this", "here's that"? Cut to the point.
- A heading that states a fact and stops? Add the question or consequence it creates.
- A number with no denominator, or asserted instead of derived? Fix it.
- A claim a reader cannot check? Source it or cut it.
- Three sentences in a row of the same length? Break one.
- A paragraph ending on a punchy one-liner? Vary it.
- An em dash, a British spelling or an exclamation point? Fix it.
- A headline in Title Case? Sentence case.
- A UI label written as a sentence, or starting with "Every"? Rename it as a noun phrase.
- Helper text under a field? Move it behind an info hint or delete it.
- A plan or answer: is each point the person raised covered? Any "TBD", "open question" or "to
  confirm"? Ask instead.
- Node available? Run the checker.

## Checker

`scripts/check.mjs` in this skill's directory runs the rules a regex can catch. It needs Node
18 or later and nothing else.

```sh
node scripts/check.mjs draft.md            # one or more files
pbpaste | node scripts/check.mjs           # text on stdin
node scripts/check.mjs --headline-full-stop post.md
```

It prints one line per hit with the rule and the fix, and exits 1 when anything fails. Fix
every failure. Read each warning and fix the ones that apply: warnings cover patterns a regex
cannot judge, such as "follow" in its time sense or an adverb that carries a fact.

## House options

A project turns these on in its own instructions (CLAUDE.md, AGENTS.md or a style guide):

- **Headlines end with a full stop.** Checker flag: `--headline-full-stop`.

A project keeps its own word lists (banned product terms, its vocabulary for the unit it
counts) in its own instructions or linter, and those add to this skill.

## Scoring

Rate 1 to 10 on each dimension:

| Dimension | Question |
|-----------|----------|
| Directness | Statements or announcements? |
| Rhythm | Varied or metronomic? |
| Trust | Respects reader intelligence? |
| Authenticity | Sounds human? |
| Density | Anything cuttable? |
| Honesty | Could a reader check every claim? |

Below 42/60: revise.

## References

- [references/phrases.md](references/phrases.md): phrases and words to cut, with replacements.
- [references/structures.md](references/structures.md): sentence and paragraph patterns to
  avoid, including servant verbs.
- [references/claims.md](references/claims.md): honesty rules for numbers, proof and product
  claims.
- [references/mechanics.md](references/mechanics.md): spelling, punctuation and case.
- [references/ui-copy.md](references/ui-copy.md): labels, buttons, placeholders, hints and
  empty states.
- [references/plans-and-answers.md](references/plans-and-answers.md): plans and replies to a
  person.
- [references/examples.md](references/examples.md): before and after rewrites.

## Credits

Based on [stop-slop](https://github.com/hardikpandya/stop-slop) by Hardik Pandya. Extended by
[@grossprice](https://github.com/grossprice).

## License

MIT
