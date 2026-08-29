import { ExternalLink } from "lucide-react";
import React, { useEffect } from "react";
import { Link } from "react-router-dom";

import { Card, CardContent } from "../ui/card";

export type Block =
  { kind: "text"; content: string } | { kind: "list"; items: string[] };

export interface Section {
  id: string;
  title: string;
  blocks: Block[];
}

export type LinkMap = Record<string, string>;

const TOKEN_REGEX = /\[\[[^\]]{1,256}\]\]|\*\*[^*]{1,256}\*\*/g;

const renderToken = (
  token: string,
  key: string,
  linkMap: LinkMap,
): React.ReactNode => {
  if (token.startsWith("**"))
    return (
      <strong key={key} className="text-foreground font-medium">
        {token.slice(2, -2)}
      </strong>
    );

  const label = token.slice(2, -2);
  const href = linkMap[label];
  const linkClasses = "text-primary inline-flex items-center gap-1 underline";

  if (href?.startsWith("/"))
    return (
      <Link key={key} to={href} className={linkClasses}>
        {label}
      </Link>
    );

  const isExternal = href?.startsWith("http");

  return (
    <a
      key={key}
      href={href}
      {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={linkClasses}
    >
      {label}
      {isExternal && <ExternalLink className="h-3 w-3" />}
    </a>
  );
};

const parseText = (text: string, linkMap: LinkMap): React.ReactNode[] => {
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(TOKEN_REGEX)) {
    const token = match[0];
    const offset = match.index;
    if (offset === undefined) continue;

    if (offset > lastIndex)
      nodes.push(
        <span key={`text-${lastIndex}`}>{text.slice(lastIndex, offset)}</span>,
      );

    nodes.push(renderToken(token, `token-${offset}`, linkMap));
    lastIndex = offset + token.length;
  }

  if (lastIndex < text.length)
    nodes.push(<span key={`text-${lastIndex}`}>{text.slice(lastIndex)}</span>);

  return nodes;
};

interface BlockRendererProps {
  readonly block: Block;
  readonly linkMap: LinkMap;
}

const BlockRenderer = ({ block, linkMap }: BlockRendererProps) => {
  if (block.kind === "list")
    return (
      <ul className="list-outside list-disc space-y-2 pl-5 marker:text-sm">
        {block.items.map((item) => (
          <li key={item.substring(0, 40)}>{parseText(item, linkMap)}</li>
        ))}
      </ul>
    );

  return <p>{parseText(block.content, linkMap)}</p>;
};

const blockKey = (block: Block): string =>
  block.kind === "list"
    ? `list-${block.items[0].substring(0, 40)}`
    : block.content.substring(0, 40);

interface PolicyDocumentProps {
  readonly title: string;
  readonly lastUpdated: string;
  readonly summaryPoints: string[];
  readonly sections: Section[];
  readonly linkMap: LinkMap;
  readonly summaryTitle?: string;
}

const PolicyDocument = ({
  title,
  lastUpdated,
  summaryPoints,
  sections,
  linkMap,
  summaryTitle = "The short version",
}: PolicyDocumentProps) => {
  useEffect(() => {
    if (!globalThis.location.hash) globalThis.scrollTo(0, 0);
  }, []);

  return (
    <div className="mx-auto w-full p-4">
      <Card>
        <CardContent className="p-6">
          <div className="mb-6 border-b pb-4">
            <h1 className="text-3xl font-bold">{title}</h1>
            <p className="text-muted-foreground mt-2 text-sm">
              Last updated: {lastUpdated}
            </p>
          </div>

          <div className="bg-muted/50 mb-8 rounded-lg border p-5">
            <h2 className="mb-3 text-lg font-semibold">{summaryTitle}</h2>
            <ul className="text-muted-foreground list-outside list-disc space-y-2 pl-5 leading-relaxed marker:text-sm">
              {summaryPoints.map((point) => (
                <li key={point.substring(0, 40)}>
                  {parseText(point, linkMap)}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-8">
            {sections.map((section) => (
              <section
                key={section.id}
                id={section.id}
                className="scroll-mt-5"
                aria-labelledby={`${section.id}-heading`}
              >
                <h2
                  id={`${section.id}-heading`}
                  className="mb-3 text-xl font-semibold"
                >
                  {section.title}
                </h2>
                <div className="text-muted-foreground space-y-3 leading-relaxed">
                  {section.blocks.map((block) => (
                    <BlockRenderer
                      key={blockKey(block)}
                      block={block}
                      linkMap={linkMap}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PolicyDocument;
