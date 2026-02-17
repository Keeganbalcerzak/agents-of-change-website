import { defineField, defineType } from "sanity";

export const assetBrief = defineType({
  name: "assetBrief",
  title: "Asset Brief",
  type: "document",
  fields: [
    defineField({
      name: "assetId",
      title: "Asset ID",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "assetType",
      title: "Asset Type",
      type: "string",
      options: { list: ["photo", "video", "illustration", "diagram", "og-frame"] },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "priority",
      title: "Priority",
      type: "string",
      options: { list: ["critical", "high", "medium", "low"] },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "brief",
      title: "Brief",
      type: "text",
      rows: 8,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "acceptanceCriteria",
      title: "Acceptance Criteria",
      type: "text",
      rows: 8,
    }),
  ],
});
