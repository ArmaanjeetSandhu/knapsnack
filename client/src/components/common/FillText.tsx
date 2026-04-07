const SVG_W = 1000;
const FONT_SIZE = 220;

const CAP_TOP = 0.71;
const CAP_BOTTOM = 0.01;
const PAD = 0.14;

interface FillTextProps {
  words: string[];
  width: number;
  height: number;
  isMobile: boolean;
}

function FillText({ words, width, height, isMobile }: FillTextProps) {
  if (!width || !height) return null;

  if (isMobile) {
    const LINE_HEIGHT_MULTIPLIER = 0.72;
    const n = words.length;

    const firstBaseline = FONT_SIZE;
    const lastBaseline =
      FONT_SIZE + (n - 1) * FONT_SIZE * LINE_HEIGHT_MULTIPLIER;

    const inkTop = firstBaseline - FONT_SIZE * CAP_TOP;
    const inkBottom = lastBaseline + FONT_SIZE * CAP_BOTTOM;

    const pad = FONT_SIZE * PAD;
    const vbY = inkTop - pad;
    const vbH = inkBottom - inkTop + pad * 2;

    return (
      <svg
        width={width}
        height={height}
        viewBox={`0 ${vbY} ${SVG_W} ${vbH}`}
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

  const baseline = FONT_SIZE;
  const inkTop = baseline - FONT_SIZE * CAP_TOP;
  const inkBottom = baseline + FONT_SIZE * CAP_BOTTOM;
  const pad = FONT_SIZE * PAD;
  const vbY = inkTop - pad;
  const vbH = inkBottom - inkTop + pad * 2;

  const combined = words.map((w) => w.toUpperCase()).join("   ");
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 ${vbY} ${SVG_W} ${vbH}`}
      preserveAspectRatio="none"
      style={{ display: "block" }}
    >
      <text
        x={0}
        y={baseline}
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
