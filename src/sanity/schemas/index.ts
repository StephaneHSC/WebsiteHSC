import type { SchemaTypeDefinition } from "sanity";
import { teamMember } from "./teamMember";
import { testimonial } from "./testimonial";
import { milestone } from "./milestone";
import { quoteFormConfig } from "./quoteFormConfig";
import { siteStats } from "./siteStats";
import { showcaseItem } from "./showcaseItem";
import { smartTrackingCards } from "./smartTrackingCards";
import { officeLocations } from "./officeLocations";

export const schemaTypes: SchemaTypeDefinition[] = [
  teamMember,
  testimonial,
  milestone,
  quoteFormConfig,
  siteStats,
  showcaseItem,
  smartTrackingCards,
  officeLocations,
];
