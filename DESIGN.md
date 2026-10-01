---
name: I Love C
description: A shared home for C & C, built like an iPhone Home Screen inside a Notion-style workspace.
colors:
  heart-red: "#cb392e"
  heart-red-ink: "#c2362b"
  heart-red-ink-dark: "#ff6f61"
  grouped-ground: "#f3f2ef"
  widget-white: "#fefefd"
  inset-gray: "#f7f6f4"
  track-gray: "#ebeae6"
  ink: "#22211f"
  ink-secondary: "#6b6964"
  control-ring: "#8c8a85"
  night-ground: "#141413"
  night-widget: "#1f1f1e"
  night-inset: "#252524"
  night-ink: "#eeedea"
  night-ink-secondary: "#a19f9a"
typography:
  title:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI Variable Display', 'Segoe UI', system-ui, sans-serif"
    fontSize: "2.125rem"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI Variable Display', 'Segoe UI', system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI Variable Text', 'Segoe UI', system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 600
    lineHeight: 1.4
  figure:
    fontFamily: "ui-rounded, 'SF Pro Rounded', -apple-system, BlinkMacSystemFont, system-ui, sans-serif"
    fontSize: "4rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.04em"
    fontFeature: "'tnum'"
rounded:
  thumb: "8px"
  control: "10px"
  panel: "14px"
  widget: "20px"
  chip: "999px"
spacing:
  "1": "4px"
  "2": "8px"
  "3": "12px"
  "4": "16px"
  "5": "20px"
  "6": "24px"
  "8": "32px"
  "10": "40px"
  "12": "48px"
components:
  button-primary:
    backgroundColor: "{colors.heart-red}"
    textColor: "{colors.widget-white}"
    rounded: "{rounded.control}"
    padding: "0 14px"
    height: "36px"
  button-secondary:
    backgroundColor: "{colors.widget-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "0 14px"
    height: "36px"
  button-danger:
    backgroundColor: "{colors.inset-gray}"
    textColor: "{colors.heart-red-ink}"
    rounded: "{rounded.control}"
    padding: "0 14px"
    height: "36px"
  widget:
    backgroundColor: "{colors.widget-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.widget}"
    padding: "16px"
  field-group:
    backgroundColor: "{colors.inset-gray}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "4px 14px"
  pill:
    backgroundColor: "{colors.track-gray}"
    textColor: "{colors.ink-secondary}"
    rounded: "{rounded.chip}"
    padding: "0 8px"
    height: "22px"
  segmented:
    backgroundColor: "{colors.track-gray}"
    textColor: "{colors.ink-secondary}"
    rounded: "9px"
    padding: "2px"
---

# Design System: I Love C

## Overview

**Creative North Star: "Our Home Screen"**

The app is an iPhone Home Screen made for two people. Home is a stack of live widgets in three sizes (small, medium, large), each showing real content: their next date counting down over their own photo, open tasks you can tick from the widget, the posters of what they're watching. Every widget is a door. Tapping it grows the widget into its page, and each page is a quiet Notion-style document: an icon, a large title, one line of context, then honest rows separated by hairlines.

Warmth comes from their content (the photo, the playlist name, their plans) and from one heart-red accent, not from tinted paper or decoration. Grounds are near-neutral warm grays, deliberately not cream. Type is Apple's own system face, ranked by weight more than size. Motion is sparse and meaningful: one staggered entrance on Home, the widget-to-page zoom, a check that fills when something gets done.

**Key Characteristics:**
- White widgets (20px corners) on a grouped gray ground; photo and accent widgets add color by content, not decoration.
- One accent, heart red, used for primary actions, today, done states and the brand mark.
- Notion-style pages: icon tile, large title, segmented filters, hairline rows, sheets for adding and editing.
- iOS materials only where iOS uses them: the phone tab bar and bottom sheets.
- Light and dark follow the device, with a per-device override.

## Colors

A restrained palette: warm-neutral grays, white surfaces, and a single heart red.

