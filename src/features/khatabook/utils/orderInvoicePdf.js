import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatDate, formatMoney, formatQuantity } from "../components/khatabookFormatters.js";

const MARGIN = 40;

export function buildOrderInvoicePdf(order, { shopName } = {}) {
  const metalName = order.metal?.name ?? "Metal";
  const cs = order.collectionSummary ?? {};
  const creditApplied = cs.collectionAppliedToThisOrder ?? order.orderSummary?.collectionApplied ?? order.creditReceived ?? 0;
  const oldDue = order.oldDue ?? order.priorOutstandingDue ?? order.metalAccount?.priorDue ?? null;
  const orderDue = order.orderDue ?? order.outstandingDue ?? 0;
  const totalMetalDue = order.metalAccount?.totalOutstandingDue ?? order.metalDue ?? 0;

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(shopName ?? "Khatabook Order", MARGIN, 50);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Order #${order.orderNumber}`, MARGIN, 68);
  doc.text(`${metalName} · ${formatDate(order.entryDate)}`, MARGIN, 82);
  doc.text(`Note: ${order.notes || "Regular delivery"}`, MARGIN, 96);

  let cursorY = 120;

  autoTable(doc, {
    startY: cursorY,
    margin: { left: MARGIN, right: MARGIN },
    head: [["Item Name", "Gross Weight", "Tunch / Purity", "Fine Weight"]],
    body: (order.items ?? []).map((item) => [
      item.itemName,
      formatQuantity(item.grossWeight),
      Number(item.tunch).toLocaleString("en-IN"),
      formatQuantity(item.fineWeight),
    ]),
    foot: [["", "", "Total Fine Delivered", formatQuantity(order.fineDelivered)]],
    styles: { fontSize: 9 },
    headStyles: { fillColor: [40, 40, 40] },
  });

  cursorY = doc.lastAutoTable.finalY + 24;

  const billingRows = [["Collection Applied To This Order", formatQuantity(creditApplied)]];
  if (Number(cs.metalApplied ?? 0) > 0) {
    billingRows.push([`↳ ${metalName} (fine)`, formatQuantity(cs.metalApplied)]);
  }
  if (Number(cs.cashApplied ?? 0) > 0) {
    billingRows.push(["↳ Cash", formatMoney(cs.cashApplied)]);
  }
  if (Number(cs.collectionAppliedLater ?? 0) > 0) {
    billingRows.push([`(incl. ${formatQuantity(cs.collectionAppliedLater)} fine applied later)`, ""]);
  }
  if (oldDue !== null) {
    billingRows.push(["Old Due", formatQuantity(oldDue)]);
  }
  billingRows.push(["Order Due", formatQuantity(orderDue)]);
  billingRows.push([`Total ${metalName} Due`, formatQuantity(totalMetalDue)]);

  autoTable(doc, {
    startY: cursorY,
    margin: { left: MARGIN, right: MARGIN },
    body: billingRows,
    theme: "plain",
    styles: { fontSize: 9 },
    columnStyles: { 1: { halign: "right" } },
  });

  cursorY = doc.lastAutoTable.finalY + 24;

  if ((order.settlementBreakdown?.length ?? 0) > 0) {
    autoTable(doc, {
      startY: cursorY,
      margin: { left: MARGIN, right: MARGIN },
      head: [["#", "Type", "Received", "Applied (this order)", "Source", "Date"]],
      body: order.settlementBreakdown.map((row) => {
        const isCash = row.collectionType === "CASH";
        const receivedCell = isCash
          ? `${formatMoney(row.cashAmount)} @ ${formatMoney(row.metalRate)}/10gm`
          : row.receivedQuantity != null
            ? `${formatQuantity(row.receivedQuantity)} fine`
            : "—";
        const appliedCell = isCash
          ? `${formatMoney(row.appliedCash)} ≈ ${formatQuantity(row.appliedFine)}`
          : `${formatQuantity(row.appliedFine)} fine`;

        return [
          `#${row.collectionId}`,
          isCash ? "Cash" : metalName,
          receivedCell,
          appliedCell,
          row.source === "ORDER_CREATION" ? "At creation" : "Later",
          row.collectionDate ? formatDate(row.collectionDate) : "—",
        ];
      }),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [40, 40, 40] },
    });
  }

  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text(`Generated ${new Date().toLocaleString("en-IN")}`, pageWidth - MARGIN, doc.internal.pageSize.getHeight() - 24, { align: "right" });

  const fileName = `Order-${order.orderNumber}.pdf`;
  return { doc, fileName };
}

export function getOrderInvoicePdfBlob(order, options) {
  const { doc, fileName } = buildOrderInvoicePdf(order, options);
  return { blob: doc.output("blob"), fileName };
}
