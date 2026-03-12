import { useCallback, useEffect, useRef, useState } from "react";

const SVG_W = 1000;
const FONT_SIZE = 220;

interface FillTextProps {
  words: string[];
  width: number;
  height: number;
  isMobile: boolean;
}

function FillText({ words, width, height, isMobile }: FillTextProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [viewBox, setViewBox] = useState<string | null>(null);

  const doMeasure = useCallback(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const texts = Array.from(svg.querySelectorAll("text"));
    if (!texts.length) return;

    let x0 = Infinity,
      y0 = Infinity,
      x1 = -Infinity,
      y1 = -Infinity;
    for (const t of texts) {
      try {
        const bb = t.getBBox();
        if (bb.width < 1) continue;
        x0 = Math.min(x0, bb.x);
        y0 = Math.min(y0, bb.y);
        x1 = Math.max(x1, bb.x + bb.width);
        y1 = Math.max(y1, bb.y + bb.height);
      } catch {
        /* getBBox() may throw in detached/hidden SVGs */
      }
    }
    if (x0 === Infinity) return;

    const trimTop = FONT_SIZE * 0.32;
    const trimBottom = FONT_SIZE * 0.2;

    setViewBox(
      `${x0} ${y0 + trimTop} ${x1 - x0} ${y1 - y0 - trimTop - trimBottom}`,
    );
  }, []);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setViewBox(null);
      requestAnimationFrame(doMeasure);
    });
    return () => cancelAnimationFrame(id);
  }, [words, width, height, isMobile, doMeasure]);

  if (!width || !height) return null;

  if (isMobile) {
    const LINE_HEIGHT_MULTIPLIER = 0.72;

    return (
      <svg
        ref={svgRef}
        width={width}
        height={height}
        viewBox={viewBox ?? `0 0 ${SVG_W} ${words.length * FONT_SIZE}`}
        preserveAspectRatio="none"
        style={{ display: "block" }}
      >
        {words.map((word, i) => (
          <text
            key={word}
            x={0}
            y={FONT_SIZE + i * FONT_SIZE * LINE_HEIGHT_MULTIPLIER}
            fontSize={FONT_SIZE}
            fontWeight={900}
            fontFamily="inherit"
            textAnchor="start"
            textLength={SVG_W}
            lengthAdjust="spacingAndGlyphs"
            fill="currentColor"
          >
            {word.toUpperCase()}
          </text>
        ))}
      </svg>
    );
  }

  const combined = words.map((w) => w.toUpperCase()).join("   ");
  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      viewBox={viewBox ?? `0 0 ${SVG_W} ${FONT_SIZE}`}
      preserveAspectRatio="none"
      style={{ display: "block" }}
    >
      <text
        x={0}
        y={FONT_SIZE * 0.82}
        fontSize={FONT_SIZE}
        fontWeight={900}
        fontFamily="inherit"
        textAnchor="start"
        textLength={SVG_W}
        lengthAdjust="spacingAndGlyphs"
        fill="currentColor"
      >
        {combined}
      </text>
    </svg>
  );
}

export default FillText;
