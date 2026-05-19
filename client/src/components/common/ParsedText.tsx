import React from "react";

type TagName = "m" | "acc" | "i";

interface TextNode {
  type: "text";
  content: string;
  key: string;
}

interface TagNode {
  type: "tag";
  tag: TagName;
  children: Node[];
  key: string;
}

type Node = TextNode | TagNode;

const TAG_REGEX = /<(m|acc|i)>([\s\S]*?)<\/\1>/g;

function parseNodes(text: string): Node[] {
  const nodes: Node[] = [];
  let lastIndex = 0;

  const regex = new RegExp(TAG_REGEX.source, "gs");

  for (const match of text.matchAll(regex)) {
    const [full, tag, inner] = match;
    const offset = match.index!;

    if (offset > lastIndex) {
      const content = text.slice(lastIndex, offset);
      nodes.push({ type: "text", content, key: `text-${offset}` });
    }

    nodes.push({
      type: "tag",
      tag: tag as TagName,
      children: parseNodes(inner),
      key: `tag-${offset}-${tag}`,
    });

    lastIndex = offset + full.length;
  }

  if (lastIndex < text.length) {
    const content = text.slice(lastIndex);
    nodes.push({ type: "text", content, key: `text-${lastIndex}` });
  }

  return nodes;
}

function renderNodes(nodes: Node[]): React.ReactNode {
  return nodes.map((node) => {
    if (node.type === "text")
      return <React.Fragment key={node.key}>{node.content}</React.Fragment>;

    const children = renderNodes(node.children);

    switch (node.tag) {
      case "m":
        return (
          <span
            key={node.key}
            className="text-muted-foreground transition-colors duration-300"
          >
            {children}
          </span>
        );
      case "acc":
        return (
          <span
            key={node.key}
            className="transition-colors duration-300"
            style={{ color: "var(--accent-highlight)" }}
          >
            {children}
          </span>
        );
      case "i":
        return (
          <em key={node.key} className="transition-colors duration-300">
            {children}
          </em>
        );
    }
  });
}

export const ParsedText = ({ text }: { text: string }) => {
  const nodes = parseNodes(text);
  return <>{renderNodes(nodes)}</>;
};
