# Emergency Cleanings - Hoarding Price Calculator

Internal-use estimate calculator for Emergency Cleanings hoarding cleanup projects.

## Files

- `index.html` - page structure
- `styles.css` - brand styling and responsive layout
- `calculator.js` - live pricing logic, validation, copy summary, and PDF/print fallback

## Features

- Live estimate calculation without a calculate button
- Required first name and last name fields
- Required email format validation
- Phone auto-formatting: `4154567898` becomes `(415)-456-7898`
- Service address field
- Hoarding level, disposal volume, market multiplier, property size, and cleaning add-ons
- Carpet service options: vacuum, shampoo, and removal
- Hazards and special conditions
- Additional labor/handling factors
- Attic, basement, garage, shed, and other requested task options
- Suggested 20% deposit
- Copy estimate summary
- Download PDF button using browser print/save-as-PDF fallback

## Important Pricing Disclaimer

This calculator provides a preliminary internal range only. Final pricing is subject to photos/video review, onsite walkthrough, confirmed scope, access conditions, hazards, disposal requirements, and written approval.

## Deployment

Upload the files to any static hosting provider or GitHub Pages.

For GitHub Pages:

1. Push these files to the repository root.
2. Go to Settings > Pages.
3. Set Source to `Deploy from a branch`.
4. Select branch `main` and folder `/root`.
5. Save.

## Suggested Commit Message

```bash
git add .
git commit -m "Add Emergency Cleanings hoarding price calculator"
git push origin main
```
