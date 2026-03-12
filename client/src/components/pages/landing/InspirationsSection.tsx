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
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
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
          <div
            ref={containerRef}
            className="absolute inset-0 overflow-hidden rounded-3xl border border-border bg-card shadow-xl"
          >
            <div className="absolute inset-0 flex flex-col justify-center bg-card py-4 pl-14 pr-4 text-foreground sm:py-6 sm:pl-16 sm:pr-6 md:py-8 md:pl-20 md:pr-10">
              <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Inspirations
              </span>

              <h2 className="mb-8 text-[clamp(1.5rem,4vw,2.5rem)] font-black leading-[0.9] tracking-tighter text-foreground">
                <ParsedText text="<acc>Media</acc> That Shaped Our Process" />
              </h2>

              <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 md:gap-10">
                <div>
                  <div className="mb-3 flex items-center gap-2 border-b border-foreground/20 pb-2">
                    <BookOpen className="h-5 w-5 text-foreground" />
                    <h3 className="text-xl font-black leading-none tracking-tighter text-foreground">
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
                          <span className="text-base font-bold text-foreground transition-colors sm:text-lg">
                            <ParsedText text={title} />
                          </span>
                        </a>
                        <span className="block text-sm font-bold text-muted-foreground md:ml-2 md:inline">
                          <ParsedText text={`<m>${author}</m>`} />
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <div className="mb-3 flex items-center gap-2 border-b border-foreground/20 pb-2">
                    <Rss className="h-5 w-5 text-foreground" />
                    <h3 className="text-xl font-black leading-none tracking-tighter text-foreground">
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
                          <span className="text-base font-bold text-foreground transition-colors sm:text-lg">
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
              className="absolute inset-0 z-10 bg-primary px-6 text-white sm:px-8 md:px-10"
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

          <motion.div
            className="group absolute bottom-0 top-0 z-20 -ml-5 flex cursor-ew-resize items-center justify-center md:-ml-6"
            style={{ x }}
            drag="x"
            dragConstraints={{ left: 0, right: containerWidth }}
            dragElastic={0}
            dragMomentum={false}
            onDragEnd={handleDragEnd}
          >
            <div
              className="flex h-full w-10 items-center justify-center md:w-12"
              onClick={handleToggle}
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
                className="flex h-12 w-8 items-center justify-center gap-[1px] rounded-full border border-border bg-background shadow-lg transition-colors group-hover:border-primary/50 md:h-14 md:w-10"
              >
                <svg
                  className="h-3 w-3 text-muted-foreground transition-colors group-hover:text-primary dark:text-white md:h-4 md:w-4"
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
                  className="h-3 w-3 text-muted-foreground transition-colors group-hover:text-primary dark:text-white md:h-4 md:w-4"
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
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default InspirationsSection;
