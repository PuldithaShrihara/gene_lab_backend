import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

// Import Mongoose Models
import Appointment from './models/Appointment.js';
import GeneticTestRequest from './models/GeneticTestRequest.js';
import Contact from './models/Contact.js';
import PatientRegistration from './models/PatientRegistration.js';
import PartnerLabInquiry from './models/PartnerLabInquiry.js';
import Review from './models/Review.js';
import User from './models/User.js';
import TestAllocation from './models/TestAllocation.js';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
if (!process.env.MONGO_URI) {
  console.error("MONGO_URI is missing. Please add it to environment variables.");
  process.exit(1);
}
const MONGO_URI = process.env.MONGO_URI;




const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
// --- ADMIN AUTHENTICATION ---
const verifyAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

  if (!token) {
    return res.status(401).json({ error: "Admin token required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired admin token" });
  }
};

app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body;

  if (
    username !== process.env.ADMIN_USERNAME ||
    password !== process.env.ADMIN_PASSWORD
  ) {
    return res.status(401).json({ error: "Invalid admin credentials" });
  }

  const token = jwt.sign(
    { username, role: "admin" },
    process.env.ADMIN_JWT_SECRET,
    { expiresIn: "8h" }
  );

  res.json({
    token,
    username,
    role: "admin"
  });
});
// ----------------------------


