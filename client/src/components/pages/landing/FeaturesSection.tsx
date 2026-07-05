import { AlternatingMotionItem } from "../../common/AlternatingMotionItem";
import { ParsedText } from "../../common/ParsedText";

const features = [
  {
    id: "01",
    title: "<acc>No AI</acc>\nOnly Math",
    description:
      "<m>Deterministic results every time</m>\nNot probabilistic guesses",
  },
  {
    id: "02",
    title: "<acc>Completely</acc> Free",
    description: "<m>As in “free speech” <i>and</i> “free beer”</m>",
  },
  {
    id: "03",
    title: "<acc>Private</acc> & Local",
    description:
      "<m>All data stays on your device</m>\nNo tracking, no sign-ups",
  },
  {
    id: "04",
    title: "<acc>Exportable</acc> Plans",
    description:
      "<m>Easily export your saved foods and generated meal plans</m>",
  },
  {
    id: "05",
    title: "<acc>Currency</acc>-Agnostic",
    description:
      "<m>Works anywhere in the world</m>\nOnly price numbers matter, not the currency",
  },
  {
    id: "06",
    title: "<acc>Transparent</acc> & Open Source",
    description: "<m>Publicly available codebase for anyone to inspect</m>",
  },
];

const FeaturesSection = () => {
  return (
    <section
      id="features"
      className="relative flex w-full flex-col py-4 sm:py-8"
    >
      <div className="mx-auto w-full max-w-[1204px] px-4 sm:px-6 lg:px-8">
        <div className="flex w-full flex-col">
          {features.map((feature, idx) => {
            const isRightAligned = idx % 2 !== 0;

            return (
              <AlternatingMotionItem key={feature.id} index={idx}>
                <div
                  className={`group border-muted flex flex-col border-b py-2 transition-colors duration-500 last:border-b-0 sm:py-4 ${
                    isRightAligned
                      ? "items-end text-right"
                      : "items-start text-left"
                  }`}
                >
                  <span className="text-muted-foreground/40 group-hover:text-foreground mb-4 font-mono text-xl font-bold tracking-tight transition-colors duration-500 sm:text-2xl md:text-3xl">
                    {feature.id}
                  </span>

                  <h3 className="text-foreground mb-4 text-4xl leading-[0.9] font-black tracking-tighter whitespace-pre-wrap transition-colors duration-300 sm:text-5xl md:text-6xl lg:text-[4rem]">
                    <ParsedText text={feature.title} />
                  </h3>

                  <div className="text-foreground max-w-2xl text-lg leading-snug font-bold whitespace-pre-wrap sm:text-xl md:text-2xl">
                    <ParsedText text={feature.description} />
                  </div>
                </div>
              </AlternatingMotionItem>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
