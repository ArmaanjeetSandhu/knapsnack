import React from "react";
import { AlternatingMotionItem } from "../../common/AlternatingMotionItem";
import { ParsedText } from "../../common/ParsedText";
import { SquiggleLink } from "../../common/SquiggleLink";

const paragraphs: React.ReactNode[] = [
  "Say your personal diet consists of around <acc>100 foods</acc> — the full intersection of what's locally accessible and what you actually eat. Not all <acc>100</acc> are in your kitchen at any given moment, but they represent your complete realistic menu.",

  "Most days, you choose what to eat ad-hoc, and it gets you by well enough. <m>But what if you wanted to be more deliberate?</m> To eat in a way that is both perfectly <acc>healthy</acc> and as <acc>inexpensive</acc> as possible?",

  "Each of those <acc>100</acc> foods carries its own cost per serving and its own nutritional profile. Your body, meanwhile, demands around <acc>25</acc> different nutrients every day, each with a <acc>floor</acc> you must clear <m>(vitamin D, magnesium, zinc, and so on)</m> and some with a <acc>ceiling</acc> you must not breach <m>(too much vitamin A is actually toxic; too much iron, dangerous)</m>.",

  "Every food you add to your plate nudges all <acc>25</acc> nutrient totals simultaneously, in different directions, by different amounts.",

  "<m>Could you sit down with a pen and paper and find the most inexpensive combination of servings that satisfies every one of those requirements?</m>",

  "Load up on <acc>chicken breast</acc> for cheap, lean protein, and your iron and zinc quietly fall short. So you add <acc>liver</acc> to bring those back up, but it's so rich in vitamin A that even modest portions push you toward its toxicity ceiling. Dial the <acc>liver</acc> back down to stay safe, and your iron and zinc slip again. <m>Every correction disturbs something else, and you find yourself chasing your own tail through a vast space of possibilities</m> while dozens of constraints press in from all sides.",

  <React.Fragment key="stigler-link">
    <ParsedText text="This is essentially the famous " />
    <SquiggleLink href="https://math.berkeley.edu/~mgu/MA170F2015/Diet.pdf">
      <ParsedText text="<acc>Stigler diet problem</acc>" />
    </SquiggleLink>
    <ParsedText text=", first posed by economist <acc>George Stigler</acc> in <m>1945</m>." />
  </React.Fragment>,

  "For decades, nutritionists laboured over food composition tables, manually balancing plates through rules of thumb and professional judgment. <m>And to their credit, we do broadly understand what a balanced diet looks like.</m>",

  "But knowing the shape of a healthy diet in general terms is a far cry from knowing your <acc>optimal diet</acc> specifically: the <acc>precise</acc> combination of the foods you actually eat, priced at what you actually pay, tuned to your personal nutritional targets.",

  "<m>That last mile, where individual foods, real prices, and exact nutrient thresholds all have to line up at once,</m> is where human intuition runs out of road.",

  "This is precisely where <acc>mathematical optimisation</acc> earns its keep.",

  "With Knap<acc>[Snack]</acc>, all you need to do is provide your personal stats and your health goal. Then you input a list of foods available to you — <m>whatever's in your kitchen or locally accessible</m> — along with their prices. Our optimiser calculates the exact combination and quantities of those foods that will meet <m>all your macro and micronutrient targets</m> at the lowest possible cost.",

  "Knap<acc>[Snack]</acc> is designed for everyone who cares about nutrition.\n• <acc>Individuals</acc> who want to <m>build personal meal plans that are both nutritionally complete and as affordable as possible</m>\n• <acc>Nutritionists and dietitians</acc> who want to <m>generate evidence-based plans for their clients without hours of manual calculation</m>\n• <acc>Public health researchers and policymakers</acc> who want to <m>model dietary inventions and food costs for entire communities</m>",
];

const IntroSection = () => {
  return (
    <section
      id="intro"
      className="relative flex min-h-screen w-full flex-col py-16 sm:py-24"
      lang="en"
    >
      <div className="mx-auto w-full max-w-[1204px] px-4 sm:px-6 lg:px-8">
        <div className="flex w-full flex-col space-y-8 sm:space-y-10">
          {paragraphs.map((paragraph, idx) => (
            <AlternatingMotionItem key={idx} index={idx}>
              <div className="no-select whitespace-pre-wrap text-4xl font-black leading-[0.8] tracking-tighter text-foreground transition-colors duration-300 sm:text-6xl md:text-8xl lg:text-[2rem]">
                {typeof paragraph === "string" ? (
                  <ParsedText text={paragraph} />
                ) : (
                  paragraph
                )}
              </div>
            </AlternatingMotionItem>
          ))}
        </div>
      </div>
    </section>
  );
};

export default IntroSection;
