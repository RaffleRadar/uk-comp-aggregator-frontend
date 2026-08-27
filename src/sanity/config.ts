import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "./schemas";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION;

if (!projectId) {
  throw new Error("Missing NEXT_PUBLIC_SANITY_PROJECT_ID");
}

if (!dataset) {
  throw new Error("Missing NEXT_PUBLIC_SANITY_DATASET");
}

if (!apiVersion) {
  throw new Error("Missing NEXT_PUBLIC_SANITY_API_VERSION");
}

const sanityConfig = defineConfig({
  name: "default",
  title: "RaffleRadar Studio",
  projectId,
  dataset,
  apiVersion,
  basePath: "/studio",
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Content")
          .items([
            S.listItem()
              .title("Pages")
              .schemaType("page")
              .child(S.documentTypeList("page")),
            S.listItem()
              .title("Operator profiles")
              .schemaType("operatorProfile")
              .child(
                S.documentTypeList("operatorProfile")
                  .title("Operator profiles")
                  .defaultOrdering([
                    { field: "operatorName", direction: "asc" },
                  ]),
              ),
            S.listItem()
              .title("Reviews")
              .schemaType("review")
              .child(S.documentTypeList("review")),
            S.listItem()
              .title("Blog posts")
              .schemaType("post")
              .child(S.documentTypeList("post")),
            S.divider(),
            S.listItem().title("Site settings").child(
              S.editor()
                .id("siteSettings")
                .schemaType("siteSettings")
                .documentId("siteSettings"),
            ),
            S.listItem().title("Site Content").child(
              S.editor()
                .id("siteContent")
                .schemaType("siteContent")
                .documentId("siteContent"),
            ),
            S.listItem().title("How It Works Page").child(
              S.editor()
                .id("howItWorksPage")
                .schemaType("howItWorksPage")
                .documentId("howItWorksPage"),
            ),
          ]),
    }),
    visionTool(),
  ],
  schema: {
    types: schemaTypes,
  },
});

export default sanityConfig;
