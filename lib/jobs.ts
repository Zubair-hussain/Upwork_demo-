export type Bid = {
  id: string;
  freelancer: string;
  headline: string;
  connectsSpent: number;
  rate: string;
  fitSignal: "Strong" | "Medium" | "Risk";
};

export type Job = {
  id: string;
  title: string;
  postedAgo: string;
  connectsRequired: 5 | 10 | 30;
  budget: string;
  level: "Intermediate" | "Expert";
  category: "Full Stack" | "AI Engineering" | "n8n Automation";
  summary: string;
  skills: string[];
  questions: string[];
  postGuide: string[];
  bids: Bid[];
  client: {
    country: string;
    city: string;
    localTime: string;
    rating: string;
    reviews: number;
    jobsPosted: number;
    hireRate: string;
    openJobs: number;
    totalSpent: string;
    hires: number;
    activeHires: number;
    paymentVerified: boolean;
    phoneVerified: boolean;
  };
};

const bidderNames = [
  "Ayesha Khan",
  "Michael Reed",
  "Sara Nolan",
  "Bilal Ahmed",
  "Nina Park",
  "Omar Dev",
  "Elena Torres"
];

function makeBids(jobId: string, premiumIndex: number): Bid[] {
  return bidderNames.map((name, index) => ({
    id: `${jobId}-bid-${index + 1}`,
    freelancer: name,
    headline:
      index === premiumIndex
        ? "Spent heavily to stand out with a deep technical plan"
        : index % 2 === 0
          ? "Relevant portfolio and clear delivery milestones"
          : "Fast availability with concise proposal",
    connectsSpent: index === premiumIndex ? 112 + index * 9 : [7, 12, 18, 24, 31, 42, 55][index],
    rate: ["$35/hr", "$48/hr", "$55/hr", "$28/hr", "$62/hr", "$40/hr", "$70/hr"][index],
    fitSignal: index === premiumIndex || index === 2 ? "Strong" : index === 4 ? "Risk" : "Medium"
  }));
}

function makeClient(index: number): Job["client"] {
  const clients: Job["client"][] = [
    {
      country: "United Kingdom",
      city: "Belfast",
      localTime: "12:53 PM",
      rating: "5.00",
      reviews: 322,
      jobsPosted: 357,
      hireRate: "93%",
      openJobs: 41,
      totalSpent: "$15K+",
      hires: 351,
      activeHires: 15,
      paymentVerified: true,
      phoneVerified: true
    },
    {
      country: "United States",
      city: "Austin",
      localTime: "6:53 AM",
      rating: "4.89",
      reviews: 84,
      jobsPosted: 98,
      hireRate: "76%",
      openJobs: 8,
      totalSpent: "$25K+",
      hires: 73,
      activeHires: 4,
      paymentVerified: true,
      phoneVerified: false
    },
    {
      country: "Canada",
      city: "Toronto",
      localTime: "7:53 AM",
      rating: "4.72",
      reviews: 29,
      jobsPosted: 45,
      hireRate: "61%",
      openJobs: 5,
      totalSpent: "$8K+",
      hires: 24,
      activeHires: 2,
      paymentVerified: false,
      phoneVerified: true
    }
  ];

  return clients[index % clients.length];
}

