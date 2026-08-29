import {
  animate,
  motion,
  PanInfo,
  useMotionTemplate,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import { ParsedText } from "../../common/ParsedText";

const OUTRO_TEXT =
  "The diet problem became one of the founding motivations for linear programming as a field. When <acc>Stigler</acc> posed it in <acc>1945</acc>, he estimated the cheapest healthy diet by hand through heroic effort, <m>arriving at an answer he suspected was near-optimal but couldn't prove.</m> A few years later, once the <acc>simplex method</acc> existed, a computer confirmed the true optimum, and Stigler's painstaking human guess had been off by about <acc>0.5%</acc>. That simplex method forms the foundation of how Knap<acc>[Snack]</acc> finds optimal diets for you today. The original problem was formulated for a <acc>70kg</acc> male, with a consideration for <acc>9</acc> nutrients and <acc>77</acc> foods. But Knap<acc>[Snack]</acc> is built for everyone, and takes into account no less than <acc>26</acc> nutrients, <m>with as many foods as you like.</m>";

const IMAGE_SRC =
  "https://press.uchicago.edu/.imaging/mte/ucp/400x400/dam/ucp/books/authors/S/Stigler_George_J_au5239134.jpg/jcr:content/Stigler_George_J_au5239134.jpg";

const NOISE_BACKGROUND = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`;

const DESKTOP_QUERY = "(min-width: 768px)";

function subscribeToDesktopQuery(onChange: () => void) {
  const mediaQuery = globalThis.matchMedia(DESKTOP_QUERY);
  mediaQuery.addEventListener("change", onChange);
  return () => mediaQuery.removeEventListener("change", onChange);
}

function getIsDesktop() {
  return globalThis.matchMedia(DESKTOP_QUERY).matches;
}

function fitTextToHeight(textEl: HTMLElement, targetHeight: number) {
  if (targetHeight <= 0 || textEl.offsetWidth < 40) return;

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
}

function DragHandle({ pulse }: Readonly<{ pulse: boolean }>) {
  return (
    <motion.div
      animate={
        pulse
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
        pulse
          ? { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
          : { duration: 0.3 }
      }
      whileHover={{ scale: 1.25 }}
      className="border-border bg-background group-hover:border-primary/50 group-focus-visible/btn:ring-primary flex h-12 w-8 items-center justify-center gap-[1px] rounded-full border shadow-lg transition-colors group-focus-visible/btn:ring-2 group-focus-visible/btn:ring-offset-2"
    >
      <svg
        className="text-muted-foreground group-hover:text-primary h-3 w-3 transition-colors dark:text-white"
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
        className="text-muted-foreground group-hover:text-primary h-3 w-3 transition-colors dark:text-white"
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
  );
}

function StiglerImage() {
  return (
    <>
      <img
        src={IMAGE_SRC}
        alt="George Stigler"
        className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
      />

      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: NOISE_BACKGROUND,
          mixBlendMode: "overlay",
          opacity: 0.35,
        }}
      />

      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/40 to-transparent" />
    </>
  );
}

function OutroDesktop() {
  const imageRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const matchHeight = () => {
      if (!imageRef.current || !textRef.current) return;
      fitTextToHeight(textRef.current, imageRef.current.offsetHeight);
    };

    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(matchHeight);
    });

    if (imageRef.current) resizeObserver.observe(imageRef.current);
    requestAnimationFrame(matchHeight);

    return () => resizeObserver.disconnect();
  }, []);

  return (
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
          className="border-foreground/20 absolute inset-0 translate-x-[2.5%] translate-y-[2.5%] border-2"
          style={{ zIndex: 0 }}
        />

        <div
          className="border-foreground/10 absolute inset-0 -translate-x-[3%] -translate-y-[3%] border"
          style={{ zIndex: 0 }}
        />

        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative aspect-[4/5] w-full overflow-hidden"
          style={{ zIndex: 1 }}
        >
          <StiglerImage />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          viewport={{ once: true }}
          className="bg-foreground absolute -bottom-1.5 -left-1.5 flex items-center justify-center px-1 py-0.5 sm:-bottom-3 sm:-left-3 sm:px-2 sm:py-1"
          style={{ zIndex: 2 }}
        >
          <span className="text-background text-[0.5rem] leading-none font-black tracking-tighter uppercase sm:text-xs">
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
        <div
          ref={textRef}
          className="no-select w-full font-black tracking-tighter transition-colors duration-300"
        >
          <ParsedText text={OUTRO_TEXT} />
        </div>
      </motion.div>
    </div>
  );
}

function OutroMobile() {
  const containerRef = useRef<HTMLDivElement>(null);
  const textPanelRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const prevWidthRef = useRef<number>(0);
  const containerWidthRef = useRef<number>(1000);

  const [containerWidth, setContainerWidth] = useState(0);
  const [isAtRight, setIsAtRight] = useState(true);

  const x = useMotionValue(5000);

  useEffect(() => {
    const unsubscribe = x.on("change", (latestX) => {
      const w = containerWidthRef.current || 1000;
      setIsAtRight(latestX > w / 2);
    });

    return () => unsubscribe();
  }, [x]);

  useEffect(() => {
    const measure = () => {
      if (!containerRef.current) return;

      const w = containerRef.current.offsetWidth;
      setContainerWidth(w);
      containerWidthRef.current = w;

      const prevW = prevWidthRef.current || w;
      const ratio = x.get() / prevW;

      if (ratio > 0.5) x.set(w);
      else x.set(0);

      prevWidthRef.current = w;
    };

    measure();
    globalThis.addEventListener("resize", measure);
    return () => globalThis.removeEventListener("resize", measure);
  }, [x]);

  useEffect(() => {
    const matchHeight = () => {
      if (!textPanelRef.current || !textRef.current) return;
      fitTextToHeight(textRef.current, textPanelRef.current.offsetHeight);
    };

    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(matchHeight);
    });

    if (textPanelRef.current) resizeObserver.observe(textPanelRef.current);
    requestAnimationFrame(matchHeight);

    return () => resizeObserver.disconnect();
  }, []);

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
    <div className="no-select relative h-[520px] w-full font-sans">
      <motion.div
        className="group absolute top-0 bottom-0 z-20 -ml-5 flex cursor-ew-resize items-center justify-center"
        style={{ x }}
        drag="x"
        dragConstraints={{ left: 0, right: containerWidth }}
        dragElastic={0}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
      >
        <button
          type="button"
          aria-label="Toggle outro image panel"
          className="group/btn flex h-full w-10 cursor-pointer items-center justify-center focus:outline-none"
          onClick={handleToggle}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") snapTo(0);
            if (e.key === "ArrowRight") snapTo(containerWidth);
          }}
        >
          <DragHandle pulse={isAtRight} />
        </button>
      </motion.div>

      <div
        ref={containerRef}
        className="border-border bg-card absolute inset-0 overflow-hidden rounded-3xl border shadow-xl"
      >
        <div className="bg-card text-foreground absolute inset-0 py-8 pr-6 pl-10">
          <div ref={textPanelRef} className="h-full w-full">
            <div
              ref={textRef}
              className="no-select w-full font-black tracking-tighter transition-colors duration-300"
            >
              <ParsedText text={OUTRO_TEXT} />
            </div>
          </div>
        </div>

        <motion.div
          className="absolute inset-0 z-10 overflow-hidden"
          style={{ clipPath }}
        >
          <StiglerImage />

          <div className="bg-foreground absolute bottom-3 left-3 flex items-center justify-center px-1.5 py-0.5">
            <span className="text-background text-[0.5rem] leading-none font-black tracking-tighter whitespace-nowrap uppercase">
              01 / George Stigler
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

const OutroSection = () => {
  const isDesktop = useSyncExternalStore(
    subscribeToDesktopQuery,
    getIsDesktop,
    () => true,
  );

  return (
    <section
      id="image-text"
      className="relative flex w-full flex-col items-center overflow-hidden py-16"
      lang="en"
    >
      <div className="mx-auto w-full max-w-[1204px] px-4 sm:px-6 lg:px-8">
        {isDesktop ? <OutroDesktop /> : <OutroMobile />}
      </div>
    </section>
  );
};

export default OutroSection;
