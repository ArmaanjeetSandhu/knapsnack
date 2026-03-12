import React from "react";

export const ParsedText = ({ text }: { text: string }) => {
  const parts = text.split(/(<m>.*?<\/m>|<acc>.*?<\/acc>)/gs);

  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith("<m>"))
          return (
            <span
              key={index}
              className="text-muted-foreground transition-colors duration-300"
            >
              {part.replace(/<\/?m>/g, "")}
            </span>
          );

        if (part.startsWith("<acc>"))
          return (
            <span
              key={index}
              className="transition-colors duration-300"
              style={{ color: "var(--accent-highlight)" }}
            >
              {part.replace(/<\/?acc>/g, "")}
            </span>
          );

        return <React.Fragment key={index}>{part}</React.Fragment>;
      })}
    </>
  );
};
