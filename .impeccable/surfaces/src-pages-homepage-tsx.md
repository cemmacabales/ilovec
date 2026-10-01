---
version: 1
slug: "src-pages-homepage-tsx"
primary_target: "src/pages/HomePage.tsx"
related_targets: ["src/App.tsx","src/components"]
---

## Scope

Whole app shell plus Home and the seven tracker pages (Dates, Gallery, Watchlist, Budget, Bucket list, Tasks, Music). Visitor mode: Operate. Audience: the couple (C & C), phone and laptop about equally. Job: see what's next, add things in seconds, look back. Constraints: no real names (Him / Her / Both), Supabase currently unreachable so every surface needs loading, empty and error states; gallery is in-memory only.

## Direction contract

THESIS: Home is an iPhone Home Screen for the two of them: a stack of live widgets in three sizes (small, medium, large), each showing real content and each opening into its own Notion-style page. It refuses the category default of a grid of identical icon-heading-text cards and a fake stats strip.

OWN-WORLD: Apple grouped-background ground (near-neutral warm gray, not cream) with white widgets at 20px radius, system SF type with rounded numerals, one warm heart-red accent, hairline rows on tracker pages, iOS materials only where Apple uses them (tab bar, sheets). Dark mode mirrors it on Notion-dark charcoal.

STORY: They open it, instantly see the next date counting down over their own photo, tick a task straight from its widget, and tap any widget to zoom into the full page to add or browse.

FIRST VIEWPORT: Greeting heading ("Good evening, C & C") with the date beneath, left-aligned. Below, a 4-column widget grid (2 columns on phones): large Next date widget (2x2, photo, countdown) top-left; Spend and Bucket smalls top-right; Tasks medium (interactive checks) under them; Watching medium (posters), Gallery small and Music small on the third row. Primary action: tap a widget; quick-add lives inside each widget.

FORM: iPhone Home Screen widget stack, my top-ranked grounded candidate (#1 of 7), chosen by the user as the pick over the rolled week spread. Seed key 82ef2e6e. Signature interaction: widget-to-page zoom via View Transitions (the widget's box grows into the page and shrinks back). Motion grammar: one staggered widget entrance on Home, spring-like ease-out, interactive check fills; all collapsed under reduced motion. Kept disciplines: one 4px grid, four type sizes ranked by weight, state shown by shape (filled, hollow, struck), honest hairline rows on tracker pages.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
