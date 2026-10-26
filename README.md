Web Mutation Detector Tool

A browser-based genomics tool for detecting and interpreting DNA mutations. Compare a sample sequence against a reference, review the variants it finds, and explore their likely effect on the protein.

Disclaimer: This project is for education and research. It is not a medical device and must not be used for diagnosis or treatment decisions.

<!-- TODO: add a screenshot or GIF here, e.g. ![Screenshot](docs/screenshot.png) -->
Features
Sequence input for a reference and a sample sequence, with bundled sample genes to try
Sequence alignment with a viewer that highlights differences between the two sequences
Variant table and summary cards listing detected variants and their counts at a glance
Variant details in a dedicated view for each mutation
Pathogenicity scoring to help prioritise variants
Gene domain viewer showing where variants fall on the gene
3D protein viewer for looking at the protein structure
Sanger trace viewer with a trace simulator
Mutagenesis sandbox for introducing your own changes and seeing the result
CRISPR therapy panel with guide design utilities and therapy reference data
Clinical report and export to produce a report and export results
Built-in guide explaining how to use the tool
<!-- TODO: remove any feature above that is not finished, and add anything missing. -->
Tech Stack
React with TypeScript
Vite for development and builds
<!-- TODO: confirm against package.json and list the styling and 3D libraries actually used. -->
Getting Started
Prerequisites
Node.js (a current LTS version) and npm
Installation
bash
git clone https://github.com/<your-username>/web-mutation-detector-tool.git
cd web-mutation-detector-tool
npm install
Run locally
bash
npm run dev

Open the local address printed in the terminal.

Build for production
bash
npm run build
npm run preview
<!-- TODO: check these script names in package.json and correct them if they differ. -->
Project Structure
text
src/
├── App.tsx                  # Main application layout and state
├── main.tsx                 # Entry point
├── index.css                # Global styles
├── components/              # UI: input panel, alignment viewer, variant table,
│                            # protein 3D viewer, Sanger trace viewer, modals, etc.
├── data/                    # Sample genes and therapy reference data
├── types/                   # Shared TypeScript types (genomics.ts)
└── utils/                   # Core logic
    ├── alignment.ts         # Sequence alignment
    ├── geneticCode.ts       # Codon table and translation
    ├── pathogenicity.ts     # Variant scoring
    ├── crispr.ts            # CRISPR guide utilities
    └── sangerSimulator.ts   # Sanger trace simulation
How It Works
Paste or load a reference sequence and a sample sequence.
The tool aligns the two sequences and calls the differences as variants.
Each variant is translated against the genetic code to see how it changes the protein.
Variants are scored for likely pathogenicity and shown in the table, the domain viewer and the protein viewer.
Export the results or generate a report.
<!-- TODO: correct the steps above if the real flow differs. -->
Limitations
Pathogenicity scores are heuristic estimates, not clinical classifications.
The Sanger trace is simulated from the sequence and is not real lab data.
CRISPR and therapy information is for reference only.
<!-- TODO: edit this list to match what the tool actually does. -->
Contributing

Contributions are welcome.

Fork the repository
Create a branch: git checkout -b feature/your-feature
Commit your changes: git commit -m "Add your feature"
Push the branch: git push origin feature/your-feature
Open a pull request
License
<!-- TODO: choose a license, add a LICENSE file, and name it here. MIT is a common choice. -->
Author
Tushar Sain 

| Bioinformatics | Genomics 
