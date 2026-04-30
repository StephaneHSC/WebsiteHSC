import type { SchemaTypeDefinition } from "sanity";
import { teamMember } from "./teamMember";
import { testimonial } from "./testimonial";
import { milestone } from "./milestone";
import { quoteFormConfig } from "./quoteFormConfig";
import { siteStats } from "./siteStats";

export const schemaTypes: SchemaTypeDefinition[] = [
  teamMember,
  testimonial,
  milestone,
  quoteFormConfig,
  siteStats,
];
