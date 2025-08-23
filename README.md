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

## Sample datasets
A fixed number of datasets are embedded at build time and available directly in the UI thumbnails for both classification and regression. Additional sample files can be placed under the `sample-data/` directory during development, but end users do not upload their own files from the UI.

Notes:
- Classification and regression include multiple built‑in datasets, including additional dummy examples for demonstration.
- Noise, train/test split and other parameters remain adjustable from the UI.
