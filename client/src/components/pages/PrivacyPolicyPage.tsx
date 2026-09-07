import PolicyDocument, {
  type LinkMap,
  type Section,
} from "../common/PolicyDocument";

const LAST_UPDATED = "07 September 2026";
const CONTACT_EMAIL = "armaanjeetsandhu430@gmail.com";

const LINK_MAP: LinkMap = {
  this: `mailto:${CONTACT_EMAIL}`,
  GitHub: "https://github.com/ArmaanjeetSandhu/knapsnack",
  "FoodData Central site": "https://fdc.nal.usda.gov/",
  "Vercel Privacy Notice":
    "https://vercel.com/legal/privacy-notice",
  "Contentful Privacy Notice":
    "https://www.contentful.com/legal/privacy-at-contentful/privacy-notice/",
  "Google Privacy Policy": "https://policies.google.com/privacy",
  "Buy Me a Coffee Privacy Policy": "https://www.buymeacoffee.com/privacy",
  "Terms of Use": "/terms",
};

const summaryPoints: string[] = [
  "There are no accounts, no logins, and no cookies.",
  "There is no analytics, no advertising, and no third-party tracking of any kind.",
  "Your profile details, food list, and meal plans are kept in your own browser, not on a server.",
  "What you send to the server is used to compute a response and then discarded. There is no database of users.",
  "The only thing deliberately kept is whatever you choose to type into the feedback form.",
];