export const jobs: Job[] = [
  {
    id: "full-stack-ai-dashboard",
    title: "Build a Full Stack AI Operations Dashboard",
    postedAgo: "38 minutes ago",
    connectsRequired: 10,
    budget: "$2,400 fixed",
    level: "Expert",
    category: "Full Stack",
    summary:
      "Create a secure Next.js dashboard that tracks prompts, AI tasks, users, billing states, and admin review decisions.",
    skills: ["Next.js", "TypeScript", "PostgreSQL", "Auth", "AI SDK"],
    questions: [
      "What is your name?",
      "Describe the safest auth pattern you would use for this dashboard.",
      "How would you prevent a slow AI call from blocking the UI?"
    ],
    postGuide: [
      "Lead with one similar dashboard you have shipped.",
      "Mention how you handle role-based access and audit logs.",
      "Explain your testing plan before discussing timeline."
    ],
    bids: makeBids("full-stack-ai-dashboard", 1),
    client: makeClient(0)
  },
  {
    id: "n8n-lead-router",
    title: "n8n Lead Routing Workflow With CRM Sync",
    postedAgo: "1 hour ago",
    connectsRequired: 5,
    budget: "$950 fixed",
    level: "Intermediate",
    category: "n8n Automation",
    summary:
      "Design an n8n workflow that qualifies inbound leads, enriches company data, routes hot leads, and alerts sales.",
    skills: ["n8n", "HubSpot", "Webhooks", "JavaScript", "Slack"],
    questions: [
      "What is your name?",
      "Which n8n error handling pattern do you trust most?",
      "How would you retry failed CRM updates without duplicates?"
    ],
    postGuide: [
      "Include a small workflow diagram in your proposal.",
      "Call out idempotency and logging.",
      "Share one workflow where you reduced manual work."
    ],
    bids: makeBids("n8n-lead-router", 5),
    client: makeClient(1)
  },
  {
    id: "rag-agent-api",
    title: "AI Engineer Needed for RAG Agent API",
    postedAgo: "1 hour ago",
    connectsRequired: 30,
    budget: "$4,800 fixed",
    level: "Expert",
    category: "AI Engineering",
    summary:
      "Build a retrieval augmented API that ingests documents, ranks chunks, answers with citations, and exposes evaluation metrics.",
    skills: ["RAG", "Vector DB", "Python", "OpenAI", "Eval Pipelines"],
    questions: [
      "What is your name?",
      "How do you measure retrieval quality before launch?",
      "What is your fallback when the model cannot cite a source?"
    ],
    postGuide: [
      "Give a concrete retrieval evaluation method.",
      "Mention chunking, reranking, and citation checks.",
      "Do not overpromise autonomous behavior without guardrails."
    ],
    bids: makeBids("rag-agent-api", 0),
    client: makeClient(2)
  },
  {
    id: "saas-admin-portal",
    title: "Full Stack SaaS Admin Portal Cleanup",
    postedAgo: "2 hours ago",
    connectsRequired: 10,
    budget: "$1,700 fixed",
    level: "Intermediate",
    category: "Full Stack",
    summary:
      "Improve a SaaS admin portal with cleaner tables, billing views, permissions, and reliable acceptance tests.",
    skills: ["React", "Next.js", "Prisma", "Playwright", "Stripe"],
    questions: [
      "What is your name?",
      "How do you protect admin-only billing screens?",
      "Which acceptance tests would you write first?"
    ],
    postGuide: [
      "Reference table-heavy product work.",
      "Explain how you avoid breaking existing flows.",
      "Share how you report progress to nontechnical clients."
    ],
    bids: makeBids("saas-admin-portal", 6),
    client: makeClient(3)
  },
  {
    id: "ai-support-triage",
    title: "AI Support Triage System for Tickets",
    postedAgo: "2 hours ago",
    connectsRequired: 5,
    budget: "$1,250 fixed",
    level: "Expert",
    category: "AI Engineering",
    summary:
      "Classify support tickets, draft safe replies, detect urgency, and hand off uncertain cases to human reviewers.",
    skills: ["LLM Workflows", "Classification", "Node.js", "Queues", "QA"],
    questions: [
      "What is your name?",
      "How would you stop unsafe support replies from being sent?",
      "What data do you need to evaluate the classifier?"
    ],
    postGuide: [
      "Describe human review and confidence thresholds.",
      "Mention queueing and observability.",
      "Show care for edge cases and customer tone."
    ],
    bids: makeBids("ai-support-triage", 3),
    client: makeClient(4)
  },
  {
    id: "n8n-invoice-agent",
    title: "n8n Invoice Automation With AI Extraction",
    postedAgo: "3 hours ago",
    connectsRequired: 5,
    budget: "$1,100 fixed",
    level: "Intermediate",
    category: "n8n Automation",
    summary:
      "Extract invoice details with AI, validate fields, push records to accounting software, and flag uncertain invoices.",
    skills: ["n8n", "OCR", "AI Extraction", "QuickBooks", "Validation"],
    questions: [
      "What is your name?",
      "How would you validate AI-extracted invoice totals?",
      "What should happen when confidence is low?"
    ],
    postGuide: [
      "Show an example of structured extraction.",
      "Include validation rules and manual review steps.",
      "Be clear about integrations you have used."
    ],
    bids: makeBids("n8n-invoice-agent", 4),
    client: makeClient(5)
  },
  {
    id: "workflow-marketplace",
    title: "Full Stack Marketplace for Automation Templates",
    postedAgo: "4 hours ago",
    connectsRequired: 10,
    budget: "$3,200 fixed",
    level: "Expert",
    category: "Full Stack",
    summary:
      "Create a marketplace where users browse n8n and AI workflow templates, preview steps, purchase, and install.",
    skills: ["Next.js", "Payments", "n8n", "AI UX", "Search"],
    questions: [
      "What is your name?",
      "How would you model reusable workflow templates?",
      "How do you keep purchased template installation secure?"
    ],
    postGuide: [
      "Talk through data models and install permissions.",
      "Mention search, previews, and versioning.",
      "Share one marketplace or template product example."
    ],
    bids: makeBids("workflow-marketplace", 2),
    client: makeClient(6)
  }
];

export const totalConnectsRequired = jobs.reduce((sum, job) => sum + job.connectsRequired, 0);
export const startingConnects = 75;

export function getJobById(id: string) {
  return jobs.find((job) => job.id === id);
}
