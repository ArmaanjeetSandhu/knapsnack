import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ChevronDown } from "lucide-react";
import PropTypes from "prop-types";
import React, { useEffect, useRef, useState } from "react";
import { BlockMath, InlineMath } from "react-katex";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";

const faqs = [
  {
    question: "What is Knap[Snack]?",
    answer: [
      "Knap[Snack] is a cost-aware meal planning application that solves a problem most nutrition apps ignore: creating the cheapest possible diet that still meets all your nutritional needs.",
      "You provide your personal stats (age, height, weight, etc.) and your fitness goal. Then you input a list of foods available to you—whatever's in your kitchen or locally accessible—along with their prices. Knap[Snack] then uses mathematical optimization to calculate the exact combination and quantities of those foods that will meet all your macro and micronutrient targets at the lowest possible cost.",
      "The result is a personalized, goal-specific meal plan that hits your nutritional requirements without wasting money.",
    ],
  },
  {
    question: "What about MyFitnessPal?",
    answer: [
      "Apps like MyFitnessPal, Cronometer, and MacroFactor are meal trackers, not planners. When you use them to plan your meals, you follow a reactive approach: logging what you've already eaten, observing patterns over time, and then manually adjusting future meals based on past entries. This can create a time-consuming cycle of trial and error. Moreover, these tracking apps don't account for cost. Even if you manage to create a nutritionally perfect plan, there's no guarantee it's the most economical option available to you.",
      "Knap[Snack], on the other hand, is proactive and cost-optimized from the start.",
      "The most effective approach combines both tools: Knap[Snack] to plan your meals, and your preferred tracker to monitor your adherence to that plan.",
    ],
  },
  {
    question: "How does Knap[Snack] work?",
    answer: [
      "Under the hood, Knap[Snack] uses an optimization algorithm called mixed-integer linear programming (MILP). Here's the math:",
      <h3 key="objective-header" className="text-xl font-semibold mt-4">
        Objective
      </h3>,
      "The objective is to minimize the total cost of the diet:",
      "$$\n\\text{Minimize } \\sum_{i=1}^{n} c_i x_i\n$$",
      "where:\n\t• $n$ is the number of available food items\n\t• $c_i$ is the cost per serving of food item $i$\n\t• $x_i$ is the number of servings of food item $i$",
      <h3 key="constraints-header" className="text-xl font-semibold mt-4">
        Constraints
      </h3>,
      "The optimization is subject to the following constraints:",
      <h4 key="micronutrients-header" className="font-semibold mt-2">
        Micronutrients
      </h4>,
      "For each nutrient $j$, the total amount in the diet must meet or exceed the minimum requirement:",
      "$$\n\\sum_{i=1}^{n} a_{ij} x_i \\geq b_j \\quad \\forall j \\in \\{1,2,...,m\\}\n$$",
      "For nutrients with established upper limits, the total amount must not exceed the maximum allowable intake:",
      "$$\n\\sum_{i=1}^{n} a_{ij} x_i \\leq u_j \\quad \\forall j \\in \\{1,2,...,p\\}\n$$",
      "where:\n\t• $m$ is the number of nutrients\n\t• $p$ is the number of micronutrients with upper limits\n\t• $a_{ij}$ is the amount of nutrient $j$ in one serving of food item $i$\n\t• $b_j$ is the minimum required amount of nutrient $j$ (RDA value)\n\t• $u_j$ is the maximum allowable amount of nutrient $j$ (UL value)",
      <h4 key="macronutrients-header" className="font-semibold mt-2">
        Macronutrients
      </h4>,
      "Once Knap[Snack] calculates your daily caloric target, you specify how you want to split that into protein, carbs, and fats. These values then form the lower limits for those nutrients:",
      "$$\n\\sum_{i=1}^{n} a_{i,p} x_i \\geq \\frac{C \\times r_p}{4 \\text{ kcal/g}}\n$$",
      "$$\n\\sum_{i=1}^{n} a_{i,c} x_i \\geq \\frac{C \\times r_c}{4 \\text{ kcal/g}}\n$$",
      "$$\n\\sum_{i=1}^{n} a_{i,f} x_i \\geq \\frac{C \\times r_f}{9 \\text{ kcal/g}}\n$$",
      "where:\n\t• $C$ is your daily caloric goal\n\t• $r_p, r_c$ and $r_f$ are the proportion of calories from protein, carbs, and fats respectively\n\t• $a_{i,p}, a_{i,c}$ and $a_{i,f}$ are grams of protein, carbs, and fats in food item $i$",
      "As per Acceptable Macronutrient Distribution Ranges (AMDR) guidelines, $r_p, r_c$ and $r_f$ must fall within the following percentage ranges:",
      "$$\n10\\% \\le r_p \\le 40\\%, \\quad 40\\% \\le r_c \\le 65\\%, \\quad 20\\% \\le r_f \\le 35\\%\n$$",
      "Additionally, in accordance with evidence-based recommendations, fibre has been given a lower limit of 14 grams per 1000 calories:",
      "$$\n\\sum_{i=1}^{n} a_{i,fb} x_i \\geq \\frac{14 \\times C}{1000}\n$$",
      "And saturated fats have been capped at 10% of your daily caloric goal:",
      "$$\n\\sum_{i=1}^{n} a_{i,sf} x_i \\leq \\frac{0.10 \\times C}{9 \\text{ kcal/g}}\n$$",
      "Unlike micronutrients, macronutrients don't have well-defined toxicity thresholds, so they typically don't require strict upper limits. However, without any upper bounds, the optimizer might converge on solutions where macronutrient values are significantly higher than their intended targets, disrupting your desired macronutrient ratios and resulting in excessive overall intake. At the same time, enforcing zero deviation from each macronutrient target may make it impossible for the optimizer to find a feasible solution. To balance these competing needs, Knap[Snack] allows controlled deviations above your macronutrient targets:",
      "$$\n\\sum_{i=1}^{n} a_{i,p} x_i \\leq \\frac{C \\times r_p}{4 \\text{ kcal/g}} \\times (1 + \\delta_p)$$",
      "$$\n\\sum_{i=1}^{n} a_{i,c} x_i \\leq \\frac{C \\times r_c}{4 \\text{ kcal/g}} \\times (1 + \\delta_c)$$",
      "$$\n\\sum_{i=1}^{n} a_{i,f} x_i \\leq \\frac{C \\times r_f}{9 \\text{ kcal/g}} \\times (1 + \\delta_f)$$",
      "where $\\delta_p, \\delta_c,$ and $\\delta_f$ represent allowable deviation percentages (ranging from 0% to 10%) for protein, carbohydrates, and fats respectively.",
      "This creates a dual-objective optimization problem:",
      "\t• minimizing the total cost of the diet, and",
      "\t• minimizing deviations from your target macronutrient values.",
      "Knap[Snack] solves this using a systematic grid search approach that explores combinations of allowable deviations, prioritizing solutions that stay closest to your nutritional targets while still finding feasible, cost-effective meal plans.",
      <h4 key="servings-header" className="font-semibold mt-2">
        Servings
      </h4>,
      "Each food has a maximum practical serving size $s_i$ (as set by you), and a binary variable $y_i \\in \\{0, 1\\}$ that determines whether the food is included at all. If $y_i = 0$, then $x_i = 0$. If $y_i = 1$, the food must be served in at least 1 unit, but no more than $s_i$:",
      "$$\n x_i \\leq s_i \\cdot y_i \\quad \\text{and} \\quad x_i \\geq y_i \\quad \\forall i \\in \\{1,2,\\dots,n\\}\n$$",
      "If a food item is explicitly marked for 'Discrete Servings', an additional constraint ensures $x_i$ is a natural number, preventing fractional recommendations (e.g., 1.5 eggs):",
      "$$\n x_i \\in \\mathbb{N}\n$$",
    ],
  },
  {
    question: "How do you determine my macro requirements?",
    answer: [
      "Knap[Snack] uses the Mifflin-St. Jeor equation to calculate your BMR (Basal Metabolic Rate), which estimates the number of calories your body burns at rest. Then, based on your activity level, your TDEE (Total Daily Energy Expenditure) is calculated, which is the actual number of calories you burn in a typical day. Depending on your fitness goals, you choose a target intake between 75% and 125% of your TDEE. This becomes your daily caloric goal. Finally, you customize how you distribute those calories across fats, carbohydrates, and protein.",
    ],
  },
  {
    question: "How do you determine my micro requirements?",
    answer:
      "Your daily micronutrient targets—RDAs (minimums) and ULs (safe maximums)—are determined based on your age and gender, using the Dietary Reference Intakes published by the National Institutes of Health (NIH).",
  },
  {
    question: "There are some nutrients that I don't see here. Why is that?",
    answer: [
      "Some nutrients have been deliberately excluded for two broad reasons:",

      <h3 key="vegans" className="text-xl font-semibold mt-4">
        Ensuring Convergence for Vegans/Vegetarians
      </h3>,

      <h4 key="vitamin-d" className="font-semibold mt-2">
        Vitamin D
      </h4>,
      "Most whole foods contain minimal amounts of vitamin D. Including vitamin D as a constraint can prevent the system from converging on any solution at all, even for those without any dietary reservations. More importantly, food sources are not the primary way humans should obtain vitamin D. Sun exposure remains the most effective method, with fortified foods and supplements being the next best options.",

      <h4 key="vitamin-b12" className="font-semibold mt-2">
        Vitamin B12
      </h4>,
      "Similar to vitamin D, vitamin B12 is nearly impossible to obtain in adequate amounts from plant foods alone. Including it would prevent vegans, and often vegetarians, from receiving any meal plan. If you follow a vegan diet, prioritize B12-fortified foods and supplements. If you a follow a vegetarian diet, eggs and dairy can help, though they still contain less B12 than meat.",

      <h3 key="deficiency-rare" className="text-xl font-semibold mt-4">
        Rare Deficiencies in the General Population
      </h3>,

      <h4 key="copper" className="font-semibold mt-2">
        Copper
      </h4>,
      "Copper deficiency is rare because the body uses robust homeostatic mechanisms to regulate absorption and excretion, while drawing from skeletal and muscular reserves as needed.",

      <h4 key="biotin" className="font-semibold mt-2">
        Biotin
      </h4>,
      "Biotin deficiency is uncommon due to its wide availability across many food groups, contributions from intestinal microbiota, and efficient renal and enzymatic recycling.",

      <h4 key="chromium" className="font-semibold mt-2">
        Chromium
      </h4>,
      "Chromium deficiency is exceedingly rare because the mineral is ubiquitous in the environment and frequently enters the diet through soil accumulation or food processing equipment such as stainless steel.",

      <h4 key="molybdenum" className="font-semibold mt-2">
        Molybdenum
      </h4>,
      "Molybdenum deficiency is rare because the body requires only trace amounts, which are easily met through its widespread presence in soils, plants, and dairy products.",

      <h4 key="chloride" className="font-semibold mt-2">
        Chloride
      </h4>,
      "Chloride deficiency is virtually nonexistent in modern diets due to the abundance of sodium chloride in foods and the tight physiological coupling between sodium and chloride regulation.",

      <h4 key="fluoride" className="font-semibold mt-2">
        Fluoride
      </h4>,
      "Fluoride deficiency, particularly with respect to dental health, is rare due to community water fluoridation, widespread use of fluoride-containing dental products, and natural dietary sources such as tea and seafood.",

      "\nAdding more variables to a linear programming model increases computational complexity, and so excluding these nutrients helps Knap[Snack] converge on solutions more efficiently.",
    ],
  },
  {
    question: "What about trans fat, cholesterol, and added sugars?",
    answer: [
      <h4 key="trans-fats" className="font-semibold mt-2">
        Trans Fat
      </h4>,
      "The World Health Organization (WHO) recommends limiting trans fat intake to less than 1% of total daily energy intake. By prioritizing whole food choices over highly processed ones, a diet planned using Knap[Snack] will naturally keep trans fat intake well below this threshold.",
      <h4 key="cholesterol" className="font-semibold mt-2">
        Cholesterol
      </h4>,
      "Earlier versions of the Dietary Guidelines for Americans had set an upper limit of 300 mg per day, but this recommendation was removed in 2015 due to evidence that dietary cholesterol had only a limited effect on blood cholesterol levels for most people. Since there is no longer a defined quantitative upper limit, cholesterol is not explicitly accounted for in Knap[Snack].",
      "If you are concerned, you can read more [[here]], and then apply those insights when planning meals.",
      <h4 key="sugar" className="font-semibold mt-2">
        Added Sugars
      </h4>,
      "Because the food database used by Knap[Snack] does not provide information on added sugars, this metric is not explicitly tracked. Using Knap[Snack] in conjunction with a meal tracker can help you monitor and manage your added sugar intake effectively. The Dietary Guidelines for Americans recommend limiting added sugars to less than 10% of total daily calories, while the WHO conditionally recommends reducing intake to below 5% for additional health benefits, such as a reduced risk of dental caries.",
    ],
  },
  {
    question: "I take supplements. Can I include those here?",
    answer: [
      "One of Knap[Snack]'s goals is to reduce supplement dependence by optimizing whole food choices, but the flexibility is there if needed. To include supplements, you need to import a CSV file containing their nutritional profiles. Ensure the file format matches the CSVs exported from the app's selected foods section.",
      <h4 key="discrete-supps" className="font-semibold mt-2">
        Discrete Supplements (e.g., pills, capsules)
      </h4>,
      "For items taken in whole units, tick the corresponding boxes in the 'Discrete Servings' column. This ensures the optimizer only recommends whole numbers (e.g., 2 pills, not 1.5). Set the 'Serving Size (g)' to 1 so that one unit equals one pill. In the 'Max Serving (g)' column, enter the maximum number of pills you are comfortable consuming daily.",
      <h4 key="continuous-supps" className="font-semibold mt-2">
        Continuous Supplements (e.g., powders, liquids)
      </h4>,
      "For items measured flexibly, leave the 'Discrete Servings' column unchecked. You can then configure the logic in two ways:",
      "\t• By unit (e.g., scoops): Set the 'Serving Size (g)' to 1. This treats one unit as one scoop. In the 'Max Serving (g)' column, enter the maximum number of scoops you are comfortable consuming daily.\n\t• By weight (e.g., grams): Set the 'Serving Size (g)' to the actual weight of one unit (e.g., 20 for a 20g scoop). In the 'Max Serving (g)' column, enter the maximum total weight in grams you are comfortable consuming daily.",
    ],
  },
  {
    question: "Why doesn't the food search have everything I eat?",
    answer: [
      "Knap[Snack]'s food search pulls data from the USDA FoodData Central database, which is quite limited in its scope. To include food items that you don't see in the food search, you can import a CSV with their nutritional profiles (taken from a reliable source). Just ensure that the file format matches the CSVs exported from the app's selected foods section., and that the nutrient values in each row correspond to the amount specified in the 'Serving Size (g)' column.",
    ],
  },
  {
    question: 'I got an "Optimization Failed" error. What now?',
    answer: [
      "This can happen because the math problem Knap[Snack] solves is NP-hard. As you add more constraints, the difficulty increases exponentially, and the solver may fail to converge on a solution.",
      "To help the solver, you can try relaxing the constraints: add more variety to your food list, or increase the maximum serving sizes.",
    ],
  },
  {
    question: "Why is it called Knap[Snack]?",
    answer:
      "The name is a play on the classic [[knapsack problem]] in computer science—an optimization challenge that, like meal planning, involves selecting the best combination of items under constraints. Certain variants of the knapsack problem are solvable using linear programming, which is what Knap[Snack] uses, making it a fitting inspiration.",
  },
  {
    question: "Where can I learn more?",
    answer: [
      "You might want to check out the [[Knap[Snack] blog]], which dives deeper into nutrition science, best practices, and other ideas.",
      "I'm also inspired by and recommend these excellent resources:",
      "\t• [[MacroFactor's Blog]]",
      "\t• [[CronoMeter's Blog]]",
      "\t• [[Gut Bites MD's Blog]]",
    ],
  },
];

