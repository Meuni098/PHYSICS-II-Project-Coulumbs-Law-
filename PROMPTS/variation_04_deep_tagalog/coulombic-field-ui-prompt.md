# Coulombic Field & Vector Analyst — Full Application UI — Dark Mode (Primary) + Light Mode Variant — Desktop 1440px

## Prompt

Design a premium web-based physics sandbox application called **"Coulombic Field & Vector Analyst"**, a high-precision electrostatic simulation dashboard for students and physics enthusiasts. The entire application is a single-page interactive tool — no scrolling needed. Displayed as a full-screen render at 1440px × 900px viewport.

**Overall Aesthetic:** Scientific instrument meets modern observatory dashboard. Think Bloomberg Terminal's data density intersected with CERN's visualization dashboards and Desmos's elegant simplicity. A "control room" feel — dark panels with luminous data readouts, electric accent colors, glass-frosted sidebars, and a central canvas that feels like peering into an electromagnetic field. Every number is typeset with obsessive precision: superscripts, subscripts, proper unit symbols. The app must feel like a $10,000 lab instrument rendered as a web experience.

**Background & Canvas:** The primary background is a rich dark navy-charcoal `#0B0E17`. The main simulation canvas occupies the center and has a slightly lighter background `#0F1219` with a subtle dot-grid pattern: 1px dots in `#1E2433` at 30% opacity, spaced 32px apart, giving the feel of engineering graph paper. Behind the canvas, a faint radial gradient emanates from center: `#1A1040` at 5% opacity fading to transparent over 600px, suggesting latent electromagnetic energy. All side panels use glassmorphism: `background: rgba(15, 18, 30, 0.72)` with `backdrop-filter: blur(16px)` and a `1px solid rgba(255, 255, 255, 0.06)` border.

---

### Top Header Bar (full-width, height 56px, fixed top, z-index 50):

Background: `rgba(11, 14, 23, 0.85)` with `backdrop-filter: blur(12px)` and a bottom border `1px solid rgba(255, 255, 255, 0.06)`. Padding: `0 24px`. Flex layout, `justify-content: space-between`, `align-items: center`.

- **Left cluster:**
  - App icon: a stylized vector field icon — three diverging arrows radiating from a central point, outlined style, 22px, stroke width 1.5px, in electric violet `#A78BFA`.
  - Title: **"Coulombic Field & Vector Analyst"** in Space Grotesk Bold 17px `#E2E8F0`, letter-spacing `-0.02em`. Immediately right, a version badge: "v1.0" in a tiny pill — `background: rgba(167, 139, 250, 0.12)`, text in Geist Mono Medium 10px `#A78BFA`, padding `2px 8px`, border-radius `4px`.
  - Separator: a vertical line `1px solid rgba(255, 255, 255, 0.08)`, height 20px, margin `0 16px`.
  - Subtitle: "Coulomb's Law Interactive Sandbox" in DM Sans Regular 13px `#64748B`.

- **Center cluster:** Simulation controls in a horizontal row, gap 8px.
  - **"Add + Charge"** button: `background: rgba(239, 68, 68, 0.12)`, border `1px solid rgba(239, 68, 68, 0.25)`, text in DM Sans Semibold 12px `#F87171`, height 32px, padding `0 14px`, border-radius `8px`. Prepend a small plus-in-circle icon, 14px, outlined, `#F87171`. Hover: `background: rgba(239, 68, 68, 0.20)`, border brightens to `rgba(239, 68, 68, 0.40)`, transition 200ms ease.
  - **"Add − Charge"** button: same structure but blue — `background: rgba(59, 130, 246, 0.12)`, border `rgba(59, 130, 246, 0.25)`, text `#60A5FA`, icon is minus-in-circle. Hover: `background: rgba(59, 130, 246, 0.20)`.
  - **Charge magnitude selector:** a segmented control with options **1μC**, **5μC**, **10μC**. Container: `background: rgba(255, 255, 255, 0.04)`, border `1px solid rgba(255, 255, 255, 0.08)`, border-radius 8px, height 32px. Each segment: DM Sans Medium 12px `#94A3B8`, padding `0 12px`. Active segment: `background: rgba(167, 139, 250, 0.15)`, text `#A78BFA`, border-radius 6px. Hover on inactive: text `#CBD5E1`, transition 150ms.
  - **"Reset All"** button: ghost style, border `1px solid rgba(255, 255, 255, 0.08)`, text DM Sans Medium 12px `#64748B`, height 32px, padding `0 14px`, border-radius 8px, prepend a refresh/rotate icon 14px outlined `#64748B`. Hover: border `rgba(255, 255, 255, 0.15)`, text `#94A3B8`.

