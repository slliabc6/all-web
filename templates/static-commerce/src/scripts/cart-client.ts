import { CartStore, calculateCartSummary, unitPriceForLine } from "../domain/cart";
import type { Cart, CartLineInput } from "../domain/cart";
import { buildInquiryText, buildMailtoUrl } from "../domain/inquiry";

function money(value: number, code: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: code, minimumFractionDigits: 2 }).format(value);
}

function currentSiteId() {
  return document.querySelector<HTMLElement>("[data-site-id]")?.dataset.siteId
    ?? document.querySelector<HTMLFormElement>("[data-add-to-cart]")?.dataset.siteId
    ?? "site";
}

const store = new CartStore(currentSiteId(), window.localStorage);

function updateCounts(cart: Cart) {
  const count = cart.lines.reduce((total, line) => total + line.quantity, 0);
  document.querySelectorAll<HTMLElement>("[data-cart-count]").forEach((element) => { element.textContent = String(count); });
}

function selectedOptions(form: HTMLFormElement) {
  const summary = form.closest(".product-summary");
  const options: Record<string, string> = {};
  summary?.querySelectorAll<HTMLFieldSetElement>("[data-option]").forEach((fieldset) => {
    const selected = fieldset.querySelector<HTMLInputElement>('input[type="radio"]:checked');
    const label = fieldset.querySelector("legend")?.textContent?.trim();
    const value = selected?.closest("label")?.querySelector("span")?.textContent?.trim();
    if (label && value) options[label] = value;
  });
  return options;
}

document.querySelectorAll<HTMLFormElement>("[data-add-to-cart]").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const product = JSON.parse(form.dataset.product ?? "{}") as Omit<CartLineInput, "quantity" | "selectedOptions">;
    const quantity = Math.max(1, Number(new FormData(form).get("quantity") ?? 1));
    store.add({ ...product, quantity, selectedOptions: selectedOptions(form) });
    const status = form.querySelector<HTMLElement>("[data-cart-status]");
    if (status) status.textContent = "Added to cart.";
    updateCounts(store.load());
  });
});

function renderCart() {
  const root = document.querySelector<HTMLElement>("[data-cart-page]");
  if (!root) return;
  const cart = store.load();
  const linesRoot = root.querySelector<HTMLElement>("[data-cart-lines]");
  const template = root.querySelector<HTMLTemplateElement>("[data-cart-line-template]");
  const empty = root.querySelector<HTMLElement>("[data-cart-empty]");
  const summaryRoot = root.querySelector<HTMLElement>("[data-cart-summary]");
  if (!linesRoot || !template || !empty || !summaryRoot) return;

  linesRoot.replaceChildren();
  for (const line of cart.lines) {
    const fragment = template.content.cloneNode(true) as DocumentFragment;
    const article = fragment.querySelector<HTMLElement>("[data-cart-line]")!;
    article.dataset.lineId = line.lineId;
    fragment.querySelector<HTMLElement>("[data-line-sku]")!.textContent = line.sku;
    fragment.querySelector<HTMLElement>("[data-line-name]")!.textContent = line.name;
    const options = Object.entries(line.selectedOptions).map(([label, value]) => `${label}: ${value}`).join(", ");
    fragment.querySelector<HTMLElement>("[data-line-options]")!.textContent = options;
    const unitPrice = unitPriceForLine(line);
    fragment.querySelector<HTMLElement>("[data-line-price]")!.textContent = unitPrice === undefined ? "Quoted separately" : money(unitPrice, root.dataset.currencyCode ?? "USD");
    const quantity = fragment.querySelector<HTMLInputElement>("[data-line-quantity]")!;
    quantity.value = String(line.quantity);
    quantity.setAttribute("aria-label", `Quantity for ${line.name}`);
    quantity.addEventListener("change", () => { store.update(line.lineId, Number(quantity.value)); renderCart(); });
    const remove = fragment.querySelector<HTMLButtonElement>("[data-line-remove]")!;
    remove.setAttribute("aria-label", `Remove ${line.name}`);
    remove.addEventListener("click", () => { store.remove(line.lineId); renderCart(); });
    linesRoot.append(fragment);
  }

  empty.hidden = cart.lines.length > 0;
  summaryRoot.hidden = cart.lines.length === 0;
  const summary = calculateCartSummary(cart);
  root.querySelector<HTMLElement>("[data-cart-total]")!.textContent = `${money(summary.knownTotal, root.dataset.currencyCode ?? "USD")} ${root.dataset.currencyCode ?? "USD"}`;
  root.querySelector<HTMLElement>("[data-cart-quote-note]")!.hidden = !summary.hasInquiryItems;
  const site = { id: root.dataset.siteId!, contact: { email: root.dataset.email! }, currency: { code: root.dataset.currencyCode!, symbol: root.dataset.currencySymbol! } };
  const text = buildInquiryText(cart, site);
  const email = root.querySelector<HTMLAnchorElement>("[data-email-inquiry]");
  if (email) email.href = buildMailtoUrl(text, site);
  root.querySelector<HTMLButtonElement>("[data-copy-inquiry]")?.addEventListener("click", async () => {
    const status = root.querySelector<HTMLElement>("[data-inquiry-status]");
    try {
      await navigator.clipboard.writeText(text);
      if (status) status.textContent = "Enquiry list copied.";
    } catch {
      if (status) status.textContent = "Could not copy automatically. Please use the email draft.";
    }
  }, { once: true });
  updateCounts(cart);
}

updateCounts(store.load());
renderCart();
