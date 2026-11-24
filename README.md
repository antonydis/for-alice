# For Alice ♡

An interactive, mobile-first letter for Alice, made by Antony to celebrate a month of getting to know each other.

## The experience

1. A centered envelope: **To Alice · from Antony**. Nothing moves until **Begin** is tapped.
2. Two illustrated capybaras (his blue scarf, her violet bow) approach, bump noses and share a tiny kiss.
3. A miniature art museum: tap **Keep walking →** to watch the capybaras walk together to the next framed memory.
4. Seven paintings, without labels or generic captions: soccer, hike, cinema, Chinese food and ramen, birthday with arepas and empanadas, dancing, and the Coaticook lookout.
5. A sunset with a short personal message in Spanish and Chinese.

The art gallery deliberately uses custom inline SVG illustrations, so every frame has a built-in scene and no image links can break. The story has no music, tracking, accounts or backend.

## Publishing on GitHub Pages

From the GitHub repository, open **Settings → Pages** and set:

- Source: **Deploy from a branch**
- Branch: **main**
- Folder: **/ (root)**

Save. Then visit: **https://antonydis.github.io/for-alice/**

The website is public if Pages is enabled; do not add private photos or sensitive information. The letter is designed to work on phones, with touch and keyboard controls and reduced-motion support.

## Project files

- \`index.html\` — four screens: envelope, meeting, gallery and ending
- \`styles.css\` — responsive styles and animations
- \`app.js\` — capybara drawings, seven watercolor scenes, navigation, animation timing

## Edit the story

The array \`memories\` in \`app.js\` controls scene order. Each art function (\`soccer\`, \`hike\`, \`cinema\`, \`ramen\`, \`birthday\`, \`dance\`) draws a painting. The final message is in \`index.html\`.

Made with plain HTML, CSS, JavaScript and SVG. No build step required.

## Updated illustrated gallery

The six framed memories now use the original watercolor-style WebP postcards stored in `assets/`, not the earlier prototype SVG scenes. The two introductory capybaras are separate transparent illustrated assets, and the walking duo is a four-frame transparent sprite sheet. No labels or dedication captions appear on each framed memory.