- **Right cluster:**
  - **Field Lines toggle:** a labeled switch — label "Field Lines" in DM Sans Regular 12px `#64748B`, followed by a toggle switch 36px wide × 20px tall, track `background: rgba(255, 255, 255, 0.08)`, thumb 16px circle `#64748B`. When ON: track `background: rgba(167, 139, 250, 0.3)`, thumb `#A78BFA` with a soft glow `box-shadow: 0 0 8px rgba(167, 139, 250, 0.4)`. Transition 200ms.
  - **Force Arrows toggle:** identical switch, label "Force Arrows".
  - Separator: vertical line as before.
  - **Theme toggle button:** a circular button 36px diameter, `background: rgba(255, 255, 255, 0.05)`, border `1px solid rgba(255, 255, 255, 0.08)`, border-radius 50%. Contains a crescent moon icon, 16px, outlined, `#94A3B8`. Hover: `background: rgba(255, 255, 255, 0.10)`, icon color `#E2E8F0`. In light mode, this becomes a sun icon. Smooth 300ms rotation animation on toggle.

---

### Main Canvas Area (center, fills remaining space between header and bottom panel):

Dimensions: approximately 880px wide × 540px tall (flexible, eats remaining space). Background `#0F1219` with the dot-grid pattern. Border-radius 12px on all corners, border `1px solid rgba(255, 255, 255, 0.05)`. A subtle inner shadow: `inset 0 0 60px rgba(0, 0, 0, 0.3)`.

**Contents visualized on the canvas:**

- **Mannequin Charges:** Each charge is rendered as a humanoid stick-figure silhouette — a filled circle head (12px radius), two angled lines for arms, a vertical body line, and two angled lines for legs. Total height ~56px. **Positive charges** are rendered in coral-red `#EF4444` with a glowing aura: `box-shadow: 0 0 20px rgba(239, 68, 68, 0.35)`. A bold "+" symbol in Space Grotesk Bold 14px sits centered on the figure's torso, in `#FCA5A5`. **Negative charges** are rendered in electric blue `#3B82F6` with aura: `box-shadow: 0 0 20px rgba(59, 130, 246, 0.35)`. A bold "−" on the torso in `#93C5FD`. Below each figure, a small label: "q₁ = +5μC" in Geist Mono Regular 10px `#94A3B8`, centered.

- Show **two mannequin charges** in the default state: one positive (left-center of canvas) and one negative (right-center), separated by roughly 300px.

- **Force Arrows:** From each mannequin charge, a large arrow extends toward or away from the other charge. Arrow shaft: 3px thick, color matching the charge (red or blue), with a tapered arrowhead. The arrow length is proportional to force magnitude. Along each arrow shaft, a small floating label: "F = 8.99 × 10⁻³ N" in Geist Mono Medium 11px `#E2E8F0`, background `rgba(15, 18, 30, 0.8)`, padding `2px 8px`, border-radius 4px.

- **Field Lines:** Thin curved lines (1.5px stroke) emanating from the positive charge and curving toward the negative charge, following the classic dipole pattern. Line color: a soft gradient from warm `#F59E0B` at 30% opacity near positive to cool `#6366F1` at 30% opacity near negative. Approximately 12-16 lines evenly spaced angularly around the positive charge.

- **Distance indicator:** A dashed line between the two charges, `1px dashed #475569`, with a small centered label: "r = 0.15 m" in Geist Mono Regular 11px `#94A3B8`, background `rgba(15, 18, 30, 0.85)`, padding `2px 8px`, border-radius 4px.

- **Cursor hint:** When hovering over a charge, a subtle hand-grab cursor appears. While dragging, the charge has an enhanced glow: aura radius doubles, `box-shadow: 0 0 40px rgba(color, 0.5)`, and all connected arrows/field lines animate smoothly to follow.

---

### Right Sidebar — Physics Panel (width 300px, pinned right, full height below header):

