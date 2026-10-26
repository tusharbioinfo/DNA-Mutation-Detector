export interface DrugAnnotation {
  gene: string;
  variantPattern: string; // e.g., 'V600E', 'L858R', 'T790M', 'G12C', 'G12D', 'delAG', 'Phe508del', 'Glu6Val'
  drugs: {
    name: string;
    class: string;
    status: 'FDA Approved' | 'Standard of Care' | 'NCCN Guideline' | 'Clinical Trial' | 'Investigational';
    indication: string;
    response: 'Sensitive' | 'Resistant' | 'Potentiator' | 'Corrective Gene Therapy';
    mechanism: string;
  }[];
  clinicalNotes: string;
  evidenceLevel: 'Level 1A' | 'Level 1B' | 'Level 2A' | 'Level 2B';
}

export const THERAPY_DATABASE: DrugAnnotation[] = [
  {
    gene: 'BRAF',
    variantPattern: 'V600E',
    drugs: [
      {
        name: 'Dabrafenib + Trametinib',
        class: 'BRAF inhibitor + MEK inhibitor combination',
        status: 'FDA Approved',
        indication: 'Unresectable or Metastatic Melanoma, NSCLC, Anaplastic Thyroid Cancer with BRAF V600E',
        response: 'Sensitive',
        mechanism: 'Dabrafenib selectively inhibits V600E mutant kinase; Trametinib blocks downstream MEK1/2 preventing paradoxical MAPK reactivation.'
      },
      {
        name: 'Encorafenib + Cetuximab',
        class: 'BRAF kinase inhibitor + Anti-EGFR monoclonal antibody',
        status: 'FDA Approved',
        indication: 'Metastatic Colorectal Cancer (mCRC) with BRAF V600E mutation',
        response: 'Sensitive',
        mechanism: 'Synergistic blockade of BRAF kinase and EGFR feedback loop reactivation.'
      },
      {
        name: 'Vemurafenib',
        class: 'First-generation BRAF V600 inhibitor',
        status: 'FDA Approved',
        indication: 'BRAF V600E mutated melanoma & Erdheim-Chester Disease',
        response: 'Sensitive',
        mechanism: 'Competitively inhibits ATP-binding site of mutant BRAF monomers.'
      }
    ],
    clinicalNotes: 'V600E is a Class I BRAF mutation active as a RAS-independent monomer. Monotherapy in CRC is prone to rapid EGFR feedback reactivation; combination therapy with EGFR/MEK inhibitors is strongly recommended.',
    evidenceLevel: 'Level 1A'
  },
  {
    gene: 'EGFR',
    variantPattern: 'L858R',
    drugs: [
      {
        name: 'Osimertinib (Tagrisso)',
        class: '3rd-generation irreversible mutant-selective EGFR-TKI',
        status: 'FDA Approved',
        indication: '1st-line Metastatic NSCLC with EGFR Exon 19 del or L858R mutations',
        response: 'Sensitive',
        mechanism: 'Covalently binds Cys797 in ATP-binding domain, sparing wild-type EGFR with superior CNS penetration.'
      },
      {
        name: 'Gefitinib / Erlotinib',
        class: '1st-generation reversible EGFR-TKIs',
        status: 'FDA Approved',
        indication: 'EGFR-sensitizing mutation positive NSCLC',
        response: 'Sensitive',
        mechanism: 'Reversibly binds catalytic domain; prone to secondary T790M gatekeeper resistance.'
      }
    ],
    clinicalNotes: 'L858R accounts for ~40% of activating EGFR mutations in NSCLC. Superior progression-free survival (PFS) demonstrated with front-line Osimertinib vs 1st-generation TKIs (FLAURA trial).',
    evidenceLevel: 'Level 1A'
  },
  {
    gene: 'EGFR',
    variantPattern: 'T790M',
    drugs: [
      {
        name: 'Osimertinib',
        class: '3rd-generation irreversible EGFR-TKI',
        status: 'FDA Approved',
        indication: 'T790M-positive NSCLC following progression on 1st/2nd-gen TKIs',
        response: 'Sensitive',
        mechanism: 'Accommodates the bulky methionine gatekeeper residue and forms covalent bond with Cys797.'
      },
      {
        name: '1st/2nd Gen TKIs (Erlotinib, Afatinib)',
        class: 'Reversible/Early generation TKIs',
        status: 'FDA Approved',
        indication: 'EGFR NSCLC',
        response: 'Resistant',
        mechanism: 'Bulky Met790 sterically clashes with quinazoline core and increases ATP affinity by 10-fold, conferring drug resistance.'
      }
    ],
    clinicalNotes: 'T790M is the most common acquired resistance mutation (~50-60%) following 1st/2nd generation EGFR inhibitors.',
    evidenceLevel: 'Level 1A'
  },
  {
    gene: 'KRAS',
    variantPattern: 'G12C',
    drugs: [
      {
        name: 'Sotorasib (Lumakras)',
        class: 'First-in-class allele-specific covalent KRAS(G12C) inhibitor',
        status: 'FDA Approved',
        indication: 'KRAS G12C-mutated locally advanced or metastatic NSCLC',
        response: 'Sensitive',
        mechanism: 'Irreversibly traps KRAS in its inactive GDP-bound conformation via covalent pocket engagement at Cys12.'
      },
      {
        name: 'Adagrasib (Krazati)',
        class: 'Covalent KRAS(G12C) switch-II pocket inhibitor',
        status: 'FDA Approved',
        indication: 'KRAS G12C-mutated NSCLC and Colorectal Cancer (with Cetuximab)',
        response: 'Sensitive',
        mechanism: 'Optimized oral bioavailability and brain penetrance, locking GDP-KRAS.'
      }
    ],
    clinicalNotes: 'KRAS was historically considered "undruggable" until covalent targeting of the mutant cysteine 12 pocket unlocked targeted therapies.',
    evidenceLevel: 'Level 1A'
  },
  {
    gene: 'KRAS',
    variantPattern: 'G12D',
    drugs: [
      {
        name: 'MRTX1133 / Pan-KRAS Inhibitors',
        class: 'Non-covalent selective KRAS G12D inhibitor',
        status: 'Clinical Trial',
        indication: 'KRAS G12D pancreatic ductal adenocarcinoma & colorectal cancer',
        response: 'Sensitive',
        mechanism: 'High-affinity reversible inhibitor binding to the switch-II pocket and coordinating the Asp12 carboxylate.'
      },
      {
        name: 'KRAS G12D TCR Engineered T-cell Therapy',
        class: 'Adoptive cell therapy',
        status: 'Clinical Trial',
        indication: 'Refractory metastatic pancreatic adenocarcinoma',
        response: 'Sensitive',
        mechanism: 'Engineered T-cells recognizing HLA-C*08:02-restricted G12D neoantigen peptide.'
      }
    ],
    clinicalNotes: 'G12D is the predominant driver in pancreatic cancer (>40%) and colorectal cancer, activating both RAF-MEK-ERK and PI3K-AKT cascades.',
    evidenceLevel: 'Level 2A'
  },
  {
    gene: 'BRCA1',
    variantPattern: 'delAG',
    drugs: [
      {
        name: 'Olaparib (Lynparza)',
        class: 'Poly(ADP-ribose) polymerase (PARP) inhibitor',
        status: 'FDA Approved',
        indication: 'Germline BRCA-mutated HER2-negative metastatic breast cancer, ovarian cancer, pancreatic & prostate cancer',
        response: 'Sensitive',
        mechanism: 'Synthetic lethality: PARP trapping prevents single-strand break repair, converting them to double-strand breaks that homologous-recombination deficient cells cannot repair.'
      },
      {
        name: 'Talazoparib / Niraparib / Rucaparib',
        class: 'Potent PARP1/2 catalytic & trapping inhibitors',
        status: 'FDA Approved',
        indication: 'BRCA-associated ovarian and breast cancers',
        response: 'Sensitive',
        mechanism: 'Induces synthetic lethal apoptosis specifically in HR-deficient tumor cells.'
      },
      {
        name: 'Platinum Chemotherapy (Cisplatin / Carboplatin)',
        class: 'DNA cross-linking agents',
        status: 'Standard of Care',
        indication: 'BRCA1/2 mutated advanced malignancies',
        response: 'Sensitive',
        mechanism: 'Causes intrastrand and interstrand DNA crosslinks requiring functional BRCA1 homologous recombination for repair.'
      }
    ],
    clinicalNotes: 'Loss-of-function BRCA1 frameshift mutations render tumors profoundly sensitive to synthetic lethal PARP trapping and platinum salts. Resistance can arise through secondary reversion mutations restoring reading frame.',
    evidenceLevel: 'Level 1A'
  },
  {
    gene: 'CFTR',
    variantPattern: 'Phe508del',
    drugs: [
      {
        name: 'Trikafta (Elexacaftor + Tezacaftor + Ivacaftor)',
        class: 'Triple combination CFTR corrector and potentiator therapy',
        status: 'FDA Approved',
        indication: 'Cystic Fibrosis patients aged 2+ with at least one F508del mutation',
        response: 'Corrective Gene Therapy',
        mechanism: 'Elexacaftor and Tezacaftor act as pharmacological chaperones correcting F508del misfolding and trafficking to cell membrane; Ivacaftor potentiates channel open probability (P_open).'
      }
    ],
    clinicalNotes: 'Transforms clinical outcomes in >90% of CF population previously with fatal progressive bronchiectasis and pancreatic insufficiency.',
    evidenceLevel: 'Level 1A'
  },
  {
    gene: 'HBB',
    variantPattern: 'Glu6Val',
    drugs: [
      {
        name: 'Casgevy (Exagamglogene autotemcel)',
        class: 'CRISPR/Cas9 genome-edited autologous cell therapy',
        status: 'FDA Approved',
        indication: 'Severe Sickle Cell Disease and Transfusion-Dependent Beta-Thalassemia',
        response: 'Corrective Gene Therapy',
        mechanism: 'CRISPR/Cas9 precisely edits the BCL11A erythroid enhancer, reactivating fetal hemoglobin (HbF) production to prevent HbS polymerization.'
      },
      {
        name: 'Voxelotor (Oxbryta)',
        class: 'Hemoglobin S polymerization inhibitor',
        status: 'FDA Approved',
        indication: 'Sickle cell disease in adults and pediatric patients',
        response: 'Sensitive',
        mechanism: 'Allosterically binds HbS alpha chain, stabilizing high-affinity oxygenated state and delaying polymerization.'
      },
      {
        name: 'Hydroxyurea',
        class: 'Ribonucleotide reductase inhibitor / HbF inducer',
        status: 'FDA Approved',
        indication: 'Prevention of sickle cell vaso-occlusive crises',
        response: 'Sensitive',
        mechanism: 'Stimulates gamma-globin gene expression, increasing non-sickling HbF.'
      }
    ],
    clinicalNotes: 'The point mutation creates a valine hydrophobic knot causing fibrous polymers when deoxygenated. First milestone FDA approval for CRISPR gene editing in human medicine.',
    evidenceLevel: 'Level 1A'
  }
];

export function findTherapeuticMatches(geneSymbol: string, mutationDescription: string) {
  const symbolUpper = geneSymbol.toUpperCase();
  return THERAPY_DATABASE.filter(item => {
    const geneMatch = item.gene.toUpperCase() === symbolUpper || symbolUpper.includes(item.gene.toUpperCase());
    const variantMatch = mutationDescription.toUpperCase().includes(item.variantPattern.toUpperCase()) ||
      item.variantPattern.toUpperCase().includes(mutationDescription.toUpperCase());
    return geneMatch && (variantMatch || mutationDescription === '');
  });
}
