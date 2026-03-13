const collectionOrder = ["Main", "Main White", "Full Black", "Full White"];
const layoutOrder = ["Horizontal", "Vertical", "Icon"];
const formatOrder = ["SVG", "PNG"];
const scaleOrder = ["Vector", "4x", "2x", "1x"];
const locationOrder = [
  "SVG",
  "PNG / Main",
  "PNG / Main White",
  "PNG / Full Black",
  "PNG / Full White",
  "Root level"
];

const previewTones = {
  Main: "tone-accent",
  "Main White": "tone-dark",
  "Full Black": "tone-light",
  "Full White": "tone-dark"
};

const labels = {
  collectionFilter: "All colorways",
  layoutFilter: "All layouts",
  scaleFilter: "All scales",
  locationFilter: "All folders"
};

const gallery = document.querySelector("#gallery");
const cardTemplate = document.querySelector("#cardTemplate");
const emptyState = document.querySelector("#emptyState");
const fileCount = document.querySelector("#fileCount");
const variantCount = document.querySelector("#variantCount");
const folderCount = document.querySelector("#folderCount");
const resultsSummary = document.querySelector("#resultsSummary");

const controls = {
  searchInput: document.querySelector("#searchInput"),
  formatFilter: document.querySelector("#formatFilter"),
  collectionFilter: document.querySelector("#collectionFilter"),
  layoutFilter: document.querySelector("#layoutFilter"),
  scaleFilter: document.querySelector("#scaleFilter"),
  locationFilter: document.querySelector("#locationFilter"),
  sortSelect: document.querySelector("#sortSelect"),
  clearFilters: document.querySelector("#clearFilters")
};

const state = {
  search: "",
  format: "all",
  collection: "all",
  layout: "all",
  scale: "all",
  location: "all",
  sort: "recommended"
};

const logos = (window.LOGO_FILES || []).map(parseLogoFile);

initialize();

function initialize() {
  populateSelect(
    controls.collectionFilter,
    sortValues(getUnique(logos, "collection"), collectionOrder),
    labels.collectionFilter
  );
  populateSelect(
    controls.layoutFilter,
    sortValues(getUnique(logos, "layout"), layoutOrder),
    labels.layoutFilter
  );
  populateSelect(
    controls.scaleFilter,
    sortValues(getUnique(logos, "scale"), scaleOrder),
    labels.scaleFilter
  );
  populateSelect(
    controls.locationFilter,
    sortValues(getUnique(logos, "location"), locationOrder),
    labels.locationFilter
  );

  fileCount.textContent = String(logos.length);
  variantCount.textContent = String(new Set(logos.map((logo) => logo.variantKey)).size);
  folderCount.textContent = String(new Set(logos.map((logo) => logo.location)).size);

  controls.searchInput.addEventListener("input", handleControlChange);
  controls.formatFilter.addEventListener("change", handleControlChange);
  controls.collectionFilter.addEventListener("change", handleControlChange);
  controls.layoutFilter.addEventListener("change", handleControlChange);
  controls.scaleFilter.addEventListener("change", handleControlChange);
  controls.locationFilter.addEventListener("change", handleControlChange);
  controls.sortSelect.addEventListener("change", handleControlChange);
  controls.clearFilters.addEventListener("click", clearFilters);

  render();
}

function handleControlChange() {
  state.search = controls.searchInput.value.trim().toLowerCase();
  state.format = controls.formatFilter.value;
  state.collection = controls.collectionFilter.value;
  state.layout = controls.layoutFilter.value;
  state.scale = controls.scaleFilter.value;
  state.location = controls.locationFilter.value;
  state.sort = controls.sortSelect.value;
  render();
}

function clearFilters() {
  controls.searchInput.value = "";
  controls.formatFilter.value = "all";
  controls.collectionFilter.value = "all";
  controls.layoutFilter.value = "all";
  controls.scaleFilter.value = "all";
  controls.locationFilter.value = "all";
  controls.sortSelect.value = "recommended";
  handleControlChange();
}

function render() {
  const filtered = logos
    .filter(matchesFilters)
    .sort((left, right) => compareLogos(left, right, state.sort));

  gallery.replaceChildren();
  emptyState.hidden = filtered.length !== 0;
  gallery.hidden = filtered.length === 0;

  resultsSummary.textContent = buildSummary(filtered);

  if (!filtered.length) {
    return;
  }

  const fragment = document.createDocumentFragment();

  filtered.forEach((logo, index) => {
    const card = cardTemplate.content.firstElementChild.cloneNode(true);
    card.style.setProperty("--stagger", String(index % 12));

    const previewFrame = card.querySelector(".preview-frame");
    const previewLink = card.querySelector(".preview-link");
    const previewImage = card.querySelector(".preview-image");
    const cardKicker = card.querySelector(".card-kicker");
    const formatBadge = card.querySelector(".format-badge");
    const cardTitle = card.querySelector(".card-title");
    const cardMeta = card.querySelector(".card-meta");
    const tagRow = card.querySelector(".tag-row");
    const cardPath = card.querySelector(".card-path");
    const previewButton = card.querySelector(".preview-button");
    const downloadButton = card.querySelector(".download-button");

    previewFrame.classList.add(logo.previewTone);
    previewLink.href = logo.path;
    previewImage.src = logo.path;
    previewImage.alt = logo.alt;

    cardKicker.textContent = logo.location;
    formatBadge.textContent = logo.format;
    cardTitle.textContent = `${logo.collection} ${logo.layout}`;
    cardMeta.textContent = `${logo.format} • ${logo.scale}`;
    cardPath.textContent = logo.path;
    cardPath.title = logo.path;

    createTag(tagRow, logo.collection);
    createTag(tagRow, logo.layout);
    createTag(tagRow, logo.scale);

    previewButton.href = logo.path;
    downloadButton.href = logo.path;
    downloadButton.download = logo.fileName;
    downloadButton.textContent =
      logo.scale === "Vector" ? `Download ${logo.format}` : `Download ${logo.format} ${logo.scale}`;

    fragment.append(card);
  });

  gallery.append(fragment);
}

