# 🧬 DNA Mutation Detector

**An Interactive Web-Based Tool for DNA Sequence Alignment, Mutation Detection, and Genomic Variant Analysis**

DNA Mutation Detector is a web application designed to explore differences between reference and mutated DNA sequences. It provides an interactive interface for identifying sequence variations, examining nucleotide alignments, and exploring their potential effects on protein sequences.

🔗 **Live Demo:** https://tusharbioinfo.github.io/DNA-Mutation-Detector/  
📂 **GitHub Repository:** https://github.com/tusharbioinfo/DNA-Mutation-Detector

---

## ✨ Features

- **DNA Sequence Analysis** — Compare reference and alternative DNA sequences.
- **Mutation Detection** — Identify sequence differences and visualize detected variants.
- **Interactive Alignment Viewer** — Explore nucleotide-level alignments and mutation positions.
- **Variant Summary** — View summarized mutation information and filter detected variants.
- **Protein Translation** — Translate DNA sequences into their corresponding protein sequences.
- **Gene and Protein Visualization** — Explore gene domains and interactive protein structure views.
- **Sanger Trace Simulation** — Visualize a simulated Sanger sequencing trace.
- **CRISPR Exploration** — Explore the application's CRISPR guide RNA analysis interface.
- **Mutation Sandbox** — Experiment with alternative sequences and compare results.
- **Report and Data Export** — Access report-generation and VCF export interfaces.

## 🛠️ Technologies Used

| Technology | Purpose |
|---|---|
| React | Interactive user interface |
| TypeScript | Type-safe application development |
| Vite | Development server and production build |
| Tailwind CSS | Responsive styling |
| JavaScript | Application logic and sequence analysis |
| GitHub Pages | Website hosting |

## 🚀 Getting Started

### Prerequisites

Install the following software:

- [Node.js](https://nodejs.org/) — preferably version 20 or a compatible supported version
- npm — included with Node.js
- [Git](https://git-scm.com/)

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/tusharbioinfo/DNA-Mutation-Detector.git
```

**2. Open the project directory**

```bash
cd DNA-Mutation-Detector
```

**3. Install dependencies**

```bash
npm install
```

**4. Start the development server**

```bash
npm run dev
```

Open the local URL displayed in your terminal, usually `http://localhost:5173/`.

### Build for Production

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

## 🧪 How to Use

1. Open the application.
2. Select a sample gene or enter your reference DNA sequence.
3. Enter the alternative DNA sequence you want to compare.
4. Configure the gene symbol and reading frame, if needed.
5. Examine the detected mutations and sequence alignment.
6. Explore the available visualization tabs.
7. Use the report and export interfaces to inspect available output options.

**Tip:** Use valid DNA sequences containing the nucleotide characters A, T, G, and C for the intended analysis.

## 📁 Project Structure

```text
DNA-Mutation-Detector/
├── src/
│   ├── components/    # Interface and visualization components
│   ├── data/          # Sample gene data
│   ├── utils/         # Sequence analysis utilities
│   ├── App.tsx        # Main application component
│   ├── main.tsx       # React entry point
│   └── index.css      # Application styles
├── index.html
├── package.json
├── package-lock.json
├── tsconfig.json
└── vite.config.ts
```

## 🎯 Project Objectives

- Make DNA sequence comparison easier to explore interactively.
- Demonstrate fundamental concepts in mutation detection and sequence analysis.
- Connect nucleotide-level variations with protein translation and visualization.
- Provide a learning and demonstration platform for bioinformatics and genomics.

## ⚠️ Scientific Disclaimer

This project is intended for educational, research, and demonstration purposes. Its outputs should not be treated as clinically validated results or used alone for medical diagnosis, treatment decisions, or genetic counselling. Variant interpretation requires appropriate validation, evidence, and expert review.

## 🔮 Future Improvements

- Integration with established variant annotation resources.
- Support for standard genomic formats such as FASTA and VCF.
- Improved validation and handling of large DNA sequences.
- Integration with external reference genome and protein databases.
- Automated testing and continuous deployment.
- Additional quality checks and reproducible analysis reports.

## 👨‍💻 Author

**Tushar Sain**  
Bioinformatics | Computational Biology | Genomics

GitHub: [@tusharbioinfo](https://github.com/tusharbioinfo)

---

⭐ If you find this project useful for learning or research, consider starring the repository.

**Built to explore DNA variation through interactive bioinformatics.**