const ContentRenderer = ({ content }) => {
  const linkMap = {
    "knapsack problem": "https://en.wikipedia.org/wiki/Knapsack_problem",
    "MacroFactor's Blog": "https://macrofactorapp.com/articles/",
    "CronoMeter's Blog": "https://cronometer.com/blog/",
    "Gut Bites MD's Blog": "https://gutbites.org/stories/",
    "Knap[Snack] blog": "https://knapsnack-b4b10d2b0910.herokuapp.com/blog",
    here: "https://health.clevelandclinic.org/how-much-cholesterol-per-day",
  };

  const parseText = (text) => {
    const regex = /(\$\$[\s\S]*?\$\$|\$.*?\$|\[\[.*?\]\]|https?:\/\/\S+)/g;
    return text.split(regex).map((part, index) => {
      if (!part) return null;

      if (part.startsWith("$$") && part.endsWith("$$")) {
        return (
          <div key={index} className="overflow-x-auto w-full py-2">
            <BlockMath math={part.slice(2, -2)} />
          </div>
        );
      }
      if (part.startsWith("$") && part.endsWith("$")) {
        return <InlineMath key={index} math={part.slice(1, -1)} />;
      }
      if (part.startsWith("[[") && part.endsWith("]]")) {
        const linkText = part.slice(2, -2);
        return (
          <a
            href={linkMap[linkText]}
            key={index}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline"
          >
            {linkText}
          </a>
        );
      }
      if (part.startsWith("http")) {
        return (
          <a
            href={part}
            key={index}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline"
          >
            {part}
          </a>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  if (Array.isArray(content)) {
    return (
      <div className="space-y-2 prose-p:my-0">
        {content.map((item, index) =>
          typeof item === "string" ? (
            <div key={index} className="whitespace-pre-wrap">
              {parseText(item)}
            </div>
          ) : (
            React.cloneElement(item, { key: index })
          )
        )}
      </div>
    );
  }
  return <div className="whitespace-pre-wrap">{parseText(content)}</div>;
};

ContentRenderer.propTypes = {
  content: PropTypes.oneOfType([PropTypes.string, PropTypes.array]).isRequired,
};

const mainQuestion = faqs[0];
const otherFaqs = faqs.slice(1);

const AboutPage = ({ onBack }) => {
  const [openItemIndex, setOpenItemIndex] = useState(null);
  const faqRefs = useRef([]);

  useEffect(() => {
    if (openItemIndex !== null && faqRefs.current[openItemIndex]) {
      setTimeout(() => {
        faqRefs.current[openItemIndex]?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 400);
    }
  }, [openItemIndex]);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Button onClick={onBack} variant="outline" className="mb-4">
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to App
      </Button>
      <Card>
        <CardContent className="p-6">
          <div className="pb-4 border-b">
            <h2 className="text-3xl font-bold mb-3">{mainQuestion.question}</h2>
            <div className="text-muted-foreground leading-relaxed">
              <ContentRenderer content={mainQuestion.answer} />
            </div>
          </div>
          <div className="w-full pt-2">
            {otherFaqs.map((faq, index) => (
              <div
                key={index}
                ref={(el) => (faqRefs.current[index] = el)}
                className="border-b last:border-b-0 scroll-mt-5"
              >
                <button
                  onClick={() =>
                    setOpenItemIndex(openItemIndex === index ? null : index)
                  }
                  className="flex w-full items-center justify-between py-4 text-left font-medium hover:underline focus:outline-none"
                >
                  <span className="text-lg">{faq.question}</span>
                  <motion.div
                    animate={{ rotate: openItemIndex === index ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="h-5 w-5 shrink-0" />
                  </motion.div>
                </button>
                <AnimatePresence initial={false}>
                  {openItemIndex === index && (
                    <motion.section
                      key="content"
                      initial="collapsed"
                      animate="open"
                      exit="collapsed"
                      variants={{
                        open: { opacity: 1, height: "auto" },
                        collapsed: { opacity: 0, height: 0 },
                      }}
                      transition={{
                        duration: 0.4,
                        ease: [0.04, 0.62, 0.23, 0.98],
                      }}
                      className="overflow-hidden"
                    >
                      <div className="pb-4 pt-0 text-muted-foreground leading-relaxed">
                        <ContentRenderer content={faq.answer} />
                      </div>
                    </motion.section>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

AboutPage.propTypes = {
  onBack: PropTypes.func.isRequired,
};

export default AboutPage;
