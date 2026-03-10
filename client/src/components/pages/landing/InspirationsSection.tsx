import { BookOpen, Rss } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  useMotionTemplate,
  animate,
  PanInfo,
} from "framer-motion";
import FillText from "../../common/FillText";

const WORDS = ["What", "Inspires", "Us"];

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
      className="relative flex w-full flex-col items-center justify-center overflow-hidden py-16 sm:py-24"
    >
      <div className="mx-auto w-full max-w-[1204px] px-4 sm:px-6 lg:px-8">
        <div className="no-select relative mx-auto h-[550px] w-full font-sans md:h-[350px]">
          <div
            ref={containerRef}
            className="absolute inset-0 overflow-hidden rounded-3xl border border-border bg-card shadow-xl"
          >
            <div className="absolute inset-0 flex flex-col justify-center bg-card py-6 pl-16 pr-6 text-card-foreground sm:py-8 sm:pl-16 sm:pr-8 md:py-10 md:pl-20 md:pr-10">
              <h2 className="mb-6 text-xl font-bold tracking-tight text-primary md:text-2xl">
                Media That Shaped Our Process
              </h2>
              <div className="grid w-full grid-cols-1 gap-8 sm:grid-cols-2 md:gap-16 lg:gap-24">
                <div>
                  <div className="mb-3 flex items-center gap-2 border-b border-border pb-2 md:mb-4">
                    <BookOpen className="h-4 w-4 text-primary" />
                    <h3 className="text-base font-semibold md:text-lg">
                      Books
                    </h3>
                  </div>
                  <ul className="space-y-2 md:space-y-3">
                    {BOOKS.map(([href, title, author]) => (
                      <li key={title}>
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          <strong className="text-sm font-medium">
                            {title}
                          </strong>
                        </a>
                        <span className="block text-xs text-muted-foreground md:ml-2 md:inline">
                          {author}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="mb-3 flex items-center gap-2 border-b border-border pb-2 md:mb-4">
                    <Rss className="h-4 w-4 text-primary" />
                    <h3 className="text-base font-semibold md:text-lg">
                      Blogs
                    </h3>
                  </div>
                  <ul className="space-y-2 md:space-y-3">
                    {BLOGS.map(([href, title]) => (
                      <li key={title}>
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          <strong className="text-sm font-medium">
                            {title}
                          </strong>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <motion.div
              ref={textPanelRef}
              className="absolute inset-0 bg-primary px-6 text-primary-foreground sm:px-8 md:px-10"
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
              <div className="flex h-12 w-8 items-center justify-center gap-[1px] rounded-full border border-border bg-background shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:border-primary/50 md:h-14 md:w-10">
                <svg
                  className="h-3 w-3 text-muted-foreground transition-colors group-hover:text-primary md:h-4 md:w-4"
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
                  className="h-3 w-3 text-muted-foreground transition-colors group-hover:text-primary md:h-4 md:w-4"
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
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default InspirationsSection;
