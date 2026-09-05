# Pola: Your Food Journal

Create a mobile-first clickable prototype for an iOS food-calorie app called “Pola” and ensure 5 credit is enough to make all page functioning.

Product idea:
Pola lets people photograph food, receive an estimated calorie breakdown, and save a beautiful lightweight meal sticker to a personal collection. The original photo is only used temporarily for analysis and is deleted after saving by default. The saved object is the sticker plus structured meal details—not the original image.

Goal:
Build a polished but minimal prototype that lets someone understand the complete product loop in under one minute:

Capture → Analyze → Review/edit → Save sticker → View collection.

Important constraints:

Mobile/iPhone layout only.

No login, onboarding, social features, subscriptions, barcode scanning, or backend.

Use mock data and simulated loading; do not build real AI/API integration.

Store saved example items in browser local state/local storage if needed.

Keep the experience calm, warm, lightweight, and delightful—not clinical or overly gamified.

Use English UI copy.

Create these 5 screens and working navigation:

Today / Collection screen

Header: “Today”

Small calorie progress summary: “1,240 / 2,000 kcal” and “3 meals”

A grid or vertical timeline of saved meal stickers.

Include three seeded examples:

Nasi Gulai Lunch — 650 kcal

Iced Tea — 130 kcal

Pisang Goreng — 180 kcal

Prominent circular camera button: “Capture meal”

Tapping a sticker opens the meal-detail screen.

Capture screen

Large camera-preview placeholder using a realistic Indonesian meal image or elegant food placeholder.

Controls:

Capture photo

Choose from library

Meal selector: Breakfast / Lunch / Dinner / Snack

“Add another item” text explaining that drinks or snacks can be added to the same meal.

A captured-photo state with a Continue button.

Analyzing screen

Show the captured image, a subtle progress animation, and friendly copy:
“Finding the pattern in your meal…”

Simulate completion after a short delay.

Do not imply medical-grade precision.

Review meal screen

Header: “Your lunch”

Show the captured meal photo temporarily at the top, labelled “Used only to estimate this meal.”

List editable food items with calories:

White rice — Regular — 220 kcal

Chicken curry — Regular — 320 kcal

Boiled vegetables — Small — 70 kcal

Sambal — Small — 40 kcal

Total card: “Estimated total: 650 kcal”

Supporting text: “Likely range: 580–720 kcal”

Each item should support:

remove

change serving: Small / Regular / Large

calorie total updates visually

Button: “Add drink or another item”

Primary CTA: “Create my Pola”

Include a subtle disclaimer: “Estimates are for everyday guidance, not medical use.”

Saved meal detail screen

Show a large generated sticker representation of the meal. For the prototype, it can be a tightly cropped food image with a thick white rounded outline, soft shadow, and warm pastel background.

Show: “Nasi Gulai Lunch”, 650 kcal, date and meal type.

Food breakdown and portion sizes.

Note: “Original photo was deleted after this Pola was created.”

Actions: Edit foods and Delete meal.

Visual direction:

Modern, premium, playful food-journal aesthetic.

Off-white background; earthy greens, soft orange, tomato red, and warm yellow accents.

Rounded cards, generous spacing, friendly typography, minimal line icons.

Stickers should feel collectible, like little food memories—not generic ecommerce cards.

Avoid charts except for the simple daily calorie progress.

Make the primary action always obvious.

Use realistic Indonesian food examples throughout. Ensure the prototype works smoothly from capture through saving a new sticker into the Today collection.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://pola-snap-save.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/725214f7-37b9-4f10-9186-fe1faba8d705).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
