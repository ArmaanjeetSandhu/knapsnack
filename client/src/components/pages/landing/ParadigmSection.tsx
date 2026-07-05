import { motion } from "framer-motion";

const ParadigmSection = () => {
  return (
    <section
      id="paradigm"
      className="relative flex w-full flex-col items-center justify-center overflow-hidden py-16"
    >
      <div className="mx-auto w-full max-w-[1204px] px-4 sm:px-6 lg:px-8">
        <div className="flex w-full flex-col gap-6 md:gap-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-start"
          >
            <span className="text-muted-foreground mb-4 block text-xs font-bold tracking-widest uppercase">
              The Old Paradigm
            </span>
            <div className="relative inline-block">
              <h2 className="no-select text-muted-foreground/30 text-[18vw] leading-[0.8] font-black tracking-tighter sm:text-[14vw] md:text-[8rem] lg:text-[11rem]">
                IIFYM
              </h2>
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.7,
                  delay: 0.4,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="bg-foreground absolute top-1/2 right-0 left-0 h-2 origin-left -translate-y-1/2 sm:h-4 md:h-5"
              />
            </div>
            <p className="text-muted-foreground mt-4 text-lg font-bold tracking-tight sm:text-xl">
              If It Fits Your Macros
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-end text-right"
          >
            <span className="text-foreground mb-4 block text-xs font-bold tracking-widest uppercase">
              The New Standard
            </span>
            <h2 className="no-select text-foreground text-[18vw] leading-[0.8] font-black tracking-tighter sm:text-[14vw] md:text-[8rem] lg:text-[11rem]">
              IIFYM<span style={{ color: "var(--accent-highlight)" }}>&M</span>
            </h2>
            <p className="text-foreground mt-4 text-lg font-bold tracking-tight sm:text-xl">
              If It Fits Your Macros{" "}
              <span style={{ color: "var(--accent-highlight)" }}>& Micros</span>
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ParadigmSection;
