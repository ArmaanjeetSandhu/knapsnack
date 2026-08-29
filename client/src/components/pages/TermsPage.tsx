import PolicyDocument, {
  type LinkMap,
  type Section,
} from "../common/PolicyDocument";

const LAST_UPDATED = "29 August 2026";
const CONTACT_EMAIL = "armaanjeetsandhu430@gmail.com";

const LINK_MAP: LinkMap = {
  "armaanjeetsandhu430@gmail.com": `mailto:${CONTACT_EMAIL}`,
  GitHub: "https://github.com/ArmaanjeetSandhu/knapsnack",
  "USDA FoodData Central": "https://fdc.nal.usda.gov/",
  "Privacy Policy": "/privacy",
  FAQ: "/faq",
};

const summaryPoints: string[] = [
  "Knap[Snack] is a free, open-source hobby project, offered as is and with no guarantees.",
  "It is a maths tool, not a dietitian. Nothing it produces is medical advice.",
  "The plans it generates are built for healthy adults aged 19 and over.",
  "Its results are only as good as the data going in, and several nutrients are deliberately left out of the model.",
  "Check anything important with a qualified professional before acting on it.",
];

const sections: Section[] = [
  {
    id: "agreement",
    title: "1. About these terms",
    blocks: [
      {
        kind: "text",
        content:
          "Knap[Snack] is a free, open-source project maintained by an individual developer in his spare time. By using the site you agree to these terms. If you do not agree with them, please do not use the service. Separately, the [[Privacy Policy]] explains how information is handled.",
      },
      {
        kind: "text",
        content:
          "There is nothing to sign up for and nothing to pay. These terms simply set out what Knap[Snack] does, what it does not do, and what you can reasonably expect from it.",
      },
    ],
  },
  {
    id: "what-it-does",
    title: "2. What the service does",
    blocks: [
      {
        kind: "text",
        content:
          "Knap[Snack] solves a mathematical optimisation problem. You provide your personal details, a list of foods, and the prices you pay for them. It then searches for the cheapest combination of those foods that satisfies a set of nutritional constraints derived from published reference intake values.",
      },
      {
        kind: "text",
        content:
          "That is the whole of it. Knap[Snack] does not assess your health, does not know your medical history, and cannot tell whether a plan it produces is appropriate for you. It optimises the numbers you give it against the constraints it has been programmed with.",
      },
    ],
  },
  {
    id: "not-advice",
    title: "3. Not medical or nutritional advice",
    blocks: [
      {
        kind: "text",
        content:
          "Knap[Snack] does not provide medical, nutritional, or dietetic advice. Its output is the result of a calculation, not a professional recommendation, and it is offered for general informational and educational purposes only. No doctor, dietitian, or nutritionist has reviewed the plan it produces for you.",
      },
      {
        kind: "text",
        content:
          "Nothing on this site is intended to diagnose, treat, cure, or prevent any condition, and it should not be used as a substitute for advice from a qualified healthcare professional. Never disregard or delay seeking professional advice because of something you read here.",
      },
      {
        kind: "text",
        content:
          "You should speak to a qualified professional before making significant changes to your diet, and particularly if any of the following apply to you:",
      },
      {
        kind: "list",
        items: [
          "You are pregnant or breastfeeding. The nutrient requirements for pregnancy and lactation are explicitly excluded from the model.",
          "You have a medical condition affected by diet, including diabetes, kidney disease, liver disease, heart disease, or a digestive disorder.",
          "You take medication that interacts with food or with specific nutrients.",
          "You have a history of disordered eating, or you find that tracking food and calories affects your relationship with eating.",
          "You have food allergies or intolerances. Knap[Snack] has no knowledge of allergens and will not screen them out.",
          "You are considering a substantial calorie deficit or surplus, or a large change in macronutrient balance.",
        ],
      },
    ],
  },
  {
    id: "eligibility",
    title: "4. Who the service is for",
    blocks: [
      {
        kind: "text",
        content:
          "Knap[Snack] is intended for healthy adults aged 19 and over, and it will not accept an age below 19. The nutrient requirements it works from are adult reference values; the model excludes the requirements for infants, children, adolescents, pregnancy, and lactation entirely. Using it to plan meals for anyone in those groups will produce results that are not appropriate for them.",
      },
      {
        kind: "text",
        content:
          "By using the service you confirm that you are 19 or older and that you are using it for yourself.",
      },
    ],
  },
  {
    id: "accuracy",
    title: "5. Accuracy and known limitations",
    blocks: [
      {
        kind: "text",
        content:
          "Knap[Snack] is open about the limits of its model, and you should understand them before relying on a plan:",
      },
      {
        kind: "list",
        items: [
          "**Nutrient data.** Food nutrition data comes from [[USDA FoodData Central]] and is reproduced as supplied. It may be incomplete, averaged across samples, or out of date, and it may not match the specific product in your kitchen.",
          "**Excluded nutrients.** Several nutrients are deliberately left out of the optimisation, including vitamin D, vitamin B₁₂, iodine, copper, biotin, chromium, molybdenum, chloride, and fluoride. A plan meeting every constraint may therefore still be short on something. The [[FAQ]] explains the reasoning for each exclusion.",
          "**Your own inputs.** Prices, serving sizes, serving limits, and any nutrition data you import by CSV are taken at face value and are never verified. Incorrect inputs produce incorrect plans.",
          "**Rounding.** Serving quantities are rounded to practical amounts, so the nutrients in a finished plan will differ slightly from the computed targets.",
          "**Feasibility.** For some combinations of foods and constraints no valid solution exists, and the optimiser will not return a plan. This is a property of the problem, not a fault you can always correct.",
          "**Cost.** The cheapest plan by the numbers is not necessarily the most practical, the most varied, or the most palatable.",
        ],
      },
      {
        kind: "text",
        content:
          "Use your judgement, and treat the output as a starting point rather than a prescription.",
      },
    ],
  },
  {
    id: "your-responsibilities",
    title: "6. Acceptable use",
    blocks: [
      {
        kind: "text",
        content:
          "You are responsible for how you use Knap[Snack] and for anything you do with its output. Please use the service in good faith. In particular, you agree not to:",
      },
      {
        kind: "list",
        items: [
          "Use the service in a way that places an unreasonable load on it, including automated scraping, bulk querying, or stress testing.",
          "Attempt to gain unauthorised access to the service, its infrastructure, or any data it handles.",
          "Upload files intended to disrupt, exploit, or damage the service or other users.",
          "Use the service for any unlawful purpose, or to plan meals for someone in a group the model explicitly excludes.",
          "Present output from Knap[Snack] to others as professional dietary advice, or resell it as such.",
        ],
      },
    ],
  },
  {
    id: "your-content",
    title: "7. Your data and content",
    blocks: [
      {
        kind: "text",
        content:
          "The details you enter and the foods you select stay in your own browser, and CSV files you import are read locally. You keep ownership of anything you create with the service, and exported plans are yours to use as you wish.",
      },
      {
        kind: "text",
        content:
          "Feedback you send may be read and used to improve Knap[Snack], including as the basis for a change to the code, without any obligation or payment to you. Please do not send anything confidential. The [[Privacy Policy]] sets out how feedback is handled.",
      },
    ],
  },
  {
    id: "intellectual-property",
    title: "8. Source code and third-party material",
    blocks: [
      {
        kind: "text",
        content:
          "The Knap[Snack] source code is published on [[GitHub]]. Nutrition data is provided by the United States Department of Agriculture through [[USDA FoodData Central]] and remains subject to its terms. The Knap[Snack] name, look, and written content on this site belong to the project maintainer.",
      },
    ],
  },
  {
    id: "availability",
    title: "9. Availability and changes",
    blocks: [
      {
        kind: "text",
        content:
          "Knap[Snack] is a personal project running on modest infrastructure. It comes with no uptime guarantee and no support commitment. Features may be added, changed, or removed, and the service may be suspended or discontinued at any time without notice.",
      },
      {
        kind: "text",
        content:
          "Because your plans and food lists are stored only in your browser, you are responsible for keeping your own copies. Export anything you want to keep, and expect that clearing your browser data will remove it permanently.",
      },
    ],
  },
  {
    id: "warranties",
    title: "10. Disclaimer of warranties",
    blocks: [
      {
        kind: "text",
        content:
          "The service is provided **as is** and **as available**, without warranties of any kind, whether express or implied. To the fullest extent permitted by law, no warranty is given as to merchantability, fitness for a particular purpose, non-infringement, accuracy, or uninterrupted or error-free operation.",
      },
    ],
  },
  {
    id: "liability",
    title: "11. Limitation of liability",
    blocks: [
      {
        kind: "text",
        content:
          "To the fullest extent permitted by law, the maintainer of Knap[Snack] is not liable for any loss or damage arising from your use of the service. This includes, without limitation, any health consequence of following a generated meal plan, any financial loss from purchasing decisions made using it, any loss of data held in your browser, and any consequence of the service being unavailable.",
      },
      {
        kind: "text",
        content:
          "Nothing in these terms limits liability that cannot be limited by law. Some jurisdictions do not allow certain exclusions, so parts of this section may not apply to you.",
      },
    ],
  },
  {
    id: "third-parties",
    title: "12. Third-party services and links",
    blocks: [
      {
        kind: "text",
        content:
          "Knap[Snack] depends on outside services for hosting, nutrition data, blog content, fonts, and its support button, and it links to external sites for reference. Those services and sites are governed by their own terms, and a link is not an endorsement. The [[Privacy Policy]] lists which third parties are involved and what each one can see.",
      },
    ],
  },
  {
    id: "changes",
    title: "13. Changes to these terms",
    blocks: [
      {
        kind: "text",
        content:
          "These terms may be updated from time to time. The date at the top of this page will change when they are, and because the project is open source the full history of revisions is visible in the repository on [[GitHub]]. Continuing to use the service after a change means you accept the revised terms.",
      },
    ],
  },
  {
    id: "contact",
    title: "14. Contact",
    blocks: [
      {
        kind: "text",
        content:
          "Questions about these terms can be sent to [[armaanjeetsandhu430@gmail.com]].",
      },
    ],
  },
];

const TermsPage = () => (
  <PolicyDocument
    title="Terms of Use"
    lastUpdated={LAST_UPDATED}
    summaryPoints={summaryPoints}
    sections={sections}
    linkMap={LINK_MAP}
  />
);

export default TermsPage;
