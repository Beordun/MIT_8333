# Design System & CSS Tokens Rule

All UI components, layouts, and stylesheets in this project MUST strictly consume the CSS custom properties defined in `design-tokens.css` (derived from `design-tokens-all.json`).

## Guidelines
1. **No Hardcoded Colors:** Never use raw hex, RGB, or HSL literals in components or CSS modules. Always use semantic tokens:
   - Brand & Actions: `var(--primary-color)`, `var(--on-primary-color)`, `var(--primary-container-color)`, `var(--on-primary-container-color)`
   - Secondary & Accents: `var(--secondary-color)`, `var(--tertiary-color)`
   - Surfaces & Text: `var(--background-color)`, `var(--surface-color)`, `var(--surface-container-color)`, `var(--surface-container-low-color)`, `var(--on-surface-color)`, `var(--on-surface-variant-color)`
   - Borders & Dividers: `var(--outline-color)`, `var(--outline-variant-color)`
   - Errors: `var(--error-color)`, `var(--error-container-color)`, `var(--on-error-container-color)`
2. **Typography:** Use `var(--font-family-sans)` / `var(--font-family-display)` (`Poppins`) and scale sizes with `var(--font-size-*)`, `var(--font-weight-*)`, `var(--line-height-*)`, and `var(--letter-spacing-*)`.
3. **Spacing, Radius, & Elevation:** Use `var(--spacing-*)` (note fractional tokens use underscores: `--spacing-0_5`, `--spacing-1_5`, `--spacing-2_5`, `--spacing-3_5`), `var(--radius-*)`, `var(--shadow-*)`, and `var(--elevation-*)`.
4. **Theme Support:** Ensure components work cleanly under `:root` / `[data-theme="light"]` and `[data-theme="dark"]` / `.dark`.
5. **Mobile-First Ergonomics (375px+):**
   - Design every layout for mobile screens first, then enhance for `md:` / `lg:` desktop viewports.
   - Render ticket lists as single-column **cards** on mobile (no horizontal table scrolling); show full tables only on `md:` and up.
   - Ensure all interactive controls (buttons, tabs, inputs) meet a minimum `44px × 44px` touch target.
   - Support mobile camera capture (`accept="image/*" capture="environment"`) for fault evidence uploads.

