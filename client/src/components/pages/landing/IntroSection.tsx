import React from "react";

import { AlternatingMotionItem } from "../../common/AlternatingMotionItem";
import { ParsedText } from "../../common/ParsedText";
import { SquiggleLink } from "../../common/SquiggleLink";

const paragraphs: React.ReactNode[] = [
  "Say your personal diet consists of around <acc>100</acc> foods — the full intersection of what's locally accessible and what you actually eat. Not all <acc>100</acc> are in your kitchen at any given moment, but they represent your complete realistic menu.",

  "Most days, you choose what to eat ad-hoc, and it gets you by well enough. <m>But what if you wanted to be more deliberate?</m> To eat in a way that is both nutritionally <acc>complete</acc> and as <acc>inexpensive</acc> as possible?",

  "Each of those <acc>100</acc> foods carries its own cost per serving and its own nutritional profile. Your body, meanwhile, demands, say, <acc>26</acc> different nutrients every day, each with a <acc>floor</acc> you must clear (<acc>zinc</acc>, <acc>folate</acc>, <acc>magnesium</acc>, and so on) and some with a <acc>ceiling</acc> you must not breach (too much <acc>vitamin A</acc> is actually toxic; too much <acc>iron</acc>, dangerous).",

  "Every food you add to your plate nudges all <acc>26</acc> nutrient totals simultaneously, in different directions, by different amounts.",

  "<m>Could you sit down with a pen and paper</m> and find the most inexpensive combination of servings that satisfies every one of those requirements?",

  "Build your meals around <acc>eggs</acc> and <acc>potatoes</acc> because they're cheap and filling, and your <acc>zinc</acc> and <acc>folate</acc> quietly fall short. <acc>Liver</acc> would fix both for very little money, but it's so rich in <acc>vitamin A</acc> that a portion big enough to close the gaps takes you past the toxicity ceiling. Cut it back to a safe sliver, and both gaps reopen. <acc>Lentils</acc> can make up the <acc>folate</acc> without adding any <acc>vitamin A</acc>, but they only get you part of the way on <acc>zinc</acc>, so you're still short, and still searching.",

  "<m>Every correction disturbs something else,</m> and you find yourself chasing your own tail through a <m>vast space of possibilities</m> while dozens of <acc>constraints</acc> press in from all sides.",

  <React.Fragment key="stigler-link">
    <ParsedText text="This is essentially the famous " />
    <SquiggleLink href="https://math.berkeley.edu/~mgu/MA170F2015/Diet.pdf">
      <ParsedText text="<acc>Stigler diet problem</acc>" />
    </SquiggleLink>
    <ParsedText text=", first posed by economist <acc>George Stigler</acc> in <acc>1945</acc>." />
  </React.Fragment>,

  "For decades, nutritionists have laboured over food composition tables, manually balancing plates through rules of thumb and professional judgment. <m>And to their credit, we do broadly understand what a balanced diet looks like.</m>",

  "But knowing the shape of a healthy diet in general terms is a far cry from knowing your <acc>optimal diet</acc> specifically: the <acc>precise</acc> combination of the foods you actually eat, priced at what you actually pay, tuned to your personal nutritional targets.",

  "That last mile, <m>where individual foods, real prices, and exact nutrient thresholds</m> all have to line up at once, is where human intuition runs out of road.",

  "This is precisely where <acc>mathematical optimisation</acc> earns its keep.",

  "With Knap<acc>[Snack]</acc>, all you need to do is provide your personal stats and your health goal. Then you input a list of foods available to you — <m>whatever's in your kitchen or locally accessible</m> — along with their prices. Our optimiser calculates the exact combination and quantities of those foods that will meet all your <acc>macro</acc> and <acc>micronutrient targets</acc> at the lowest possible cost.",
];

const audienceHeading =
  "Knap<acc>[Snack]</acc> is designed for everyone who cares about nutrition.";

const audiences = [
  "<acc>Individuals</acc> who want to <m>build personal meal plans that are both nutritionally complete and as affordable as possible</m>",

  "<acc>Nutritionists</acc> and <acc>dietitians</acc> who want to <m>generate evidence-based plans for their clients without hours of manual calculation</m>",

  "<acc>Public health researchers</acc> and <acc>policymakers</acc> who want to <m>model dietary interventions and food costs for entire communities</m>",
];

const PARAGRAPH_CLASS =
  "no-select text-foreground text-[clamp(1.75rem,1.25rem+1.5vw,2rem)] leading-[0.8] font-black tracking-tighter whitespace-pre-wrap transition-colors duration-300";

const IntroSection = () => {
  return (
    <section
      id="intro"
      className="relative flex w-full flex-col py-4 sm:py-8"
      lang="en"
    >
      <div className="mx-auto w-full max-w-[1204px] px-4 sm:px-6 lg:px-8">
        <div className="flex w-full flex-col space-y-8 sm:space-y-10">
          {paragraphs.map((paragraph, idx) => {
            const itemKey =
              typeof paragraph === "string"
                ? paragraph.slice(0, 32)
                : "stigler-link";
            return (
              <AlternatingMotionItem key={itemKey} index={idx}>
                <div className={PARAGRAPH_CLASS}>
                  {typeof paragraph === "string" ? (
                    <ParsedText text={paragraph} />
                  ) : (
                    paragraph
                  )}
                </div>
              </AlternatingMotionItem>
            );
          })}

          <div className="flex w-full flex-col pt-6 sm:pt-10">
            <AlternatingMotionItem index={0} align="start">
              <h2 className={PARAGRAPH_CLASS}>
                <ParsedText text={audienceHeading} />
              </h2>
            </AlternatingMotionItem>

            <ul className="mt-8 grid gap-8 sm:mt-10 lg:grid-cols-3 lg:gap-10">
              {audiences.map((audience, idx) => (
                <li
                  key={audience.slice(0, 32)}
                  className="border-foreground/15 border-t pt-4"
                >
                  <AlternatingMotionItem index={idx} align="start">
                    <p className="no-select text-foreground text-2xl leading-[0.9] font-black tracking-tighter transition-colors duration-300">
                      <ParsedText text={audience} />
                    </p>
                  </AlternatingMotionItem>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default IntroSection;
