import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { ParsedText } from "../../common/ParsedText";

interface CtaSectionProps {
  onGetStarted: () => void;
}

const CtaSection = ({ onGetStarted }: CtaSectionProps) => {
  return (
    <section className="relative flex w-full flex-col py-16 sm:py-24">
      <div className="mx-auto w-full max-w-[1204px] px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <button
            onClick={onGetStarted}
            className="group relative flex w-full items-center justify-between border-y border-foreground/20 py-10 transition-colors duration-500 hover:border-foreground focus:outline-none sm:py-16 md:py-20"
          >
            <div className="flex flex-col items-start text-left">
              <span className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground transition-colors duration-500 group-hover:text-foreground sm:text-sm">
                Convinced yet?
              </span>
              <span className="no-select text-4xl font-black leading-[0.8] tracking-tighter text-foreground sm:text-6xl md:text-8xl lg:text-[7rem]">
                <ParsedText text="Try <acc>It</acc> Out" />
              </span>
            </div>

            <div className="ml-4 flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-foreground/20 transition-all duration-500 group-hover:border-foreground group-hover:bg-foreground group-hover:text-background sm:h-24 sm:w-24 md:h-32 md:w-32">
              <ArrowRight className="h-6 w-6 transition-transform duration-500 group-hover:translate-x-1 sm:h-10 sm:w-10 md:h-12 md:w-12" />
            </div>
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default CtaSection;