Background: glassmorphism — `rgba(15, 18, 30, 0.72)`, `backdrop-filter: blur(16px)`, left border `1px solid rgba(255, 255, 255, 0.06)`. Padding: 20px. Flex column, gap 0.

**Panel Header:**
- Title: "Physics Panel" in Space Grotesk Semibold 15px `#E2E8F0`. Below it, a thin line `1px solid rgba(255, 255, 255, 0.06)`, margin `12px 0 16px 0`.

**Section: Selected Pair** (only visible when two charges exist):
- Section label: "ACTIVE PAIR" in DM Sans Bold 10px `#64748B`, letter-spacing `0.08em`, text-transform uppercase, margin-bottom 12px.

- **Charge 1 card:** A small card, `background: rgba(239, 68, 68, 0.06)`, border `1px solid rgba(239, 68, 68, 0.15)`, border-radius 10px, padding 12px.
  - Label: "Charge 1 (q₁)" in DM Sans Medium 12px `#F87171`.
  - Value: "+5.00 × 10⁻⁶ C" in Geist Mono Semibold 16px `#FCA5A5`. The exponent "⁻⁶" uses proper `<sup>` styling.
  - Polarity badge: a tiny pill "POSITIVE" in DM Sans Bold 9px `#F87171`, background `rgba(239, 68, 68, 0.12)`, padding `2px 6px`, border-radius 3px.

- Gap: 8px.

- **Charge 2 card:** Identical structure but blue — `background: rgba(59, 130, 246, 0.06)`, border `rgba(59, 130, 246, 0.15)`, label `#60A5FA`, value `#93C5FD`, badge "NEGATIVE" in `#60A5FA`.

- Gap: 16px.

**Section: Computed Values:**
- Section label: "COMPUTED VALUES" in same uppercase style.
- A vertical list of key-value rows, gap 10px. Each row is: label on the left in DM Sans Regular 12px `#64748B`, value on the right in Geist Mono Medium 14px `#E2E8F0`. Rows:
  - **Separation (r):** `0.1500 m`
  - **Force (F):** `8.9875 × 10⁻³ N` — this value in `#A78BFA` (accent) to stand out.
  - **Direction (θ):** `0.00°`
  - **Field at midpoint:** `2.396 × 10⁶ N/C`
  - **Potential Energy (U):** `−2.997 × 10⁻¹ J`
- Between each row, a faint divider `1px solid rgba(255, 255, 255, 0.04)`.

- Gap: 16px.

**Section: Coulomb's Law:**
- Section label: "COULOMB'S LAW" same style.
- A beautifully typeset equation block: `background: rgba(167, 139, 250, 0.05)`, border `1px solid rgba(167, 139, 250, 0.12)`, border-radius 10px, padding 16px, text-align center.
  - Line 1 (formula): **F = k · |q₁ · q₂| / r²** in Geist Mono Medium 15px `#CBD5E1`. The `k`, `q₁`, `q₂`, `r²` should feel like proper math typesetting — italicized variables, upright constants.
  - Line 2 (constant): "k = 8.9875 × 10⁹ N·m²/C²" in Geist Mono Regular 11px `#64748B`.

---

### Bottom-Left Panel — Data Log Table (width ~540px, height ~220px, pinned bottom-left):

Background: glassmorphism, `rgba(15, 18, 30, 0.72)`, `backdrop-filter: blur(16px)`, top border `1px solid rgba(255, 255, 255, 0.06)`, border-radius `12px 12px 0 0`. Padding: 16px.

**Panel Header Row:** Flex, space-between, align-items center, margin-bottom 12px.
- Left: "Data Log" in Space Grotesk Semibold 14px `#E2E8F0`. Next to it, a small count badge: "(12 entries)" in DM Sans Regular 11px `#64748B`.
- Right: Two small icon buttons, gap 6px.
  - **Export CSV:** a download icon, 14px, outlined, `#64748B`, in a 28px square button, `background: rgba(255, 255, 255, 0.04)`, border `1px solid rgba(255, 255, 255, 0.06)`, border-radius 6px. Hover: `background: rgba(255, 255, 255, 0.08)`, icon `#94A3B8`.
  - **Clear Log:** a trash icon, 14px, same style but hover turns icon `#F87171`.