### Primary
- **Heart Red** (`heart-red`): fills for primary buttons, the brand mark, today's date, filled checks, the music widget and the "her" share of the split bar. White text on it passes AA.
- **Heart Red Ink** (`heart-red-ink`, dark mode `heart-red-ink-dark`): red used as text and icons: overdue dates, page icons, widget icons, text buttons, focus rings.

### Neutral
- **Grouped Ground** (`grouped-ground`): the app background behind widgets and page panels.
- **Widget White** (`widget-white`): widgets, page panels, sheets.
- **Inset Gray** (`inset-gray`): grouped form rows, the calendar panel, summary panels, search fields.
- **Track Gray** (`track-gray`): segmented-control tracks, pills, meter tracks, skeletons.
- **Ink** (`ink`) and **Ink Secondary** (`ink-secondary`): primary and secondary text; secondary passes 4.5:1 on every light surface.
- **Control Ring** (`control-ring`): the outline of empty checks; 3:1 against surfaces.
- **Night** set (`night-*`): the dark theme's ground, surfaces and ink, on a Notion-dark charcoal.

### Named Rules
**The One Heart Rule.** Heart red is the only accent. Categories, people and statuses never get their own hues; they're told apart by icon, label, shape or position.

**The Content Is The Color Rule.** Color arrives through their photos and posters and the single accent widget, never through gradients or tinted backgrounds.

## Typography

**Display Font:** SF Pro Display via the system stack (Segoe UI Variable on Windows)
**Body Font:** SF Pro Text via the system stack
**Figures:** SF Pro Rounded via `ui-rounded` on Apple platforms, falling back to the system face with tabular numerals

**Character:** Apple's own voice: neutral, legible and familiar, with rounded numerals for anything you count. SF Pro Rounded cannot be self-hosted outside Apple platforms, so other browsers show regular tabular figures.

### Hierarchy
- **Title** (700, 34px, 32px on phones, -0.025em): page titles, the Home greeting, widget figures.
- **Headline** (700, 20px): sheet titles, the next date's name, empty-state titles, the amount-entry currency.
- **Body** (400 to 600, 15px, 16px on phones so iOS never zooms into a field): everything you read and type.
- **Label** (600, 13px): widget headers, list-group labels, meta lines, segmented items, pills.
- **Figure** (700, 64px, rounded): the countdown on the Next date widget and the expense amount field only.
- **Micro** (600, 11px): phone tab bar labels only.

### Named Rules
**The Weight Before Size Rule.** Rank comes from weight and ink first. Use one of the sizes above; never add an in-between size to make something stand out.

**The No Eyebrow Rule.** No small uppercase labels above headings. A widget's header row is its title; a list group's label is its heading.

## Layout

Everything snaps to a 4px grid (spacing tokens 4 to 64px).

- **Desktop (900px and up):** a 248px Notion-style sidebar plus a main column. Content is centered at 920px max. Tracker pages sit in a white panel with 20px corners and 32px/40px padding on the grouped ground.
- **Phone (under 900px):** no sidebar; a fixed iOS tab bar (Home, Dates, Tasks, Budget, More). Pages run full-bleed white with 16px gutters and respect the safe areas.
- **Home widget grid:** 4 columns on wide containers, 2 on narrow ones (container query at 600px). Rows are square cells sized from the container (`100cqi`), so small widgets are square, mediums are 2:1 and the large widget is 2x2. Every cell holds exactly one widget; no gaps.
- **Dates:** a 296px calendar column beside the agenda on wide screens, stacked under 1100px. Month views always render six weeks so every month keeps the same scale.

## Elevation & Depth

Hybrid: surfaces are tonal (ground, then white, then inset gray) and only floating things carry shadows. Shadows are tinted to the warm ground, always offset downward with a soft blur. They are never a 1px border plus a shadow on the same element.

### Shadow Vocabulary
- **Widget** (`0 1px 1px rgba(40,32,24,.03), 0 6px 18px -8px rgba(40,32,24,.12)`): widgets and page panels at rest.
- **Raise** (`0 2px 4px rgba(40,32,24,.05), 0 16px 36px -12px rgba(40,32,24,.22)`): widget hover and toasts.
- **Sheet** (`0 28px 70px -20px rgba(24,20,16,.38), 0 2px 6px rgba(24,20,16,.06)`): sheets and dialogs.
- **Thumb** (`0 1px 2px rgba(24,20,16,.12), 0 3px 8px -2px rgba(24,20,16,.12)`): posters, the brand mark, small floating buttons.

