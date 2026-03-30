# Design System Specification: Coulombic Field & Vector Analyst

## 1. Overview & Creative North Star
### The Creative North Star: "The Synthetic Lens"
This design system is not a dashboard; it is a high-precision optical instrument. It rejects the "web-template" aesthetic in favor of a specialized environment that mimics a modern deep-space observatory. By merging the technical rigor of a laboratory UI with the ethereal depth of a dark-sky preserve, we create an experience of "Synthetic Clarity."

To break the traditional grid, this system utilizes **intentional asymmetry**—placing heavy data visualizations against expansive negative space—and **overlapping glass layers** to simulate the physical stacking of optical lenses.

---

## 2. Colors & Surface Logic
The palette is rooted in the deep spectrum of the cosmos, using the `Electric Violet` accent as a high-energy particle beam cutting through the `Dark Navy` void.

### The "No-Line" Rule
**Explicit Instruction:** Do not use 1px solid borders to define sections. Layout boundaries must be established exclusively through background tonal shifts. Use `surface_container_low` against a `surface` background to define a zone. 

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. Use the Material `surface_container` tiers to create "nested" depth:
- **Base Level:** `surface` (#10131c) - The infinite background.
- **Section Level:** `surface_container_low` (#181b25) - Large structural areas.
- **Component Level:** `surface_container` (#1c1f29) - Cards and interactive zones.
- **Interaction Level:** `surface_container_highest` (#32343f) - Active states or elevated flyouts.

### The "Glass & Gradient" Rule
Floating panels (Modals, Hover Details, Global Nav) must utilize **Glassmorphism**.
- **Token:** `surface_variant` at 60% opacity.
- **Effect:** `backdrop-filter: blur(16px);`.
- **Polish:** Apply a subtle linear gradient to main CTAs from `primary` (#cebdff) to `primary_container` (#a78bfa) to simulate the glow of an ionized gas.

---

## 3. Typography: The Information Hierarchy
We employ a tri-font system to separate intent: Brand Authority, Human Readability, and Machine Precision.

| Category | Font Family | Role | Token Example |
| :--- | :--- | :--- | :--- |
| **Display/Headlines** | `Space Grotesk` | High-tech, geometric authority. | `display-lg` (3.5rem) |
| **Body/Titles** | `Inter` (DM Sans Alt) | Neutral, high-legibility interface. | `title-md` (1.125rem) |
| **Data/Scientific** | `Geist Mono` | Raw telemetry and calculations. | `label-md` (0.75rem) |

**Editorial Note:** Use `Geist Mono` for all numerical data, scientific notation (e.g., $6.626 \times 10^{-34}$), and coordinate systems to maintain the "instrument" feel.

---

## 4. Elevation & Depth
In a scientific environment, shadows represent light occlusion, not just "lift."

- **The Layering Principle:** Avoid shadows for static cards. Instead, place a `surface_container_lowest` (#0b0e17) element inside a `surface_container_high` (#272a34) area to create a "recessed" well for data.
- **Ambient Shadows:** For floating elements, use extra-diffused shadows.
    - `box-shadow: 0 20px 50px rgba(11, 14, 23, 0.4);`
- **The "Ghost Border" Fallback:** If accessibility requires a stroke, use `outline_variant` at **15% opacity**. Never use 100% opaque borders; they shatter the glass illusion.

---

## 5. Components & Interface Elements

### Buttons
- **Primary:** Gradient fill (`primary` to `primary_container`), `on_primary` text. No border.
- **Secondary:** `surface_container_highest` fill, `primary` text.
- **Tertiary:** No fill. `primary` text with an underline that only appears on hover.

### Data Tables (The Observation Grid)
- **Rule:** No vertical or horizontal lines. 
- **Separation:** Use `0.9rem` (spacing-4) of vertical padding. Alternate row backgrounds using `surface_container_low` and `surface` are forbidden; use hover highlights only to maintain visual purity.
- **Alignment:** Numbers in `Geist Mono` must be tabular-lining (monospaced) for decimal alignment.

### Inputs & Fields
- **State:** Active inputs use a bottom-only "active glow" using `primary`. 
- **Validation:** Use `error` (#ffb4ab) for negative readings and `secondary_container` (#0566d9) for positive confirmations.

### Instrumentation Components (Custom)
- **The Vector Gauge:** A circular telemetry component using `tertiary` (#ffb95f) for theoretical values and `primary_container` (#a78bfa) for real-time data.
- **Glass Panel:** A container with `backdrop-filter: blur(16px)` and a subtle `outline_variant` (10% opacity) top-border to simulate light catching the edge of a glass pane.

---

## 6. Do’s and Don’ts

### Do
- **Do** embrace asymmetrical layouts. A heavy data visualization on the left balanced by wide-tracked `label-sm` text on the right creates a "custom" feel.
- **Do** use `secondary` (#adc6ff) for "Negative" space/readings. In this system, "Negative" is not bad—it's a directional vector.
- **Do** use `theoretical` (Amber Gold) for predictive data or "What-If" scenarios.

### Don't
- **Don't** use standard "Drop Shadows." They feel like 2010 web design. Use tonal layering.
- **Don't** use rounded corners larger than `xl` (0.75rem) for main panels. The system should feel sharp and precise, not "bubbly."
- **Don't** use 100% white. Use `on_surface_variant` (#cac4d4) for secondary text to reduce eye strain in dark environments.