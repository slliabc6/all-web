import { describe, expect, it } from "vitest";
import { rewriteStaticCssReferences, rewriteStaticReferences } from "../../src/domain/static-paths";

describe("rewriteStaticReferences", () => {
  it("rewrites root routes and assets from a nested product page", () => {
    const html = [
      '<a href="/">Home</a>',
      '<a href="/shop?category=home#grid">Shop</a>',
      '<a href="/products/linen-tray">Product</a>',
      '<img src="/catalog-assets/assets/item.svg">',
      '<script src="/_astro/app.js"></script>'
    ].join("");

    expect(rewriteStaticReferences(html, "products/linen-tray.html")).toBe([
      '<a href="../index.html">Home</a>',
      '<a href="../shop.html?category=home#grid">Shop</a>',
      '<a href="linen-tray.html">Product</a>',
      '<img src="../catalog-assets/assets/item.svg">',
      '<script src="../_astro/app.js"></script>'
    ].join(""));
  });

  it("rewrites routes from the root page", () => {
    expect(rewriteStaticReferences('<a href="/about">About</a><a href="/products/item">Item</a>', "index.html"))
      .toBe('<a href="about.html">About</a><a href="products/item.html">Item</a>');
  });

  it("leaves external, mail, anchor, data and existing relative references unchanged", () => {
    const html = '<a href="https://example.com">External</a><a href="mailto:a@example.com">Mail</a><a href="#top">Top</a><img src="data:image/svg+xml,x"><a href="../about.html">Relative</a>';
    expect(rewriteStaticReferences(html, "products/item.html")).toBe(html);
  });
});

describe("rewriteStaticCssReferences", () => {
  it("rewrites root-absolute bundled font URLs relative to the CSS file", () => {
    const css = '@font-face{src:url("/_astro/morrow.woff2") format("woff2")}';
    expect(rewriteStaticCssReferences(css, "_astro/site.css"))
      .toBe('@font-face{src:url("morrow.woff2") format("woff2")}');
  });

  it("leaves data, external and already-relative CSS URLs unchanged", () => {
    const css = '.a{background:url(data:image/svg+xml,x)}.b{background:url(https://example.com/a.png)}.c{background:url(../a.png)}';
    expect(rewriteStaticCssReferences(css, "_astro/site.css")).toBe(css);
  });
});
