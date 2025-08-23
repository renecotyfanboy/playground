# Deep playground

Deep playground is an interactive visualization of neural networks, written in
TypeScript using d3.js. We use GitHub issues for tracking new requests and bugs.
Your feedback is highly appreciated!

**If you'd like to contribute, be sure to review the [contribution guidelines](CONTRIBUTING.md).**

## Development

To run the visualization locally, run:
- `npm i` to install dependencies
- `npm run build` to compile the app and place it in the `dist/` directory
- `npm run serve` to serve from the `dist/` directory and open a page on your browser.

For a fast edit-refresh cycle when developing run `npm run serve-watch`.
This will start an http server and automatically re-compile the TypeScript,
HTML and CSS files whenever they change.

## For owners
To push to production: `git subtree push --prefix dist origin gh-pages`.

This is not an official Google product.

## CSV datasets (new)
You can now build a dataset from a CSV file for both classification and regression.

Expected CSV columns:
- x: number
- y: number
- values (or value): number

Notes:
- For regression, the `values` column is used as-is (should be in roughly [-1,1] for best display).
- For classification, the `values` column is thresholded to {-1, 1}: value <= 0 → -1, value > 0 → 1.
- Invalid rows (missing or non-numeric values) are skipped.

How to use:
1. Choose the problem type (Classification or Regression).
2. Click the "Load CSV (x,y,values)" control under the Data section and select your .csv file.
3. The data will be parsed and set as the active dataset. You can still adjust noise/ratio/etc.

Dummy presets:
- Two additional classification presets: "CSV Dummy 1/2 (Classification)"
- Two additional regression presets: "CSV Dummy 1/2 (Regression)"
These appear as thumbnails and can be used until your real data is provided.
