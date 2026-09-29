# Ultimate Stop Slop

A skill that removes AI writing patterns from anything a person reads: prose, product and UI
copy, articles, docs, plans and replies.

It starts from [stop-slop](https://github.com/hardikpandya/stop-slop) by Hardik Pandya and adds
the rules one product team enforced on its own copy in review. Most added rules exist because
a real sentence on a shipped page broke them.

Outrankfast uses this skill to fix the copy its article-writing agent produces at
[outrankfast.app](https://outrankfast.app).

## Install

**Claude Code, and other agents the `skills` CLI supports:**

```sh
npx skills add grossprice/ultimate-stop-slop        # this project
npx skills add grossprice/ultimate-stop-slop -g     # all your projects
```

**By hand:** clone this repo into `~/.claude/skills/ultimate-stop-slop` or into a project's
`.claude/skills/ultimate-stop-slop`.

**Claude.ai:** zip the folder and upload it in your skills settings.

**API calls or custom instructions:** include `SKILL.md` in the system prompt. The reference
files load on demand.

## Additions to stop-slop

**Servant verbs, banned outright.** A product, page or tool that `obeys`, `follows`,
`listens`, `complies` or `respects your settings` reads like a slave to the user. Say what the
product does.

**Claims a reader can check.** Derive numbers from the data and state what each one is out of.
Quote records verbatim. No social proof that does not exist, and no claim of an action the
product does not take. See `references/claims.md`.

**Interface copy.** Labels are noun phrases. Explanations sit behind an info hint. No example
lists, one-word placeholders, and a button is a name without a blurb. See
`references/ui-copy.md`.

**Plans and answers.** A plan covers each point the person raised and leaves no open
questions. Missing information gets asked for, with a recommendation and honest trade-offs.
See `references/plans-and-answers.md`.

**Mechanics.** American spelling, no em dashes, sentence case, no exclamation points, and `%`
in place of `pts`. See `references/mechanics.md`.

**More patterns.** `rather than` and `Y, not X` as contrasts, reader homework (`you have to`,
`you need to`, `you must`), selling by refusal, standalone facts, possessive flips,
question-fragment headings, trailing qualifiers, house-tic words and buzzwords.

**Refinements to the original.** Adverbs that carry a fact (`daily`, `only`) stay. Questions a
reader would ask keep their Wh- word. `Every` stays for a cadence (`every day`) and for a
promise about each item. The two original examples that broke the skill's own rules are
fixed.

## Scope

It applies to everything a person reads. Code comments, prompts sent to a model, legal text
and verbatim quotes are exempt.

## Checker

`scripts/check.mjs` runs the rules a regular expression can catch. It needs Node 18 or later and
no packages.

```sh
node scripts/check.mjs draft.md
pbpaste | node scripts/check.mjs
node scripts/check.mjs --headline-full-stop post.md
```

It prints one line per hit with the rule and the fix, and exits 1 when anything fails.
Warnings print without failing. They cover the patterns a regex cannot judge, such as `follow`
in its time sense or an adverb that carries a fact.

Run the tests with `node --test scripts/check.test.mjs`.

## Structure

```
ultimate-stop-slop/
├── SKILL.md                    core rules, scope, precedence, quick checks, scoring
├── references/
│   ├── phrases.md              phrases and words to cut
│   ├── structures.md           sentence and paragraph patterns, servant verbs
│   ├── claims.md               honesty rules for numbers, proof and product claims
│   ├── mechanics.md            spelling, punctuation and case
│   ├── ui-copy.md              labels, buttons, placeholders, hints and empty states
│   ├── plans-and-answers.md    plans and replies to a person
│   └── examples.md             before and after rewrites
├── scripts/
│   ├── check.mjs               the checker
│   └── check.test.mjs          its tests
├── CHANGELOG.md
└── LICENSE
```

## Scoring

Rate 1 to 10 on each dimension. Below 42 out of 60, revise.

| Dimension | Question |
|-----------|----------|
| Directness | Statements or announcements? |
| Rhythm | Varied or metronomic? |
| Trust | Respects reader intelligence? |
| Authenticity | Sounds human? |
| Density | Anything cuttable? |
| Honesty | Could a reader check each claim? |

## Author

[@grossprice](https://github.com/grossprice), based on
[stop-slop](https://github.com/hardikpandya/stop-slop) by
[Hardik Pandya](https://hvpandya.com).

## License

MIT. See `LICENSE`.
