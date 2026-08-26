export type FaqEntry = {
  question: string;
  answer: string;
};

type PortableBlock = {
  _type?: string;
  style?: string;
  children?: Array<{ _type?: string; text?: string }>;
};

const HEADING_STYLES = new Set(["h2", "h3", "h4"]);
const MIN_ANSWER_LENGTH = 40;
const MAX_ANSWER_LENGTH = 700;

function blockToText(block: PortableBlock): string {
  if (!Array.isArray(block.children)) return "";
  return block.children
    .map((child) => (typeof child.text === "string" ? child.text : ""))
    .join("")
    .trim();
}

function isHeading(block: PortableBlock): boolean {
  return (
    block._type === "block" &&
    typeof block.style === "string" &&
    HEADING_STYLES.has(block.style)
  );
}

export function extractFaqFromPortableText(value: unknown): FaqEntry[] {
  if (!Array.isArray(value)) return [];

  const blocks = value as PortableBlock[];
  const entries: FaqEntry[] = [];

  let question: string | null = null;
  let answerParts: string[] = [];

  const flush = () => {
    if (question === null) return;

    const answer = answerParts.join(" ").trim();

    if (answer.length >= MIN_ANSWER_LENGTH) {
      entries.push({
        question,
        answer:
          answer.length > MAX_ANSWER_LENGTH
            ? `${answer.slice(0, MAX_ANSWER_LENGTH).trimEnd()}...`
            : answer,
      });
    }

    question = null;
    answerParts = [];
  };

  for (const block of blocks) {
    if (isHeading(block)) {
      flush();
      const text = blockToText(block);
      question = text.endsWith("?") ? text : null;
      continue;
    }

    if (question === null) continue;

    if (block._type === "block") {
      const text = blockToText(block);
      if (text) answerParts.push(text);
    }
  }

  flush();

  return entries;
}