function matchesFilters(logo) {
  if (state.search && !logo.searchText.includes(state.search)) {
    return false;
  }

  if (state.format !== "all" && logo.format !== state.format) {
    return false;
  }

  if (state.collection !== "all" && logo.collection !== state.collection) {
    return false;
  }

  if (state.layout !== "all" && logo.layout !== state.layout) {
    return false;
  }

  if (state.scale !== "all" && logo.scale !== state.scale) {
    return false;
  }

  if (state.location !== "all" && logo.location !== state.location) {
    return false;
  }

  return true;
}

function buildSummary(filtered) {
  const visibleVariants = new Set(filtered.map((logo) => logo.variantKey)).size;
  const activeFilters = [
    state.search,
    state.format !== "all",
    state.collection !== "all",
    state.layout !== "all",
    state.scale !== "all",
    state.location !== "all"
  ].filter(Boolean).length;

  const filterText = activeFilters ? ` with ${activeFilters} active filter${activeFilters === 1 ? "" : "s"}` : "";

  return `Showing ${filtered.length} of ${logos.length} assets across ${visibleVariants} variant${visibleVariants === 1 ? "" : "s"}${filterText}.`;
}

function compareLogos(left, right, mode) {
  switch (mode) {
    case "name-asc":
      return left.fileName.localeCompare(right.fileName);
    case "name-desc":
      return right.fileName.localeCompare(left.fileName);
    case "format":
      return compareByKnownOrder(left.format, right.format, formatOrder) || compareRecommended(left, right);
    case "scale":
      return compareByKnownOrder(left.scale, right.scale, scaleOrder) || compareRecommended(left, right);
    case "location":
      return compareByKnownOrder(left.location, right.location, locationOrder) || compareRecommended(left, right);
    default:
      return compareRecommended(left, right);
  }
}

function compareRecommended(left, right) {
  return (
    compareByKnownOrder(left.collection, right.collection, collectionOrder) ||
    compareByKnownOrder(left.layout, right.layout, layoutOrder) ||
    compareByKnownOrder(left.format, right.format, formatOrder) ||
    compareByKnownOrder(left.scale, right.scale, scaleOrder) ||
    compareByKnownOrder(left.location, right.location, locationOrder) ||
    left.fileName.localeCompare(right.fileName)
  );
}

function compareByKnownOrder(left, right, order) {
  const leftIndex = order.indexOf(left);
  const rightIndex = order.indexOf(right);

  if (leftIndex === -1 || rightIndex === -1) {
    return left.localeCompare(right);
  }

  return leftIndex - rightIndex;
}

function populateSelect(element, values, allLabel) {
  element.innerHTML = "";
  element.add(new Option(allLabel, "all"));

  values.forEach((value) => {
    element.add(new Option(value, value));
  });
}

function getUnique(items, key) {
  return [...new Set(items.map((item) => item[key]))];
}

function sortValues(values, order) {
  return [...values].sort((left, right) => compareByKnownOrder(left, right, order));
}

function createTag(container, label) {
  const tag = document.createElement("span");
  tag.className = "tag";
  tag.textContent = label;
  container.append(tag);
}

function parseLogoFile(path) {
  const segments = path.split("/");
  const fileName = segments[segments.length - 1];
  const format = fileName.toLowerCase().endsWith(".svg") ? "SVG" : "PNG";
  const nameWithoutExtension = fileName.replace(/\.[^.]+$/, "");
  const parts = nameWithoutExtension.split(" - ").map((part) => part.trim());
  const layout = parts.find((part) => layoutOrder.includes(part)) || "Unknown";
  const descriptor = parts[parts.length - 1] || "";
  const cleanDescriptor = descriptor.replace(/@\dx$/i, "").trim();
  const collection = normalizeCollection(cleanDescriptor);
  const scaleMatch = descriptor.match(/@(2|4)x$/i);
  const scale = format === "SVG" ? "Vector" : scaleMatch ? `${scaleMatch[1]}x` : "1x";
  const location = getLocationLabel(segments, format);
  const previewTone = previewTones[collection] || "tone-accent";

  return {
    path,
    fileName,
    format,
    collection,
    layout,
    scale,
    location,
    previewTone,
    variantKey: `${collection}|${layout}`,
    alt: `${collection} ${layout} logo in ${format} ${scale}`,
    searchText: [path, fileName, format, collection, layout, scale, location].join(" ").toLowerCase()
  };
}

function normalizeCollection(value) {
  const normalized = value.toLowerCase();

  if (normalized === "main") {
    return "Main";
  }

  if (normalized === "main white") {
    return "Main White";
  }

  if (normalized === "full black") {
    return "Full Black";
  }

  if (normalized === "full white") {
    return "Full White";
  }

  return value;
}

function getLocationLabel(segments, format) {
  if (format === "SVG") {
    return "SVG";
  }

  if (segments.length === 1) {
    return "Root level";
  }

  return `PNG / ${segments[1]}`;
}
