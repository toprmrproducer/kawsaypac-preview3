# Kawsaypac Production Design Contract

## 1. Direction

Kawsaypac is a luminous, landscape-led Ecuadorian herbal brand. The visual system combines a cinematic Andean entry with a calm apothecary editorial body. The experience must feel sacred, grounded, expensive, honest, and easy to use for customers who are not highly technical.

## 2. Tokens

- Cream: `#FAF9F6`
- Forest: `#1F3A2A`
- Forest 2: `#2C4A37`
- Gold: `#C9A942`
- Olive: `#958E59`
- Charcoal: `#2A2A26`
- Paper: `#F3F0E9`
- Display type: Playfair Display, weights 400 to 700, with italic accents
- Body type: Satoshi Variable, weights 400 to 700
- Content width: 1240px
- Corner grammar: 18px cards, 28px media, fully rounded controls
- Interactive target: 44px minimum

## 3. Layout

The homepage begins with a full-viewport pinned scene. Cotopaxi stays high and right. Product copy occupies the lower-left valley pocket and does not overlap the volcano. The body uses generous cream space, seamless transitions, image bands, and editorial grids. Secondary pages use a compact image-led hero and a readable 760px article measure.

## 4. Primitives and states

- Liquid nav: bright frosted pill, refractive SVG layer, solid white tint, inset shine, and shadow. Desktop dropdowns support pointer and keyboard. Mobile opens a full sheet.
- Button: forest primary and bordered cream secondary. Every button has default, hover, active, focus, and disabled treatment.
- Card: cream or forest surface with 18px radius, border, image crop, and small vertical hover lift. Empty and unavailable commerce states stay explicit.
- Form: high-contrast label, 52px field, visible focus ring, inline error or success copy.
- Modal: focus-contained, Escape-close, labeled close button, and clear placeholder disclosure when footage is pending.

## 5. Motion

The hero is the single large motion moment. Its six visual layers rise from below at depth-scaled speeds, driven directly by scroll progress. Product copy appears only after 78 percent progress. All other reveals move only upward by 16px while fading. No horizontal entrances are permitted. Motion uses transform, opacity, and filter only. Reduced-motion and mobile receive a complete static hero.

## 6. Responsive behavior

- Desktop: pinned hero and full pill navigation.
- Tablet: two-column content grids and mobile navigation sheet.
- Mobile at 390px: static composed hero, visible product copy, hidden brand statement, single-column cards, no horizontal overflow, and at least 44px targets.

## 7. Accessibility and accepted integration debt

Semantic headings, visible focus rings, descriptive image text, keyboard menus, focus-contained modals, and reduced-motion support are required. Product claims remain educational and include the FDA disclaimer. Cart and checkout remain Shopify integration boundaries. The preview may acknowledge an item selection but must not present a fake checkout.
