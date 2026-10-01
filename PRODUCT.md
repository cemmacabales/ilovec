# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two people, a couple who go by "C & C". It is a private, shared space for the two of them, not a product for other couples. They open it about equally on their phones and on a laptop, usually to check what is coming up next, add something they just thought of (a date idea, a show, an expense, a chore), or look back at memories.

## Product Purpose

"I Love C" is the couple's shared home base: the place where their plans, memories, and shared logistics live together. Success is that both of them actually keep using it, because opening it feels personal and pleasant and adding something takes seconds.

## Positioning

It is theirs. Their names, their photos, their playlist, their next date. A generic couples app or a Notion template cannot carry that, so the interface should foreground their own content (photos, the next date, what they are watching) over chrome.

## Operating Context

- Quick capture on a phone (add a task, log an expense, save a movie) and browsing on a laptop (planning dates on a calendar, sorting the gallery, reviewing the budget).
- Both partners use the same data; anything one adds, the other sees.
- Currency is Philippine peso (PHP) by default.

## Capabilities and Constraints

Areas (each becomes its own page, with a Home overview tying them together):

- **Upcoming dates**: calendar of planned dates/events with time, location, done state.
- **Gallery**: albums and photos with tags and favorites.
- **Music**: their shared Apple Music playlist (embed).
- **Watchlist**: movies and series via TMDB search; watchlist / watching / completed.
- **Budget**: expenses (who paid), monthly category budgets, savings goals.
- **Bucket list**: shared goals with category, priority, progress, difficulty, cost, target date.
- **Shared tasks**: to-dos assigned to him, her, or both, with priority, category, due date.

Technical: React 19 + Vite + TypeScript, Supabase as the data store, TMDB for movie data, deployed on Netlify. As of 2026-10-01 the Supabase project host does not resolve, so the UI must handle unreachable data gracefully. Gallery photos and several Home stats are not persisted yet (backend work is tracked separately; frontend comes first).

## Brand Commitments

- Name: "I Love C". Favicon is a heart.
- The couple is "C & C". Where one person is meant (who paid, who a task is for), the labels are "Him", "Her", and "Both". Never "Partner 1 / Partner 2" or "Me / Partner", and no real names anywhere in the app or repo.
- The user asked for a Notion + Apple feel: clean, minimal, warm, and alive rather than static.

## Evidence on Hand

- One real photo of the two of them: `folassets/mendmygirl.jpeg`.
- Their Apple Music playlist embed: `https://embed.music.apple.com/ph/playlist/mylove/pl.u-pMylgvLtW7RGMk5`.
- No other real photos, dates, or stats are available in the repo; the current Home "Next date", "Recent activity" and "This month" values are hardcoded placeholders and must not be presented as real.

## Product Principles

1. Their content leads; the interface recedes.
2. Adding something should take one tap and a few words.
3. Never show invented numbers as if they were real; empty is better than fake.
4. Feels the same on a phone and a laptop: same places, same words.
5. Warm, not cute: personal without being saccharine.
