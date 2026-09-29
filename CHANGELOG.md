# Changelog

## 1.0.0 (2026-09-29)

First release of ultimate-stop-slop, based on
[hardikpandya/stop-slop](https://github.com/hardikpandya/stop-slop) at commit `8da1f030`
(2026-03-18). The added rules come from the copy linter, design notes and review history of
[outrankfast.app](https://outrankfast.app), generalized so they apply to any project.

### Added

- **Scope and precedence** in `SKILL.md`. Code comments, prompts sent to a model, legal text
  and verbatim quotes are exempt. A customer's stated style and a project's house rules come
  first. This skill wins over other writing skills on sentence-level rules.
- **Servant verbs**, banned outright: `obeys`, `follows`, `listens`, `heeds`, `complies`,
  `submits to`, `does what you say`, `takes orders`, `at your command`, `respects your`,
  `honors your`, `answers to`.
- **Structures:** `X rather than Y` and `Y, not X` as contrasts, reader homework, selling by
  refusal, possessive flips, standalone facts, question-fragment headings and vague pronouns.
- **Phrases:** buzzwords, plain-word swaps, trailing qualifiers, hedge connectives, a phrase
  standing in for one word, and house-tic words.
- **`references/claims.md`:**
  - Invent nothing a reader could check. Derive numbers and state what each is out of.
  - Quote records verbatim. No fabricated social proof.
  - No claim of an action the product does not take. State a claim once.
  - No implied metrics, no internal constraints and no promised sending frequency.
  - Failures name their cause. One name per fact.
- **`references/ui-copy.md`:**
  - Labels are noun phrases, and `every X` in a label becomes `all X`.
  - No helper text by default, no example lists, one-word placeholders.
  - Buttons without blurbs, `%` in place of `pts`, a 30-word cap per string.
  - Errors name their cause.
- **`references/mechanics.md`:** American spelling, no em dashes (with an empty-cell
  exception), sentence case, full-stop headlines as a house option, no exclamation points.
- **`references/plans-and-answers.md`:** drop no point the person raised, leave no open
  question, ask with a recommendation and honest trade-offs, draw UI mockups inline.
- **`scripts/check.mjs`:** a checker with no dependencies for the rules a regex can catch, with
  tests and a CI workflow.
- A Honesty dimension in the scoring rubric. The threshold moves from 35/50 to 42/60.

### Changed

- **Adverbs:** cut -ly words, intensifiers, softeners and hedges, and keep an adverb that
  carries a fact (`daily`, `only`).
- **Wh- openers:** still banned in statements, allowed in questions a reader would ask.
- **Lazy extremes:** `every` stays for a cadence or scope and for a promise about each item.
- **Examples:** example 4 lost its em dash and example 5 lost its `X, not Y` tail. Seven new
  before and after pairs.

## Upstream history (stop-slop)

### 2026-03-17

- False agency rule: no inanimate objects performing human actions.
- Twelve new rules: adverbs, passive voice, Wh- starters, vague declaratives, narrator
  distance, negative listings, meta-joiners.

### 2026-01-13

- Phrases: `Here's what I find interesting`, `Here's the problem though`, `creeps in`,
  `I promise`, `This is genuinely hard`.
- Structures: binary contrasts, staccato fragmentation, dashes for dramatic pause, hedging as
  reassurance, absolute words, overused intensifiers.

### 2026-01-12

- Restructured into `SKILL.md` and a `references/` folder.

### 2025-01-12

- Initial release.