**Table:** A clean data table with the following columns, scrollable (max-height ~150px, thin custom scrollbar `4px wide`, track `rgba(255,255,255,0.03)`, thumb `rgba(255,255,255,0.1)`, border-radius 2px).

| Column | Width | Alignment | Header Style | Cell Style |
|---|---|---|---|---|
| # | 40px | center | DM Sans Bold 10px `#475569`, uppercase | Geist Mono Regular 11px `#475569` |
| q₁ (C) | 120px | right | DM Sans Bold 10px `#F87171`, uppercase | Geist Mono Regular 11px `#FCA5A5` |
| q₂ (C) | 120px | right | DM Sans Bold 10px `#60A5FA`, uppercase | Geist Mono Regular 11px `#93C5FD` |
| r (m) | 90px | right | DM Sans Bold 10px `#64748B`, uppercase | Geist Mono Regular 11px `#CBD5E1` |
| F (N) | 130px | right | DM Sans Bold 10px `#A78BFA`, uppercase | Geist Mono Medium 11px `#C4B5FD` |

- Header row: `background: rgba(255, 255, 255, 0.03)`, padding `8px 12px`, bottom border `1px solid rgba(255, 255, 255, 0.06)`.
- Data rows: padding `7px 12px`, border-bottom `1px solid rgba(255, 255, 255, 0.03)`. Alternating rows: even rows get `background: rgba(255, 255, 255, 0.015)`. Hover: `background: rgba(167, 139, 250, 0.06)`, transition 150ms.
- All numerical values in scientific notation: e.g., `+5.00×10⁻⁶`, `8.99×10⁻³`.
- The most recent entry (top row) has a faint left-border accent: `3px solid #A78BFA` and slightly brighter text.

Show 5-6 sample data rows to demonstrate the table populated.

---

### Bottom-Right Panel — F vs r Graph (fills remaining bottom-right space, height ~220px):

Background: glassmorphism, same treatment as data log panel. Border-radius `12px 12px 0 0`. Padding: 16px.

**Panel Header Row:** Flex, space-between, align-items center, margin-bottom 8px.
- Left: "F vs r — Inverse-Square Law" in Space Grotesk Semibold 14px `#E2E8F0`.
- Right: A small legend row — two items:
  - A small circle 8px `#A78BFA` + "Measured" in DM Sans Regular 11px `#94A3B8`, gap 6px.
  - A small dashed line segment 16px wide, `#F59E0B` + "Theoretical 1/r²" in DM Sans Regular 11px `#94A3B8`, gap 6px.

**Chart area:** A scatter plot filling the remaining panel space (~500px wide × ~170px tall).
- **Background:** `#0F1219` with very faint grid lines `rgba(255, 255, 255, 0.04)`.
- **X-axis:** labeled "r (m)" in DM Sans Medium 11px `#64748B`. Tick marks in Geist Mono Regular 10px `#475569`. Range: 0.05 to 0.50 m.
- **Y-axis:** labeled "F (N)" in DM Sans Medium 11px `#64748B`. Same tick style. Range: 0 to 0.05 N (auto-scaled).
- **Data points:** Filled circles, 6px diameter, `#A78BFA`, with a subtle glow `box-shadow: 0 0 6px rgba(167, 139, 250, 0.4)`. On hover, a tooltip appears: `background: #1A1D27`, border `1px solid rgba(255,255,255,0.1)`, border-radius 6px, padding `6px 10px`, showing "r = 0.15 m, F = 8.99×10⁻³ N" in Geist Mono Regular 11px `#E2E8F0`.
- **Theoretical curve:** A smooth `1/r²` hyperbola curve, `2px solid #F59E0B` at 50% opacity, dashed (`stroke-dasharray: 6,4`), flowing through the expected values. This visually confirms the inverse-square law.
- **Axis lines:** `1px solid rgba(255, 255, 255, 0.1)` for both axes.

Show 8-10 scattered data points that roughly follow the theoretical curve, with slight real-world scatter to look authentic.

---

### Empty State (when no charges placed yet):

The canvas shows a centered message:
- Icon: a large atom-like icon (three elliptical orbits around a central dot), 48px, outlined, `#2D3748`.
- Text line 1: "Mag-drag ng mga charge papunta sa canvas" in Space Grotesk Medium 18px `#475569`.
- Text line 2: "I-click ang 'Add + Charge' o 'Add − Charge' sa toolbar sa itaas" in DM Sans Regular 14px `#3E4A5C`.
- A soft pulse animation on the icon: `opacity: 0.5 → 1.0`, 2s ease-in-out infinite.

