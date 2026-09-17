export interface TelemetryPacket {
  id: string;
  timestamp: string;
  topic: string;
  source: string;
  latencyMs: number;
  payload: Record<string, any>;
  status: "OK" | "ALERT" | "INGESTED" | "SYNCED";
}

export interface MetricTag {
  type: "Source" | "Measured" | "Design target";
  url?: string;
  detail?: string;
}

export interface MetricCardItem {
  label: string;
  value: string;
  subtext: string;
  trend?: string;
  severity?: "neutral" | "warning" | "danger" | "success";
  citationUrl?: string;
  tag?: MetricTag;
}

export interface ArchitectureColumnItem {
  name: string;
  tech: string;
  description: string;
  specs: string[];
}

export interface ArchitectureColumn {
  layerNumber: number;
  title: string;
  subtitle: string;
  throughput: string;
  items: ArchitectureColumnItem[];
}

export interface FeasibilityRow {
  id: string;
  riskCategory: string;
  riskTitle: string;
  riskDescription: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM";
  safeguardTitle: string;
  safeguardDescription: string;
  engineeringImplementation: string;
}

export interface ImpactRow {
  dimension: string;
  statusQuo: string;
  ourSolution: string;
  metricGain: string;
  tag?: MetricTag;
}

export interface ProofOfWorkItem {
  id: "repo" | "api" | "dataset" | "audio";
  title: string;
  subtitle: string;
  badge: string;
  description: string;
  actionText: string;
  url?: string;
  modalType?: "swagger" | "dataset" | "audio";
  icon?: "code" | "database" | "mic";
}

export interface TeamMember {
  name: string;
  operationalRole: string;
  coreDiscipline: string;
  keyContributions: string[];
  github: string;
  linkedin: string;
  initials: string;
}

// ---------------------------------------------------------------------------
// NEW RESEARCH & COMPARATIVE VISUALIZATION INTERFACES
// ---------------------------------------------------------------------------

export interface CompetitivePlatform {
  name: string;
  category: "Chatbot" | "Enterprise" | "Extension" | "E-Commerce" | "Second Brain";
  badge: string;
  whatTheyClaim: string;
  whereTheyFail: string;
  failReason: string;
  howWeOvercome: string;
  isOurSolution?: boolean;
  scoreCard: {
    conflictResolution: boolean;
    deterministicMath: boolean;
    vernacularVoice: boolean;
    vendorNeutral: boolean;
    smallholderOptimized: boolean;
  };
}

export interface ParallelApiItem {
  name: string;
  source: string;
  purpose: string;
  cadence: string;
  protocol: string;
  status: "LIVE" | "PARALLEL" | "FALLBACK";
  sampleOutput: string;
}

export interface ApiCategoryTier {
  categoryNumber: number;
  categoryName: string;
  headline: string;
  description: string;
  apis: {
    name: string;
    provider: string;
    description: string;
    endpoint: string;
    latency: string;
    type: "REST" | "MQTT" | "S3-Zarr" | "WebHook" | "Vector";
    status?: "LIVE_IN_PROTOTYPE" | "SCAFFOLDED_KEY_REQUIRED" | "ENTERPRISE_GATEWAY";
    docUrl?: string;
  }[];
}

export interface ParadigmShift {
  id: string;
  title: string;
  thenState: string;
  nowState: string;
  solutionImpact: string;
  badge: string;
}

export interface ConflictScenario {
  id: string;
  title: string;
  crop: string;
  location: string;
  farmerName: string;
  variables: {
    weatherRisk: string;
    marketPrice: string;
    soilCondition: string;
    laborStatus: string;
  };
  singleBestAction: string;
  actionReasoning: string;
  savedAmount: string;
  audioDialect: string;
}

export interface PersonalizationLayer {
  layerNumber: number;
  title: string;
  subtitle: string;
  staticKnowledge: string;
  personalizationEngine: string;
  mathematicalEquation?: string;
  practicalExample: string;
  iconType: "spatial" | "soil" | "profit" | "labor" | "vernacular";
}

export interface EconomicLossDetail {
  category: string;
  annualLoss: string;
  rootCause: string;
  impactMetrics: string[];
  citation: {
    title: string;
    source: string;
    url: string;
  };
}

// ---------------------------------------------------------------------------
// MASTER PORTAL CONFIGURATION
// ---------------------------------------------------------------------------

export interface PortalConfig {
  id: "weathergpt" | "krishismriti";
  psId: string;
  ministry: string;
  ministryShort: string;
  theme: string;
  teamName: string;
  brandName: string;
  brandTagline: string;
  thesis: string;
  trlStatus: string;
  deployedSolution: {
    label: string;
    url: string;
    badge: string;
    description: string;
  };
  heroVideoId: string; // YouTube video ID (e.g. standard unlisted or demo)
  quickStats: {
    label: string;
    value: string;
    sublabel: string;
    tag?: MetricTag;
  }[];
  telemetry: {
    title: string;
    description: string;
    brokerUrl: string;
    topics: string[];
    packetPool: TelemetryPacket[];
  };
  problem: {
    sectionTitle: string;
    headline: string;
    summary: string;
    metrics: MetricCardItem[];
    economicLossDetails?: EconomicLossDetail[];
    gapComparison: {
      legacyTitle: string;
      legacyPoints: string[];
      solutionTitle: string;
      solutionPoints: string[];
    };
  };
  architecture: {
    sectionTitle: string;
    headline: string;
    summary: string;
    columns: ArchitectureColumn[];
    parallelApis?: ParallelApiItem[];
  };
  feasibility: {
    sectionTitle: string;
    headline: string;
    summary: string;
    rows: FeasibilityRow[];
  };
  impact: {
    sectionTitle: string;
    headline: string;
    summary: string;
    rows: ImpactRow[];
  };
  proofOfWork: {
    sectionTitle: string;
    headline: string;
    summary: string;
    items: ProofOfWorkItem[];
  };
  team: {
    sectionTitle: string;
    headline: string;
    summary: string;
    members: TeamMember[];
  };

  // Optional extended sections
  competitiveMatrix?: {
    sectionTitle: string;
    headline: string;
    summary: string;
    platforms: CompetitivePlatform[];
  };
  apiDirectoryTiers?: ApiCategoryTier[];
  paradigmShifts?: ParadigmShift[];
  conflictScenarios?: ConflictScenario[];
  personalizationLayers?: PersonalizationLayer[];
}
