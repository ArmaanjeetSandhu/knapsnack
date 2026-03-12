import { motion } from "framer-motion";
import { useEffect, useRef } from "react";

const OutroSection = () => {
  const passages = [
    {
      text: "The diet problem became one of the founding motivations for linear programming as a field.",
      color: "text-foreground",
    },
    {
      text: "When George Stigler posed it in 1945, he estimated the cheapest healthy diet by hand through heroic effort,",
      color: "accent-highlight",
    },
    {
      text: "arriving at an answer he suspected was near-optimal but couldn't prove.",
      color: "text-muted-foreground",
    },
    {
      text: "A few years later, once the simplex method existed,",
      color: "text-foreground",
    },
    {
      text: "a computer confirmed the true optimum — ",
      color: "accent-highlight",
    },
    {
      text: "and Stigler's painstaking human guess had been off by about 0.5%.",
      color: "text-muted-foreground",
    },
    {
      text: "That simplex method forms the foundation of how Knap[Snack] finds optimal diets for you today.",
      color: "text-foreground",
    },
    {
      text: "Of course the original problem was formulated for a 70kg male, with a consideration for 9 nutrients and 77 nutrients. Knap[Snack], however, is meant for everyone, with a consideration for no less than 26 nutrients, and as many foods as you like.",
      color: "text-muted-foreground",
    },
  ];

  const imageRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const matchHeight = () => {
      if (!imageRef.current || !textRef.current) return;

      const targetHeight = imageRef.current.offsetHeight;
      const textEl = textRef.current;

      textEl.style.lineHeight = "0.85";

      let minFontSize = 5;
      let maxFontSize = 200;
      let bestFontSize = minFontSize;

      for (let i = 0; i < 20; i++) {
        const mid = (minFontSize + maxFontSize) / 2;
        textEl.style.fontSize = `${mid}px`;

        if (textEl.scrollHeight <= targetHeight) {
          bestFontSize = mid;
          minFontSize = mid;
        } else maxFontSize = mid;
      }

      textEl.style.fontSize = `${bestFontSize}px`;

      const currentHeight = textEl.scrollHeight;
      if (currentHeight > 0 && currentHeight < targetHeight) {
        const ratio = targetHeight / currentHeight;
        textEl.style.lineHeight = `${0.85 * ratio}`;
      }
    };

    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(matchHeight);
    });

    if (imageRef.current) resizeObserver.observe(imageRef.current);
    requestAnimationFrame(matchHeight);

    return () => resizeObserver.disconnect();
  }, []);

  return (
    <section
      id="image-text"
      className="relative flex w-full flex-col items-center overflow-hidden py-16"
      lang="en"
    >
      <div className="mx-auto w-full max-w-[1204px] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-row items-center gap-4 sm:gap-8 md:gap-12 lg:gap-16">
          <motion.div
            ref={imageRef}
            initial={{ opacity: 0, x: -48 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true }}
            className="relative w-[45%] shrink-0"
          >
            <div
              className="absolute inset-0 translate-x-3 translate-y-3 border-2 border-foreground/20"
              style={{ zIndex: 0 }}
            />

            <div
              className="absolute inset-0 -translate-x-1 -translate-y-1 border border-foreground/10"
              style={{ zIndex: 0 }}
            />

            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="relative aspect-[4/5] w-full overflow-hidden"
              style={{ zIndex: 1 }}
            >
              <img
                src="https://press.uchicago.edu/.imaging/mte/ucp/400x400/dam/ucp/books/authors/S/Stigler_George_J_au5239134.jpg/jcr:content/Stigler_George_J_au5239134.jpg"
                alt="Precision nutrition ingredients"
                className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
              />

              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
                  mixBlendMode: "overlay",
                  opacity: 0.35,
                }}
              />

              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/40 to-transparent" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              viewport={{ once: true }}
              className="absolute -bottom-3 -left-3 bg-foreground px-2 py-1"
              style={{ zIndex: 2 }}
            >
              <span className="text-xs font-black uppercase tracking-tighter text-background">
                01 / George Stigler
              </span>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            viewport={{ once: true }}
            className="w-[55%]"
          >
            <div ref={textRef} className="w-full">
              {passages.map((passage, index) => (
                <span
                  key={index}
                  className={`inline font-black tracking-tighter ${
                    passage.color !== "accent-highlight" ? passage.color : ""
                  } no-select transition-colors duration-300`}
                  style={
                    passage.color === "accent-highlight"
                      ? { color: "var(--accent-highlight)" }
                      : undefined
                  }
                >
                  {passage.text}{" "}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default OutroSection;
