import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";

import { AlternatingMotionItem } from "../../common/AlternatingMotionItem";
import { ParsedText } from "../../common/ParsedText";
import { SquiggleLink } from "../../common/SquiggleLink";

const faqs = [
  {
    question: "What about <acc>MyFitnessPal</acc>?",
    answer: [
      <div key="trackers-links" className="whitespace-pre-wrap">
        <ParsedText text="Apps like " />
        <SquiggleLink href="https://www.myfitnesspal.com/">
          <ParsedText text="<acc>MyFitnessPal</acc>" />
        </SquiggleLink>
        <ParsedText text=", " />
        <SquiggleLink href="https://cronometer.com/">
          <ParsedText text="<acc>Cronometer</acc>" />
        </SquiggleLink>
        <ParsedText text=", and " />
        <SquiggleLink href="https://macrofactor.com/">
          <ParsedText text="<acc>MacroFactor</acc>" />
        </SquiggleLink>
        <ParsedText text=" are excellent meal trackers, but when you use them to plan your meals, you follow a <acc>reactive approach</acc>: <m>logging what you've already eaten, observing patterns over time, and then manually adjusting future meals based on past entries.</m> This can create a time-consuming cycle of trial and error. <m>Moreover, these tracking apps don't account for cost.</m> Even if you manage to create a nutritionally perfect plan, there's no guarantee it's the most economical option available to you." />
      </div>,
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
        <ParsedText text="<acc>Macronutrients</acc>" />
      </h4>,
      "Knap<acc>[Snack]</acc> uses the <acc>Mifflin-St. Jeor</acc> equation to calculate your <acc>BMR</acc> (Basal Metabolic Rate), which estimates the number of calories your body burns at rest. Then, based on your activity level, your <acc>TDEE</acc> (Total Daily Energy Expenditure) is calculated. Depending on your health goals, you choose a target intake between <acc>75%</acc> and <acc>125%</acc> of your <acc>TDEE</acc>. <m>This becomes your daily caloric goal.</m> Finally, you customise how you distribute those calories across <acc>fats</acc>, <acc>carbohydrates</acc>, and <acc>protein</acc>.",
      <h4
        key="micros"
        className="mb-2 mt-8 text-2xl font-black leading-[0.9] tracking-tighter text-foreground transition-colors duration-300 sm:text-3xl lg:text-[1.75rem]"
      >
        <ParsedText text="<acc>Micronutrients</acc>" />
      </h4>,
      "Your daily micronutrient targets — <acc>RDAs</acc> (minimums) and <acc>ULs</acc> (safe maximums) — are determined <m>based on your age and gender</m>, using the Dietary Reference Intakes published by the <acc>National Institutes of Health</acc>.",
    ],
  },
  {
    question: "How does it work?",
    answer: [
      "At its core, Knap<acc>[Snack]</acc> is a cost-minimisation engine.",
      <h4
        key="hitting-targets"
        className="mb-2 mt-2 text-2xl font-black leading-[0.9] tracking-tighter text-foreground transition-colors duration-300 sm:text-3xl lg:text-[1.75rem]"
      >
        <ParsedText text="<acc>Hitting your nutritional targets</acc>" />
      </h4>,
      "Every essential nutrient has a <acc>recommended daily amount</acc> (RDA) — a floor that your diet needs to clear. Some nutrients also have an <acc>upper tolerable limit</acc> (UL), a ceiling you should stay under. Knap<acc>[Snack]</acc> treats both of these as hard rules: <m>the optimiser will only accept meal plans that stay within those bounds across every nutrient it tracks.</m>",
      <h4
        key="distributing-calories"
        className="mb-2 mt-2 text-2xl font-black leading-[0.9] tracking-tighter text-foreground transition-colors duration-300 sm:text-3xl lg:text-[1.75rem]"
      >
        <ParsedText text="<acc>Distributing your calories</acc>" />
      </h4>,
      "Once your daily calorie target is calculated, you choose what percentage of those calories should come from <acc>protein</acc>, <acc>carbs</acc>, and <acc>fat</acc>. Knap<acc>[Snack]</acc> converts those percentages into gram targets, and then sets those as floors <m>the meal plan must reach.</m>",
      "<m>Two additional rules apply regardless of your preferences.</m> <acc>Fibre</acc> is held to at least <acc>14</acc> grams per <acc>1,000</acc> calories, in line with evidence-based dietary guidance. And <acc>saturated fat</acc> is capped at <acc>10%</acc> of your total calorie goal.",
      <h4
        key="staying-close"
        className="mb-2 mt-2 text-2xl font-black leading-[0.9] tracking-tighter text-foreground transition-colors duration-300 sm:text-3xl lg:text-[1.75rem]"
      >
        <ParsedText text="<acc>Staying close to your macro targets</acc>" />
      </h4>,
      "Because macronutrients lack the well-defined toxicity thresholds that some micronutrients have, there is no natural hard ceiling for them the way there is for, say, <acc>vitamin A</acc>. <m>But leaving macronutrients completely unbounded can cause the optimiser to overshoot your targets dramatically,</m> throwing off your intended ratios and pushing your total intake higher than planned.",
      "To handle this, Knap<acc>[Snack]</acc> allows each macronutrient to land anywhere between its floor and a small percentage above its target — between <acc>0%</acc> and <acc>10%</acc> over. This gives the optimiser <m>just enough flexibility to find feasible solutions</m> while keeping the results close to what you asked for.",
      "Because cost-minimisation and macro-accuracy are both goals, Knap<acc>[Snack]</acc> systematically explores combinations of those allowable deviation percentages, <m>prioritising solutions that stay as close to your targets as possible while still being cost-effective.</m>",
      <h4
        key="controlling-portions"
        className="mb-2 mt-8 text-2xl font-black leading-[0.9] tracking-tighter text-foreground transition-colors duration-300 sm:text-3xl lg:text-[1.75rem]"
      >
        <ParsedText text="<acc>Controlling portions and food inclusion</acc>" />
      </h4>,
      "You set a <acc>maximum serving size</acc> for each food, so nothing is recommended beyond your chosen limit. On top of that, foods that you mark as <acc>“Must Include”</acc> will be <m>guaranteed to appear</m> in the plan, and foods you mark as <acc>“Discrete Servings”</acc> will only appear in <m>whole-number amounts</m>, so you'll never be told to eat, say, <acc>1.5</acc> eggs.",
      <div key="technical-link" className="whitespace-pre-wrap">
        <ParsedText text="<m>For a more technical dive into the algorithm,</m> you can read about how it works " />
        <SquiggleLink href="https://github.com/ArmaanjeetSandhu/knapsnack?tab=readme-ov-file#how-it-works">
          <ParsedText text="<acc>here</acc>" />
        </SquiggleLink>
        <ParsedText text="." />
      </div>,
    ],
  },
  {
    question: "This seems like overkill!",
    answer: [
      "Fair point. And you’re right, it is! You’ll notice Knap<acc>[Snack]</acc> meal plans are precise down to the hundredth of a gram. But those granular numbers <m>aren't really meant to be followed to the letter.</m> We don’t expect you to weigh out <acc>118.4g</acc> of banana or <acc>27.3g</acc> of almonds.",
      "The precision is there because seeing exact quantities is what <m>trains your sense of proportion</m> in the first place. Once you've seen that your plan calls for roughly one medium banana and a handful of almonds, you start to internalise what <acc>“enough carb”</acc> or <acc>“enough healthy fat”</acc> actually looks like on a plate — <m>no scale required.</m>",
      <div key="overkill-1" className="whitespace-pre-wrap">
        <ParsedText text="The real goal, <m>in other words,</m> is not to turn you into an " />
        <SquiggleLink href="https://en.wikipedia.org/wiki/Orthorexia_nervosa">
          <ParsedText text="<acc>orthorexic</acc>" />
        </SquiggleLink>
        <ParsedText text=", but to give you a reference point precise enough to be genuinely useful, one you can  translate into practical, real-world amounts and carry with you <m>long after you've closed the app.</m>" />
      </div>,
    ],
  },
  {
    question:
      "Okay but I’m supposed to put in all the prices myself? <acc>No way!</acc>",
    answer: [
      "We get it. An app shouldn't inconvenience you more than it helps you. That's why Knap<acc>[Snack]</acc> works just fine even if you never enter a single price. Every food item starts with a default price of <acc>0</acc>, and you're welcome to leave it that way. <m>The app will still build you a nutritionally complete meal plan tailored to your needs.</m> We're also planning to roll out more objectives in the future, other than cost minimisation, such as optimising for <acc>food variety</acc> or <acc>caloric intake</acc>. And these wouldn't require any price data at all.",
    ],
  },
  {
    question: "I take supplements. Can I include those?",
    answer: (
      <>
        <ParsedText text="One of Knap<acc>[Snack]</acc>'s goals is to <acc>reduce supplement dependence</acc> by optimising whole food choices, <m>but the flexibility is there if needed.</m> We guide you through the process " />
        <SquiggleLink href="https://knapsnack-b4b10d2b0910.herokuapp.com/faq#how-do-i-include-supplements">
          <ParsedText text="<acc>here</acc>" />
        </SquiggleLink>
        <ParsedText text="." />
      </>
    ),
  },
  {
    question: "Why is it called Knap<acc>[Snack]</acc>?",
    answer: (
      <>
        <ParsedText text="The name is a play on the classic " />
        <SquiggleLink href="https://en.wikipedia.org/wiki/Knapsack_problem">
          <ParsedText text="<acc>knapsack problem</acc>" />
        </SquiggleLink>
        <ParsedText text=" in <acc>computer science</acc>, an optimisation challenge that, like meal planning, involves selecting the <m>best combination of items</m> under constraints. Certain variants of the knapsack problem are solvable using <acc>linear programming</acc>, which is what Knap<acc>[Snack]</acc> uses, making it a fitting inspiration." />
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
  const [openItemIndex, setOpenItemIndex] = useState<number | null>(null);
  const faqRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    if (openItemIndex !== null && faqRefs.current[openItemIndex])
      setTimeout(() => {
        faqRefs.current[openItemIndex]?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 400);
  }, [openItemIndex]);

  const handleToggle = (index: number) => {
    setOpenItemIndex(openItemIndex === index ? null : index);
  };

  return (
    <section id="faq" className="relative flex w-full flex-col py-4 sm:py-8">
      <div className="mx-auto w-full max-w-[1204px] px-4 sm:px-6 lg:px-8">
        <div className="flex w-full flex-col space-y-2 sm:space-y-2">
          {faqs.map((faq, idx) => {
            const isRightAligned = idx % 2 !== 0;

            return (
              <AlternatingMotionItem key={idx} index={idx}>
                <div
                  ref={(el) => {
                    faqRefs.current[idx] = el;
                  }}
                  className="scroll-mt-24 border-b border-muted pb-6 last:border-b-0"
                >
                  <button
                    onClick={() => handleToggle(idx)}
                    className={`group flex w-full items-start focus:outline-none ${
                      isRightAligned
                        ? "flex-row-reverse text-right"
                        : "flex-row text-left"
                    }`}
                  >
                    <h3 className="mb-4 text-3xl font-black leading-[0.9] tracking-tighter text-foreground transition-colors duration-300 group-hover:opacity-80 sm:text-4xl lg:text-[2rem]">
                      <ParsedText text={faq.question} />
                    </h3>
                    <motion.div
                      animate={{ rotate: openItemIndex === idx ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className={`mt-1 flex-shrink-0 ${
                        isRightAligned ? "mr-4" : "ml-4"
                      }`}
                    >
                      <ChevronDown className="h-8 w-8 text-foreground" />
                    </motion.div>
                  </button>

                  <AnimatePresence initial={false}>
                    {openItemIndex === idx && (
                      <motion.section
                        key="content"
                        initial="collapsed"
                        animate="open"
                        exit="collapsed"
                        variants={{
                          open: {
                            opacity: 1,
                            height: "auto",
                            marginTop: "1rem",
                          },
                          collapsed: {
                            opacity: 0,
                            height: 0,
                            marginTop: "0rem",
                          },
                        }}
                        transition={{
                          duration: 0.4,
                          ease: [0.04, 0.62, 0.23, 0.98],
                        }}
                        className="overflow-hidden"
                      >
                        <div
                          className={`pb-4 text-xl font-black leading-[0.9] tracking-tighter text-foreground transition-colors duration-300 sm:text-2xl lg:text-[1.5rem] ${
                            isRightAligned ? "text-right" : "text-left"
                          }`}
                        >
                          <ContentRenderer content={faq.answer} />
                        </div>
                      </motion.section>
                    )}
                  </AnimatePresence>
                </div>
              </AlternatingMotionItem>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FaqSection;