### Named Rules
**The Lift Means Tap Rule.** Only things you can open lift on hover (widgets, posters, albums). Static content never moves.

## Shapes

Continuous, friendly corners in a fixed ladder: widgets 20px, sheets and panels 14px, controls and fields 10px, thumbnails 8px, and full pills only for small chips, toasts and round controls. Checks and calendar days are circles. Photos are cropped with `object-fit: cover`; nothing is masked into fake shapes.

## Components

### Buttons
- **Shape:** gently rounded (10px), 36px tall, 46px in phone sheets.
- **Primary:** heart red with white text. Hover darkens about 12%; press scales to 0.97.
- **Secondary:** white with a 1px inset line; hover moves to inset gray.
- **Danger:** heart-red text on a soft red tint. Destructive actions take two taps: the first changes the label to "Tap again to delete".
- **Icon buttons:** 32px circles; a filled variant (heart red) for quick-add on photo widgets.

### Widgets (signature)
- **Anatomy:** a header row (icon in heart-red ink, 13px label, optional count and "+" quick-add), then content pinned to the bottom.
- **Tones:** plain (white), photo (full-bleed image under a top and bottom scrim, white text), accent (heart red, white text).
- **Behavior:** the whole widget is a link, and its controls sit above that link. The widget and its page share a view-transition name, so the widget grows into the page. Hover lifts by 2px; press scales to 0.98.

### Segmented control
- iOS-style: a track-gray track with a white thumb that slides to the selected item. Arrow keys move the selection. Optional counts sit inside items.

### Inputs / Fields
- **Grouped rows:** iOS Settings style. An inset-gray group with 48px rows, a label and icon on the left, the value right-aligned, and hairline separators inset past the icon. A focused row tints faint red.
- **Title field:** a borderless 20px bold title with a hairline underline that turns heart red on focus.
- **Amount field:** a big rounded figure with a peso sign, centered.
- **Choice:** a small segmented picker inside a row (Both / Him / Her, priority).
- **Errors:** 13px heart-red text under the form, naming what's missing.

### Checks
- 22px circles: an empty ring at rest, filling heart red with a white check when done. A finished item lingers for about 650ms, then slides out of the open list.

### Navigation
- **Sidebar (desktop):** the brand mark plus "I Love C" over "C & C"; 34px links with 18px icons. The active link gets a pressed background, bold text and a filled red icon. Appearance (Auto / Light / Dark) sits at the bottom.
- **Tab bar (phone):** a translucent material (20px blur, 180% saturation, solid under reduced transparency). The active tab and its filled icon turn heart red. "More" opens a sheet of the other sections with iOS Settings-style red icon tiles.

### Sheets
- Built on `<dialog>`: a bottom sheet with a grabber on phones and a centered 480px panel on larger screens. They dim the page behind and focus the first field on open.

## Do's and Don'ts

### Do:
- **Do** put real content in widgets (photos, posters, names, amounts); a widget that is only an icon and a label isn't a widget.
- **Do** call the couple "C & C", and use "Him", "Her" and "Both" wherever one person is meant.
- **Do** show honest empty, loading and offline states. Show "-" and "Not available right now" rather than a fake zero.
- **Do** keep each tracker page as a white panel on the grouped ground, so the widget-to-page zoom reads as one surface opening.
- **Do** honor reduced motion: no entrance, drift, zoom or shimmer.

### Don't:
- **Don't** add a second accent color, colored category chips, or gradients.
- **Don't** use cream or beige grounds. The ground stays a near-neutral warm gray (`grouped-ground`).
- **Don't** put small uppercase labels above headings, or number sections.
- **Don't** show placeholder stats or invented activity on Home. Empty beats fake.
- **Don't** mix icon families. Phosphor only, regular weight at rest and fill for active or emphasis.
