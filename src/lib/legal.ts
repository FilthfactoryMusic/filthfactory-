export const LEGAL_VERSION = "2026-09-03";
export const LEGAL_CONTACT = "legal@filthfactory.co.uk";
export const SUPPORT_CONTACT = "support@filthfactory.co.uk";
export const OPERATOR = "Filth Factory Music";
export const TRADING_AS = "Filthfactory";
export const JURISDICTION = "England and Wales";
export const MIN_AGE = 18;
export const PAYOUT_MIN_PENCE = 2000;
/** Not VAT-registered. Do not print a VAT line until this is true. */
export const VAT_REGISTERED = false;
export const VAT_PERCENT = 0;
export const GIFTS_ON_SALE = false;

export const LEGAL_PATHS = ["/privacy", "/terms", "/community", "/cookies", "/safety"] as const;

export function isLegalPath(pathname: string) {
  return LEGAL_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export function vatBreakdown(grossPence: number) {
  if (!VAT_REGISTERED || VAT_PERCENT <= 0) {
    return { gross: grossPence, vat: 0, net: grossPence };
  }
  const vat = Math.round((grossPence * VAT_PERCENT) / (100 + VAT_PERCENT));
  return { gross: grossPence, vat, net: grossPence - vat };
}

export const REPORT_REASONS = [
  { id: "copyright", label: "Copyright or unlicensed music" },
  { id: "hate", label: "Hate or harassment" },
  { id: "sexual", label: "Sexual content involving anyone 17 or under" },
  { id: "illegal", label: "Other illegal content" },
  { id: "spam", label: "Spam or scams" },
  { id: "other", label: "Something else" },
] as const;

export type ReportReason = (typeof REPORT_REASONS)[number]["id"];
export type ReportTarget = "mix" | "live" | "user" | "comment";

export type LegalDoc = {
  slug: string;
  title: string;
  updated: string;
  sections: { h: string; p: string[] }[];
};

export const LEGAL_DOCS: LegalDoc[] = [
  {
    slug: "privacy",
    title: "Privacy policy",
    updated: LEGAL_VERSION,
    sections: [
      {
        h: "Who we are",
        p: [
          `${OPERATOR} is a sole trader in the United Kingdom, trading as ${TRADING_AS}. We are the controller of personal data for this service. Contact ${LEGAL_CONTACT}.`,
          "This policy is written for UK GDPR and the Data Protection Act 2018. If you install Filthfactory from Google Play, this policy also covers that listing.",
        ],
      },
      {
        h: "What we collect",
        p: [
          "Account: email and password you create on Filthfactory, or display name, email and profile image from Google or X when you use those buttons.",
          "Membership and money: plan, renewal date, invoices, merch orders (name, UK shipping address and phone, taken by Stripe), and (when gifts are on sale) gifts sent or received, wallet balance and payout requests. Card payments are taken by Stripe. We do not store card numbers.",
          "Booth: show title, genre, city, whether camera is on, and mix titles you drop. Camera and microphone stay on your device to run the booth; we store the fact of a live, not a raw recording archive.",
          "Safety: reports, blocks, age confirmation and the legal consents you tick at checkout.",
          "Technical: session cookies needed to keep you signed in. We do not run advertising trackers.",
        ],
      },
      {
        h: "Why we use it",
        p: [
          "Contract: to run your account, membership, booth and (when enabled) gifts and payouts.",
          "Legal obligation: tax records, safety duties and to respond to lawful requests.",
          "Legitimate interests: keeping the factory free of abuse, fraud and copyright theft.",
          "Consent: confirming you are 18 or over, and any non-essential cookies if we add them later.",
        ],
      },
      {
        h: "Sharing",
        p: [
          "We do not sell your data. We share it with: sign-in providers (Google, X); Stripe (payments — Stripe processes cards and may process data in the United States under its UK GDPR terms and standard contractual clauses); hosting and database providers that run the app; Google Play if you buy membership inside a Play-distributed app (Google Play Billing); and authorities when the law requires it.",
          "DJs see the display name you chose when you send a gift or chat. They do not receive your email or payment details.",
        ],
      },
      {
        h: "How long we keep it",
        p: [
          `Account data lasts while the account is open. Invoices and payout records are kept for six years for UK tax. Closed reports are kept as needed to handle repeats and legal claims. You can ask us to delete an account at ${LEGAL_CONTACT}; we will keep what the law says we must.`,
        ],
      },
      {
        h: "Your rights",
        p: [
          `You can ask for a copy of your data, a correction, erasure, restriction, or to object. You can complain to the ICO (ico.org.uk). Email ${LEGAL_CONTACT}.`,
        ],
      },
      {
        h: "Children",
        p: [
          `Filthfactory is 18+. We do not knowingly take accounts or payments from anyone under ${MIN_AGE}. If we learn an account is under ${MIN_AGE} we close it and refund unspent paid time where the law requires.`,
        ],
      },
      {
        h: "International",
        p: [
          "Sign-in providers, Stripe and hosting may process data outside the UK. We rely on UK adequacy decisions or standard contractual clauses those providers offer.",
        ],
      },
    ],
  },
  {
    slug: "terms",
    title: "Terms of use",
    updated: LEGAL_VERSION,
    sections: [
      {
        h: "The deal",
        p: [
          `These terms are a contract between you and ${OPERATOR}, a sole trader in the United Kingdom trading as ${TRADING_AS}. English law and the courts of ${JURISDICTION} apply. You must be ${MIN_AGE} or over.`,
          "Listening to mixes, charts, Who's on what and linked live rooms is free. Going live from the booth and dropping mixes requires a paid membership.",
        ],
      },
      {
        h: "Membership",
        p: [
          "Resident is £5.00 a calendar month. Featured is £15.00 a calendar month and advertises your live on Discover while you are on air. Prices are in GBP. We are not VAT-registered, so no VAT is charged. If that changes, this page will say so.",
          "Membership is a rolling digital subscription. It starts when Stripe confirms payment and renews each calendar month until you cancel in Account. Cancel stops the next renewal and ends booth access immediately. We do not refund the current month once it has started, except where UK law says we must.",
          "Consumer Contracts Regulations 2013 give you a 14-day cooling-off right for distance contracts. Digital content is supplied immediately when membership starts. By ticking the checkout box you consent to immediate supply and accept that you lose that cooling-off right for that period.",
          "Web purchases are taken by Stripe on behalf of Filth Factory Music. If you later install Filthfactory from Google Play, digital purchases made inside that app use Google Play Billing, as Google requires.",
        ],
      },
      {
        h: "Gifts",
        p: [
          "Live gifts and DJ payouts are not on sale yet. Buttons that look like gifts do not take money and do not pay DJs.",
          "When gifts are switched on: they will be digital goods you buy from Filthfactory during a live, not cash transfers. The DJ will receive 50% as a talent / revenue share. Filthfactory will retain 50%. DJs are not employees or workers of Filthfactory. Gift income is theirs to declare to HMRC. Minimum payout will be £20.00. We may hold a payout until identity checks are complete.",
        ],
      },
      {
        h: "Merch",
        p: [
          "Filthfactory merch on this site is sold by Filth Factory Music. It is printed to order and posted to UK addresses. You pay Stripe at checkout. We do not store card numbers.",
          "We do not scrape Instagram. We do not sell another label's merchandise. Mockups of a label mark on a blank are so you can find their shop. Their goods, their contract, their till.",
          "Unused, unused-condition merch may be returned within 14 days of delivery under the Consumer Contracts Regulations 2013. Print-to-order goods that are personalised may be exempt. Email " + SUPPORT_CONTACT + ".",
        ],
      },
      {
        h: "Your content and music rights",
        p: [
          "Filthfactory does not hold a blanket PRS, PPL or MCPS licence. You may only go live or drop a mix if you own the rights or have a licence that covers this platform. Playing someone else's records without a licence is your breach, not a feature.",
          "You grant Filthfactory a worldwide, non-exclusive licence to host, stream, cache and display your mixes, lives, titles, artwork and chat so the service can run, including advertising Featured lives on Discover.",
          "You warrant the content is yours to publish, is not illegal, and does not infringe anyone's rights. We will remove reported copyright material. Repeat infringement closes the account.",
        ],
      },
      {
        h: "Third-party stations, YouTube and Mixcloud",
        p: [
          "On air / Just gone live may show links, titles and artwork for independent UK stations and for public YouTube or Mixcloud rooms. Those broadcasts belong to the station or the DJ. We do not licence their catalogue. A play button on Filthfactory is a link or a technical wrap of the station's own stream so it can play on HTTPS — it is not Filthfactory radio.",
          "Buy links on NEW RELEASES go to Beatport. We do not sell downloadable tracks and we do not run a Beatport affiliate programme.",
        ],
      },
      {
        h: "Acceptable use",
        p: [
          "Follow the Community rules. We can remove content, suspend or close accounts for breach, illegal activity, or risk to other users. We can refuse Featured placement.",
        ],
      },
      {
        h: "Liability",
        p: [
          "Nothing in these terms limits liability for death or personal injury caused by negligence, fraud, or any liability that UK law does not allow us to limit.",
          "We provide the service as a live platform. Streams can drop. For paid membership, if the booth is unavailable for a prolonged period we will extend time or refund a fair portion. Our total liability for any claim is limited to the membership fees you paid in the 12 months before the claim, except where the law says otherwise.",
        ],
      },
      {
        h: "Changes",
        p: [
          `We may update these terms. Material changes will be posted on this page with a new date. Continued use after that date is acceptance. Questions: ${LEGAL_CONTACT}.`,
        ],
      },
    ],
  },
  {
    slug: "community",
    title: "Community rules",
    updated: LEGAL_VERSION,
    sections: [
      {
        h: "The floor",
        p: [
          "Filthfactory is an 18+ room for UK underground DJs. No hate, no harassment, no doxxing, no scams, no spam. Sexual content involving anyone 17 or under is banned — we report it.",
          "Do not broadcast or drop mixes you do not have the rights to. Do not impersonate another DJ.",
        ],
      },
      {
        h: "Report and block",
        p: [
          "Use Report on a mix, live or profile. Use Block to hide someone from your account. We review reports. Illegal content is removed. We may share a report with law enforcement when required.",
        ],
      },
      {
        h: "Enforcement",
        p: [
          `We can remove content, strip Featured, suspend the booth or close the account. Appeals: ${LEGAL_CONTACT}.`,
        ],
      },
    ],
  },
  {
    slug: "cookies",
    title: "Cookies",
    updated: LEGAL_VERSION,
    sections: [
      {
        h: "What we use",
        p: [
          "Filthfactory only sets cookies and local storage that are strictly necessary: the sign-in session, age confirmation (18+), and whether you have seen this notice. These are required to run the service under UK PECR and do not need a marketing opt-in.",
          "We do not currently use analytics, advertising or social pixels. If that changes, this page will say so and we will ask before any non-essential cookie is set.",
          "Stripe sets its own cookies on checkout.stripe.com when you pay. That is Stripe's checkout, not a Filthfactory marketing cookie.",
        ],
      },
    ],
  },
  {
    slug: "safety",
    title: "Safety and standards",
    updated: LEGAL_VERSION,
    sections: [
      {
        h: "18+",
        p: [
          `You must be ${MIN_AGE} or over to use Filthfactory. The age gate is the first screen. Membership is an adult digital purchase.`,
        ],
      },
      {
        h: "User-generated content",
        p: [
          "Lives, mixes, chat, comments and (when enabled) gifts are user-generated. We provide in-app Report and Block, written rules, and human review of open reports. Content that violates the law or these rules is removed.",
          "This is a UK user-to-user service. We take reports of child sexual abuse material, terrorism, and other priority illegal content as an immediate takedown.",
        ],
      },
      {
        h: "Google Play data safety",
        p: [
          "Data collected: name, email, user IDs, purchases, audio and camera access for the booth, crash-free diagnostics we may add later. Purpose: app functionality, account, payments. Not sold. Not used for advertising. Optional: none of the above is optional if you use that feature — camera and mic are only used when you open the booth.",
        ],
      },
      {
        h: "Contact",
        p: [`Safety and legal: ${LEGAL_CONTACT}. Account help: ${SUPPORT_CONTACT}.`],
      },
    ],
  },
];

export function legalBySlug(slug: string) {
  return LEGAL_DOCS.find((d) => d.slug === slug) ?? null;
}
