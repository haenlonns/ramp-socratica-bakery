// View-model contract for the Ramp simulator UI.
//
// Every screen renders from these shapes, so a team's real fund, card and
// transaction data can replace the sample data without touching components.

export type IconName =
  | "logo-mark-grey"
  | "sb-toggle"
  | "sb-logo"
  | "sb-home"
  | "sb-how"
  | "sb-store"
  | "sb-careers"
  | "nav-home"
  | "nav-expenses"
  | "nav-travel"
  | "nav-manage"
  | "search"
  | "bell"
  | "plus"
  | "help"
  | "chevron-down-12"
  | "chevron-down-16"
  | "home"
  | "envelope"
  | "external-link"
  | "lyft"
  | "wallet"
  | "phone"
  | "close"
  | "chevron-down-expense"
  | "overflow-menu"
  | "select-chevron"
  | "upload"
  | "memo-sparkle"
  | "check"
  | "copy"
  | "issued-amount"
  | "issued-card"
  | "issued-people"
  | "card-avatar"
  | "field-card"
  | "field-receipt"
  | "field-category"
  | "edit"
  | "chevron-red"
  | "chevron-right"
  | "timeline-dot"
  | "eye-off";

export type NavItem = {
  id: string;
  label: string;
  icon: IconName;
  /** Omit to render an inert button that looks the part but does not navigate. */
  href?: string;
  /** Rendered as the yellow pill on the right of the row. */
  badge?: number;
};

export type Viewer = {
  /** Used for the "Good evening, {firstName}" greeting. */
  firstName: string;
  /** Two-letter avatar monogram. */
  initials: string;
};

export type Notice = {
  id: string;
  icon: IconName;
  title: string;
  body: string;
  actionLabel: string;
  dismissible?: boolean;
};

/** One row of the "Before you spend" checklist. */
export type ChecklistTask = {
  id: string;
  title: string;
  description: string;
  actionLabel: string;
  /** Appends the ↗ glyph to the action, as the Chrome extension row does. */
  actionExternal?: boolean;
  completed?: boolean;
  /** Mutually exclusive with imageSrc. */
  icon?: IconName;
  /** Raster logos (Chrome) that are not part of the icon set. */
  imageSrc?: string;
};

/**
 * A spend card in the wallet sidebar. `limitCents` omitted means no progress
 * bar is drawn — matching "General Card", which shows a balance only.
 */
export type WalletCard = {
  id: string;
  name: string;
  remainingCents: number;
  currency: string;
  limitCents?: number;
  href?: string;
  /** Present when the card can be opened in the detail drawer. */
  detail?: CardDetail;
};

/** One line of the "What's issued?" list. */
export type IssuedFact = { icon: IconName; label: string };

/**
 * Card detail shown in the drawer.
 *
 * Only the last four digits are ever modelled: AGENTS.md forbids storing a PAN,
 * CVV or expiry, and the design shows a masked number, so there is nothing here
 * that could carry real card credentials.
 */
export type CardDetail = {
  displaySuffix: string;
  nameOnCard: string;
  billingAddress: string[];
  /** e.g. "Signature Business" — printed under the network mark. */
  networkTier?: string;
  issued: IssuedFact[];
  requestHref?: string;
  /** Flips to show simulator-only credentials when true. */
  revealable?: boolean;
};

export type HomeData = {
  viewer: Viewer;
  nav: NavItem[];
  notices: Notice[];
  checklist: { title: string; tasks: ChecklistTask[] };
  transactions: RampTransaction[];
  /** Omit viewAllHref to render an inert "View all" that does not navigate. */
  wallet: { title: string; viewAllHref?: string; cards: WalletCard[] };
};

/** A posted workshop-card charge, optionally linked to its supplier invoice. */
export type RampTransaction = {
  id: string;
  merchantName: string;
  amountCents: number;
  currency: string;
  occurredAtLabel: string;
  invoiceHref?: string;
  invoiceNumber?: string;
};


/** A posted card transaction on the Ramp home page, newest first. */
export type HomeTransaction = {
  id: string;
  merchantName: string;
  amountCents: number;
  /** Epoch milliseconds. */
  at: number;
  /** Set when the transaction is a store order, so the row can open its invoice. */
  orderId: string | null;
};
