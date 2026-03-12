import { motion } from "framer-motion";

const content = `
  Say your personal diet consists of around <a>100 foods</a> — the full intersection of what's locally accessible and what you actually eat. Not all <a>100</a> are in your kitchen at any given moment, but they represent your complete realistic menu.
  
  Most days, you choose what to eat ad-hoc, and it gets you by well enough. <m>But what if you wanted to be more deliberate?</m> To eat in a way that is both perfectly <a>healthy</a> and as <a>inexpensive</a> as possible?

  Each of those <a>100</a> foods carries its own cost per serving and its own nutritional profile. Your body, meanwhile, demands around <a>25</a> different nutrients every day, each with a <a>floor</a> you must clear <m>(vitamin D, magnesium, zinc, and so on)</m> and some with a <a>ceiling</a> you must not breach <m>(too much vitamin A is actually toxic; too much iron, dangerous)</m>.
  
  Every food you add to your plate nudges all <a>25</a> nutrient totals simultaneously, in different directions, by different amounts.

  <m>Could you sit down with a pen and paper and find the most inexpensive combination of servings that satisfies every one of those requirements?</m>
  
  Load up on <a>chicken breast</a> for cheap, lean protein, and your iron and zinc quietly fall short. So you add <a>liver</a> to bring those back up, but it's so rich in vitamin A that even modest portions push you toward its toxicity ceiling. Dial the <a>liver</a> back down to stay safe, and your iron and zinc slip again. <m>Every correction disturbs something else, and you find yourself chasing your own tail through a vast space of possibilities</m> while dozens of constraints press in from all sides.

  This is essentially the famous <a>Stigler diet problem</a>, first posed by economist <a>George Stigler</a> in <m>1945</m>.
  
  For decades, nutritionists laboured over food composition tables, manually balancing plates through rules of thumb and professional judgment. <m>And to their credit, we do broadly understand what a balanced diet looks like.</m>
  
  But knowing the shape of a healthy diet in general terms is a far cry from knowing your <a>optimal diet</a> specifically: the <a>precise</a> combination of the foods you actually eat, priced at what you actually pay, tuned to your personal nutritional targets.
  
  <m>That last mile, where individual foods, real prices, and exact nutrient thresholds all have to line up at once,</m> is where human intuition runs out of road.

  This is precisely where <a>mathematical optimisation</a> earns its keep.

  With Knap<a>[Snack]</a>, all you need to do is provide your personal stats and your health goal. Then you input a list of foods available to you — <m>whatever's in your kitchen or locally accessible</m> — along with their prices. Our optimiser calculates the exact combination and quantities of those foods that will meet <m>all your macro and micronutrient targets</m> at the lowest possible cost.

  Knap<a>[Snack]</a> is designed for everyone who cares about nutrition.
  • <a>Individuals</a> who want to <m>build personal meal plans that are both nutritionally complete and as affordable as possible</m>
  • <a>Nutritionists and dietitians</a> who want to <m>generate evidence-based plans for their clients without hours of manual calculation</m>
  • <a>Public health researchers and policymakers</a> who want to <m>model dietary inventions and food costs for entire communities</m>
`;

const parseText = (text: string) => {
  const parts = text.split(/(<m>.*?<\/m>|<a>.*?<\/a>)/gs);

  return parts.map((part, index) => {
    if (part.startsWith("<m>")) {
      return (
        <span
          key={index}
          className="text-muted-foreground transition-colors duration-300"
        >
          {part.replace(/<\/?m>/g, "")}
        </span>
      );
    }
    if (part.startsWith("<a>")) {
      return (
        <span
          key={index}
          className="transition-colors duration-300"
          style={{ color: "var(--accent-highlight)" }}
        >
          {part.replace(/<\/?a>/g, "")}
        </span>
      );
    }
    return <span key={index}>{part}</span>;
  });
};

const IntroSection = () => {
  const paragraphs = content.trim().split(/\n\s*\n/);

  return (
    <section
      id="intro"
      className="relative flex min-h-screen w-full flex-col py-16 sm:py-24"
      lang="en"
    >
      <div className="mx-auto w-full max-w-[1204px] px-4 sm:px-6 lg:px-8">
        <div className="flex w-full flex-col space-y-8 sm:space-y-10">
          {paragraphs.map((paragraph, idx) => {
            const isEven = idx % 2 === 0;

            const cleanParagraph = paragraph.replace(/^[ \t]+/gm, "");

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className={`flex w-full max-w-4xl flex-col ${
                  isEven ? "self-start text-left" : "self-end text-right"
                }`}
              >
                <div className="no-select whitespace-pre-wrap text-4xl font-black leading-[0.8] tracking-tighter text-foreground transition-colors duration-300 sm:text-6xl md:text-8xl lg:text-[2rem]">
                  {parseText(cleanParagraph)}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default IntroSection;
