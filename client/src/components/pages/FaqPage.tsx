import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Download, ExternalLink } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "../ui/card";

type FaqAnswer = Array<string | React.ReactElement> | string;

interface Faq {
  question: string;
  answer: FaqAnswer;
}

const faqs: Faq[] = [
  {
    question: "Is there no signup or login functionality?",
    answer: [
      <span key="no-login-answer">
        Correct. Though that may change if the app grows. In the meantime,
        Knap[Snack] allows you to save your added foods and diet plans by
        exporting them as CSV files. Look for the{" "}
        <Download
          className="inline h-4 w-4"
          style={{ verticalAlign: "-0.10em" }}
        />{" "}
        button in the &lsquo;Selected Foods&rsquo; and &lsquo;Optimised Diet
        Plan&rsquo; sections.
      </span>,
    ],
  },
  {
    question:
      "Why are there differences between my nutritional targets and the actual results?",
    answer: [
      "You may notice small discrepancies between your targets and the actual nutrients provided by a Knap[Snack] plan. This is because the serving quantities used to calculate the plan's nutritional profile are rounded to reasonable, practical values. The resulting discrepancies are negligible and will not meaningfully impact the quality of your diet.",
    ],
  },
  {
    question: "Why are some nutrients not included?",
    answer: [
      "Some nutrients have been deliberately excluded for two broad reasons:",
      <h3 key="vegans" className="mt-4 text-xl font-semibold">
        Ensuring Convergence for Vegans/Vegetarians
      </h3>,
      <h4 key="vitamin-d" className="mt-2 font-semibold">
        Vitamin D
      </h4>,
      "Most whole foods contain minimal amounts of vitamin D. Including vitamin D as a constraint can prevent the system from converging on any solution at all, even for those without any dietary reservations. More importantly, food sources are not the primary way humans should obtain vitamin D. Sun exposure remains the most effective method, with fortified foods and supplements being the next best options.",
      <h4 key="vitamin-b12" className="mt-2 font-semibold">
        Vitamin B₁₂
      </h4>,
      "Similar to vitamin D, vitamin B₁₂ is nearly impossible to obtain in adequate amounts from plant foods alone. Including it would prevent vegans, and often vegetarians, from receiving any meal plan. If you follow a vegan diet, prioritise B₁₂-fortified foods and supplements. If you a follow a vegetarian diet, eggs and dairy can help, though they still contain less B₁₂ than meat.",
      <h3 key="deficiency-rare" className="mt-4 text-xl font-semibold">
        Rare Deficiencies in the General Population
      </h3>,
      <h4 key="copper" className="mt-2 font-semibold">
        Copper
      </h4>,
      "Copper deficiency is rare because the body uses robust homeostatic mechanisms to regulate absorption and excretion, while drawing from skeletal and muscular reserves as needed.",
      <h4 key="biotin" className="mt-2 font-semibold">
        Biotin (Vitamin B₇)
      </h4>,
      "Biotin deficiency is uncommon due to its wide availability across many food groups, contributions from intestinal microbiota, and efficient renal and enzymatic recycling.",
      <h4 key="chromium" className="mt-2 font-semibold">
        Chromium
      </h4>,
      "Chromium deficiency is exceedingly rare because the mineral is ubiquitous in the environment and frequently enters the diet through soil accumulation or food processing equipment such as stainless steel.",
      <h4 key="molybdenum" className="mt-2 font-semibold">
        Molybdenum
      </h4>,
      "Molybdenum deficiency is rare because the body requires only trace amounts, which are easily met through its widespread presence in soils, plants, and dairy products.",
      <h4 key="chloride" className="mt-2 font-semibold">
        Chloride
      </h4>,
      "Chloride deficiency is virtually nonexistent in modern diets due to the abundance of sodium chloride in foods and the tight physiological coupling between sodium and chloride regulation.",
      <h4 key="fluoride" className="mt-2 font-semibold">
        Fluoride
      </h4>,
      "Fluoride deficiency, particularly with respect to dental health, is rare due to community water fluoridation, widespread use of fluoride-containing dental products, and natural dietary sources such as tea and seafood.",
      "\nAdding more variables to a linear programming model increases computational complexity, so excluding these nutrients helps Knap[Snack] converge on solutions more efficiently. If you're curious, you can look up recommended intake values with [[this]] tool.",
    ],
  },
  {
    question: "What about trans fat, cholesterol, and added sugars?",
    answer: [
      <h4 key="trans-fats" className="mt-2 font-semibold">
        Trans Fat
      </h4>,
      "The World Health Organization (WHO) recommends limiting trans fat intake to less than 1% of total daily energy intake. By prioritising whole food choices over highly processed ones, a diet planned using Knap[Snack] will naturally keep trans fat intake well below this threshold.",
      <h4 key="cholesterol" className="mt-2 font-semibold">
        Cholesterol
      </h4>,
      "Earlier versions of the Dietary Guidelines for Americans had set an upper limit of 300 mg per day, but this recommendation was removed in 2015 due to evidence that dietary cholesterol had only a limited effect on blood cholesterol levels for most people. Since there is no longer a defined quantitative upper limit, cholesterol is not explicitly accounted for in Knap[Snack].",
      "If you are concerned, you can read more [[here]], and then apply those insights when planning meals.",
      <h4 key="sugar" className="mt-2 font-semibold">
        Added Sugars
      </h4>,
      "Because the food database used by Knap[Snack] does not provide information on added sugars, this metric is not explicitly tracked. Using Knap[Snack] in conjunction with a meal tracker can help you monitor and manage your added sugar intake effectively. The Dietary Guidelines for Americans recommend limiting added sugars to less than 10% of total daily calories, while the WHO conditionally recommends reducing intake to below 5% for additional health benefits, such as a reduced risk of dental caries.",
    ],
  },
  {
    question: "How do I include supplements?",
    answer: [
      "To include supplements, you need to import a CSV file containing their nutritional profiles. Ensure the file format matches the CSVs exported from the app's selected foods section.",
      <h4 key="discrete-supps" className="mt-2 font-semibold">
        Discrete Supplements (e.g., pills, capsules)
      </h4>,
      "For items taken in whole units, tick the corresponding boxes in the 'Discrete Servings' column. This ensures the optimiser only recommends whole numbers (e.g., 2 pills, not 1.5). Set the 'Serving Size (g)' to 1 so that one unit equals one pill. In the 'Max Serving (g)' column, enter the maximum number of pills you are comfortable consuming daily.",
      <h4 key="continuous-supps" className="mt-2 font-semibold">
        Continuous Supplements (e.g., powders, liquids)
      </h4>,
      "For items measured flexibly, leave the 'Discrete Servings' column unchecked. You can then configure the logic in two ways:",
      "\t• By unit (e.g., scoops): Set the 'Serving Size (g)' to 1. This treats one unit as one scoop. In the 'Max Serving (g)' column, enter the maximum number of scoops you are comfortable consuming daily.\n\t• By weight (e.g., grams): Set the 'Serving Size (g)' to the actual weight of one unit (e.g., 20 for a 20g scoop). In the 'Max Serving (g)' column, enter the maximum total weight in grams you are comfortable consuming daily.",
    ],
  },
  {
    question: "Why doesn't the food search have everything I eat?",
    answer: [
      "Knap[Snack]'s food search pulls data from the USDA FoodData Central database, which is quite limited in its scope. To include food items that you don't see in the food search, you can import a CSV that contains their nutritional profiles taken from a reliable source. Just ensure that the file format matches the CSVs exported from the app's selected foods section, and that the nutrient values in each row correspond to the amount specified in the 'Serving Size (g)' column.",
    ],
  },
];