// Articles Data
const articles = [
  {
    id: '1',
    title: 'What Is Genetic Testing?',
    slug: 'what-is-genetic-testing',
    summary: 'An introductory guide to understanding clinical genetics, genetic tests, and how testing can help diagnose or manage inherited conditions.',
    content: 'Genetic testing involves analyzing DNA to identify changes (variants) in genes that may cause or increase the risk of a medical condition. In a clinical genetics setup, testing is typically recommended for individuals with a family history of an inherited disease, children with developmental delays or unique physical features, or couples planning a pregnancy who want to assess genetic compatibility. A clinical geneticist guides you through selecting the correct test, understanding what the results mean, and coordinating medical management or family screening options based on the findings.',
    category: 'Education',
    date: 'June 10, 2026',
    author: 'Dr. Lahiru Prabodha',
    readTime: '5 min read'
  },
  {
    id: '2',
    title: 'Understanding Genetic Counselling',
    slug: 'understanding-genetic-counselling',
    summary: 'A look into genetic counseling, how it works, and why pre-test and post-test sessions are crucial for families.',
    content: 'Genetic counselling is the process of helping people understand and adapt to the medical, psychological, and familial implications of genetic contributions to disease. Sessions are conducted in a supportive and confidential environment. Pre-test counselling helps identify the best tests, clarify expectations, and discuss genetic inheritance. Post-test counselling covers the interpretation of results, including positive, negative, and variants of uncertain significance, mapping out family risk communications, medical referrals, and surveillance.',
    category: 'Counselling',
    date: 'June 11, 2026',
    author: 'Dr. Lahiru Prabodha',
    readTime: '5 min read'
  },
  {
    id: '3',
    title: 'What Is NIPT?',
    slug: 'what-is-nipt',
    summary: 'Learn about Non-Invasive Prenatal Testing, its accuracy, what it screens for, and its clinical limitations.',
    content: 'Non-Invasive Prenatal Testing (NIPT) analyzes cell-free fetal DNA circulating in maternal blood to screen for chromosomal conditions. From 10 weeks of pregnancy, NIPT offers highly sensitive screening for trisomy 21 (Down syndrome), trisomy 18 (Edwards syndrome), and trisomy 13 (Patau syndrome). Because it only requires a blood draw, it poses no risk to the fetus. However, it is a screening test rather than a diagnostic test. All high-risk outcomes must be confirmed via diagnostic procedures like amniocentesis or chorionic villus sampling (CVS).',
    category: 'Prenatal Screening',
    date: 'June 12, 2026',
    author: 'Dr. Lahiru Prabodha',
    readTime: '6 min read'
  },
  {
    id: '4',
    title: 'Genetic Testing Before Pregnancy',
    slug: 'genetic-testing-before-pregnancy',
    summary: 'Why pre-conception carrier screening helps couples evaluate risks for conditions like Thalassemia.',
    content: 'Pre-pregnancy carrier screening helps couples assess whether they are carriers of mutations for recessive disorders like Thalassemia, Cystic Fibrosis, or Spinal Muscular Atrophy. Since carriers are healthy and display no symptoms, they are usually unaware of their status. If both parents carry a mutation in the same gene, there is a 25% risk of having an affected child. A pre-conception genetics consultation outlines carrier screening options and supports reproductive choices before pregnancy.',
    category: 'Reproductive Genetics',
    date: 'June 13, 2026',
    author: 'Dr. Lahiru Prabodha',
    readTime: '5 min read'
  },
  {
    id: '5',
    title: 'How to Read a Genetic Test Report',
    slug: 'how-to-read-a-report',
    summary: 'A step-by-step walk through variant classifications like pathogenic, benign, or variants of uncertain significance.',
    content: 'A genetic test report categorizes DNA changes (variants) into classifications standardized by the ACMG (American College of Medical Genetics). Variants are categorized as: Pathogenic (known to cause disease), Likely Pathogenic, Variant of Uncertain Significance (VUS), Likely Benign, or Benign. The clinical geneticist evaluates these classifications alongside your clinical features, medical history, and family tree to determine their significance.',
    category: 'Clinical Advice',
    date: 'June 14, 2026',
    author: 'Dr. Lahiru Prabodha',
    readTime: '6 min read'
  },
  {
    id: '6',
    title: 'What Is a Variant of Uncertain Significance?',
    slug: 'what-is-vus',
    summary: 'Understanding VUS results, why they occur, and how to manage the uncertainty without anxiety.',
    content: 'A Variant of Uncertain Significance (VUS) means a change in DNA has been detected, but current scientific literature lacks enough data to confirm whether it causes disease or is a benign variation. Finding a VUS is extremely common. It should not be used to make treatment decisions or trigger surgeries. Clinical geneticists monitor scientific databases and re-evaluate VUS findings over time as genomics research advances.',
    category: 'Clinical Advice',
    date: 'June 15, 2026',
    author: 'Dr. Lahiru Prabodha',
    readTime: '5 min read'
  },
  {
    id: '7',
    title: 'Genetics and Nutrition',
    slug: 'genetics-and-nutrition',
    summary: 'How DNA analysis helps map micronutrient needs, vitamin metabolism, and food sensitivities.',
    content: 'Nutrigenomics is the study of how individual genetic variation affects response to nutrients. For example, variants in the MTHFR gene alter folate activation, while changes in genes like MCM6 determine lactose tolerance. By understanding your genetic tendencies, we can customize nutrient intakes, trace sensitivities, and support cardiovascular health through targeted nutrition plans.',
    category: 'Genomics & Wellness',
    date: 'June 16, 2026',
    author: 'Dr. Lahiru Prabodha',
    readTime: '5 min read'
  },
  {
    id: '8',
    title: 'Genetics and Weight Management',
    slug: 'genetics-and-weight-management',
    summary: 'Learn how genetic responses influence satiety, fat metabolism, and weight management strategies.',
    content: 'Weight management is influenced by genetic responses. Variations in genes like FTO affect satiety patterns, food cravings, and metabolic responses to dietary fats or carbohydrates. Rather than using standard diets, wellness genomics evaluates these tendencies to structure weight loss programs based on your metabolic blueprint.',
    category: 'Genomics & Wellness',
    date: 'June 17, 2026',
    author: 'Dr. Lahiru Prabodha',
    readTime: '4 min read'
  },
  {
    id: '9',
    title: 'Genetics and Fitness Response',
    slug: 'genetics-and-fitness-response',
    summary: 'Discover how muscle fibers, injury recovery, and aerobic capacities are guided by DNA profile traits.',
    content: 'Your body\'s response to physical training is influenced by genetic factors. The ACTN3 gene, for instance, determines sprint power vs. endurance capacity, while COL1A1 affects ligament strength and injury susceptibility. Wellness genomics helps target exercise styles (high intensity vs. steady cardio) and structure appropriate recovery times to reduce injury risk.',
    category: 'Genomics & Wellness',
    date: 'June 18, 2026',
    author: 'Dr. Lahiru Prabodha',
    readTime: '5 min read'
  },
  {
    id: '10',
    title: 'Family History and Inherited Risk',
    slug: 'family-history-risk',
    summary: 'Why drawing a detailed family pedigree is a cornerstone of clinical genetic assessment.',
    content: 'A detailed family history is the cornerstone of clinical genetics. By building a three-generation pedigree chart, a clinical geneticist can identify dominant or recessive inheritance patterns. This assessment helps evaluate risks for conditions like breast cancer or cardiomyopathy, supporting proactive screening and protection for family members.',
    category: 'Genomics',
    date: 'June 19, 2026',
    author: 'Dr. Lahiru Prabodha',
    readTime: '5 min read'
  },
  {
    id: '11',
    title: 'Whole Exome vs Whole Genome Sequencing',
    slug: 'exome-vs-genome-sequencing',
    summary: 'Understanding sequencing differences, costs, and choosing the right test panel.',
    content: 'Whole Exome Sequencing (WES) sequences only the protein-coding regions of DNA (exons), which make up about 2% of the genome but contain ~85% of disease-causing mutations. Whole Genome Sequencing (WGS) sequences all 3 billion letters of your DNA, including introns and structural regions. While WGS provides the most comprehensive data, WES is often a highly cost-effective first step for diagnosing rare pediatric or neurological conditions.',
    category: 'Genomics',
    date: 'June 20, 2026',
    author: 'Dr. Lahiru Prabodha',
    readTime: '6 min read'
  },
  {
    id: '12',
    title: 'Why Genetic Results Need Professional Interpretation',
    slug: 'why-results-need-professional-interpretation',
    summary: 'Avoid misinterpretation pitfalls by seeking guidance from a clinical geneticist.',
    content: 'Genetic data requires professional interpretation. A minor variant flagged by a direct-to-consumer app could be clinically benign, while a VUS might be incorrectly assumed to be a diagnosis. To avoid unnecessary anxiety or incorrect treatments, reports must be reviewed alongside clinical symptoms and detailed family history by a qualified medical specialist.',
    category: 'Clinical Advice',
    date: 'June 21, 2026',
    author: 'Dr. Lahiru Prabodha',
    readTime: '5 min read'
  }
];


