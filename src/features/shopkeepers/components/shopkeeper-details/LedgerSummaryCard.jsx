import { ScrollText } from "lucide-react";
import { AnalyticsCard } from "./DetailRows.jsx";

const grams = (metric) => `${metric?.grams ?? "0.000"} g`;

export function LedgerSummaryCard({ ledger, metalName = "Metal" }) {
  return (
    <AnalyticsCard
      icon={ScrollText}
      title="Ledger Analytics"
      rows={[
        [`Total Debit ${metalName}`,       grams(ledger?.totalDebit)],
        [`Total Credit ${metalName}`,      grams(ledger?.totalCredit)],
        [`Current Outstanding ${metalName}`, grams(ledger?.currentOutstanding)],
        ["Last Payment Received", ledger?.lastPaymentReceived?.date],
        ["Last Delivery Done",    ledger?.lastDeliveryDone?.date],
      ]}
    />
  );
}