const sections: Section[] = [
  {
    id: "who-we-are",
    title: "1. Who this policy comes from",
    blocks: [
      {
        kind: "text",
        content:
          "Knap[Snack] is a free, open-source project maintained by an individual developer rather than a company. The full source code, including every line described in this policy, is public and can be inspected on [[GitHub]]. This policy explains what happens to information when you use the hosted version of the app. The [[Terms of Use]] cover the service itself.",
      },
    ],
  },
  {
    id: "on-your-device",
    title: "2. Information kept on your device",
    blocks: [
      {
        kind: "text",
        content:
          "Knap[Snack] works without an account by saving your session in your browser's local storage. This data lives on your device, under your browser profile. It is not uploaded anywhere, and it is not readable by us. It includes:",
      },
      {
        kind: "list",
        items: [
          "The details you enter in the personal information form: age, gender, height, weight, activity level, smoking status, calorie target, and macronutrient split.",
          "Your calculated nutrient requirements, along with any custom nutrient bounds you set.",
          "Your selected foods, together with the prices, serving sizes, and serving limits you assign to them.",
          "Your most recent optimised meal plans, so you can return to them later.",
          "Interface preferences, such as your light or dark theme choice and where you are in the planning flow.",
        ],
      },
      {
        kind: "text",
        content:
          "Some of this is health-related information, so it is worth knowing that anyone with access to your device and browser profile can read it. On a shared or public computer, clear it when you are done.",
      },
      {
        kind: "text",
        content:
          "You can erase all of it at any time. The 'Start Over' action in the app clears everything Knap[Snack] has stored, and clearing site data through your browser settings has the same effect. Nothing survives on our side once you do.",
      },
    ],
  },
  {
    id: "sent-to-server",
    title: "3. Information sent to the server",
    blocks: [
      {
        kind: "text",
        content:
          "Some features need a server to do the maths. In each case the information is held in memory only for as long as it takes to compute a response, and is then discarded. It is not written to a database, and it is not linked to you or to any identifier.",
      },
      {
        kind: "list",
        items: [
          "**Food search:** the search terms you type. The server forwards these to the USDA FoodData Central API using the project's own API key, so USDA receives the query from our server, not from your browser.",
          "**Nutrition calculation:** your age, gender, height, weight, activity level, smoking status, calorie target, and macronutrient ratios, used to compute your nutrient requirements.",
          "**Diet optimisation:** your selected foods and their nutrient values, prices, serving sizes, serving limits, and the nutrient bounds being applied, along with your age, gender, and smoking status.",
          "**Blog pages:** nothing about you. The server simply fetches the article content.",
        ],
      },
    ],
  },
  {
    id: "feedback",
    title: "4. The feedback form",
    blocks: [
      {
        kind: "text",
        content:
          "If you send feedback, your message and, if you provide one, your email address are sent to the server and forwarded by email to the maintainer. This is the one part of Knap[Snack] where information is deliberately retained: the message sits in an ordinary email inbox until it is deleted.",
      },
      {
        kind: "text",
        content:
          "The email field is optional and exists only so that you can be replied to. Leave it blank to send feedback anonymously. Because feedback arrives as plain email, please do not include passwords, medical details, or anything else sensitive. If you want a message you have already sent to be deleted, write to [[this]] email and it will be removed.",
      },
    ],
  },
  {
    id: "logs",
    title: "5. Server logs",
    blocks: [
      {
        kind: "text",
        content:
          "Like any website, Knap[Snack] runs on infrastructure that automatically records technical details of incoming requests: IP address, browser user-agent, the path requested, timestamps, and any error traces. These logs exist to keep the service running and to diagnose faults. They are retained only briefly by the hosting platform, are not used to build a profile of you, and are not combined with anything you enter into the app.",
      },
    ],
  },
  {
    id: "third-parties",
    title: "6. Third-party services",
    blocks: [
      {
        kind: "text",
        content:
          "Knap[Snack] relies on a small number of outside services. Two of them are contacted directly by your browser, which means those companies can see your IP address and user-agent when a page loads.",
      },
      {
        kind: "list",
        items: [
          "**Vercel** hosts the application. See the [[Vercel Privacy Notice]].",
          "**USDA FoodData Central** supplies the nutrition database. Contacted by our server, not your browser. See the [[FoodData Central site]].",
          "**Contentful** stores the blog articles. Contacted by our server, not your browser. See the [[Contentful Privacy Notice]].",
          "**Google Fonts** serves the typefaces used across the site. Contacted by your browser. See the [[Google Privacy Policy]].",
          "**Buy Me a Coffee** provides the support button image in the footer. Contacted by your browser. See the [[Buy Me a Coffee Privacy Policy]].",
        ],
      },
      {
        kind: "text",
        content:
          "No information you enter into Knap[Snack] is shared with any of these services beyond what is described in section 3.",
      },
    ],
  },
  {
    id: "files",
    title: "7. Files you import and export",
    blocks: [
      {
        kind: "text",
        content:
          "CSV import and export happen entirely inside your browser. A CSV you import is parsed locally and never uploaded as a file; the foods it contains are sent to the server only as part of an optimisation request, exactly as described in section 3. Files and images you export are generated in the browser and saved straight to your device.",
      },
    ],
  },
  {
    id: "cookies",
    title: "8. Cookies and tracking",
    blocks: [
      {
        kind: "text",
        content:
          "Knap[Snack] sets no cookies. There is no analytics platform, no advertising network, no tracking pixel, no session recording, no fingerprinting, and no cross-site tracking. Local storage is used purely to make the app work and to remember your preferences, as described in section 2. The Google site-verification file in the site root confirms ownership for search indexing and does not track anything.",
      },
    ],
  },
  {
    id: "security",
    title: "9. Security",
    blocks: [
      {
        kind: "text",
        content:
          "Traffic is served over HTTPS and the app sets a strict Content Security Policy along with standard protective headers such as HSTS, X-Frame-Options, and X-Content-Type-Options. Holding almost no data is itself the strongest protection here. That said, no method of transmission or storage is perfectly secure, and information kept in your browser is only as safe as the device it sits on.",
      },
      {
        kind: "text",
        content:
          "Security issues can be reported to [[this]] email, as listed in the site's security.txt file.",
      },
    ],
  },
  {
    id: "your-choices",
    title: "10. Your choices and rights",
    blocks: [
      {
        kind: "text",
        content:
          "Because nothing you enter is stored on a server or tied to an identity, most data rights are things you can exercise directly and immediately:",
      },
      {
        kind: "list",
        items: [
          "To access or export your data, use the CSV export options in the app. Everything Knap[Snack] holds about you is already on your device.",
          "To erase your data, use 'Start Over' or clear the site's data in your browser.",
          "To stay anonymous when sending feedback, leave the email field blank.",
          "To have feedback you have sent deleted, email a request to [[this]] address.",
        ],
      },
      {
        kind: "text",
        content:
          "Depending on where you live, you may have further statutory rights over personal data. Since the only personal data retained is feedback correspondence, requests about it can be sent to the same address.",
      },
    ],
  },
  {
    id: "children",
    title: "11. Children",
    blocks: [
      {
        kind: "text",
        content:
          "Knap[Snack] is intended for adults. Its nutrition model uses adult reference intake values and only accepts ages of 19 and above, and the service is not directed at children.",
      },
    ],
  },
  {
    id: "changes",
    title: "12. Changes to this policy",
    blocks: [
      {
        kind: "text",
        content:
          "If the way Knap[Snack] handles information changes, this page will be updated and the date at the top revised. Because the project is open source, the full history of changes to this policy is visible in the repository on [[GitHub]].",
      },
    ],
  },
  {
    id: "contact",
    title: "13. Contact",
    blocks: [
      {
        kind: "text",
        content:
          "Questions about privacy, or about anything described here, can be sent to [[this]] email.",
      },
    ],
  },
];

const PrivacyPolicyPage = () => (
  <PolicyDocument
    title="Privacy Policy"
    lastUpdated={LAST_UPDATED}
    summaryPoints={summaryPoints}
    sections={sections}
    linkMap={LINK_MAP}
  />
);

export default PrivacyPolicyPage;
