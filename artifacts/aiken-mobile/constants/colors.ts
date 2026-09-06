/**
 * Semantic design tokens for the mobile app.
 *
 * These tokens mirror the naming conventions used in web artifacts (index.css)
 * so that multi-artifact projects share a cohesive visual identity.
 *
 * Replace the placeholder values below with values that match the project's
 * brand. If a sibling web artifact exists, read its index.css and convert the
 * HSL values to hex so both artifacts use the same palette.
 *
 * To add dark mode, add a `dark` key with the same token names.
 * The useColors() hook will automatically pick it up.
 */

const colors = {
  light: {
    // Legacy aliases (kept for backward compatibility)
    text: '#33261f',
    tint: '#F2A93B',

    // Core surfaces
    background: '#FFFBF3',
    foreground: '#33261f',

    // Cards / elevated surfaces
    card: '#FFFFFF',
    cardForeground: '#33261f',

    // Primary action color (buttons, links, active states)
    primary: '#F2A93B',
    primaryForeground: '#ffffff',

    // Secondary / less-emphasis interactive surfaces
    secondary: '#FFF1D8',
    secondaryForeground: '#33261f',

    // Muted / subdued elements (dividers, timestamps, placeholders)
    muted: '#F3E9DC',
    mutedForeground: '#866F62',

    // Accent highlights (badges, selected items, focus rings)
    accent: '#B4232A',
    accentForeground: '#FFFFFF',

    // Destructive actions (delete, error states)
    destructive: '#B4232A',
    destructiveForeground: '#ffffff',

    // Borders and input outlines
    border: '#E9D9CA',
    input: '#E9D9CA',
  },

  // Border radius (in px). Sync from the sibling web artifact's --radius
  // CSS variable. This value applies to cards, buttons, inputs, and modals.
  radius: 8,
};

export default colors;
