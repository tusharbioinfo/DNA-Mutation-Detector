# DNA Mutation Detector — Quick Start

## Run the website on your computer

1. Install Node.js (current LTS) from https://nodejs.org/.
2. Extract this ZIP and open a terminal in the `DNA-Mutation-Detector-main` folder (the folder containing `package.json`).
3. Run:

   ```bash
   npm install
   npm run dev
   ```

4. Open the local URL printed by Vite, usually `http://localhost:5173/`.

## Create a deployable website

Run:

```bash
npm install
npm run build
```

Upload the contents of the generated `dist` folder to your web host's public web directory. The Vite base path is set to `./` so generated assets can load when the site is hosted at a domain root or in a subfolder.

## Notes

- `tsconfig.json` includes Vite client types and the `@/*` source alias.
- This is an educational genomics interface, not a medical device. Its heuristic variant scores and simulated Sanger trace must not be used for clinical decisions.
