---
name: TypeRush Design System
description: Tactile, distraction-free design language for high-speed typing and code practice
colors:
  white: "#ffffff"
  bg-base: "#090b10"
  bg-surface: "#12151f"
  bg-elevated: "#1a1f2e"
  bg-highlight: "#22293d"
  border-subtle: "#1e2538"
  border-strong: "#2f3a55"
  border-focus: "#3b82f6"
  text-primary: "#f8fafc"
  text-secondary: "#94a3b8"
  text-muted: "#64748b"
  text-untyped: "#475569"
  accent-primary: "#3b82f6"
  accent-hover: "#2563eb"
  accent-success: "#10b981"
  accent-warning: "#f59e0b"
  accent-error: "#ef4444"
typography:
  display:
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif"
    fontSize: "2.75rem"
    fontWeight: 700
    lineHeight: "1.1"
  title:
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif"
    fontSize: "1.65rem"
    fontWeight: 800
    lineHeight: "1.2"
  subtitle:
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: "1.3"
  h3:
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif"
    fontSize: "1.05rem"
    fontWeight: 700
    lineHeight: "1.4"
  ui:
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif"
    fontSize: "1rem"
    lineHeight: "1.5"
  ui-sm:
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif"
    fontSize: "0.875rem"
    lineHeight: "1.5"
  ui-xs:
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif"
    fontSize: "0.8rem"
    lineHeight: "1.4"
  badge:
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif"
    fontSize: "0.65rem"
    fontWeight: 700
    lineHeight: "1"
  mono-stage:
    fontFamily: "'JetBrains Mono', monospace"
    fontSize: "1.25rem"
    lineHeight: "1.85"
    letterSpacing: "-0.01em"
  mono-input:
    fontFamily: "'JetBrains Mono', monospace"
    fontSize: "1.1rem"
    lineHeight: "1.6"
  mono-code:
    fontFamily: "'JetBrains Mono', monospace"
    fontSize: "1.05rem"
    lineHeight: "1.7"
  mono-stat:
    fontFamily: "'JetBrains Mono', monospace"
    fontSize: "2.25rem"
    fontWeight: 700
    lineHeight: "1"
rounded:
  sm: "6px"
  md: "10px"
  lg: "16px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.accent-primary}"
    textColor: "{colors.white}"
    rounded: "{rounded.md}"
    padding: "10px 18px"
  button-primary-hover:
    backgroundColor: "{colors.accent-hover}"
---

# Design System

## Overview
TypeRush is engineered for speed, rhythmic typing, and developer accuracy. The visual language takes inspiration from high-end mechanical keyboard design, modern code editors, and telemetry dashboards: low visual friction, balanced contrast, tabular metrics, and clear tactile states.

## Colors
- **Obsidian Dark (Default)**: Deep midnight slate (`#090b10`), card surfaces (`#12151f`), electric blue accent (`#3b82f6`), and emerald confirmation (`#10b981`).
- **Cobalt Blue**: Deep oceanic canvas (`#050a15`), elevated panels (`#0b1426`), vibrant cyan (`#00f0ff` / `#38bdf8`), and electric accents.
- **Nordic Light**: Architectural paper canvas (`#f8fafc`), clean surface containers (`#ffffff`), crisp slate ink (`#0f172a`), muted graphite (`#64748b`), and crisp borders (`#e2e8f0`).

## Typography
- **Interface**: Plus Jakarta Sans for UI headings, navigation pills, and descriptive labels.
- **Typing & Code Stage**: JetBrains Mono with `font-variant-numeric: tabular-nums` to eliminate character jitter during real-time typing and metric updates.
- **Hierarchy**: Bold brand heading (1.65rem), prominent HUD stat numbers (2.25rem tabular figures), target race word (2.75rem), and clean micro-caps for stat labels (0.72rem).

## Layout
- Centered container constrained to 1080px max width with generous 24px/32px vertical rhythm.
- Header with integrated brand mark and minimal theme select menu.
- Sleek segmented tab bar with tactile pill states.
- Clean HUD statistics bar displaying real-time metrics in an uninterrupted row.
- Deep, focused typing arena with comfortable padding and distinct cursor caret.

## Elevation & Depth
- Layering over heavy dropshadows: depth is established via subtle surface lightness gradation and crisp 1px borders.
- Soft multi-stop shadows on interactive states and active tab indicators.

## Shapes
- Border radius: 6px for small badges, 10px for input fields and navigation pills, 16px for primary stage containers, 9999px for arcade badges.

## Components
- **Nav Tabs**: Pill-style segmented controls with smooth transitions.
- **Stats HUD**: Minimalist cards with micro-labels above high-contrast tabular values.
- **Typing Text Display**: Monospace presentation where untyped text is comfortably readable, typed text is affirmed with high contrast, active letter has an animated cursor bar, and errors are cleanly demarcated with subtle error undercurl.
- **Buttons**: Structured interactive elements with subtle scaling and color transitions, paired with clean vector iconography instead of raw emojis.

## Do's and Don'ts
- **DO** use tabular numerals (`tabular-nums`) for all timers, WPM, and accuracy counters.
- **DO** maintain strict keyboard accessibility and clear focus rings.
- **DO** keep the typing stage clean, distraction-free, and legible at all breakpoints.
- **DON'T** use multi-color gradient text masks on logos or metrics.
- **DON'T** clutter button text with random decorative emojis.
- **DON'T** nest cards within cards.