---

## Light Mode Variant

When the theme toggle is clicked, all tokens transition smoothly (`transition: background-color 300ms ease, color 300ms ease, border-color 300ms ease`):

| Token | Dark Value | Light Value |
|---|---|---|
| Page background | `#0B0E17` | `#F5F6FA` |
| Canvas background | `#0F1219` | `#FFFFFF` |
| Canvas dot grid | `#1E2433` at 30% | `#D1D5DB` at 25% |
| Panel background | `rgba(15, 18, 30, 0.72)` | `rgba(255, 255, 255, 0.78)` |
| Panel border | `rgba(255, 255, 255, 0.06)` | `rgba(0, 0, 0, 0.06)` |
| Primary text | `#E2E8F0` | `#1A1A2E` |
| Secondary text | `#94A3B8` | `#64748B` |
| Muted text | `#64748B` | `#94A3B8` |
| Disabled text | `#475569` | `#CBD5E1` |
| Accent (violet) | `#A78BFA` | `#7C3AED` |
| Positive charge | `#EF4444` / `#FCA5A5` | `#DC2626` / `#FCA5A5` |
| Negative charge | `#3B82F6` / `#93C5FD` | `#2563EB` / `#93C5FD` |
| Theoretical curve | `#F59E0B` | `#D97706` |
| Table even row | `rgba(255, 255, 255, 0.015)` | `rgba(0, 0, 0, 0.02)` |
| Table hover | `rgba(167, 139, 250, 0.06)` | `rgba(124, 58, 237, 0.06)` |
| Card shadow | none (borders only) | `0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)` |
| Graph grid | `rgba(255,255,255,0.04)` | `rgba(0,0,0,0.06)` |
| Header bg | `rgba(11,14,23,0.85)` | `rgba(255,255,255,0.90)` |
| Header border | `rgba(255,255,255,0.06)` | `rgba(0,0,0,0.08)` |

In light mode, the canvas loses the radial gradient glow and instead has a very subtle warm tone. The charge auras become soft box-shadows instead of glows. The graph background becomes pure white with light gray grid lines. All glassmorphism panels get a subtle `box-shadow: 0 4px 20px rgba(0,0,0,0.06)` instead of relying on borders alone.

---

## Key Design Notes

- **Grid system:** The layout is a CSS Grid: `grid-template-columns: 1fr 300px`, `grid-template-rows: 56px 1fr 220px`. The bottom row splits into two: data table (left) and graph (right) via a nested grid or flex.
- **Typography hierarchy:** Space Grotesk for headings/titles, DM Sans for labels/body, Geist Mono for ALL numerical data and scientific notation. This three-font system creates clear visual hierarchy between "structural", "descriptive", and "data" content.
- **Color usage:** Violet `#A78BFA` is the singular accent — used for active states, computed force values, data points, and interactive highlights. Red and blue are ONLY for charge polarity. Gold `#F59E0B` is ONLY for the theoretical curve. This disciplined palette prevents visual noise.
- **Spacing rhythm:** 4px base unit. Gaps: 8/12/16/20/24px. Panel padding: 16-20px. Section spacing: 16px. The tighter spacing reflects a data-dense instrument aesthetic.
- **Interaction states:** Every interactive element has a hover state. Charges glow on hover and scale up 5%. Buttons brighten borders and backgrounds. Table rows highlight. Graph points show tooltips. Toggle switches animate smoothly.
- **Scientific notation:** ALL values rendered in proper scientific notation with `×` (multiplication sign, not 'x'), superscript exponents via `<sup>`, and correct unit symbols (N, m, C, N/C, J). Subscripts use `<sub>` for q₁, q₂. This is non-negotiable — the app is a physics tool.
- **Glassmorphism depth:** Three depth levels — canvas (lowest, opaque), panels (mid, frosted glass), and tooltips/popovers (highest, more opaque). This creates a layered cockpit feel.
- **Responsive consideration:** At 1024px, hide the right sidebar and move the physics panel into a collapsible bottom sheet. At 768px, stack the data table and graph vertically. The canvas always takes maximum available space.
