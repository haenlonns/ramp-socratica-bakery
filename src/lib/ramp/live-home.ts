import type { CurrentUser } from "@/lib/auth";
import type { MockFinanceOverview } from "@/lib/mock-finance";
import type { HomeData, Viewer } from "./types";

const transactionDate = new Intl.DateTimeFormat("en-CA", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

export function viewerForUser(user: { email: string }): Viewer {
  const localPart = user.email.split("@")[0] || "Participant";
  const name = localPart.split(/[._+-]+/).filter(Boolean).map((part) => part[0]?.toUpperCase() + part.slice(1)).join(" ") || "Participant";
  const initials = name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  return { firstName: name.split(" ")[0], initials };
}

export function liveHomeData(user: CurrentUser, overview: MockFinanceOverview): HomeData {
  const viewer = viewerForUser(user);

  return {
    viewer,
    nav: [
      { id: "home", label: "Home", icon: "nav-home", href: "/ramp" },
      { id: "expenses", label: "Expenses", icon: "nav-expenses" },
      { id: "travel", label: "Travel", icon: "nav-travel" },
      { id: "manage", label: "Manage", icon: "nav-manage" },
    ],
    notices: [],
    checklist: { title: "Before you spend", tasks: [] },
    transactions: overview.transactions
      .filter((transaction) => transaction.status === "POSTED")
      .map((transaction) => ({
        id: transaction.id,
        merchantName: transaction.merchantName,
        amountCents: transaction.amountCents,
        currency: transaction.currency,
        occurredAtLabel: transactionDate.format(new Date(transaction.createdAt)),
        invoiceHref: transaction.orderId ? `/invoices/${transaction.orderId}` : undefined,
        invoiceNumber: transaction.orderId ? "View invoice" : undefined,
      })),
    wallet: {
      title: "Workshop card",
      cards: [{
        id: overview.card.id,
        name: `${user.teamName} workshop card`,
        remainingCents: overview.fund.availableCents,
        limitCents: overview.fund.fundLimitCents,
        currency: overview.fund.currency,
        detail: {
          displaySuffix: overview.card.displaySuffix,
          revealable: true,
          nameOnCard: user.email,
          billingAddress: ["Workshop-only card", "Socratica Bakery Supply"],
          issued: [
            { icon: "issued-amount", label: `${(overview.fund.fundLimitCents / 100).toFixed(2)} ${overview.fund.currency} shared team limit` },
            { icon: "issued-card", label: "Nonfunctional workshop card" },
            { icon: "issued-people", label: "Not shareable with other participants" },
          ],
        },
      }],
    },
  };
}