const LINK_MAP: Record<string, string> = {
  here: "https://health.clevelandclinic.org/how-much-cholesterol-per-day",
  this: "https://www.omnicalculator.com/health/dri",
};

const parseText = (text: string): React.ReactNode[] => {
  const regex = /(\[\[.*?\]\]|https?:\/\/\S+)/g;
  return text.split(regex).map((part, index) => {
    if (!part) return null;

    if (part.startsWith("[[") && part.endsWith("]]")) {
      const linkText = part.slice(2, -2);
      return (
        <a
          key={index}
          href={LINK_MAP[linkText]}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-primary underline"
        >
          {linkText}
          <ExternalLink className="h-3 w-3" />
        </a>
      );
    }
    if (part.startsWith("http")) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-primary underline"
        >
          {part}
          <ExternalLink className="h-3 w-3" />
        </a>
      );
    }
    return <span key={index}>{part}</span>;
  });
};

interface ContentRendererProps {
  content: FaqAnswer;
}

const ContentRenderer = ({ content }: ContentRendererProps) => {
  if (Array.isArray(content)) {
    return (
      <div className="prose-p:my-0 space-y-2">
        {content.map((item, index) =>
          typeof item === "string" ? (
            <div key={index} className="whitespace-pre-wrap">
              {parseText(item)}
            </div>
          ) : (
            React.cloneElement(item, { key: index })
          ),
        )}
      </div>
    );
  }
  return <div className="whitespace-pre-wrap">{parseText(content)}</div>;
};

const createSlug = (text: string): string =>
  text
    .toLowerCase()
    .replace(/[[\]]/g, "")
    .replace(/([a-z0-9])['"]([a-z0-9])/g, "$1$2")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const FaqPage = () => {
  const [openItemIndex, setOpenItemIndex] = useState<number | null>(() => {
    const hash = window.location.hash.slice(1);
    if (!hash) return null;
    const index = faqs.findIndex((faq) => createSlug(faq.question) === hash);
    return index !== -1 ? index : null;
  });

  const faqRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    if (!window.location.hash) window.scrollTo(0, 0);
    else if (openItemIndex !== null && faqRefs.current[openItemIndex])
      setTimeout(() => {
        faqRefs.current[openItemIndex]?.scrollIntoView({ behavior: "smooth" });
      }, 400);
  }, [openItemIndex]);

  const handleToggle = (index: number) => {
    const isOpening = openItemIndex !== index;
    setOpenItemIndex(isOpening ? index : null);
    if (isOpening)
      window.history.replaceState(
        null,
        "",
        `#${createSlug(faqs[index].question)}`,
      );
    else
      window.history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search,
      );
  };

  return (
    <div className="mx-auto w-full p-4">
      <Card>
        <CardContent className="p-6">
          <div className="mb-6 border-b pb-4">
            <h1 className="text-3xl font-bold">Frequently Asked Questions</h1>
          </div>

          <div className="w-full">
            {faqs.map((faq, index) => (
              <div
                key={index}
                ref={(el) => {
                  faqRefs.current[index] = el;
                }}
                className="scroll-mt-5 border-b last:border-b-0"
              >
                <button
                  onClick={() => handleToggle(index)}
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
                      <div className="pb-4 pt-0 leading-relaxed text-muted-foreground">
                        <ContentRenderer content={faq.answer} />
                      </div>
                    </motion.section>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-4 text-left">
            <p className="text-lg font-medium">
              Have more questions?{" "}
              <Link
                to="/feedback"
                className="text-primary underline hover:text-primary/80"
              >
                Send us a message!
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FaqPage;
