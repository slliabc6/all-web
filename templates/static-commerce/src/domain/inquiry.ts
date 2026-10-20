import { calculateCartSummary, unitPriceForLine } from "./cart";
import type { Cart } from "./cart";

interface InquirySite {
  id: string;
  contact: { email: string };
  currency: { code: string; symbol: string };
}

function money(value: number, code: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: code, minimumFractionDigits: 2 }).format(value);
}

export function buildInquiryText(cart: Cart, site: InquirySite): string {
  const lines = ["Product enquiry", ""];
  cart.lines.forEach((line, index) => {
    lines.push(`${index + 1}. ${line.name} (${line.sku})`);
    for (const [label, value] of Object.entries(line.selectedOptions)) lines.push(`   ${label}: ${value}`);
    lines.push(`   Quantity: ${line.quantity}`);
    const unitPrice = unitPriceForLine(line);
    lines.push(unitPrice === undefined ? "   Price: Request a quote" : `   Unit price: ${money(unitPrice, site.currency.code)}`);
  });
  const summary = calculateCartSummary(cart);
  if (summary.knownTotal > 0) lines.push("", `Known total: ${money(summary.knownTotal, site.currency.code)} ${site.currency.code}`);
  if (summary.hasInquiryItems) lines.push("Quote-only items are not included in the known total.");
  return lines.join("\n");
}

export function buildMailtoUrl(text: string, site: InquirySite): string {
  return `mailto:${site.contact.email}?subject=${encodeURIComponent("Product enquiry")}&body=${encodeURIComponent(text)}`;
}
