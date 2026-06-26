import { ScrollText } from "lucide-react";
import { AnalyticsCard } from "./DetailRows.jsx";

const grams = (metric) => `${metric?.grams ?? "0.000"} g`;

export function LedgerSummaryCard({ ledger }) {
  return (
    <AnalyticsCard
      icon={ScrollText}
      title="Ledger Analytics"
      rows={[
        ["Total Debit Gold", grams(ledger?.totalDebitGold)],
        ["Total Credit Gold", grams(ledger?.totalCreditGold)],
        ["Current Outstanding Gold", grams(ledger?.currentOutstandingGold)],
        ["Last Payment Received", ledger?.lastPaymentReceived?.date],
        ["Last Delivery Done", ledger?.lastDeliveryDone?.date],
      ]}
    />
  );
}
