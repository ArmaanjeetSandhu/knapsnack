import { motion } from "framer-motion";
import React from "react";
import { AlternatingMotionItem } from "../../common/AlternatingMotionItem";
import { ParsedText } from "../../common/ParsedText";

const SquiggleLink = ({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="group relative inline-block transition-opacity hover:opacity-80"
  >
    <span className="relative z-10">{children}</span>
    <svg
      className="absolute -bottom-1 left-0 w-full sm:-bottom-2"
      height="14"
      viewBox="0 0 100 14"
      preserveAspectRatio="none"
      aria-hidden
    >
      <motion.path
        d="M0,9 Q25,3 50,9 Q75,15 100,9"
        fill="none"
        stroke="var(--accent-highlight)"
        strokeWidth="2.5"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, delay: 0.4, ease: "easeInOut" }}
      />
    </svg>
  </a>
);

const faqs = [
  {
    question: "What about MyFitnessPal?",
    answer: [
      "Apps like <acc>MyFitnessPal</acc>, <acc>Cronometer</acc>, and <acc>MacroFactor</acc> are excellent meal trackers, but when you use them to plan your meals, you follow a <m>reactive approach:</m> logging what you've already eaten, observing patterns over time, and then manually adjusting future meals based on past entries. This can create a time-consuming cycle of trial and error. <m>Moreover, these tracking apps don't account for cost.</m> Even if you manage to create a nutritionally perfect plan, there's no guarantee it's the most economical option available to you.",
      "Knap<acc>[Snack]</acc>, on the other hand, is <acc>proactive</acc> and <acc>cost-optimised</acc> from the start.",
      "The most effective approach combines both tools: Knap<acc>[Snack]</acc> to plan your meals, and your preferred tracker to monitor your adherence to that plan.",
    ],
  },
  {
    question: "How are my nutritional requirements determined?",
    answer: [
      <h4
        key="macros"
        className="mb-2 mt-2 text-2xl font-black leading-[0.9] tracking-tighter text-foreground transition-colors duration-300 sm:text-3xl lg:text-[1.75rem]"
      >
        Macronutrients
      </h4>,
      "Knap<acc>[Snack]</acc> uses the Mifflin-St. Jeor equation to calculate your BMR (Basal Metabolic Rate), which estimates the number of calories your body burns at rest. Then, based on your activity level, your TDEE (Total Daily Energy Expenditure) is calculated. Depending on your health goals, you choose a target intake between <acc>75%</acc> and <acc>125%</acc> of your TDEE. <m>This becomes your daily caloric goal.</m> Finally, you customise how you distribute those calories across fats, carbohydrates, and protein.",
      <h4
        key="micros"
        className="mb-2 mt-8 text-2xl font-black leading-[0.9] tracking-tighter text-foreground transition-colors duration-300 sm:text-3xl lg:text-[1.75rem]"
      >
        Micronutrients
      </h4>,
      "Your daily micronutrient targets — RDAs (minimums) and ULs (safe maximums) — are determined based on your age and gender, <m>using the Dietary Reference Intakes published by the National Institutes of Health (NIH).</m>",
    ],
  },
  {
    question: "How does Knap[Snack] work?",
    answer: [
      "At its core, Knap<acc>[Snack]</acc> is a cost-minimisation engine. You tell it what foods are available, what your body needs nutritionally, and how you want to distribute your calories across protein, carbs, and fat. It then finds the most inexpensive combination of foods that satisfies all of those requirements simultaneously.",
      <h4
        key="hitting-targets"
        className="mb-2 mt-2 text-2xl font-black leading-[0.9] tracking-tighter text-foreground transition-colors duration-300 sm:text-3xl lg:text-[1.75rem]"
      >
        Hitting your nutritional targets
      </h4>,
      "Every essential nutrient has a recommended daily amount (RDA) — a floor that your diet needs to clear. Some nutrients also have an upper tolerable limit (UL), a ceiling you should stay under. Knap<acc>[Snack]</acc> treats both of these as hard rules: the optimiser will only accept meal plans that stay within those bounds across every nutrient it tracks.",
      <h4
        key="distributing-calories"
        className="mb-2 mt-2 text-2xl font-black leading-[0.9] tracking-tighter text-foreground transition-colors duration-300 sm:text-3xl lg:text-[1.75rem]"
      >
        Distributing your calories
      </h4>,
      "Once your daily calorie target is calculated, you choose what percentage of those calories should come from protein, carbs, and fat. Knap<acc>[Snack]</acc> converts those percentages into gram targets, and then sets those as floors the meal plan must reach.",
      "<m>Two additional rules apply regardless of your preferences. Fibre is held to at least 14 grams per 1,000 calories, in line with evidence-based dietary guidance. And saturated fat is capped at 10% of your total calorie goal.</m>",
      <h4
        key="staying-close"
        className="mb-2 mt-2 text-2xl font-black leading-[0.9] tracking-tighter text-foreground transition-colors duration-300 sm:text-3xl lg:text-[1.75rem]"
      >
        Staying close to your macro targets
      </h4>,
      "Because macronutrients lack the well-defined toxicity thresholds that some micronutrients have, there is no natural hard ceiling for them the way there is for, say, vitamin A. But leaving macronutrients completely unbounded can cause the optimiser to overshoot your targets dramatically, throwing off your intended ratios and pushing your total intake higher than planned. To handle this, Knap<acc>[Snack]</acc> allows each macronutrient to land anywhere between its floor and a small percentage above its target — between 0% and 10% over. This gives the optimiser just enough flexibility to find feasible solutions while keeping the results close to what you asked for.",
      "Because cost-minimisation and macro-accuracy are both goals, Knap<acc>[Snack]</acc> systematically explores combinations of those allowable deviation percentages, prioritising solutions that stay as close to your targets as possible while still being cost-effective.",
      <h4
        key="controlling-portions"
        className="mb-2 mt-8 text-2xl font-black leading-[0.9] tracking-tighter text-foreground transition-colors duration-300 sm:text-3xl lg:text-[1.75rem]"
      >
        Controlling portions and food inclusion
      </h4>,
      'Each food item has a maximum serving size that you set. A food is either included in the meal plan or it is excluded entirely — there is no in-between. If a food is included, it must appear in at least one serving, and it cannot exceed its maximum. Foods you mark as "Must Include" are guaranteed to appear. Foods you mark as "Discrete Servings" will only appear in whole-number amounts — so you will never be told to eat 1.5 eggs.',
      <React.Fragment key="technical-link">
        <ParsedText text="<m>For a more technical dive into the algorithm, you can read about how it works</m> " />
        <SquiggleLink href="https://github.com/ArmaanjeetSandhu/knapsnack?tab=readme-ov-file#how-it-works">
          here
        </SquiggleLink>
        <ParsedText text="<m>.</m>" />
      </React.Fragment>,
    ],
  },
  {
    question: "I take supplements. Can I include those?",
    answer: (
      <>
        <ParsedText text="One of Knap<acc>[Snack]</acc>'s goals is to <acc>reduce supplement dependence</acc> by optimising whole food choices, <m>but the flexibility is there if needed. We guide you through the process</m> " />
        <SquiggleLink href="https://knapsnack-b4b10d2b0910.herokuapp.com/faq#how-do-i-include-supplements">
          here
        </SquiggleLink>
        <ParsedText text="<m>.</m>" />
      </>
    ),
  },
  {
    question: "Why is it called Knap<acc>[Snack]</acc>?",
    answer: (
      <>
        <ParsedText text="The name is a play on the classic " />
        <SquiggleLink href="https://en.wikipedia.org/wiki/Knapsack_problem">
          knapsack problem
        </SquiggleLink>
        <ParsedText text=" in computer science, <m>an optimisation challenge that, like meal planning, involves selecting the best combination of items under constraints.</m> Certain variants of the knapsack problem are solvable using linear programming, which is what Knap<acc>[Snack]</acc> uses, making it a fitting inspiration." />
      </>
    ),
  },
];