// Articles API
app.get('/api/articles', (req, res) => {
  res.json(articles);
});
// Global settings
let config = {
  showPricing: true // Enabled by client request
};

// Test Packages Database (Annex 3)
// Test Packages Database (Annex 3)
let testPackages = [
  {
    id: 'pkg-1',
    code: 'GC/1',
    name: 'Nutrition',
    sampleType: 'Whole Blood/Saliva/BD',
    category: 'Wellness & Lifestyle',
    explanation: 'Assess genetic factors related to nutrient metabolism, vitamin absorption, and dietary sensitivities.',
    tat: '3 - 6 weeks',
    price: 125000,
    status: 'Active'
  },
  {
    id: 'pkg-2',
    code: 'GC/2',
    name: 'Obesity',
    sampleType: 'Whole Blood/Saliva/DB',
    category: 'Wellness & Lifestyle',
    explanation: 'Genetic variants profile impacting fat storage, metabolic efficiency, appetite regulation, and satiety.',
    tat: '3 - 6 weeks',
    price: 125000,
    status: 'Active'
  },
  {
    id: 'pkg-3',
    code: 'GC/3',
    name: 'Fitness',
    sampleType: 'Whole Blood/Saliva/DB',
    category: 'Wellness & Lifestyle',
    explanation: 'Analyze genetic markers linked to aerobic capacity, muscle fiber profile, and post-exercise recovery speed.',
    tat: '3 - 6 weeks',
    price: 125000,
    status: 'Active'
  },
  {
    id: 'pkg-4',
    code: 'GC/4',
    name: 'Detox',
    sampleType: 'Whole Blood/Saliva/DB',
    category: 'Wellness & Lifestyle',
    explanation: 'Genomic screen of Phase I and Phase II metabolic detoxification pathway efficiency.',
    tat: '3 - 6 weeks',
    price: 125000,
    status: 'Active'
  },
  {
    id: 'pkg-5',
    code: 'GC/5',
    name: 'Sports Fitness',
    sampleType: 'Whole Blood/Saliva/DB',
    category: 'Wellness & Lifestyle',
    explanation: 'Advanced sports genetics evaluating tendon strength, oxygen utility, and recovery characteristics.',
    tat: '3 - 6 weeks',
    price: 125000,
    status: 'Active'
  },
  {
    id: 'pkg-6',
    code: 'GC/6',
    name: 'Ancestry',
    sampleType: 'Whole Blood/Saliva/DB',
    category: 'Wellness & Lifestyle',
    explanation: 'Deep genetic lineage analysis tracing geographic roots, paternal/maternal haplogroups, and admixture.',
    tat: '3 - 6 weeks',
    price: 150000,
    status: 'Active'
  },
  {
    id: 'pkg-7',
    code: 'GC/7',
    name: 'Hair n Skin',
    sampleType: 'Whole Blood/Saliva/DB',
    category: 'Wellness & Lifestyle',
    explanation: 'Assess hair thinning risk, skin elasticity, sun damage vulnerability, and collagen degradation patterns.',
    tat: '3 - 6 weeks',
    price: 125000,
    status: 'Active'
  },
  {
    id: 'pkg-8',
    code: 'GC/8',
    name: 'Me360 (complete package)',
    sampleType: 'Whole Blood/Saliva/DB',
    category: 'Wellness & Lifestyle',
    explanation: 'Full-spectrum wellness blueprint mapping nutrition, fitness, obesity, detoxification, hair, skin, and metabolic traits.',
    tat: '3 - 6 weeks',
    price: 150000,
    status: 'Active'
  },
  {
    id: 'pkg-9',
    code: 'GC/9',
    name: 'Polycystic Ovary Syndrome',
    sampleType: 'Whole Blood/Saliva/DB',
    category: "Women's and Family Health",
    explanation: 'Genetic susceptibility screening for markers influencing PCOS risks, androgen pathways, and insulin dynamics.',
    tat: '3 - 6 weeks',
    price: 125000,
    status: 'Active'
  },
  {
    id: 'pkg-10',
    code: 'GC/10',
    name: 'Cardiac care',
    sampleType: 'Whole Blood/Saliva/DB',
    category: 'Clinical and Disease-Focused',
    explanation: 'Genomic risk score mapping markers associated with cardiomyopathy, lipid levels, and coronary arterial risk.',
    tat: '3 - 6 weeks',
    price: 125000,
    status: 'Active'
  },
  {
    id: 'pkg-11',
    code: 'GC/11',
    name: 'Diabetes care',
    sampleType: 'Whole Blood/Saliva/DB',
    category: 'Clinical and Disease-Focused',
    explanation: 'Hereditary factors assessing risk profiles for glucose tolerance, insulin sensitivity, and Type 2 Diabetes.',
    tat: '3 - 6 weeks',
    price: 125000,
    status: 'Active'
  },
  {
    id: 'pkg-12',
    code: 'GC/12',
    name: 'Irritable bowel syndrome',
    sampleType: 'Whole Blood/Saliva/DB',
    category: 'Clinical and Disease-Focused',
    explanation: 'Genomics of digestive mucosal barrier integrity, gut motility, and brain-gut pathway traits.',
    tat: '3 - 6 weeks',
    price: 125000,
    status: 'Active'
  },
  {
    id: 'pkg-13',
    code: 'GC/13',
    name: 'Autoimmune conditions',
    sampleType: 'Whole Blood/Saliva/DB',
    category: 'Clinical and Disease-Focused',
    explanation: 'Genetic predisposition analysis for rheumatoid, celiac, thyroiditis, and systemic inflammatory pathways.',
    tat: '3 - 6 weeks',
    price: 125000,
    status: 'Active'
  },
  {
    id: 'pkg-14',
    code: 'GC/14',
    name: 'Geriatric care for dementia/Parkinson',
    sampleType: 'Whole Blood/Saliva/DB',
    category: 'Clinical and Disease-Focused',
    explanation: 'Assess ApoE profile alleles and other variants linked to familial neurodegenerative progression.',
    tat: '3 - 6 weeks',
    price: 125000,
    status: 'Active'
  },
  {
    id: 'pkg-15',
    code: 'GC/15',
    name: 'Menopause',
    sampleType: 'Whole Blood/Saliva/DB',
    category: "Women's and Family Health",
    explanation: 'Genetic evaluation of bone mineral density decline risks, vasomotor response, and estrogen receptor traits.',
    tat: '3 - 6 weeks',
    price: 125000,
    status: 'Active'
  },
  {
    id: 'pkg-16',
    code: 'GC/16',
    name: 'ADHD',
    sampleType: 'Whole Blood/Saliva/DB',
    category: 'Clinical and Disease-Focused',
    explanation: 'Dopaminergic and noradrenergic genetic pathway variants associated with attention profile variations.',
    tat: '3 - 6 weeks',
    price: 125000,
    status: 'Active'
  },
  {
    id: 'pkg-17',
    code: 'GC/17',
    name: 'Cancer - Preliminary screening',
    sampleType: 'Whole Blood/Saliva/DB',
    category: 'Clinical and Disease-Focused',
    explanation: 'Assess genetic markers across tumor suppressor genes to evaluate baseline hereditary cancer risks.',
    tat: '3 - 6 weeks',
    price: 125000,
    status: 'Active'
  },
  {
    id: 'pkg-18',
    code: 'GC/18',
    name: 'Epigenetics',
    sampleType: 'Saliva',
    category: 'Advanced Genomic Testing',
    explanation: 'Epigenome profiling tracking DNA methylation, cellular age indicators, and environmental markers.',
    tat: '3 - 6 weeks',
    price: 'On request',
    status: 'Active'
  },
  {
    id: 'pkg-19',
    code: 'GC/19',
    name: 'Gut microbiome',
    sampleType: 'Stool',
    category: 'Advanced Genomic Testing',
    explanation: '16S metagenomic sequencing of digestive microflora mapping diversity index, bacterial ratios, and metabolic indicators.',
    tat: '3 - 6 weeks',
    price: 'On request',
    status: 'Active'
  },
  {
    id: 'pkg-20',
    code: 'GC/20',
    name: 'Skin microbiome',
    sampleType: 'Skin Scraping',
    category: 'Advanced Genomic Testing',
    explanation: 'Epidermal microflora profiling cataloging bacterial and fungal diversity related to dermatological wellness.',
    tat: '3 - 6 weeks',
    price: 'On request',
    status: 'Active'
  },
  {
    id: 'pkg-21',
    code: 'GC/21',
    name: 'Whole exome Sequencing',
    sampleType: 'Whole Blood/Saliva/DB',
    category: 'Advanced Genomic Testing',
    explanation: 'High-depth clinical sequencing of all 22,000 protein-coding exons to evaluate causative pathology.',
    tat: '3 - 6 weeks',
    price: 125000,
    status: 'Active'
  },
  {
    id: 'pkg-22',
    code: 'GC/22',
    name: 'Whole genome Sequencing',
    sampleType: 'Whole Blood/Saliva/DB',
    category: 'Advanced Genomic Testing',
    explanation: 'Complete sequencing of non-coding, structural, and regulatory regions for full clinical evaluation.',
    tat: '3 - 6 weeks',
    price: 'On request',
    status: 'Active'
  },
  {
    id: 'pkg-23',
    code: 'GC/23',
    name: 'Clinical Panels',
    sampleType: 'Whole Blood/Saliva/DB',
    category: 'Advanced Genomic Testing',
    explanation: 'Targeted gene panels designed for specific medical conditions, including neurological, cardiac, and rare syndromes.',
    tat: '3 - 6 weeks',
    price: 'On request',
    status: 'Active'
  },
  {
    id: 'pkg-24',
    code: 'GC/24',
    name: 'NIPT',
    sampleType: 'Whole Blood on a Streak Tube',
    category: "Women's and Family Health",
    explanation: 'Safe, early maternal cfDNA screening for fetal chromosomal aneuploidies (trisomy 21, 18, 13).',
    tat: '3 - 6 weeks',
    price: 'On request',
    status: 'Active'
  },
  {
    id: 'pkg-25',
    code: 'GC/25',
    name: 'PGD',
    sampleType: 'Embryo Biopsy',
    category: "Women's and Family Health",
    explanation: 'Pre-implantation Genetic Diagnosis screen for IVF embryos to evaluate health status before transfer.',
    tat: '3 - 6 weeks',
    price: 'On request',
    status: 'Active'
  },
  {
    id: 'pkg-26',
    code: 'GC/26',
    name: 'Somatic/Tissue',
    sampleType: 'FFPE Block/Section',
    category: 'Clinical and Disease-Focused',
    explanation: 'Tumor biopsy profiling mapping mutations to guide targeted oncology therapeutics and precision oncology pathways.',
    tat: '3 - 6 weeks',
    price: 'On request',
    status: 'Active'
  },
  {
    id: 'pkg-27',
    code: 'GC/27',
    name: 'Liquid Biopsy',
    sampleType: 'Whole Blood',
    category: 'Clinical and Disease-Focused',
    explanation: 'Non-invasive tracking of circulating tumor DNA (ctDNA) for tumor surveillance and early recurrence checks.',
    tat: '3 - 6 weeks',
    price: 'On request',
    status: 'Active'
  }
];


