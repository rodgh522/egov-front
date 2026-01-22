---
trigger: always_on
---

1. Project Overview
Goal: A high-performance, dashboard-style web application inspired by the Firebase Console.

Stack: React 19.2

Language: TypeScript (Strict)

Styling: Tailwind CSS

UI Components: shadcn/ui (Radix UI)

Icons: Lucide React

2. Design System (Firebase Aesthetic)
All UI generation must strictly follow the visual language of the Firebase Console as seen in the provided reference images.

Color Palette:

Primary: Firebase Blue (#1a73e8 or extracted from image).

Background: Off-white/Light gray (#f8f9fa) for main content; White for cards.

Sidebar: Deep navy or light gray (depending on the specific console version in the screenshot).

Typography: Sans-serif stack (Inter or Geist). Small, readable font sizes for high information density.

Shaping: Low border-radius (standard 0.5rem or rounded-md) and subtle, flat shadows.

Layout: * A fixed left sidebar for navigation.

A top header for breadcrumbs, search, and profile.

Main content area uses a "Card-on-Gray-Background" pattern.

3. Project Structure
Maintain a clean, modular directory structure:

Plaintext
src/
├── app/            # Next.js App Router (Pages, Layouts)
├── components/
│   ├── ui/         # shadcn/ui primitives (atomic)
│   ├── shared/     # Reusable business components (Layout, Sidebar)
│   └── features/   # Feature-specific components
├── hooks/          # Custom React hooks
├── lib/            # Utilities (utils.ts, constants.ts)
└── types/          # Global TypeScript interfaces
4. Coding Standards & Rules
React 19.2: Use modern React patterns (e.g., use hook, Actions) where applicable.

shadcn/ui Usage: Always check components/ui before creating a new component. If a component is missing, install it via npx shadcn-ui@latest add [component].

TypeScript: * No any types.

Use interface for component props.

Explicitly define return types for functions.

Tailwind CSS: * Use cn() utility for conditional classes.

Follow the mobile-first responsive design approach.

5. UI/UX Implementation Details
Navigation: The sidebar must support active-state highlighting using the primary brand color.

Loading States: Implement skeleton screens (shadcn/ui Skeleton) for data-fetching components.

Forms: Use react-hook-form and zod for validation, styled with shadcn/ui Form components.

Interactions: Use subtle transitions for hover states and modal (Dialog) appearances.

## 6. Visual Reference & Context
* **Location:** All design reference images are stored in the `/rules` directory.
* **Mandatory Review:** Before generating any new UI component or layout, the AI agent MUST analyze the images in the `/rules` folder to ensure visual consistency.
* **Key Visual Cues to Extract:**
    * **Color Accuracy:** Use the exact Hex codes found in `.agent/capture/ui_sample_1.png` and `.agent/capture/ui_sample_2.png`.
    * **Spacing & Padding:** Mimic the whitespace and "breathability" of the Firebase UI.
    * **Component Styling:** Buttons, Inputs, and Tabs must match the border-radius, font-weight, and hover states seen in the screenshots.