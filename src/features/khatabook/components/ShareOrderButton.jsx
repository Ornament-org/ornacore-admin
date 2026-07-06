import { useState } from "react";
import { Loader2, Share2 } from "lucide-react";
import { getOrderInvoicePdfBlob } from "../utils/orderInvoicePdf.js";

function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function ShareOrderButton({ order, shopName }) {
  const [busy, setBusy] = useState(false);

  const handleClick = async (event) => {
    event.stopPropagation();
    if (busy) return;
    setBusy(true);
    try {
      const { blob, fileName } = getOrderInvoicePdfBlob(order, { shopName });
      const file = new File([blob], fileName, { type: "application/pdf" });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `Order #${order.orderNumber}`,
          text: `Khatabook order #${order.orderNumber}`,
        });
      } else {
        downloadBlob(blob, fileName);
      }
    } catch (error) {
      if (error?.name !== "AbortError") {
        console.error("Failed to share order PDF", error);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      className="khatabook-order__share"
      onClick={handleClick}
      disabled={busy}
      aria-label={`Share order ${order.orderNumber} as PDF`}
      title="Share / download as PDF"
    >
      {busy ? <Loader2 size={16} className="khatabook-order__share-spinner" /> : <Share2 size={16} />}
    </button>
  );
}