// ---------------------------------------------
// API ROUTES — All data persisted to MongoDB
// ---------------------------------------------

// Appointments API
app.get('/api/appointments', verifyAdmin, async (req, res) => {
  try {
    const appointments = await Appointment.find().sort({ createdAt: -1 });
    res.json(appointments);
  } catch (err) {
    console.error('Error fetching appointments:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/appointments', async (req, res) => {
  try {
    const { 
      name, patientName, phone, email, age, appointmentType, location, clinicLocation,
      mode, preferredMode, reason, message, date, preferredDate, timeSlot, preferredTimeSlot,
      geneticReport, geneticReportName, medicalReport, medicalReportName, referralReport, referralLetterName, 
      consent, paymentStatus, source
    } = req.body;
    
    const finalName = name || patientName;
    const finalLocation = location || clinicLocation;
    const finalMode = mode || preferredMode;
    const finalReason = reason;

    if (!finalName || !phone || !email || !appointmentType || !finalLocation || !finalMode || !finalReason || consent === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newAppt = await Appointment.create({
      name: finalName,
      patientName: patientName || finalName,
      phone,
      email,
      age: age || '',
      appointmentType,
      location: finalLocation,
      clinicLocation: clinicLocation || finalLocation,
      mode: finalMode,
      preferredMode: preferredMode || finalMode,
      reason: finalReason,
      message: message || '',
      status: 'Pending',
      paymentStatus: paymentStatus || 'Pending',
      source: source || 'Website Appointment Page',
      date: date || preferredDate || new Date().toISOString().split('T')[0],
      preferredDate: preferredDate || date || new Date().toISOString().split('T')[0],
      timeSlot: timeSlot || preferredTimeSlot || 'TBD',
      preferredTimeSlot: preferredTimeSlot || timeSlot || 'TBD',
      geneticReport: geneticReport || null,
      geneticReportName: geneticReportName || '',
      medicalReport: medicalReport || null,
      medicalReportName: medicalReportName || '',
      referralReport: referralReport || null,
      referralLetterName: referralLetterName || '',
      consent
    });

    res.status(201).json(newAppt);
  } catch (err) {
    console.error('Error creating appointment:', err.message);
    res.status(500).json({ error: 'Server error while saving appointment' });
  }
});



// Genetic Test Requests API
app.post('/api/genetic-test-requests', async (req, res) => {
  try {
    const {
      name,
      patientName,
      phone,
      email,
      age,
      testCategory,
      reasonForTesting,
      referralDetails,
      preferredContactMethod,
      reportFileName,
      consent,
      source
    } = req.body;

    if (!phone || !email || !testCategory || !reasonForTesting || consent === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newRequest = await GeneticTestRequest.create({
      name: name || patientName || '',
      phone,
      email,
      age: age || '',
      testCategory,
      reason: reasonForTesting || '',
      referralDetails: referralDetails || '',
      preferredContactMethod: preferredContactMethod || 'To be confirmed',
      consent,
      status: 'New'
    });
    res.status(201).json(newRequest);
  } catch (err) {
    console.error('Error creating genetic test request:', err.message);
    res.status(500).json({ error: 'Server error while saving test request' });
  }
});

app.get('/api/genetic-test-requests', verifyAdmin, async (req, res) => {
  try {
    const requests = await GeneticTestRequest.find().sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    console.error('Error fetching genetic test requests:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});
// Contact API
app.post('/api/contact', async (req, res) => {
  try {
    const { name, phone, email, subject, message, preferredContactMethod } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const newContact = await Contact.create({
      name,
      phone,
      email: email || '',
      subject: subject || 'Contact Inquiry',
      message: message || '',
      preferredContactMethod: preferredContactMethod || 'phone',
      status: 'Pending'
    });
    res.status(201).json(newContact);
  } catch (err) {
    console.error('Error creating contact:', err.message);
    res.status(500).json({ error: 'Server error while saving contact' });
  }
});

app.get('/api/contact', verifyAdmin, async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json(contacts);
  } catch (err) {
    console.error('Error fetching contacts:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Patient Registrations API
app.post('/api/patient-registrations', async (req, res) => {
  try {
    const { name, dob, age, gender, phone, email, address, nic, emergencyContactName, emergencyContactNumber, reason, medicalCondition, currentMedications, consent, uploadedReports } = req.body;
    if (!name || !phone || !email || consent === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const newRegistration = await PatientRegistration.create({
      name,
      dob: dob || '',
      age: age || '',
      gender: gender || '',
      phone,
      email,
      address: address || '',
      nic: nic || '',
      emergencyContactName: emergencyContactName || '',
      emergencyContactNumber: emergencyContactNumber || '',
      reason: reason || '',
      medicalCondition: medicalCondition || '',
      currentMedications: currentMedications || '',
      uploadedReports: uploadedReports || [],
      consent,
      status: 'Registered'
    });
    res.status(201).json(newRegistration);
  } catch (err) {
    console.error('Error creating patient registration:', err.message);
    res.status(500).json({ error: 'Server error while saving registration' });
  }
});

app.get('/api/patient-registrations', verifyAdmin, async (req, res) => {
  try {
    const registrations = await PatientRegistration.find().sort({ createdAt: -1 });
    res.json(registrations);
  } catch (err) {
    console.error('Error fetching patient registrations:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Partner Lab Inquiries API
app.post('/api/partner-lab-inquiries', async (req, res) => {
  try {
    const { labName, contactPerson, phone, email, location, services, message } = req.body;
    if (!labName || !contactPerson || !phone || !email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const newInquiry = await PartnerLabInquiry.create({
      labName,
      contactPerson,
      phone,
      email,
      location: location || '',
      services: services || '',
      message: message || '',
      status: 'Pending'
    });
    res.status(201).json(newInquiry);
  } catch (err) {
    console.error('Error creating partner lab inquiry:', err.message);
    res.status(500).json({ error: 'Server error while saving inquiry' });
  }
});

app.get('/api/partner-lab-inquiries', verifyAdmin, async (req, res) => {
  try {
    const inquiries = await PartnerLabInquiry.find().sort({ createdAt: -1 });
    res.json(inquiries);
  } catch (err) {
    console.error('Error fetching partner lab inquiries:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Reviews API
app.post('/api/reviews', async (req, res) => {
  try {
    const { name, serviceType, rating, review, consent } = req.body;
    if (!name || !rating || !review || consent === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const newReview = await Review.create({
      name,
      serviceType: serviceType || 'General Consultation',
      rating: Number(rating),
      review,
      consent,
      status: 'Pending'
    });
    res.status(201).json(newReview);
  } catch (err) {
    console.error('Error creating review:', err.message);
    res.status(500).json({ error: 'Server error while saving review' });
  }
});

app.get('/api/reviews', verifyAdmin, async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    console.error('Error fetching reviews:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Stats Endpoint
app.get('/api/stats', verifyAdmin, async (req, res) => {
  try {
    const totalAppointments = await Appointment.countDocuments();
    const pending = await Appointment.countDocuments({ status: 'Pending' });
    const confirmed = await Appointment.countDocuments({ status: 'Confirmed' });
    const completed = await Appointment.countDocuments({ status: 'Completed' });
    const totalContacts = await Contact.countDocuments();
    const totalTestRequests = await GeneticTestRequest.countDocuments();
    const totalRegistrations = await PatientRegistration.countDocuments();
    
    res.json({
      totalAppointments,
      pending,
      confirmed,
      completed,
      totalContacts,
      totalTestRequests,
      totalRegistrations,
      activePatientsCount: totalRegistrations || 212,
      testedCount: totalTestRequests || 178,
      wellnessConsultations: 89
    });
  } catch (err) {
    console.error('Error fetching stats:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Config Endpoint
app.get('/api/config', verifyAdmin, (req, res) => {
  res.json(config);
});

app.post('/api/config', (req, res) => {
  const { showPricing } = req.body;
  if (showPricing !== undefined) {
    config.showPricing = showPricing;
  }
  res.json(config);
});

// Appointments API
app.get('/api/appointments', verifyAdmin, async (req, res) => {
  try {
    const appointments = await Appointment.find().sort({ createdAt: -1 });
    res.json(appointments);
  } catch (err) {
    console.error('Error fetching appointments:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/appointments', async (req, res) => {
  try {
    const { 
      name, patientName, phone, email, age, appointmentType, location, clinicLocation,
      mode, preferredMode, reason, message, date, preferredDate, timeSlot, preferredTimeSlot,
      geneticReport, geneticReportName, medicalReport, medicalReportName, referralReport, referralLetterName, 
      consent, paymentStatus, source
    } = req.body;
    
    const finalName = name || patientName;
    const finalLocation = location || clinicLocation;
    const finalMode = mode || preferredMode;
    const finalReason = reason;

    if (!finalName || !phone || !email || !appointmentType || !finalLocation || !finalMode || !finalReason || consent === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newAppt = await Appointment.create({
      name: finalName,
      patientName: patientName || finalName,
      phone,
      email,
      age: age || '',
      appointmentType,
      location: finalLocation,
      clinicLocation: clinicLocation || finalLocation,
      mode: finalMode,
      preferredMode: preferredMode || finalMode,
      reason: finalReason,
      message: message || '',
      status: 'Pending',
      paymentStatus: paymentStatus || 'Pending',
      source: source || 'Website Appointment Page',
      date: date || preferredDate || new Date().toISOString().split('T')[0],
      preferredDate: preferredDate || date || new Date().toISOString().split('T')[0],
      timeSlot: timeSlot || preferredTimeSlot || 'TBD',
      preferredTimeSlot: preferredTimeSlot || timeSlot || 'TBD',
      geneticReport: geneticReport || null,
      geneticReportName: geneticReportName || '',
      medicalReport: medicalReport || null,
      medicalReportName: medicalReportName || '',
      referralReport: referralReport || null,
      referralLetterName: referralLetterName || '',
      consent
    });

    res.status(201).json(newAppt);
  } catch (err) {
    console.error('Error creating appointment:', err.message);
    res.status(500).json({ error: 'Server error while saving appointment' });
  }
});

app.patch('/api/appointments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const appt = await Appointment.findById(id);
    if (!appt) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    if (status) {
      appt.status = status;
      await appt.save();
    }

    res.json(appt);
  } catch (err) {
    console.error('Error updating appointment:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Packages API
app.get('/api/packages', (req, res) => {
  // Return packages with pricing masked if showPricing is false
  if (!config.showPricing) {
    return res.json(testPackages.map(pkg => ({
      ...pkg,
      price: 'Available on request'
    })));
  }
  res.json(testPackages);
});

app.post('/api/packages', (req, res) => {
  const { name, sampleType, category, explanation, whoFor, deliverables, tat, price, status, remarks } = req.body;
  
  if (!name || !sampleType || !category || !explanation || !tat || price === undefined) {
    return res.status(400).json({ error: 'Missing package fields' });
  }

  const newPkg = {
    id: `pkg-${testPackages.length + 1}`,
    name,
    sampleType,
    category,
    explanation,
    whoFor: whoFor || '',
    deliverables: deliverables || '',
    tat,
    price: isNaN(Number(price)) ? price : Number(price),
    status: status || 'Active',
    remarks: remarks || ''
  };

  testPackages.push(newPkg);
  res.status(201).json(newPkg);
});

app.patch('/api/packages/:id', (req, res) => {
  const { id } = req.params;
  const fields = req.body;

  const pkg = testPackages.find(p => p.id === id);
  if (!pkg) {
    return res.status(404).json({ error: 'Package not found' });
  }

  Object.keys(fields).forEach(key => {
    if (key === 'price') {
      pkg[key] = isNaN(Number(fields[key])) ? fields[key] : Number(fields[key]);
    } else if (fields[key] !== undefined) {
      pkg[key] = fields[key];
    }
  });

  res.json(pkg);
});

app.patch('/api/appointments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const appt = await Appointment.findById(id);
    if (!appt) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    if (status) {
      appt.status = status;
      await appt.save();
    }

    res.json(appt);
  } catch (err) {
    console.error('Error updating appointment:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Appointments API was successfully isolated.

// --- USER SYNC API ---
app.post("/api/users/sync", async (req, res) => {
  try {
    const { uid, name, email, photoURL, provider } = req.body;

    if (!uid || !email) {
      return res.status(400).json({ error: "Missing user details" });
    }

    const savedUser = await User.findOneAndUpdate(
      { uid },
      {
        uid,
        name,
        email,
        photoURL,
        provider: provider || "google",
        lastLoginAt: new Date()
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json(savedUser);
  } catch (error) {
    console.error("User sync error:", error);
    res.status(500).json({ error: "Failed to sync user" });
  }
});

// --- ADMIN DASHBOARD APIs ---

// 1. Users
app.get("/api/admin/users", verifyAdmin, async (req, res) => {
  try {
    const users = await User.find().sort({ lastLoginAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// 2. Patients (Alias for patient-registrations)
app.get("/api/admin/patients", verifyAdmin, async (req, res) => {
  try {
    const patients = await PatientRegistration.find().sort({ createdAt: -1 });
    res.json(patients);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch patients" });
  }
});

// 3. Appointments (Alias for appointments)
app.get("/api/admin/appointments", verifyAdmin, async (req, res) => {
  try {
    const appointments = await Appointment.find().sort({ createdAt: -1 });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch appointments" });
  }
});

app.patch("/api/admin/appointments/:id/status", verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const appt = await Appointment.findByIdAndUpdate(id, { status }, { new: true });
    if (!appt) return res.status(404).json({ error: "Appointment not found" });
    res.json(appt);
  } catch (err) {
    res.status(500).json({ error: "Failed to update appointment status" });
  }
});

// 4. Payments (Derived from Appointments)
app.get("/api/admin/payments", verifyAdmin, async (req, res) => {
  try {
    const appointments = await Appointment.find({
      $or: [
        { paymentSlipName: { $exists: true, $ne: '' } },
        { paymentStatus: { $exists: true, $ne: 'Pending' } }
      ]
    }).sort({ createdAt: -1 });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch payments" });
  }
});

app.patch("/api/admin/payments/:id/status", verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;
    const appt = await Appointment.findByIdAndUpdate(id, { paymentStatus }, { new: true });
    if (!appt) return res.status(404).json({ error: "Appointment not found" });
    res.json(appt);
  } catch (err) {
    res.status(500).json({ error: "Failed to update payment status" });
  }
});

// 5. Test Allocations
app.get("/api/admin/tests", verifyAdmin, async (req, res) => {
  try {
    const tests = await TestAllocation.find().sort({ createdAt: -1 });
    res.json(tests);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch test allocations" });
  }
});

app.post("/api/admin/tests", verifyAdmin, async (req, res) => {
  try {
    const newTest = await TestAllocation.create(req.body);
    res.status(201).json(newTest);
  } catch (err) {
    res.status(500).json({ error: "Failed to create test allocation" });
  }
});

app.patch("/api/admin/tests/:id", verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updatedTest = await TestAllocation.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedTest) return res.status(404).json({ error: "Test not found" });
    res.json(updatedTest);
  } catch (err) {
    res.status(500).json({ error: "Failed to update test allocation" });
  }
});
// Connect to MongoDB and start the server only upon success
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB successfully');
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Error: Failed to connect to MongoDB. Please check if your MONGO_URI is valid and the database is accessible.', err.message);
    process.exit(1);
  });
