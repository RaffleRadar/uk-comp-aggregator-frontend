import { PortableText } from "@portabletext/react";
import { portableTextComponents } from "../portableTextComponents";

type RichTextBlockData = {
  _key?: string;
  _type?: string;
  content?: unknown[];
};

export function RichTextBlock({ block }: { block: RichTextBlockData }) {
  return (
    <section className="py-7">
      <div className="container">
        <div className="mx-auto max-w-[1100px]">
          <PortableText value={block.content ?? []} components={portableTextComponents} />
        </div>
      </div>
    </section>
  );
}
