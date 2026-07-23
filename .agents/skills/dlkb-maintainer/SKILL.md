---
name: dlkb-maintainer
description: Maintain the project's Deutsch Learning Knowledge Base (DLKB) under docs/. Use when adding German learning material from lessons or conversations, reorganizing B1–C1 notes, creating one-concept Markdown pages, updating knowledge-base navigation or CHANGELOG.md, or producing Wortbildung, vocabulary, grammar, writing, speaking, and exam notes in the project's standard format.
---

# Maintain DLKB

Treat chat as the discussion process and `docs/` as the canonical learning result.

## Workflow

1. Read `docs/README.md`, the relevant category `README.md`, and nearby pages before editing.
2. Search `docs/` for the concept and update its existing home instead of duplicating it.
3. Use one concept per file. Name files and directories with lowercase ASCII kebab-case.
4. Choose the semantic category first: `grammar`, `vocabulary`, `writing`, `speaking`, or `exam`. Do not organize primarily by CEFR level.
   - Store adjective/noun + preposition combinations and emotion-preposition combinations under `docs/grammar/prepositions/`, even when they also teach vocabulary.
   - Store productive word-formation rules under `docs/grammar/wortbildung/`. Keep the Markdown pages canonical and synchronize only structured examples and filter fields to `data/wortbildung.json`.
5. Add YAML frontmatter with `title`, `level`, `category`, `tags`, and `last_updated` to substantive knowledge pages.
6. Include relevant modules from this standard: Learning Goals; Grammar / Word Formation; High-frequency Vocabulary; Collocations; Writing Upgrade; Speaking; Exam Usage; Common Mistakes; Summary; Anki Data. Omit a module only when it genuinely does not apply.
7. For vocabulary, record the word family, grammatical gender, plural where useful, governed case or preposition, collocations, and B2/C1 upgrade examples.
8. Distinguish productive patterns from lexical exceptions. Never present a suffix mapping as universal when learners must memorize the noun.
9. Use Chinese for explanations and German for target forms and examples. Add English glosses only when they improve clarity.
10. Update the relevant category navigation, `docs/README.md`, and the root `CHANGELOG.md` using the current date.
11. When the concept appears in an interactive textbook page, update its record under `data/` as well. Keep prose in Markdown and structured filter fields in JSON; do not duplicate long explanations in JSON.
    - For a concrete vocabulary word, expression, reason, solution, consequence, or collocation, create one Markdown file and register it in `data/vocabulary-index.json`.
    - Never restore aggregate files such as `redemittel.md` or `collocations.md`; use a category `README.md` plus one file per entry.
12. When adding a new category or interactive surface, update `DeutschLernen.html`. Reuse the existing page, stylesheet, and script pattern instead of embedding learning data in HTML.
13. Ensure Markdown links resolve, validate changed JSON and JavaScript, and run `git diff --check` before finishing.

## Content rules

- Prefer precise, idiomatic German over literal transformations.
- Include noun articles, such as `die Freundlichkeit` and `das Interesse`.
- Mark incorrect learner forms with `❌` and valid forms with `✅`.
- Connect related concepts with relative Markdown links.
- Keep examples reusable for B2/C1 writing or speaking.
- Do not copy conversation filler, unsupported claims, or redundant explanations into `docs/`.
- Do not overwrite unrelated user changes or commit unless the user requests it.

## Architecture contract

- `docs/`: canonical explanations, examples, learning goals, mistakes, exam notes, and Anki blocks.
- `data/`: normalized records used for filtering, search, tables, and relationship views.
- `*.html`, `css`, and `js`: presentation and interaction only; do not hardcode growing word lists here.
- `markdown-viewer.html`: render all standalone knowledge pages consistently.
- `VocabularyLibrary.html`: render searchable vocabulary category pages from `data/vocabulary-index.json`.
- `Präpositionen.html` and `prepositions-data.json`: provide the single interactive home for preposition rules, adjective/noun combinations, and emotion-preposition combinations.
- `Wortbildung.html` and `data/wortbildung.json`: provide the interactive word-formation view; canonical rule explanations remain under `docs/grammar/wortbildung/`.
- `DeutschLernen.html`: act as the learning hub, not as a content database.
