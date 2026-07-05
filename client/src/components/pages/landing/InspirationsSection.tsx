import {
  motion,
  useMotionValue,
  useTransform,
  useMotionTemplate,
  animate,
  PanInfo,
} from "framer-motion";
import { BookOpen, Rss } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import FillText from "../../common/FillText";
import { ParsedText } from "../../common/ParsedText";

const WORDS = ["WHAT", "INSPIRES", "US"];

const BOOKS: [string, string, string][] = [
  [
    "https://app.thestorygraph.com/books/68229e04-88dd-4ac0-80a8-a766751842b4",
    "Bigger Leaner Stronger",
    "Michael Matthews",
  ],
  [
    "https://app.thestorygraph.com/books/13a2ed29-30b8-4f8f-b372-3f7223f222a3",
    "Thinner Leaner Stronger",
    "Michael Matthews",
  ],
  [
    "https://app.thestorygraph.com/books/0fdeb811-051b-46a4-92a5-c1b3f8b9e79c",
    "Ultra-Processed People",
    "Chris van Tulleken",
  ],
  [
    "https://app.thestorygraph.com/books/0cfbc723-d52c-4570-beff-bf8b2649d17c",
    "You Can't Screw This Up",
    "Adam Bornstein",
  ],
];

const BLOGS: [string, string][] = [
  ["https://macrofactorapp.com/articles/", "MacroFactor's Blog"],
  ["https://cronometer.com/blog/", "CronoMeter's Blog"],
  ["https://gutbites.org/stories/", "Gut Bites MD's Blog"],
  ["https://tbthealth.substack.com/", "Truth Be Told"],
];

function InspirationsSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const textPanelRef = useRef<HTMLDivElement>(null);
  const prevWidthRef = useRef<number>(0);
  const containerWidthRef = useRef<number>(1000);

  const [containerWidth, setContainerWidth] = useState(0);
  const [textArea, setTextArea] = useState({ width: 0, height: 0 });
  const [isMobile, setIsMobile] = useState(true);
  const x = useMotionValue(5000);

  const [isAtRight, setIsAtRight] = useState(true);

  useEffect(() => {
    const unsubscribe = x.on("change", (latestX) => {
      const w = containerWidthRef.current || 1000;
      setIsAtRight(latestX > w / 2);
    });

    return () => unsubscribe();
  }, [x]);

  useEffect(() => {
    const measure = () => {
      const md = window.innerWidth >= 768;
      setIsMobile(!md);

      if (containerRef.current) {
        const w = containerRef.current.offsetWidth;
        setContainerWidth(w);
        containerWidthRef.current = w;

        const prevW = prevWidthRef.current || w;
        const ratio = x.get() / prevW;

        if (ratio > 0.5) x.set(w);
        else x.set(0);

        prevWidthRef.current = w;
      }

      if (textPanelRef.current) {
        const rect = textPanelRef.current.getBoundingClientRect();
        const pad = md ? 40 : 24;
        setTextArea({
          width: rect.width - pad * 2,
          height: rect.height,
        });
      }
    };

    measure();
    globalThis.addEventListener("resize", measure);
    return () => globalThis.removeEventListener("resize", measure);
  }, [x]);

  const clipPathRight = useTransform(x, (latestX) => {
    const w = containerWidthRef.current || 1000;
    const progress = Math.min(Math.max(latestX / w, 0), 1);
    return 100 - progress * 100;
  });

  const clipPath = useMotionTemplate`inset(0% ${clipPathRight}% 0% 0%)`;

  const snapTo = (t: number) =>
    animate(x, t, { type: "spring", stiffness: 300, damping: 30 });

  const handleDragEnd = (
    _e: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    const vel = info.velocity.x;
    if (vel < -300) return snapTo(0);
    if (vel > 300) return snapTo(containerWidth);
    snapTo(x.get() < containerWidth / 2 ? 0 : containerWidth);
  };

  const handleToggle = () =>
    x.get() > containerWidth / 2 ? snapTo(0) : snapTo(containerWidth);

  return (
    <section
      id="inspiration"
      className="relative flex w-full flex-col items-center justify-center overflow-hidden py-4 sm:py-8"
    >
      <div className="mx-auto w-full max-w-[1204px] px-4 sm:px-6 lg:px-8">
        <div className="no-select relative mx-auto h-[550px] w-full font-sans md:h-[350px]">
          <motion.div
            className="group absolute top-0 bottom-0 z-20 -ml-5 flex cursor-ew-resize items-center justify-center md:-ml-6"
            style={{ x }}
            drag="x"
            dragConstraints={{ left: 0, right: containerWidth }}
            dragElastic={0}
            dragMomentum={false}
            onDragEnd={handleDragEnd}
          >
            <button
              type="button"
              aria-label="Toggle inspiration panel"
              className="group/btn flex h-full w-10 cursor-pointer items-center justify-center focus:outline-none md:w-12"
              onClick={handleToggle}
              onKeyDown={(e) => {
                if (e.key === "ArrowLeft") snapTo(0);
                if (e.key === "ArrowRight") snapTo(containerWidth);
              }}
            >
              <motion.div
                animate={
                  isAtRight
                    ? {
                        scale: [1, 1.15, 1],
                        boxShadow: [
                          "0px 0px 0px 0px rgba(128, 128, 128, 0)",
                          "0px 0px 0px 12px rgba(128, 128, 128, 0.25)",
                          "0px 0px 0px 0px rgba(128, 128, 128, 0)",
                        ],
                      }
                    : {
                        scale: 1,
                        boxShadow: "0px 0px 0px 0px rgba(128, 128, 128, 0)",
                      }
                }
                transition={
                  isAtRight
                    ? { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
                    : { duration: 0.3 }
                }
                whileHover={{ scale: 1.25 }}
                className="border-border bg-background group-hover:border-primary/50 group-focus-visible/btn:ring-primary flex h-12 w-8 items-center justify-center gap-[1px] rounded-full border shadow-lg transition-colors group-focus-visible/btn:ring-2 group-focus-visible/btn:ring-offset-2 md:h-14 md:w-10"
              >
                <svg
                  className="text-muted-foreground group-hover:text-primary h-3 w-3 transition-colors md:h-4 md:w-4 dark:text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                <svg
                  className="text-muted-foreground group-hover:text-primary h-3 w-3 transition-colors md:h-4 md:w-4 dark:text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </motion.div>
            </button>
          </motion.div>

          <div
            ref={containerRef}
            className="border-border bg-card absolute inset-0 overflow-hidden rounded-3xl border shadow-xl"
          >
            <div className="bg-card text-foreground absolute inset-0 flex flex-col justify-center py-4 pr-4 pl-14 sm:py-6 sm:pr-6 sm:pl-16 md:py-8 md:pr-10 md:pl-20">
              <span className="text-muted-foreground mb-2 block text-xs font-bold tracking-widest uppercase">
                Inspirations
              </span>

              <h2 className="text-foreground mb-8 text-[clamp(1.5rem,4vw,2.5rem)] leading-[0.9] font-black tracking-tighter">
                <ParsedText text="<acc>Media</acc> That Shaped Our Process" />
              </h2>

              <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 md:gap-10">
                <div>
                  <div className="border-foreground/20 mb-3 flex items-center gap-2 border-b pb-2">
                    <BookOpen className="text-foreground h-5 w-5" />
                    <h3 className="text-foreground text-xl leading-none font-black tracking-tighter">
                      <ParsedText text="<acc>Books</acc>" />
                    </h3>
                  </div>
                  <ul className="space-y-2">
                    {BOOKS.map(([href, title, author]) => (
                      <li key={title} className="leading-snug">
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          <span className="text-foreground text-base font-bold transition-colors sm:text-lg">
                            <ParsedText text={title} />
                          </span>
                        </a>
                        <span className="text-muted-foreground block text-sm font-bold md:ml-2 md:inline">
                          <ParsedText text={`<m>${author}</m>`} />
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <div className="border-foreground/20 mb-3 flex items-center gap-2 border-b pb-2">
                    <Rss className="text-foreground h-5 w-5" />
                    <h3 className="text-foreground text-xl leading-none font-black tracking-tighter">
                      <ParsedText text="<acc>Blogs</acc>" />
                    </h3>
                  </div>
                  <ul className="space-y-2">
                    {BLOGS.map(([href, title]) => (
                      <li key={title} className="leading-snug">
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          <span className="text-foreground text-base font-bold transition-colors sm:text-lg">
                            <ParsedText text={title} />
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <motion.div
              ref={textPanelRef}
              className="bg-primary absolute inset-0 z-10 px-6 text-white sm:px-8 md:px-10"
              style={{ clipPath }}
            >
              <div className="flex h-full w-full items-center justify-center">
                <FillText
                  words={WORDS}
                  width={textArea.width}
                  height={textArea.height}
                  isMobile={isMobile}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default InspirationsSection;