type FaqAnswer =
  | Array<string | React.ReactElement>
  | string
  | React.ReactElement;

interface ContentRendererProps {
  content: FaqAnswer;
}

const ContentRenderer = ({ content }: ContentRendererProps) => {
  if (React.isValidElement(content)) {
    return <div className="whitespace-pre-wrap">{content}</div>;
  }
  if (Array.isArray(content)) {
    return (
      <div className="space-y-4 sm:space-y-6">
        {content.map((item, index) =>
          typeof item === "string" ? (
            <div key={index} className="whitespace-pre-wrap">
              <ParsedText text={item} />
            </div>
          ) : (
            React.cloneElement(item as React.ReactElement, { key: index })
          ),
        )}
      </div>
    );
  }
  return (
    <div className="whitespace-pre-wrap">
      <ParsedText text={content as string} />
    </div>
  );
};

const FaqSection = () => {
  return (
    <section
      id="faq"
      className="relative flex min-h-screen w-full flex-col py-16 sm:py-24"
    >
      <div className="mx-auto w-full max-w-[1204px] px-4 sm:px-6 lg:px-8">
        <div className="flex w-full flex-col space-y-8 sm:space-y-10">
          {faqs.map((faq, idx) => (
            <AlternatingMotionItem key={idx} index={idx}>
              <h3 className="mb-4 text-3xl font-black leading-[0.9] tracking-tighter text-foreground transition-colors duration-300 sm:text-4xl lg:text-[2rem]">
                <ParsedText text={faq.question} />
              </h3>

              <div className="text-xl font-black leading-[0.9] tracking-tighter text-foreground transition-colors duration-300 sm:text-2xl lg:text-[1.5rem]">
                <ContentRenderer content={faq.answer} />
              </div>
            </AlternatingMotionItem>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FaqSection;
