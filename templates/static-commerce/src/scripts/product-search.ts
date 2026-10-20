const input = document.querySelector<HTMLInputElement>("[data-product-search]");
const results = Array.from(document.querySelectorAll<HTMLElement>("[data-search-result]"));
const empty = document.querySelector<HTMLElement>("[data-search-empty]");

function applySearch() {
  const term = input?.value.trim().toLocaleLowerCase() ?? "";
  let visible = 0;
  for (const result of results) {
    const matches = !term || (result.dataset.searchText ?? "").includes(term);
    result.hidden = !matches;
    if (matches) visible += 1;
  }
  if (empty) empty.hidden = visible !== 0;
}

input?.addEventListener("input", applySearch);
applySearch();
