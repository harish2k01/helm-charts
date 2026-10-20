(() => {
  "use strict";

  const repoUrl = "https://charts.harish2k01.in";
  const sourceUrl = "https://github.com/harish2k01/helm-charts";
  const ociUrl = "oci://ghcr.io/harish2k01/helm-charts";
  const byId = (id) => document.getElementById(id);
  const search = byId("chart-search");
  const filters = byId("category-filters");
  const grid = byId("chart-grid");
  const status = byId("catalog-status");
  const dialog = byId("chart-details");
  const themeButton = document.querySelector(".theme-toggle");
  const systemTheme = matchMedia("(prefers-color-scheme: dark)");
  const copyTimers = new WeakMap();
  let charts = [];
  let category = "All";
  let quickMethod = "helm";
  let detailMethod = "helm";
  let selectedChart = null;

  function currentTheme() {
    return (
      document.documentElement.dataset.theme ||
      (systemTheme.matches ? "dark" : "light")
    );
  }

  function updateThemeButton() {
    const theme = currentTheme();
    const label = `Switch to ${theme === "dark" ? "light" : "dark"} theme`;
    themeButton.dataset.currentTheme = theme;
    themeButton.setAttribute("aria-label", label);
    themeButton.title = label;
    themeButton.hidden = false;
  }

  themeButton.addEventListener("click", () => {
    const next = currentTheme() === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {
      /* Keep the selection for this page. */
    }
    updateThemeButton();
  });
  systemTheme.addEventListener("change", updateThemeButton);
  updateThemeButton();

  function makeElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function appendAppIcon(container, chart) {
    container.replaceChildren();
    const letters = chart.name
      .split(/[\s-]+/)
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
    const initials = makeElement("span", "initials", letters);
    container.append(initials);
    if (!chart.icon) return;
    const image = new Image(34, 34);
    image.alt = "";
    image.loading = "lazy";
    image.addEventListener(
      "load",
      () => {
        image.classList.add("loaded");
        initials.hidden = true;
      },
      { once: true },
    );
    image.addEventListener("error", () => image.remove(), { once: true });
    image.src = chart.icon;
    container.append(image);
  }

  function installation(chart, method, setup = false) {
    const install =
      method === "oci"
        ? `helm install ${chart.slug} \\\n  ${ociUrl}/${chart.slug} \\\n  --version ${chart.version}`
        : `helm install ${chart.slug} harish2k01/${chart.slug} \\\n  --version ${chart.version}`;
    return method === "helm" && setup
      ? `helm repo add harish2k01 \\\n  ${repoUrl}\nhelm repo update\n${install}`
      : install;
  }

  function updateQuickStart() {
    document.querySelectorAll("[data-quick-method]").forEach((button) => {
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.quickMethod === quickMethod),
      );
    });
    const example = charts.find((chart) => chart.slug === "jellyfin");
    const fallback =
      quickMethod === "oci"
        ? `helm install jellyfin \\\n  ${ociUrl}/jellyfin`
        : `helm repo add harish2k01 \\\n  ${repoUrl}\nhelm repo update`;
    byId("quick-command").textContent = example
      ? installation(example, quickMethod, true)
      : fallback;
    byId("quick-caption").textContent =
      quickMethod === "oci"
        ? "Example: Jellyfin · Install directly, no repository setup needed."
        : example
          ? "Example: Jellyfin · Add the repository once, then install any chart."
          : "Add the repository once, then choose a chart below.";
  }

  document.querySelectorAll("[data-quick-method]").forEach((button) => {
    button.addEventListener("click", () => {
      quickMethod = button.dataset.quickMethod;
      updateQuickStart();
    });
  });

  async function copyCommand(code, button) {
    const original = button.dataset.originalLabel || button.textContent;
    button.dataset.originalLabel = original;
    clearTimeout(copyTimers.get(button));
    try {
      await navigator.clipboard.writeText(code.textContent);
      button.textContent = "Copied";
      byId("copy-status").textContent = "Commands copied to clipboard.";
    } catch {
      const range = document.createRange();
      range.selectNodeContents(code);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      button.textContent = "Select & copy";
      byId("copy-status").textContent =
        "Clipboard unavailable. Commands selected; copy them with your browser.";
    }
    copyTimers.set(
      button,
      setTimeout(() => {
        button.textContent = original;
      }, 2200),
    );
  }
  document
    .querySelector("[data-copy-quick]")
    .addEventListener("click", (event) => {
      copyCommand(byId("quick-command"), event.currentTarget);
    });
  byId("copy-install").addEventListener("click", (event) => {
    copyCommand(byId("detail-command"), event.currentTarget);
  });

  function updateDetails() {
    if (!selectedChart) return;
    document.querySelectorAll("[data-detail-method]").forEach((button) => {
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.detailMethod === detailMethod),
      );
    });
    byId("detail-command-label").textContent =
      detailMethod === "oci"
        ? "Install from GHCR OCI"
        : "Install from Helm repository";
    byId("detail-command").textContent = installation(
      selectedChart,
      detailMethod,
      true,
    );
  }

  function showDetails(chart) {
    selectedChart = chart;
    detailMethod = quickMethod;
    byId("detail-title").textContent = chart.name;
    byId("detail-version").textContent =
      `Chart ${chart.version} · App ${chart.appVersion}`;
    byId("detail-description").textContent = chart.description;
    appendAppIcon(byId("detail-icon"), chart);
    byId("detail-docs").href = `${sourceUrl}/tree/main/charts/${chart.slug}`;
    byId("detail-values").href =
      `${sourceUrl}/blob/main/charts/${chart.slug}/values.yaml`;
    byId("copy-install").textContent = "Copy commands";
    updateDetails();
    dialog.showModal();
  }

  byId("close-details").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    const rect = dialog.getBoundingClientRect();
    if (
      event.target === dialog &&
      (event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom)
    )
      dialog.close();
  });
  document.querySelectorAll("[data-detail-method]").forEach((button) => {
    button.addEventListener("click", () => {
      detailMethod = button.dataset.detailMethod;
      updateDetails();
    });
  });

  function renderCards() {
    const query = search.value.trim().toLowerCase();
    const filtered = charts.filter((chart) => {
      return (
        (category === "All" || chart.category === category) &&
        `${chart.name} ${chart.slug} ${chart.description} ${chart.category}`
          .toLowerCase()
          .includes(query)
      );
    });
    filters.querySelectorAll("button").forEach((button) => {
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.category === category),
      );
    });
    status.textContent =
      filtered.length === 0
        ? "No matching charts. Try a different search or category."
        : `Showing ${filtered.length} of ${charts.length} charts${category === "All" ? "" : ` · ${category}`}`;
    const fragment = document.createDocumentFragment();
    for (const chart of filtered) {
      const card = makeElement("button", "chart-card");
      card.type = "button";
      card.setAttribute("aria-label", `View ${chart.name}`);
      card.setAttribute("aria-haspopup", "dialog");
      const heading = makeElement("span", "app-heading");
      const appIcon = makeElement("span", "app-icon");
      appendAppIcon(appIcon, chart);
      heading.append(appIcon, makeElement("span", "app-name", chart.name));
      const meta = makeElement("span", "chart-meta");
      meta.append(
        makeElement("span", "", chart.category),
        makeElement("span", "chart-version", `v${chart.version} ↗`),
      );
      card.append(
        heading,
        makeElement("span", "chart-description", chart.description),
        meta,
      );
      card.addEventListener("click", () => showDetails(chart));
      fragment.append(card);
    }
    grid.replaceChildren(fragment);
  }

  search.addEventListener("input", renderCards);

  async function loadCatalog() {
    status.hidden = false;
    try {
      const response = await fetch("./catalog.json");
      if (!response.ok) throw new Error(`Catalog returned ${response.status}`);
      const data = await response.json();
      if (!Array.isArray(data.charts) || data.charts.length === 0)
        throw new Error("Catalog is empty");
      charts = data.charts;
      byId("chart-total").textContent = `${charts.length} charts`;
      const categories = [
        "All",
        ...new Set(charts.map((chart) => chart.category).sort()),
      ];
      for (const name of categories) {
        const button = makeElement("button", "", name);
        button.type = "button";
        button.dataset.category = name;
        button.addEventListener("click", () => {
          category = name;
          renderCards();
        });
        filters.append(button);
      }
      byId("catalog-controls").hidden = false;
      updateQuickStart();
      renderCards();
    } catch (error) {
      console.error("Unable to load the chart catalog:", error);
      status.replaceChildren(
        document.createTextNode("The catalog could not be loaded. "),
      );
      const source = makeElement("a", "", "Browse charts on GitHub");
      source.href = `${sourceUrl}#chart-catalog`;
      status.append(source);
    }
  }
  loadCatalog();
})();
