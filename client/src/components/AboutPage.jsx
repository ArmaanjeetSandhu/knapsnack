import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ChevronDown } from "lucide-react";
import PropTypes from "prop-types";
import React, { useState } from "react";
import { BlockMath, InlineMath } from "react-katex";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";

const faqs = [
  {
    question: "What is Knap[Snack]?",
    answer:
      "Knap[Snack] is a cost-aware meal planning application that solves a problem most nutrition apps ignore: creating the cheapest possible diet that still meets all your nutritional needs.\nYou provide your personal stats (age, height, weight, etc.) and your fitness goal. Then you input a list of foods available to you—whatever's in your kitchen or locally accessible—along with their prices. Knap[Snack] then uses mathematical optimization to calculate the exact combination and quantities of those foods that will meet all your macro and micronutrient targets at the lowest possible cost.\nThe result is a personalized, goal-specific meal plan that hits your nutritional requirements without wasting money.",
  },
  {
    question: "Isn't that just what MyFitnessPal does?",
    answer:
      "The key distinction lies in planning versus tracking. MyFitnessPal and similar apps are meal trackers, not planners. They follow a reactive approach: you log what you've already eaten, observe patterns over time, and then manually adjust future meals based on past entries. This creates a time-consuming cycle of trial and error.\nThese tracking apps also lack automatic meal plan generation. Most importantly, they completely ignore cost optimization—even if you manage to create a nutritionally perfect plan, there's no guarantee it's the most economical option available to you.\nKnap[Snack], on the other hand, is proactive and cost-optimized from the start.",
  },
  {
    question: "So should I ditch MyFitnessPal?",
    answer:
      "Not at all. The most effective approach combines both tools: use Knap[Snack] to plan your meals, then use your preferred tracker (MyFitnessPal, Cronometer, MacroFactor, etc.) to monitor your adherence to that plan. Think of Knap[Snack] as your meal architect and your tracker as your accountability partner.",
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
      "where:\n• $n$ is the number of available food items\n• $c_i$ is the cost per serving of food item $i$\n• $x_i$ is the number of servings of food item $i$",
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
      "where:\n• $m$ is the number of nutrients\n• $p$ is the number of micronutrients with upper limits\n• $a_{ij}$ is the amount of nutrient $j$ in one serving of food item $i$\n• $b_j$ is the minimum required amount of nutrient $j$ (RDA value)\n• $u_j$ is the maximum allowable amount of nutrient $j$ (UL value)",
      <h4 key="macronutrients-header" className="font-semibold mt-2">
        Macronutrients
      </h4>,
      "Once Knap[Snack] calculates your daily caloric target, you specify how you want to split that into protein, carbs, and fats. These values then form the lower limits for those nutrients:",
      "$$\n\\sum_{i=1}^{n} a_{i,p} x_i \\geq \\frac{C \\times r_p}{4 \\text{ kcal/g}}\n$$",
      "$$\n\\sum_{i=1}^{n} a_{i,c} x_i \\geq \\frac{C \\times r_c}{4 \\text{ kcal/g}}\n$$",
      "$$\n\\sum_{i=1}^{n} a_{i,f} x_i \\geq \\frac{C \\times r_f}{9 \\text{ kcal/g}}\n$$",
      "where:\n• $C$ is your daily caloric goal\n• $r_p, r_c$ and $r_f$ are the proportion of calories from protein, carbs, and fats respectively\n• $a_{i,p}, a_{i,c}$ and $a_{i,f}$ are grams of protein, carbs, and fats in food item $i$",
      "Unlike micronutrients, macronutrients don't have well-defined toxicity thresholds, so they typically don't require strict upper limits. However, without any upper bounds, the optimizer might converge on solutions where macronutrient values are significantly higher than their intended targets, disrupting your desired macronutrient ratios and resulting in excessive overall intake.",
      "At the same time, enforcing zero deviation from each macronutrient target may make it impossible for the optimizer to find a feasible solution—some level of deviation is often necessary for optimization to succeed. To balance these competing needs, Knap[Snack] allows controlled deviations above your macronutrient targets:",
      "$$\n\\sum_{i=1}^{n} a_{i,p} x_i \\leq \\frac{C \\times r_p}{4 \\text{ kcal/g}} \\times (1 + \\delta_p)$$",
      "$$\n\\sum_{i=1}^{n} a_{i,c} x_i \\leq \\frac{C \\times r_c}{4 \\text{ kcal/g}} \\times (1 + \\delta_c)$$",
      "$$\n\\sum_{i=1}^{n} a_{i,f} x_i \\leq \\frac{C \\times r_f}{9 \\text{ kcal/g}} \\times (1 + \\delta_f)$$",
      "where $\\delta_p, \\delta_c,$ and $\\delta_f$ represent allowable deviation percentages (ranging from 0% to 10%) for protein, carbohydrates, and fats respectively.",
      "This creates a dual-objective optimization problem: minimizing both the total cost of the diet and deviations from your target macronutrient values. Knap[Snack] solves this using a systematic grid search approach that explores combinations of allowable deviations, prioritizing solutions that stay closest to your nutritional targets while still finding feasible, cost-effective meal plans.",
      "Additionally, in accordance with evidence-based recommendations, fibre has been given a lower limit of 14 grams per 1000 calories:",
      "$$\n\\sum_{i=1}^{n} a_{i,fb} x_i \\geq \\frac{14 \\times C}{1000}\n$$",
      "And saturated fats have been capped at 10% of your daily caloric goal:",
      "$$\n\\sum_{i=1}^{n} a_{i,sf} x_i \\leq \\frac{0.10 \\times C}{9 \\text{ kcal/g}}\n$$",
      <h4 key="servings-header" className="font-semibold mt-2">
        Servings
      </h4>,
      "Each food has a maximum practical serving size $s_i$ (as set by you), and a binary variable $y_i \\in \\{0, 1\\}$ that determines whether the food is included at all. If $y_i = 0$, then $x_i = 0$. If $y_i = 1$, the food must be served in at least 1 unit, but no more than $s_i$:",
      "$$\n x_i \\leq s_i \\cdot y_i \\quad \\text{and} \\quad x_i \\geq y_i \\quad \\forall i \\in \\{1,2,\\dots,n\\}\n$$",
    ],
  },
  {
    question: "How do you determine my macro requirements?",
    answer:
      "Knap[Snack] uses the Mifflin-St. Jeor equation to calculate your BMR (Basal Metabolic Rate), which estimates the number of calories your body burns at rest. Then, based on your activity level, your TDEE (Total Daily Energy Expenditure) is calculated, which is the actual number of calories you burn in a typical day. Depending on your fitness goals, you choose a target intake between 75% and 125% of your TDEE. This becomes your daily caloric goal. Finally, you customize how you distribute those calories across fats, carbohydrates, and protein.\nWhile Mifflin-St Jeor works for most people, I plan to incorporate additional equations to provide the most accurate calculation for your specific profile.",
  },
  {
    question: "How do you determine my micro requirements?",
    answer:
      "Your daily micronutrient targets—RDAs (minimums) and ULs (safe maximums)—are determined based on your age and gender, using the Dietary Reference Intakes published by the National Institutes of Health (NIH).",
  },
  {
    question: "I don't see vitamin D here. What's up with that?",
    answer:
      "Adding more variables to linear programming increases computational complexity and can prevent the algorithm from finding solutions. Vitamin D is particularly problematic because most whole foods contain minimal amounts—especially for vegans and vegetarians. Rather than have the system fail to find any solution due to one nutrient, I excluded vitamin D.\nMore importantly, food sources are not the primary way humans should obtain vitamin D. Sun exposure remains the most effective method, with fortified foods and supplements being your next best bets. You can figure out your personal vitamin D requirements here: [[DRI Calculator]]",
  },
  {
    question: "I don't see vitamin B12 here. What's up with that?",
    answer:
      "Similar to vitamin D, B12 is nearly impossible to obtain in adequate amounts from plant foods alone. Including it would prevent vegans and vegetarians from getting any meal plan at all.\nIf you follow a plant-based diet, prioritize B12-fortified foods and supplements. Those with no dietary reservations can rely on eggs and dairy products, though they still contain less B12 than meat. You can figure out your personal vitamin B12 requirements here: [[DRI Calculator]]",
  },
  {
    question: "I don't see copper here. What's up with that?",
    answer:
      "Copper deficiency is extremely rare in healthy individuals. Including copper constraints would add complexity to the optimization without providing meaningful benefit for most users. Unless you have specific health conditions that affect copper metabolism, this mineral rarely requires special attention in meal planning.",
  },
  {
    question: "I take supplements. Can I include those here?",
    answer:
      "The food search pulls data from the USDA FoodData Central database, which doesn't include supplements. However, you can import a CSV file with the nutritional profiles of your supplements. Just ensure it matches the format of exported CSV files from the app's selected foods section.\nOne of Knap[Snack]'s goals is reducing supplement dependence by optimizing whole food choices, but the flexibility is there if needed.",
  },
  {
    question: "Why doesn't the food search have everything I eat?",
    answer:
      "The food search pulls data from the USDA FoodData Central database, which is quite limited in its scope. A more comprehensive alternative is the NCCDB, which I'd love to integrate, but it's prohibitively expensive for now.\nHowever, the workaround is similar to that for supplements: import a CSV file with the nutritional profiles of all the foods you want to include in your diet but don't see in the food search. Just ensure it matches the format of exported CSV files from the app's selected foods section.",
  },
  {
    question: 'I got an "Optimization Failed" error. What now?',
    answer:
      "Unfortunately, linear programming can fail to converge on a solution even when the solution space is feasible. I am trying to make the backend robust to such cases, but until then, you can try adding more food variety to your list, or increasing maximum serving sizes.",
  },
  {
    question: "Why is it called Knap[Snack]?",
    answer:
      "The name is a play on the classic [[knapsack problem]] in computer science—an optimization challenge that, like meal planning, involves selecting the best combination of items under constraints. Certain variants of the knapsack problem are solvable using linear programming, which is what Knap[Snack] uses, making it a fitting inspiration.",
  },
  {
    question: "So cool! Where can I learn more?",
    answer:
      "Thanks! You might want to check out the Knap[Snack] blog, which dives deeper into nutrition science, best practices, and other ideas.\nI'm also inspired by and recommend these excellent resources:\n• [[MacroFactor's Blog]]\n• [[CronoMeter's Blog]]",
  },
];

const ContentRenderer = ({ content }) => {
  const linkMap = {
    "DRI Calculator": "https://www.omnicalculator.com/health/dri",
    "knapsack problem": "https://en.wikipedia.org/wiki/Knapsack_problem",
    "MacroFactor's Blog": "https://macrofactorapp.com/articles/",
    "CronoMeter's Blog": "https://cronometer.com/blog/",
  };

  const parseText = (text) => {
    const regex = /(\$\$[\s\S]*?\$\$|\$.*?\$|\[\[.*?\]\]|https?:\/\/\S+)/g;
    return text.split(regex).map((part, index) => {
      if (!part) return null;

      if (part.startsWith("$$") && part.endsWith("$$")) {
        return <BlockMath key={index} math={part.slice(2, -2)} />;
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
              <div key={index} className="border-b last:border-b-0">
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
