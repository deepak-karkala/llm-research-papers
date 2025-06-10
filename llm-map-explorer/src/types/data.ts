// src/types/data.ts

export interface MapFeature {
  id: string; // unique identifier
  name: string; // e.g., "Reasoning Continent," "RLHF Island," "Attention Is All You Need Lighthouse"
  type: "capability" | "landmark_paper" | "foundational_model" | "key_tool" | "benchmark_site" | "continent" | "archipelago" | "island" | "strait" | "harbor"; // Extended type
  description: string; // Concise explanation or summary
  details?: string; // Longer description, abstract, key takeaways, authors, publication date, link, etc. (especially for landmarks)
  mapCoordinates: string | number[][]; // GeoJSON-like coordinates (string for now, can be parsed to number[][] later) or simple point [lat,lng]
  visualStyleHints?: string; // e.g., "mountainous," "tropical," "technological_glow"
  iconType?: string; // e.g., "lighthouse," "ship_icon," "factory_icon", "default_marker"
  parentRegionID?: string; // ID of the parent island/continent if applicable
  relatedConceptsIDs?: string[]; // Links to other related islands/capabilities
  tags?: string[]; // For future search/filtering
  organizationID?: string; // For models or papers linked to an org
  modelIDs?: string[]; // For organizations or papers linked to models
}

export interface Organization {
  id: string; // unique identifier
  name: string; // e.g., "OpenAI," "Google DeepMind," "Meta AI"
  description?: string; // Brief overview of the organization's role
  logoURL?: string; // Optional
  websiteURL?: string;
  associatedModelIDs?: string[]; // List of model IDs they've "built"
  associatedPaperIDs?: string[]; // List of landmark IDs (papers) they've contributed to
}

export interface Model {
  id: string; // unique identifier
  name: string; // e.g., "GPT-4," "LLaMA 3 70B," "Claude 3 Opus"
  organizationID?: string; // Who "built" it (links to Organization id)
  description: string; // Key features, parameter size, core capabilities
  releaseDate?: string; // YYYY-MM-DD or YYYY-MM
  modelCardURL?: string;
  announcementURL?: string;
  capabilitiesIDs?: string[]; // Links to MapFeature ids (capabilities it's strong in)
  trainingPipelineID?: string; // Links to a specific SeaRoute id
  iconStyle?: string; // e.g., "galleon," "frigate," "research_vessel"
}

interface SeaRouteStage {
  stageID: number | string;
  stageName: string; // e.g., "SFT Fine-Tuning," "RLHF Alignment"
  description: string; // What happens at this stage, its purpose
  islandID: string; // The MapFeature id (island) this stage corresponds to
  shipTransformationDescription?: string; // Text describing the "upgrade"
  shipTransformationIconChange?: string; // Hint for visual change
  keyLandmarkIDs?: string[]; // MapFeature ids (papers/tools) relevant to this stage
  order: number; // Sequence in the route
}

export interface SeaRoute {
  id:string; // unique identifier
  routeName: string; // e.g., "The Quest for a Reasoning Model"
  description: string; // Overview of this training pipeline's goal
  startPointDescription?: string; // e.g., "Starting with raw web data..."
  endPointCapabilityID?: string; // The target MapFeature id (capability/island)
  stages: SeaRouteStage[];
}

export interface TimelineEvent {
  id: string; // unique identifier
  eventName: string; // e.g., "Launch of GPT-3," "Discovery of RLHF Archipelago"
  date: string; // YYYY-MM-DD or YYYY-MM
  description: string; // Impact and significance of this event
  type: "model_launch" | "technique_paper" | "benchmark_result" | "organization_milestone" | "other";
  associatedModelIDs?: string[];
  associatedOrganizationIDs?: string[];
  associatedLandmarkIDs?: string[]; // Papers
  associatedIslandIDs?: string[]; // Techniques/capabilities (MapFeature ids)
  mapCoordinates?: string | number[]; // Optional, for highlighting a general area
}
