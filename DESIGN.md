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

The homepage begins with a full-viewport native-sticky scene. Cotopaxi stays high and right. Product copy occupies the lower-left valley pocket and does not overlap the volcano. The body uses generous cream space, seamless transitions, image bands, and editorial grids. The homepage brand film is a second full-viewport moment: edge-to-edge motion, no inset card or cream gutter, with the approved message aligned over a restrained directional scrim. Secondary pages use a compact image-led hero and a readable 760px article measure.

## 4. Primitives and states

- Liquid nav: bright frosted pill, refractive SVG layer, solid white tint, inset shine, and shadow. Desktop dropdowns support pointer and keyboard. Mobile opens a full sheet.
- Button: forest primary and bordered cream secondary. Every button has default, hover, active, focus, and disabled treatment.
- Card: cream or forest surface with 18px radius, border, image crop, and small vertical hover lift. Empty and unavailable commerce states stay explicit.
- Form: high-contrast label, 52px field, visible focus ring, inline error or success copy.
- Modal: focus-contained, Escape-close, labeled close button, and clear placeholder disclosure when footage is pending.
- Page navigator: a quiet fixed left rail on wide screens and a horizontally scrollable pill strip on smaller screens. It may highlight the active section, but it must fade before the shared footer and must never sit over photography or footer copy.
- Editorial ritual rail: an honest, horizontally scrollable sequence of human ritual photographs with an explicit item counter and previous/next controls in addition to drag, swipe, and keyboard navigation. Captions describe observable moments only; invented customer names, quotations, ratings, and outcomes are prohibited.
- Concern rail: a native horizontal rail with a visible "Swipe to explore" cue on touch screens, 44px previous/next controls, a live segmented position indicator, and a persistent route to the full concern directory. It must remain usable by swipe, mouse, and keyboard without trapping vertical scroll.
- Reinforced catalog rails: Home Collections, Most Loved, Home concerns, and the Shop concern filter use the same mobile grammar: partial next item, “Swipe to browse,” 44px previous/next controls, segmented position, and an explicit Discover route. A concern deep link must center the selected filter and rename the Shop heading so the customer can tell which catalog path is active.
- Shop filter panel: the concern filter remains in normal document flow at every viewport width. It must scroll away with its section and never follow the viewport or cover product cards.
- Commerce cards: Add to Cart is a forest-green 44px minimum action outside the product-detail link. It must add the selected live Shopify variant, open the real cart, expose loading/unavailable/error states, and never redirect through event bubbling.
- Product gallery: on phones, the primary PDP image reaches both viewport edges with no left gutter. Thumbnails remain outside the image in a horizontally scrollable 44px rail.
- Testimonial viewer: a focus-contained video stage with persistent 44px previous/next controls, an audible current-position label, keyboard Left/Right support, and horizontal swipe support. Thumbnail navigation remains supplementary rather than the only way to change stories.
- Loox review carousel: on touch-width screens, place a quiet gold directional cue reading “Swipe to browse reviews” immediately above the live review cards. Keep it out of the desktop layout and suppress its motion for reduced-motion users.
- Marketing consent: Klaviyo remains unloaded until a visitor explicitly allows marketing analytics. The consent card is a compact cream surface with equally legible allow and necessary-only actions, a Privacy Policy link, keyboard focus states, and a persistent Cookie preferences control in the footer.
- Product availability: an unavailable Shopify variant replaces the purchase action with the official Notify Me back-in-stock control. The control loads only on an unavailable product, keeps customer contact data inside Notify Me, and never exposes a vendor API key. Exact low-stock counts may render only from live Shopify inventory data, never from hard-coded scarcity copy.
- Cart terms: every headless cart shows a required terms checkbox in the cart extension area. Checkout stays visually and functionally locked until acceptance is recorded as Shopify cart attributes that carry into the order. Buy-now shortcuts may not bypass this control.
- Shop concern directory: a compact end-of-catalog directory that exposes every concern as a large labeled link. On phones it may use a two-column grid, never targets smaller than 44px.
- Preparing Your Body promo: the former plant-archive promo on the Shop page is reassigned to the approved Preparing Your Body guide. Its copy and CTA destination must stay explicit and must not imply medical treatment.
- Apothecary field note: a wide photographic study paired with numbered botanical metadata. Specimen cards may reveal additional preparation context on hover or focus, while retaining a legible static state.
- Retreat chapter: photographic, asymmetrical editorial modules with thin rules and generous type hierarchy. Avoid repeated glass-card grids, ornamental clutter, and identical card proportions.

## 5. Motion

The hero is the single large motion moment. Its visual layers rise from below at depth-scaled speeds, driven directly by scroll progress. Native sticky positioning owns the viewport hold; GSAP scrubs only the scene timeline so downward motion reverses exactly when scrolling upward. Product copy appears only after 78 percent progress. All other reveals move only upward by 16px while fading. No horizontal entrances are permitted. Motion uses transform, opacity, and filter only. Reduced-motion receives a complete static hero.

## 6. Responsive behavior

- Desktop: native-sticky hero and full pill navigation.
- Tablet: two-column content grids and mobile navigation sheet.
- Mobile at 390px: reversible native-sticky hero, single-column cards, no horizontal overflow, and at least 44px targets. Reduced-motion uses the complete static composition.
- Horizontal rails use native scrolling, visible focus states, scroll snapping, and partial next-card affordance. They do not trap vertical scrolling.
- Below-fold video is poster-first and receives its source only as it nears the viewport. Mobile and desktop use the same reversible layered journey; reduced-motion uses the optimized static composition.

## 7. Accessibility and accepted integration debt

Semantic headings, visible focus rings, descriptive image text, keyboard menus, focus-contained modals, and reduced-motion support are required. Product claims remain educational and include the FDA disclaimer. Cart and checkout remain Shopify integration boundaries. The preview may acknowledge an item selection but must not present a fake checkout.

Customer proof must be real and client-approved. Generated or editorial lifestyle imagery can demonstrate a ritual, but it must not be paired with fabricated names, quotations, star ratings, or health outcomes.
