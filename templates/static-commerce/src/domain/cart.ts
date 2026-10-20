import type { PriceMode, PriceTier } from "./types";

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface CartLineInput {
  productId: string;
  sku: string;
  name: string;
  quantity: number;
  selectedOptions: Record<string, string>;
  priceMode: PriceMode;
  price?: number;
  priceTiers?: PriceTier[];
}

export interface CartLine extends CartLineInput { lineId: string }
export interface Cart { version: 1; siteId: string; lines: CartLine[] }

class MemoryStorage implements StorageLike {
  private values = new Map<string, string>();
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, value); }
  removeItem(key: string) { this.values.delete(key); }
}

function lineIdFor(item: CartLineInput) {
  const options = Object.entries(item.selectedOptions)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}:${value}`)
    .join("|");
  return `${item.productId}::${options}`;
}

function emptyCart(siteId: string): Cart { return { version: 1, siteId, lines: [] }; }

export class CartStore {
  private readonly key: string;
  private readonly listeners = new Set<(cart: Cart) => void>();

  constructor(private readonly siteId: string, private readonly storage: StorageLike = new MemoryStorage()) {
    this.key = `all-web-cart:v1:${siteId}`;
  }

  load(): Cart {
    const raw = this.storage.getItem(this.key);
    if (!raw) return emptyCart(this.siteId);
    try {
      const parsed = JSON.parse(raw) as Cart;
      if (parsed.version !== 1 || parsed.siteId !== this.siteId || !Array.isArray(parsed.lines)) throw new Error("invalid cart");
      return parsed;
    } catch {
      this.storage.removeItem(this.key);
      return emptyCart(this.siteId);
    }
  }

  add(item: CartLineInput) {
    const cart = this.load();
    const lineId = lineIdFor(item);
    const existing = cart.lines.find((line) => line.lineId === lineId);
    if (existing) existing.quantity += item.quantity;
    else cart.lines.push({ ...item, lineId });
    this.save(cart);
  }

  update(lineId: string, quantity: number) {
    const cart = this.load();
    const line = cart.lines.find((candidate) => candidate.lineId === lineId);
    if (!line) return;
    if (quantity <= 0) cart.lines = cart.lines.filter((candidate) => candidate.lineId !== lineId);
    else line.quantity = Math.max(1, Math.floor(quantity));
    this.save(cart);
  }

  remove(lineId: string) {
    const cart = this.load();
    cart.lines = cart.lines.filter((line) => line.lineId !== lineId);
    this.save(cart);
  }

  clear() {
    this.storage.removeItem(this.key);
    this.emit(emptyCart(this.siteId));
  }

  subscribe(listener: (cart: Cart) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private save(cart: Cart) {
    this.storage.setItem(this.key, JSON.stringify(cart));
    this.emit(cart);
  }

  private emit(cart: Cart) {
    for (const listener of this.listeners) listener(cart);
  }
}

export function unitPriceForLine(line: CartLine): number | undefined {
  if (line.priceMode === "fixed") return line.price;
  if (line.priceMode === "inquiry") return undefined;
  const tiers = [...(line.priceTiers ?? [])].sort((left, right) => left.minQuantity - right.minQuantity);
  const eligible = tiers.filter((tier) => tier.minQuantity <= line.quantity);
  return (eligible.at(-1) ?? tiers[0])?.unitPrice;
}

export function calculateCartSummary(cart: Cart) {
  let knownTotal = 0;
  let hasInquiryItems = false;
  for (const line of cart.lines) {
    const unitPrice = unitPriceForLine(line);
    if (unitPrice === undefined) hasInquiryItems = true;
    else knownTotal += unitPrice * line.quantity;
  }
  return { knownTotal, hasInquiryItems };
}
