import { calloutBlock } from "./blocks/calloutBlock";
import { cardsBlock } from "./blocks/cardsBlock";
import { categoryNavBlock } from "./blocks/categoryNavBlock";
import { competitionListBlock } from "./blocks/competitionListBlock";
import { operatorsBlock } from "./blocks/operatorsBlock";
import { richTextBlock } from "./blocks/richTextBlock";
import { statsBlock } from "./blocks/statsBlock";
import { stepsBlock } from "./blocks/stepsBlock";
import { howItWorksPage } from "./documents/howItWorksPage";
import { page } from "./documents/page";
import { post } from "./documents/post";
import { review } from "./documents/review";
import { siteContent } from "./documents/siteContent";
import { siteSettings } from "./documents/siteSettings";
import { richTitle } from "./objects/richTitle";
import { seoMeta } from "./objects/seoMeta";

export const schemaTypes = [
  page,
  review,
  post,
  siteContent,
  siteSettings,
  howItWorksPage,
  richTextBlock,
  statsBlock,
  cardsBlock,
  stepsBlock,
  calloutBlock,
  operatorsBlock,
  competitionListBlock,
  categoryNavBlock,
  richTitle,
  seoMeta,
];
