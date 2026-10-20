const DATABASE_NAME = "instacheck-history";
const DATABASE_VERSION = 1;
const PROGRESS_STORAGE_KEY = "instacheck.progress.v3";
const PREVIOUS_PROGRESS_STORAGE_KEY = "instacheck.progress.v2";
const LEGACY_STORAGE_KEY = "instacheck.removed.v1";
// Limits: 100 MiB compressed ZIP, 120 MiB expanded, 25 MiB per JSON, 80 MiB
// total JSON, 10,000 ZIP entries, 2,000 files, and 50 manual JSON files.
const MAX_ARCHIVE_SIZE = 100 * 1024 * 1024;
const MAX_TOTAL_UNCOMPRESSED_SIZE = 120 * 1024 * 1024;
const MAX_JSON_FILE_SIZE = 25 * 1024 * 1024;
const MAX_TOTAL_JSON_SIZE = 80 * 1024 * 1024;
const MAX_ARCHIVE_ENTRIES = 10000;
const MAX_ARCHIVE_FILES = 2000;
const MAX_IMPORT_FILES = 2000;
const MAX_MANUAL_JSON_FILES = 50;
const MAX_BACKUP_SIZE = 20 * 1024 * 1024;
const MAX_SUPPORTED_TIMESTAMP = 8640000000000000;
const USERNAME_PATTERN = /^[a-z0-9._]{1,30}$/i;
const RESERVED_USERNAMES = new Set(["__proto__", "constructor", "prototype", "tostring", "hasownproperty", "tolocalestring", "isprototypeof", "propertyisenumerable", "valueof", "__definegetter__", "__definesetter__", "__lookupgetter__", "__lookupsetter__"]);
const RESERVED_PATHS = new Set(["accounts", "direct", "explore", "p", "reel", "reels", "stories"]);
const PROGRESS_DATASETS = new Set(["nonFollowers", "pendingRequests"]);
const DEMO_ACCOUNT_KEY = "internal:demo";
const ARCHIVE_ENTRY_PATTERN = /(?:^|\/)(?:followers(?:_\d+)?|following(?:_\d+)?|pending_follow_requests(?:_sent)?|recent_follow_requests|recently_unfollowed_(?:profiles|accounts))\.json$/i;
const CREATOR = Object.freeze({
  instagramHandle: "@viniohc",
  instagramUrl: "https://www.instagram.com/viniohc/"
});
const ROUTES = Object.freeze({ home: "#/", help: "#/ajuda", history: "#/historico", analysis: "#/analise" });
const { t: tr, getLocale } = window.InstaCheckI18n;

let DATASET_CONFIG = createDatasetConfig();
let pendingLegacyProgress = null;

function createDatasetConfig() {
  return {
  lostFollowers: {
    label: tr("datasets.lostFollowers.label"),
    title: tr("datasets.lostFollowers.title"),
    description: tr("datasets.lostFollowers.description"),
    emptyTitle: tr("datasets.lostFollowers.emptyTitle"),
    emptyDescription: tr("datasets.lostFollowers.emptyDescription"),
    fileSlug: "deixaram-de-seguir",
    status: (profile) => profile.followedYouAt
      ? tr("datasets.lostFollowers.since", { date: formatProfileDate(profile.followedYouAt) })
      : tr("datasets.lostFollowers.detected", { date: formatProfileDate(profile.detectedAt) })
  },
  newFollowers: {
    label: tr("datasets.newFollowers.label"),
    title: tr("datasets.newFollowers.title"),
    description: tr("datasets.newFollowers.description"),
    emptyTitle: tr("datasets.newFollowers.emptyTitle"),
    emptyDescription: tr("datasets.newFollowers.emptyDescription"),
    fileSlug: "novos-seguidores",
    status: (profile) => profile.followedYouAt
      ? tr("datasets.newFollowers.since", { date: formatProfileDate(profile.followedYouAt) })
      : tr("datasets.newFollowers.detected", { date: formatProfileDate(profile.detectedAt) })
  },
  nonFollowers: {
    label: tr("datasets.nonFollowers.label"),
    title: tr("datasets.nonFollowers.title"),
    description: tr("datasets.nonFollowers.description"),
    emptyTitle: tr("datasets.nonFollowers.emptyTitle"),
    emptyDescription: tr("datasets.nonFollowers.emptyDescription"),
    actionable: true,
    actionLabel: tr("datasets.nonFollowers.action"),
    actionAria: (username) => tr("datasets.nonFollowers.actionAria", { username }),
    reviewedStatus: tr("datasets.nonFollowers.reviewed"),
    filterReviewedLabel: tr("datasets.nonFollowers.reviewedFilter"),
    progressLabel: tr("datasets.nonFollowers.progress"),
    resetMessage: tr("datasets.nonFollowers.reset"),
    pendingEmptyDescription: tr("datasets.nonFollowers.pendingEmpty"),
    reviewedEmptyDescription: tr("datasets.nonFollowers.reviewedEmpty"),
    fileSlug: "nao-seguem-de-volta",
    status: (profile) => profile.followedAt
      ? tr("datasets.nonFollowers.followedAt", { date: formatProfileDate(profile.followedAt) })
      : tr("datasets.nonFollowers.status")
  },
  followersOnly: {
    label: tr("datasets.followersOnly.label"),
    title: tr("datasets.followersOnly.title"),
    description: tr("datasets.followersOnly.description"),
    emptyTitle: tr("datasets.followersOnly.emptyTitle"),
    emptyDescription: tr("datasets.followersOnly.emptyDescription"),
    fileSlug: "voce-nao-segue",
    status: (profile) => profile.followedYouAt
      ? tr("datasets.followersOnly.since", { date: formatProfileDate(profile.followedYouAt) })
      : tr("datasets.followersOnly.status")
  },
  mutuals: {
    label: tr("datasets.mutuals.label"),
    title: tr("datasets.mutuals.title"),
    description: tr("datasets.mutuals.description"),
    emptyTitle: tr("datasets.mutuals.emptyTitle"),
    emptyDescription: tr("datasets.mutuals.emptyDescription"),
    fileSlug: "seguimento-mutuo",
    status: (profile) => formatMutualStatus(profile)
  },
  pendingRequests: {
    label: tr("datasets.pendingRequests.label"),
    title: tr("datasets.pendingRequests.title"),
    description: tr("datasets.pendingRequests.description"),
    emptyTitle: tr("datasets.pendingRequests.emptyTitle"),
    emptyDescription: tr("datasets.pendingRequests.emptyDescription"),
    actionable: true,
    actionLabel: tr("datasets.pendingRequests.action"),
    actionAria: (username) => tr("datasets.pendingRequests.actionAria", { username }),
    reviewedStatus: tr("datasets.pendingRequests.reviewed"),
    filterReviewedLabel: tr("datasets.pendingRequests.reviewedFilter"),
    progressLabel: tr("datasets.pendingRequests.progress"),
    resetMessage: tr("datasets.pendingRequests.reset"),
    pendingEmptyDescription: tr("datasets.pendingRequests.pendingEmpty"),
    reviewedEmptyDescription: tr("datasets.pendingRequests.reviewedEmpty"),
    fileSlug: "pedidos-pendentes",
    status: (profile) => profile.timestamp ? tr("datasets.pendingRequests.date", { date: formatProfileDate(profile.timestamp) }) : tr("datasets.pendingRequests.status")
  },
  recentRequests: {
    label: tr("datasets.recentRequests.label"),
    title: tr("datasets.recentRequests.title"),
    description: tr("datasets.recentRequests.description"),
    emptyTitle: tr("datasets.recentRequests.emptyTitle"),
    emptyDescription: tr("datasets.recentRequests.emptyDescription"),
    fileSlug: "pedidos-recentes",
    status: (profile) => profile.timestamp ? tr("datasets.recentRequests.date", { date: formatProfileDate(profile.timestamp) }) : tr("datasets.recentRequests.status")
  },
  recentlyUnfollowed: {
    label: tr("datasets.recentlyUnfollowed.label"),
    title: tr("datasets.recentlyUnfollowed.title"),
    description: tr("datasets.recentlyUnfollowed.description"),
    emptyTitle: tr("datasets.recentlyUnfollowed.emptyTitle"),
    emptyDescription: tr("datasets.recentlyUnfollowed.emptyDescription"),
    fileSlug: "deixei-de-seguir",
    status: (profile) => profile.timestamp ? tr("datasets.recentlyUnfollowed.date", { date: formatProfileDate(profile.timestamp) }) : tr("datasets.recentlyUnfollowed.status")
  }
  };
}

const elements = {
  startView: document.querySelector("#startView"),
  storageWarning: document.querySelector("#storageWarning"),
  historyView: document.querySelector("#historyView"),
  resultsView: document.querySelector("#resultsView"),
  accountInput: document.querySelector("#accountInput"),
  savedAccounts: document.querySelector("#savedAccounts"),
  startHistoryTools: document.querySelector("#startHistoryTools"),
  dropZone: document.querySelector("#dropZone"),
  fileInput: document.querySelector("#fileInput"),
  selectButton: document.querySelector("#selectButton"),
  demoButton: document.querySelector("#demoButton"),
  uploadTitle: document.querySelector("#uploadTitle"),
  uploadMessage: document.querySelector("#uploadMessage"),
  newAnalysisButton: document.querySelector("#newAnalysisButton"),
  currentAccountBadge: document.querySelector("#currentAccountBadge"),
  fileSummary: document.querySelector("#fileSummary"),
  analysisSummary: document.querySelector("#analysisSummary"),
  historyInsight: document.querySelector("#historyInsight"),
  historyInsightTitle: document.querySelector("#historyInsightTitle"),
  historyInsightDescription: document.querySelector("#historyInsightDescription"),
  historyDeltas: document.querySelector("#historyDeltas"),
  lostFollowersCount: document.querySelector("#lostFollowersCount"),
  newFollowersCount: document.querySelector("#newFollowersCount"),
  followersDeltaCount: document.querySelector("#followersDeltaCount"),
  followingDeltaCount: document.querySelector("#followingDeltaCount"),
  resultsHistoryActions: document.querySelector("#resultsHistoryActions"),
  resultsHistoryDeviceNote: document.querySelector("#resultsHistoryDeviceNote"),
  historyTitle: document.querySelector("#historyTitle"),
  viewLostButton: document.querySelector("#viewLostButton"),
  followersCount: document.querySelector("#followersCount"),
  followingCount: document.querySelector("#followingCount"),
  mutualCount: document.querySelector("#mutualCount"),
  notFollowingCount: document.querySelector("#notFollowingCount"),
  progressCard: document.querySelector("#progressCard"),
  progressLabel: document.querySelector("#progressLabel"),
  progressText: document.querySelector("#progressText"),
  progressPercentage: document.querySelector("#progressPercentage"),
  progressBar: document.querySelector("#progressBar"),
  progressFill: document.querySelector("#progressFill"),
  datasetDescription: document.querySelector("#datasetDescription"),
  datasetTabs: document.querySelector("#datasetTabs"),
  searchInput: document.querySelector("#searchInput"),
  sortSelect: document.querySelector("#sortSelect"),
  sortButton: document.querySelector("#sortButton"),
  sortCurrent: document.querySelector("#sortCurrent"),
  sortMenu: document.querySelector("#sortMenu"),
  statusFilters: document.querySelector("#statusFilters"),
  filterButtons: [...document.querySelectorAll(".filter-button")],
  pendingFilterLabel: document.querySelector("#pendingFilterLabel"),
  reviewedFilterLabel: document.querySelector("#reviewedFilterLabel"),
  allFilterCount: document.querySelector("#allFilterCount"),
  pendingFilterCount: document.querySelector("#pendingFilterCount"),
  removedFilterCount: document.querySelector("#removedFilterCount"),
  listTitle: document.querySelector("#listTitle"),
  visibleCount: document.querySelector("#visibleCount"),
  copyButton: document.querySelector("#copyButton"),
  exportButton: document.querySelector("#exportButton"),
  resetButton: document.querySelector("#resetButton"),
  profileList: document.querySelector("#profileList"),
  emptyState: document.querySelector("#emptyState"),
  emptyTitle: document.querySelector("#emptyTitle"),
  emptyDescription: document.querySelector("#emptyDescription"),
  historySubtitle: document.querySelector("#historySubtitle"),
  historyList: document.querySelector("#historyList"),
  historyMessage: document.querySelector("#historyMessage"),
  openHistoryButton: document.querySelector("#openHistoryButton"),
  historyBackButton: document.querySelector("#historyBackButton"),
  historyAccountsBackButton: document.querySelector("#historyAccountsBackButton"),
  historyAccounts: document.querySelector("#historyAccounts"),
  historyAccountDetail: document.querySelector("#historyAccountDetail"),
  historyAccountTitle: document.querySelector("#historyAccountTitle"),
  historyAnalysisList: document.querySelector("#historyAnalysisList"),
  historyHubMessage: document.querySelector("#historyHubMessage"),
  backupButtons: [...document.querySelectorAll('[data-action="backup"]')],
  restoreButtons: [...document.querySelectorAll('[data-action="restore"]')],
  backupFileInput: document.querySelector("#backupFileInput"),
  tutorialFab: document.querySelector("#tutorialFab"),
  inlineTutorialButton: document.querySelector("#inlineTutorialButton"),
  tutorialGuide: document.querySelector("#tutorialGuide"),
  editAccountButton: document.querySelector("#editAccountButton"),
  editAccountDialog: document.querySelector("#editAccountDialog"),
  editAccountForm: document.querySelector("#editAccountForm"),
  editAccountInput: document.querySelector("#editAccountInput"),
  editAccountMessage: document.querySelector("#editAccountMessage"),
  closeEditAccountButton: document.querySelector("#closeEditAccountButton"),
  cancelEditAccountButton: document.querySelector("#cancelEditAccountButton"),
  saveEditAccountButton: document.querySelector("#saveEditAccountButton"),
  shareResultButton: document.querySelector("#shareResultButton"),
  shareDialog: document.querySelector("#shareDialog"),
  closeShareButton: document.querySelector("#closeShareButton"),
  cancelShareButton: document.querySelector("#cancelShareButton"),
  generateShareButton: document.querySelector("#generateShareButton"),
  downloadShareButton: document.querySelector("#downloadShareButton"),
  shareCanvas: document.querySelector("#shareCanvas")
};

const state = {
  accountKey: "",
  accountUsername: "",
  followers: new Map(),
  following: new Map(),
  datasets: createEmptyDatasets(),
  availableDatasetKeys: ["nonFollowers", "followersOnly", "mutuals"],
  currentDataset: "nonFollowers",
  progress: loadProgress(),
  importInProgress: false,
  historyPersisted: false,
  filter: "all",
  query: "",
  sort: "alphabetical",
  importedFiles: [],
  importedArchiveName: "",
  visibleProfiles: [],
  database: null,
  storageAvailable: true,
  snapshots: [],
  currentSnapshot: null,
  previousSnapshot: null,
  viewingHistoricalSnapshot: false,
  isDemo: false,
  historyAccountKey: ""
};

const storageReady = initializeStorage();

elements.selectButton.addEventListener("click", openImportPicker);
elements.demoButton.addEventListener("click", launchDemo);
elements.newAnalysisButton.addEventListener("click", () => {
  state.isDemo = false;
  elements.editAccountButton.hidden = false;
  hideMessage();
  showStartView(true);
});

elements.dropZone.addEventListener("click", (event) => {
  if (!state.importInProgress && !event.target.closest("button")) openImportPicker();
});

elements.fileInput.addEventListener("change", () => {
  const files = [...elements.fileInput.files];
  elements.fileInput.value = "";
  processFiles(files);
});

elements.accountInput.addEventListener("input", () => {
  elements.accountInput.setAttribute("aria-invalid", "false");
  updateSavedAccountSelection();
});

["dragenter", "dragover"].forEach((eventName) => {
  elements.dropZone.addEventListener(eventName, (event) => {
    event.preventDefault();
    if (state.importInProgress) return;
    elements.dropZone.classList.add("dragging");
  });
});

["dragleave", "drop"].forEach((eventName) => {
  elements.dropZone.addEventListener(eventName, (event) => {
    event.preventDefault();
    elements.dropZone.classList.remove("dragging");
  });
});

elements.dropZone.addEventListener("drop", (event) => {
  if (!state.importInProgress) processFiles([...event.dataTransfer.files]);
});

elements.searchInput.addEventListener("input", (event) => {
  state.query = event.target.value.trim().toLocaleLowerCase("en-US").replace(/^@/, "");
  renderProfiles();
});

elements.sortSelect.addEventListener("change", (event) => {
  state.sort = event.target.value;
  updateSortPicker();
  renderProfiles();
});

elements.sortButton.addEventListener("click", () => {
  const shouldOpen = elements.sortMenu.hidden;
  closeSortPicker();
  elements.sortMenu.hidden = !shouldOpen;
  elements.sortButton.setAttribute("aria-expanded", String(shouldOpen));
  if (shouldOpen) elements.sortMenu.querySelector(`[data-sort="${state.sort}"]`)?.focus();
});

elements.sortMenu.querySelectorAll("[data-sort]").forEach((button) => button.addEventListener("click", () => {
  elements.sortSelect.value = button.dataset.sort;
  elements.sortSelect.dispatchEvent(new Event("change", { bubbles: true }));
  closeSortPicker(true);
}));

elements.sortMenu.addEventListener("keydown", (event) => {
  const options = [...elements.sortMenu.querySelectorAll("[data-sort]")];
  if (event.key === "Escape") {
    event.preventDefault();
    closeSortPicker(true);
    return;
  }
  if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
  event.preventDefault();
  const currentIndex = options.indexOf(document.activeElement);
  const nextIndex = event.key === "Home" ? 0
    : event.key === "End" ? options.length - 1
      : (currentIndex + (event.key === "ArrowDown" ? 1 : -1) + options.length) % options.length;
  options[nextIndex]?.focus();
});

elements.filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    state.filter = button.dataset.filter;
    updateFilterButtons();
    renderProfiles();
  });
});

elements.resetButton.addEventListener("click", resetCurrentProgress);
elements.copyButton.addEventListener("click", copyVisibleUsernames);
elements.exportButton.addEventListener("click", exportVisibleProfiles);
elements.viewLostButton.addEventListener("click", () => selectDataset("lostFollowers", true));
elements.openHistoryButton.addEventListener("click", openSelectedAccountHistory);
elements.historyBackButton.addEventListener("click", () => showStartView());
elements.historyAccountsBackButton.addEventListener("click", showHistoryAccounts);
elements.backupButtons.forEach((button) => button.addEventListener("click", exportHistoryBackup));
elements.restoreButtons.forEach((button) => button.addEventListener("click", () => elements.backupFileInput.click()));
elements.backupFileInput.addEventListener("change", () => {
  const file = elements.backupFileInput.files[0];
  elements.backupFileInput.value = "";
  if (file) restoreHistoryBackup(file, { openLatest: true });
});
elements.tutorialFab.addEventListener("click", showTutorial);
elements.inlineTutorialButton.addEventListener("click", showTutorial);
elements.editAccountButton.addEventListener("click", openEditAccountDialog);
elements.closeEditAccountButton.addEventListener("click", closeEditAccountDialog);
elements.cancelEditAccountButton.addEventListener("click", closeEditAccountDialog);
elements.editAccountForm.addEventListener("submit", handleEditAccountSubmit);
elements.editAccountDialog.addEventListener("click", (event) => {
  if (event.target === elements.editAccountDialog) closeEditAccountDialog();
});
elements.shareResultButton.addEventListener("click", openShareDialog);
elements.closeShareButton.addEventListener("click", closeShareDialog);
elements.cancelShareButton.addEventListener("click", closeShareDialog);
elements.generateShareButton.addEventListener("click", generateAndShareResult);
elements.downloadShareButton.addEventListener("click", downloadShareImage);
elements.shareDialog.addEventListener("click", (event) => {
  if (event.target === elements.shareDialog) closeShareDialog();
});
document.querySelectorAll("[data-creator-link]").forEach((link) => {
  link.href = CREATOR.instagramUrl;
  if (!link.children.length) link.textContent = link.textContent.replace(/@viniohc/g, CREATOR.instagramHandle);
});

document.addEventListener("click", (event) => {
  if (!event.target.closest(".sort-field")) closeSortPicker();
});

window.addEventListener("hashchange", handleRouteChange);

document.addEventListener("keydown", (event) => {
  const canFocusSearch = !elements.resultsView.hidden && event.key === "/" && document.activeElement !== elements.searchInput;
  if (canFocusSearch) {
    event.preventDefault();
    elements.searchInput.focus();
  }
});

window.addEventListener("instacheck:languagechange", async () => {
  DATASET_CONFIG = createDatasetConfig();
  updateSortPicker();
  await renderSavedAccounts();
  if (!elements.resultsView.hidden && state.accountKey) renderDashboard();
  if (!elements.historyView.hidden) renderHistoryHub();
});

updateSortPicker();
window.setTimeout(handleRouteChange, 0);

function updateSortPicker() {
  elements.sortSelect.value = state.sort;
  elements.sortCurrent.textContent = tr(`sort.${state.sort}`);
  elements.sortMenu.querySelectorAll("[data-sort]").forEach((button) => {
    const isSelected = button.dataset.sort === state.sort;
    button.classList.toggle("active", isSelected);
    button.setAttribute("aria-selected", String(isSelected));
  });
}

function closeSortPicker(returnFocus = false) {
  elements.sortMenu.hidden = true;
  elements.sortButton.setAttribute("aria-expanded", "false");
  if (returnFocus) elements.sortButton.focus();
}

function setRoute(route, replace = false) {
  if (window.location.hash === route) return;
  if (replace) window.history.replaceState(null, "", route);
  else window.location.hash = route.slice(1);
}

async function handleRouteChange() {
  if (state.importInProgress) return;
  const route = window.location.hash || ROUTES.home;
  if (route === ROUTES.help) {
    showTutorial(false);
    return;
  }
  if (route === ROUTES.history) {
    await openSelectedAccountHistory(false);
    return;
  }
  if (route === ROUTES.analysis) {
    if (!state.currentSnapshot) {
      showStartView(false, false);
      setRoute(ROUTES.home, true);
      return;
    }
    elements.startView.hidden = true;
    elements.historyView.hidden = true;
    elements.resultsView.hidden = false;
    elements.tutorialFab.hidden = false;
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }
  showStartView(false, false);
  if (route !== ROUTES.home) setRoute(ROUTES.home, true);
}

function showTutorial(updateRoute = true) {
  if (updateRoute) setRoute(ROUTES.help);
  if (elements.startView.hidden) showStartView(false, false);
  elements.tutorialGuide.scrollIntoView({ behavior: "smooth", block: "start" });
  elements.tutorialGuide.classList.remove("tutorial-attention");
  window.requestAnimationFrame(() => elements.tutorialGuide.classList.add("tutorial-attention"));
  window.setTimeout(() => elements.tutorialGuide.classList.remove("tutorial-attention"), 1200);
  window.setTimeout(() => elements.tutorialGuide.focus({ preventScroll: true }), 450);
}

function openEditAccountDialog() {
  elements.editAccountInput.value = state.accountUsername;
  elements.editAccountMessage.hidden = true;
  elements.editAccountMessage.textContent = "";
  if (typeof elements.editAccountDialog.showModal === "function") elements.editAccountDialog.showModal();
  else elements.editAccountDialog.setAttribute("open", "");
  window.setTimeout(() => {
    elements.editAccountInput.focus();
    elements.editAccountInput.select();
  }, 0);
}

function closeEditAccountDialog() {
  if (typeof elements.editAccountDialog.close === "function") elements.editAccountDialog.close();
  else elements.editAccountDialog.removeAttribute("open");
}

async function handleEditAccountSubmit(event) {
  event.preventDefault();
  const account = normalizeProfile(elements.editAccountInput.value);
  if (!account) {
    showEditAccountMessage(tr("messages.username"));
    elements.editAccountInput.focus();
    return;
  }

  elements.saveEditAccountButton.disabled = true;
  try {
    await renameCurrentAccount(account);
    closeEditAccountDialog();
    showHistoryMessage(tr("account.renamed", { username: account.username }), "success");
  } catch (error) {
    showEditAccountMessage(error.message || tr("account.renameError"));
  } finally {
    elements.saveEditAccountButton.disabled = false;
  }
}

function showEditAccountMessage(message) {
  elements.editAccountMessage.textContent = message;
  elements.editAccountMessage.hidden = false;
}

async function renameCurrentAccount(account) {
  const oldKey = state.accountKey;
  const oldUsername = state.accountUsername;
  if (!oldKey) throw new Error(tr("account.renameError"));

  if (state.database) {
    const oldSnapshots = await getSnapshots(oldKey);
    const destinationSnapshots = account.key === oldKey ? [] : await getSnapshots(account.key);
    const currentId = state.currentSnapshot?.id;
    const renamedSnapshots = oldSnapshots.map((snapshot) => ({
      ...snapshot,
      id: `${account.key}:${snapshot.createdAt}:${snapshot.fingerprint}`,
      accountKey: account.key,
      accountUsername: account.username
    }));
    const destinationNormalized = destinationSnapshots.map((snapshot) => ({
      ...snapshot,
      accountUsername: account.username
    }));
    const merged = new Map();
    [...destinationNormalized, ...renamedSnapshots].forEach((snapshot) => merged.set(snapshot.id, snapshot));
    const mergedSnapshots = [...merged.values()].sort((first, second) => second.createdAt - first.createdAt);

    const transaction = state.database.transaction(["snapshots", "accounts"], "readwrite");
    const snapshotStore = transaction.objectStore("snapshots");
    oldSnapshots.forEach((snapshot) => snapshotStore.delete(snapshot.id));
    mergedSnapshots.forEach((snapshot) => snapshotStore.put(snapshot));
    if (account.key !== oldKey) transaction.objectStore("accounts").delete(oldKey);
    transaction.objectStore("accounts").put({
      accountKey: account.key,
      accountUsername: account.username,
      lastUsedAt: Date.now(),
      lastSnapshotAt: mergedSnapshots[0]?.createdAt || Date.now(),
      snapshotCount: mergedSnapshots.length
    });
    await waitForTransaction(transaction);

    state.snapshots = await getSnapshots(account.key);
    const renamedCurrentId = currentId
      ? currentId.replace(`${oldKey}:`, `${account.key}:`)
      : null;
    state.currentSnapshot = state.snapshots.find((snapshot) => snapshot.id === renamedCurrentId)
      || state.snapshots.find((snapshot) => snapshot.fingerprint === state.currentSnapshot?.fingerprint)
      || state.snapshots[0]
      || null;
    state.previousSnapshot = state.snapshots.find((snapshot) => (
      snapshot.id !== state.currentSnapshot?.id
      && snapshot.fingerprint !== state.currentSnapshot?.fingerprint
      && snapshot.createdAt <= (state.currentSnapshot?.createdAt || Infinity)
    )) || null;
  }

  mergeAccountProgress(oldKey, account.key);
  state.accountKey = account.key;
  state.accountUsername = account.username;
  [state.currentSnapshot, state.previousSnapshot].filter(Boolean).forEach((snapshot) => {
    snapshot.id = `${account.key}:${snapshot.createdAt}:${snapshot.fingerprint}`;
    snapshot.accountKey = account.key;
    snapshot.accountUsername = account.username;
  });
  elements.accountInput.value = account.username;
  state.datasets.lostFollowers = [];
  state.datasets.newFollowers = [];
  buildComparisonDatasets();
  state.availableDatasetKeys = state.availableDatasetKeys.filter((key) => !["lostFollowers", "newFollowers"].includes(key));
  if (state.previousSnapshot) state.availableDatasetKeys = ["lostFollowers", "newFollowers", ...state.availableDatasetKeys];
  if (!state.availableDatasetKeys.includes(state.currentDataset)) state.currentDataset = "nonFollowers";
  renderDashboard();
  await renderSavedAccounts();

  if (oldUsername !== account.username) saveProgress();
}

function mergeAccountProgress(oldKey, newKey) {
  if (oldKey === newKey || typeof oldKey !== "string" || typeof newKey !== "string") return;
  const oldAccount = normalizeProfile(oldKey);
  const newAccount = normalizeProfile(newKey);
  if (!oldAccount || oldAccount.key !== oldKey || !newAccount || newAccount.key !== newKey) return;
  const source = state.progress.get(oldKey);
  if (!source) return;
  let target = state.progress.get(newKey);
  if (!target) { target = new Map(); state.progress.set(newKey, target); }
  source.forEach((values, datasetKey) => {
    if (!PROGRESS_DATASETS.has(datasetKey)) return;
    let destination = target.get(datasetKey);
    if (!destination) { destination = new Set(); target.set(datasetKey, destination); }
    values.forEach((value) => destination.add(value));
  });
  state.progress.delete(oldKey);
  saveProgress();
}

function openImportPicker() {
  if (!state.importInProgress) elements.fileInput.click();
}

async function openSelectedAccountHistory(updateRoute = true) {
  await storageReady;
  if (!state.database) {
    showStartView(false, false);
    showMessage(tr("messages.noAccountHistory"), "warning");
    setRoute(ROUTES.home, true);
    return;
  }
  const accounts = await getAccounts();
  if (!accounts.length) {
    showStartView(false, false);
    showMessage(tr("messages.noAccountHistory"), "warning");
    setRoute(ROUTES.home, true);
    return;
  }
  state.historyAccountKey = "";
  elements.startView.hidden = true;
  elements.resultsView.hidden = true;
  elements.historyView.hidden = false;
  elements.tutorialFab.hidden = false;
  if (updateRoute) setRoute(ROUTES.history);
  await renderHistoryHub();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showStartView(scroll = true, updateRoute = true) {
  elements.resultsView.hidden = true;
  elements.historyView.hidden = true;
  elements.startView.hidden = false;
  elements.tutorialFab.hidden = true;
  if (updateRoute) setRoute(ROUTES.home);
  if (scroll) window.scrollTo({ top: 0, behavior: "smooth" });
}

async function renderHistoryHub() {
  if (!state.database) return;
  const accounts = await getAccounts();
  elements.historyAccounts.replaceChildren();
  elements.historyHubMessage.hidden = true;
  const fragment = document.createDocumentFragment();
  for (const account of accounts) {
    const card = document.createElement("article");
    card.className = "history-account-card";
    const copy = document.createElement("div");
    const username = document.createElement("h2");
    username.textContent = `@${account.accountUsername}`;
    const count = document.createElement("strong");
    count.textContent = tr(account.snapshotCount === 1 ? "history.savedCountOne" : "history.savedCountMany", { count: formatNumber(account.snapshotCount) });
    const latest = document.createElement("span");
    latest.textContent = tr("history.lastAnalysis", { date: formatHistoryDate(account.lastSnapshotAt) });
    copy.append(username, count, latest);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "primary-button";
    button.textContent = tr("actions.viewHistory");
    button.addEventListener("click", () => showHistoryAccount(account.accountKey));
    card.append(copy, button);
    fragment.append(card);
  }
  elements.historyAccounts.append(fragment);
  showHistoryAccounts();
}

function showHistoryAccounts() {
  state.historyAccountKey = "";
  elements.historyAccounts.hidden = false;
  elements.historyAccountDetail.hidden = true;
}

async function showHistoryAccount(accountKey) {
  const snapshots = await getSnapshots(accountKey);
  if (!snapshots.length) {
    await renderHistoryHub();
    return;
  }
  state.historyAccountKey = accountKey;
  elements.historyAccounts.hidden = true;
  elements.historyAccountDetail.hidden = false;
  elements.historyAccountTitle.textContent = `@${snapshots[0].accountUsername}`;
  elements.historyAnalysisList.replaceChildren();
  const fragment = document.createDocumentFragment();
  snapshots.forEach((snapshot) => {
    const row = document.createElement("article");
    row.className = "saved-analysis-row";
    const copy = document.createElement("div");
    const title = document.createElement("h3");
    title.textContent = tr("history.savedOn", { date: formatHistoryDateTime(snapshot.createdAt) });
    const counts = document.createElement("p");
    counts.textContent = tr("history.counts", { followers: formatNumber(snapshot.followersCount), following: formatNumber(snapshot.followingCount) });
    copy.append(title, counts);
    const actions = document.createElement("div");
    const openButton = document.createElement("button");
    openButton.type = "button";
    openButton.className = "primary-button";
    openButton.textContent = tr("actions.openAnalysis");
    openButton.addEventListener("click", () => openSnapshotResults(snapshot.id));
    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-analysis-button";
    deleteButton.textContent = tr("actions.deleteAnalysis");
    deleteButton.addEventListener("click", () => deleteSavedAnalysis(snapshot));
    actions.append(openButton, deleteButton);
    row.append(copy, actions);
    fragment.append(row);
  });
  elements.historyAnalysisList.append(fragment);
}

async function deleteSavedAnalysis(snapshot) {
  const accountSnapshots = await getSnapshots(snapshot.accountKey);
  const confirmationKey = accountSnapshots.length === 1 ? "history.deleteLastConfirm" : "history.deleteConfirm";
  if (!window.confirm(tr(confirmationKey))) return;

  const deleteTransaction = state.database.transaction("snapshots", "readwrite");
  deleteTransaction.objectStore("snapshots").delete(snapshot.id);
  await waitForTransaction(deleteTransaction);
  const remaining = await getSnapshots(snapshot.accountKey);
  const accountTransaction = state.database.transaction("accounts", "readwrite");
  if (remaining.length) {
    accountTransaction.objectStore("accounts").put({
      accountKey: snapshot.accountKey,
      accountUsername: snapshot.accountUsername,
      lastUsedAt: Date.now(),
      lastSnapshotAt: remaining[0].createdAt,
      snapshotCount: remaining.length
    });
  } else {
    accountTransaction.objectStore("accounts").delete(snapshot.accountKey);
    state.progress.delete(snapshot.accountKey);
    saveProgress();
  }
  await waitForTransaction(accountTransaction);
  await renderSavedAccounts();
  if (remaining.length) await showHistoryAccount(snapshot.accountKey);
  else await renderHistoryHub();
  elements.historyHubMessage.textContent = tr("history.deleted");
  elements.historyHubMessage.className = "message success";
  elements.historyHubMessage.hidden = false;
}

function launchDemo() {
  if (state.importInProgress) return;
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  const createProfiles = (prefix, count, offset = 0) => Array.from({ length: count }, (_, index) => {
    const number = String(index + 1).padStart(3, "0");
    return normalizeProfile(`${prefix}_${number}`, now - ((index + offset) % 240) * day);
  });
  const mutuals = createProfiles("mutuo_demo", 745);
  const followersOnly = createProfiles("seguidor_demo", 516, 20);
  const newFollowers = createProfiles("novo_demo", 23, 2);
  const nonFollowers = createProfiles("exemplo_demo", 147, 40);
  const lostFollowers = createProfiles("mudanca_demo", 8, 8);
  const currentFollowers = [...mutuals, ...followersOnly, ...newFollowers];
  const previousFollowers = [...mutuals, ...followersOnly, ...lostFollowers];
  const following = [...mutuals, ...nonFollowers];
  const currentCreatedAt = now - day;
  const previousCreatedAt = now - 8 * day;
  const toDateRecord = (profiles) => Object.fromEntries(profiles.map((profile) => [profile.key, profile.timestamp]));
  const toNames = (profiles) => profiles.map((profile) => profile.username);
  const makeDemoSnapshot = (profiles, createdAt, suffix) => ({
    id: DEMO_ACCOUNT_KEY + ":" + suffix,
    accountKey: DEMO_ACCOUNT_KEY,
    accountUsername: "demo_instacheck",
    isDemo: true,
    createdAt,
    sourceName: tr("demo.source"),
    fingerprint: suffix,
    followers: toNames(profiles),
    following: toNames(following),
    followerDates: toDateRecord(profiles),
    followingDates: toDateRecord(following),
    followersCount: profiles.length,
    followingCount: following.length
  });

  state.isDemo = true;
  state.accountKey = DEMO_ACCOUNT_KEY;
  state.accountUsername = "demo_instacheck";
  state.followers = new Map(currentFollowers.map((profile) => [profile.key, profile]));
  state.following = new Map(following.map((profile) => [profile.key, profile]));
  state.datasets = buildDatasets([]);
  state.currentSnapshot = makeDemoSnapshot(currentFollowers, currentCreatedAt, "current");
  state.previousSnapshot = makeDemoSnapshot(previousFollowers, previousCreatedAt, "previous");
  state.snapshots = [state.currentSnapshot, state.previousSnapshot];
  buildComparisonDatasets();
  state.availableDatasetKeys = ["lostFollowers", "newFollowers", "nonFollowers", "followersOnly", "mutuals"];
  state.currentDataset = "nonFollowers";
  state.importedFiles = [];
  state.importedArchiveName = "";
  state.viewingHistoricalSnapshot = false;
  state.query = "";
  state.filter = "all";
  elements.searchInput.value = "";
  resetFilterButtons();
  renderDashboard();
  elements.editAccountButton.hidden = true;
  elements.startView.hidden = true;
  elements.historyView.hidden = true;
  elements.resultsView.hidden = false;
  elements.tutorialFab.hidden = false;
  setRoute(ROUTES.analysis);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function processFiles(files) {
  if (state.importInProgress) return;
  const selectedFiles = Array.from(files || []);
  if (!selectedFiles.length) { showMessage(tr("messages.selectFiles")); return; }
  state.importInProgress = true;
  setProcessing(true);
  hideMessage();
  try {
    await storageReady;
    const importResult = await prepareImport(selectedFiles);
    if (importResult.backupData) {
      await restoreHistoryBackupData(importResult.backupData, { openLatest: true, allowDuringImport: true });
      return;
    }
    const account = readAccountInput(true);
    if (!account) return;
    claimLegacyProgress(account.key);
    const recognizedFiles = [];
    const ignoredFiles = [];
    importResult.parsedFiles.forEach(({ name, data }) => {
      const type = identifyFileType(name, data);
      if (!type) { ignoredFiles.push(name); return; }
      recognizedFiles.push({ name, type, profiles: extractProfiles(data) });
    });
    const followerFiles = getFilesByType(recognizedFiles, "followers");
    const followingFiles = getFilesByType(recognizedFiles, "following");
    if (!followerFiles.length || !followingFiles.length) {
      const missing = [];
      if (!followerFiles.length) missing.push("followers_*.json");
      if (!followingFiles.length) missing.push("following.json");
      throw new Error(tr("messages.missingFiles", { files: joinWithAnd(missing) }));
    }
    state.accountKey = account.key;
    state.accountUsername = account.username;
    state.isDemo = false;
    state.historyPersisted = false;
    elements.editAccountButton.hidden = false;
    state.followers = mergeProfiles(followerFiles);
    state.following = mergeProfiles(followingFiles);
    state.datasets = buildDatasets(recognizedFiles);
    state.importedFiles = recognizedFiles;
    state.importedArchiveName = importResult.archiveName;
    state.viewingHistoricalSnapshot = false;
    state.availableDatasetKeys = ["nonFollowers", "followersOnly", "mutuals"];
    ["pendingRequests", "recentRequests", "recentlyUnfollowed"].forEach((type) => {
      if (getFilesByType(recognizedFiles, type).length) state.availableDatasetKeys.push(type);
    });
    await updateHistoryForCurrentAnalysis(importResult.sourceName);
    state.query = "";
    state.filter = "all";
    elements.searchInput.value = "";
    resetFilterButtons();
    renderDashboard(ignoredFiles.length);
    elements.startView.hidden = true;
    elements.resultsView.hidden = false;
    elements.historyView.hidden = true;
    elements.tutorialFab.hidden = false;
    try { await renderSavedAccounts(); } catch { state.storageAvailable = false; }
    setRoute(ROUTES.analysis);
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (error) {
    showMessage(error.message || tr("messages.processError"));
  } finally {
    state.importInProgress = false;
    setProcessing(false);
  }
}

async function prepareImport(files) {
  if (!files.length) throw new Error(tr("messages.selectFiles"));
  if (files.length > MAX_IMPORT_FILES) throw new Error(tr("messages.tooManyFiles"));
  const zipFiles = files.filter((file) => file.name.toLocaleLowerCase("en-US").endsWith(".zip"));
  const jsonFiles = files.filter((file) => file.name.toLocaleLowerCase("en-US").endsWith(".json"));
  if (zipFiles.length) {
    if (zipFiles.length !== 1 || files.length !== 1) throw new Error(tr("messages.oneZip"));
    const archive = zipFiles[0];
    if (archive.size > MAX_ARCHIVE_SIZE) throw new Error(tr("messages.zipTooLarge"));
    return { parsedFiles: await readInstagramArchive(archive), archiveName: archive.name, sourceName: archive.name };
  }
  if (jsonFiles.length !== files.length) throw new Error(tr("messages.zipOrJson"));
  if (jsonFiles.length > MAX_MANUAL_JSON_FILES) throw new Error(tr("messages.tooManyFiles"));
  const totalSize = jsonFiles.reduce((sum, file) => sum + file.size, 0);
  if (jsonFiles.some((file) => file.size > MAX_JSON_FILE_SIZE)) throw new Error(tr("messages.jsonTooLarge"));
  if (totalSize > MAX_TOTAL_JSON_SIZE) throw new Error(tr("messages.totalJsonTooLarge"));
  const parsedFiles = await readJsonFiles(jsonFiles);
  if (parsedFiles.length === 1 && isInstaCheckBackupData(parsedFiles[0].data)) {
    if (jsonFiles[0].size > MAX_BACKUP_SIZE) throw new Error(tr("messages.backupLarge"));
    return { parsedFiles: [], backupData: parsedFiles[0].data, archiveName: "", sourceName: jsonFiles[0].name };
  }
  return { parsedFiles, archiveName: "", sourceName: tr("messages.jsonFiles", { count: jsonFiles.length }) };
}

async function readInstagramArchive(file) {
  if (file.size > MAX_ARCHIVE_SIZE) throw new Error(tr("messages.zipTooLarge"));
  const buffer = await file.arrayBuffer();
  const result = await runImportWorker({ type: "zip", name: file.name, buffer }, [buffer]);
  return result.files;
}

async function readJsonFile(file) {
  if (file.size > MAX_JSON_FILE_SIZE) throw new Error(tr("messages.jsonTooLarge"));
  const [parsed] = await readJsonFiles([file]);
  return parsed;
}
async function readJsonFiles(files) {
  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  if (files.length > MAX_MANUAL_JSON_FILES || files.length > MAX_IMPORT_FILES) throw new Error(tr("messages.tooManyFiles"));
  if (files.some((file) => file.size > MAX_JSON_FILE_SIZE)) throw new Error(tr("messages.jsonTooLarge"));
  if (totalSize > MAX_TOTAL_JSON_SIZE) throw new Error(tr("messages.totalJsonTooLarge"));
  const entries = await Promise.all(files.map(async (file) => ({ name: file.name, buffer: await file.arrayBuffer() })));
  const result = await runImportWorker({ type: "json", files: entries }, entries.map((entry) => entry.buffer));
  return result.files;
}
function runImportWorker(payload, transferables = []) {
  if (typeof Worker !== "function") throw new Error(tr("messages.workerUnavailable"));
  return new Promise((resolve, reject) => {
    let worker;
    try { worker = new Worker("./import-worker.js"); }
    catch { reject(new Error(tr("messages.workerUnavailable"))); return; }
    const finish = (callback, value) => { worker.terminate(); callback(value); };
    worker.onmessage = (event) => {
      const result = event.data;
      if (!result || !result.ok) {
        const message = tr("messages." + (result && result.code || "processError"), { name: result && result.name || "" });
        finish(reject, new Error(message));
        return;
      }
      finish(resolve, result);
    };
    worker.onerror = () => finish(reject, new Error(tr("messages.workerUnavailable")));
    try { worker.postMessage(payload, transferables); }
    catch { finish(reject, new Error(tr("messages.workerUnavailable"))); }
  });
}
function isInstaCheckBackupData(data) {
  return data?.app === "InstaCheck" && data?.version === 1 && Array.isArray(data.snapshots);
}

function readAccountInput(showError) {
  const profile = normalizeProfile(elements.accountInput.value);
  if (!profile) {
    if (showError) {
      elements.accountInput.setAttribute("aria-invalid", "true");
      elements.accountInput.focus();
      showMessage(tr("messages.username"));
    }
    return null;
  }
  return { key: profile.key, username: profile.username };
}

function identifyFileType(fileName, data) {
  const normalizedName = fileName.toLocaleLowerCase("en-US");
  if (/^pending_follow_requests(?:_sent)?\.json$/.test(normalizedName)) return "pendingRequests";
  if (/^recent_follow_requests\.json$/.test(normalizedName)) return "recentRequests";
  if (/^recently_unfollowed_(?:profiles|accounts)\.json$/.test(normalizedName)) return "recentlyUnfollowed";
  if (/^followers(?:_\d+)?\.json$/.test(normalizedName)) return "followers";
  if (/^following(?:_\d+)?\.json$/.test(normalizedName)) return "following";

  const keys = collectKeys(data);
  if (keys.some((key) => key.includes("follow_requests_sent"))) return "pendingRequests";
  if (keys.some((key) => key.includes("permanent_follow_requests"))) return "recentRequests";
  if (keys.some((key) => key.includes("recently_unfollowed"))) return "recentlyUnfollowed";
  if (keys.some((key) => key.includes("relationships_following") || key === "following")) return "following";
  if (keys.some((key) => key.includes("relationships_followers") || /^followers(?:_\d+)?$/.test(key))) return "followers";
  return null;
}

function collectKeys(data) {
  const keys = [];
  const queue = [data];
  let inspected = 0;
  while (queue.length && inspected < 500) {
    const current = queue.shift();
    inspected += 1;
    if (!current || typeof current !== "object") continue;
    if (Array.isArray(current)) {
      queue.push(...current.slice(0, 25));
      continue;
    }
    Object.entries(current).forEach(([key, value]) => {
      keys.push(key.toLocaleLowerCase("en-US"));
      if (value && typeof value === "object") queue.push(value);
    });
  }
  return keys;
}

function extractProfiles(data) {
  const profiles = new Map();

  function addCandidate(candidate, timestamp) {
    const profile = normalizeProfile(candidate, timestamp);
    if (!profile) return;
    const current = profiles.get(profile.key);
    if (!current || (profile.timestamp || 0) > (current.timestamp || 0)) profiles.set(profile.key, profile);
  }

  function visit(node, contextKey = "") {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) {
      node.forEach((item) => visit(item, contextKey));
      return;
    }

    const nodeTimestamp = node.timestamp;
    const stringList = node.string_list_data || node.stringListData;
    if (Array.isArray(stringList)) {
      stringList.forEach((item) => {
        if (!item || typeof item !== "object") return;
        addCandidate(item.value, item.timestamp || nodeTimestamp);
        addCandidate(item.username, item.timestamp || nodeTimestamp);
        addCandidate(item.user_name, item.timestamp || nodeTimestamp);
        addCandidate(item.href, item.timestamp || nodeTimestamp);
      });
      addCandidate(node.title, stringList[0]?.timestamp || nodeTimestamp);
    }

    const labelValues = node.label_values || node.labelValues;
    if (Array.isArray(labelValues)) {
      const usernameEntry = labelValues.find((item) => {
        const label = normalizeLabel(item?.label);
        return label === "username" || label === "usuario" || label === "nome de usuario";
      });
      addCandidate(usernameEntry?.value, nodeTimestamp);
    }

    addCandidate(node.username, nodeTimestamp);
    addCandidate(node.user_name, nodeTimestamp);
    addCandidate(node.href, nodeTimestamp);
    if (contextKey.includes("follow") || contextKey.includes("relationship")) {
      addCandidate(node.title, nodeTimestamp);
      addCandidate(node.value, nodeTimestamp);
    }

    Object.entries(node).forEach(([key, value]) => {
      if (value && typeof value === "object") visit(value, key.toLocaleLowerCase("en-US"));
    });
  }

  visit(data);
  return profiles;
}

function normalizeProfile(candidate, timestamp) {
  if (typeof candidate !== "string") return null;
  let username = candidate.trim();
  if (!username) return null;
  if (/^(?:https?:\/\/)?(?:www\.)?instagram\.com\//i.test(username)) {
    try {
      const url = new URL(username.startsWith("http") ? username : "https://" + username);
      const segments = url.pathname.split("/").filter(Boolean).map(decodeURIComponent);
      username = segments[0] === "_u" ? segments[1] : segments[0];
    } catch { return null; }
  }
  username = String(username || "").trim().replace(/^@+/, "").replace(/\/$/, "");
  const key = username.toLocaleLowerCase("en-US");
  if (!USERNAME_PATTERN.test(username) || RESERVED_PATHS.has(key) || RESERVED_USERNAMES.has(key)) return null;
  return { key, username, timestamp: normalizeTimestamp(timestamp) };
}

function normalizeTimestamp(value) {
  if (value === null || value === undefined || value === "") return null;
  let numeric;
  try { numeric = Number(value); } catch { return null; }
  if (Number.isFinite(numeric)) {
    if (numeric <= 0) return null;
    const timestamp = numeric < 1e12 ? numeric * 1000 : numeric;
    return Number.isFinite(timestamp) && timestamp <= MAX_SUPPORTED_TIMESTAMP ? timestamp : null;
  }
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) && Math.abs(parsed) <= MAX_SUPPORTED_TIMESTAMP ? parsed : null;
}

function normalizeLabel(value) {
  return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLocaleLowerCase("en-US");
}

function mergeProfiles(files) {
  const merged = new Map();
  files.forEach((file) => {
    file.profiles.forEach((profile, key) => {
      const current = merged.get(key);
      if (!current || (profile.timestamp || 0) > (current.timestamp || 0)) merged.set(key, profile);
    });
  });
  return merged;
}

function buildDatasets(files) {
  const followingProfiles = [...state.following.values()].map((profile) => ({
    ...profile,
    followedAt: profile.timestamp
  }));
  const followerProfiles = [...state.followers.values()].map((profile) => ({
    ...profile,
    followedYouAt: profile.timestamp
  }));

  return {
    lostFollowers: [],
    newFollowers: [],
    nonFollowers: sortAlphabetically(followingProfiles.filter((profile) => !state.followers.has(profile.key))),
    followersOnly: sortAlphabetically(followerProfiles.filter((profile) => !state.following.has(profile.key))),
    mutuals: sortAlphabetically(followingProfiles
      .filter((profile) => state.followers.has(profile.key))
      .map((profile) => ({
        ...profile,
        followedYouAt: state.followers.get(profile.key)?.timestamp || null
      }))),
    pendingRequests: sortByNewest([...mergeProfiles(getFilesByType(files, "pendingRequests")).values()]),
    recentRequests: sortByNewest([...mergeProfiles(getFilesByType(files, "recentRequests")).values()]),
    recentlyUnfollowed: sortByNewest([...mergeProfiles(getFilesByType(files, "recentlyUnfollowed")).values()])
  };
}

function createEmptyDatasets() {
  return {
    lostFollowers: [],
    newFollowers: [],
    nonFollowers: [],
    followersOnly: [],
    mutuals: [],
    pendingRequests: [],
    recentRequests: [],
    recentlyUnfollowed: []
  };
}

function sortAlphabetically(profiles) {
  return profiles.sort((first, second) => first.username.localeCompare(second.username, getLocale(), { sensitivity: "base" }));
}

function sortByNewest(profiles) {
  return profiles.sort((first, second) => (second.timestamp || 0) - (first.timestamp || 0) || first.username.localeCompare(second.username, getLocale(), { sensitivity: "base" }));
}

function getFilesByType(files, type) {
  return files.filter((file) => file.type === type);
}

async function updateHistoryForCurrentAnalysis(sourceName) {
  state.snapshots = [];
  state.currentSnapshot = null;
  state.previousSnapshot = null;
  state.historyPersisted = false;
  let history = [];
  let canPersist = Boolean(state.storageAvailable && state.database);
  if (canPersist) {
    try { history = await getSnapshots(state.accountKey); }
    catch { canPersist = false; state.storageAvailable = false; }
  }
  const createdAt = Date.now();
  const followers = sortStrings([...state.followers.values()].map((profile) => profile.username));
  const following = sortStrings([...state.following.values()].map((profile) => profile.username));
  const followerDates = createTimestampRecord(state.followers);
  const followingDates = createTimestampRecord(state.following);
  const fingerprint = hashString(followers.map((item) => item.toLocaleLowerCase("en-US")).join("|") + "::" + following.map((item) => item.toLocaleLowerCase("en-US")).join("|"));
  const latest = history[0] || null;
  const previousDifferent = history.find((snapshot) => snapshot.fingerprint !== fingerprint) || null;
  if (latest?.fingerprint === fingerprint) {
    state.currentSnapshot = { ...latest, followerDates, followingDates };
    state.previousSnapshot = previousDifferent;
  } else {
    state.currentSnapshot = {
      id: state.accountKey + ":" + createdAt + ":" + fingerprint,
      accountKey: state.accountKey, accountUsername: state.accountUsername, createdAt, sourceName,
      fingerprint, followers, following, followerDates, followingDates,
      followersCount: followers.length, followingCount: following.length
    };
    state.previousSnapshot = latest;
  }
  state.snapshots = [state.currentSnapshot, ...history.filter((snapshot) => snapshot.id !== state.currentSnapshot.id)];
  if (canPersist) {
    try {
      await saveSnapshotAndAccount(state.currentSnapshot, state.snapshots.length);
      state.historyPersisted = true;
      try { state.snapshots = await getSnapshots(state.accountKey); } catch { /* Keep in-session snapshot after successful write. */ }
    } catch { state.historyPersisted = false; }
  }
  buildComparisonDatasets();
  if (state.previousSnapshot) {
    state.availableDatasetKeys = ["lostFollowers", "newFollowers", ...state.availableDatasetKeys.filter((key) => !["lostFollowers", "newFollowers"].includes(key))];
    state.currentDataset = "lostFollowers";
  } else state.currentDataset = "nonFollowers";
  return state.historyPersisted;
}

function buildComparisonDatasets() {
  if (!state.currentSnapshot || !state.previousSnapshot) return;
  const currentFollowers = createUsernameMap(state.currentSnapshot.followers, state.currentSnapshot.followerDates);
  const previousFollowers = createUsernameMap(state.previousSnapshot.followers, state.previousSnapshot.followerDates);
  state.datasets.lostFollowers = sortAlphabetically([...previousFollowers.values()]
    .filter((profile) => !currentFollowers.has(profile.key))
    .map((profile) => ({ ...profile, detectedAt: state.previousSnapshot.createdAt })));
  state.datasets.newFollowers = sortAlphabetically([...currentFollowers.values()]
    .filter((profile) => !previousFollowers.has(profile.key))
    .map((profile) => ({ ...profile, detectedAt: state.currentSnapshot.createdAt })));
}

function createUsernameMap(usernames, dates = {}) {
  const profiles = new Map();
  usernames.forEach((username) => {
    const profile = normalizeProfile(username);
    if (!profile) return;
    const timestamp = Object.prototype.hasOwnProperty.call(dates, profile.key) ? normalizeTimestamp(dates[profile.key]) : null;
    profiles.set(profile.key, { ...profile, followedYouAt: timestamp });
  });
  return profiles;
}

function createTimestampRecord(profiles) {
  const dates = Object.create(null);
  profiles.forEach((profile, key) => {
    const timestamp = normalizeTimestamp(profile.timestamp);
    if (timestamp) dates[key] = timestamp;
  });
  return dates;
}

function renderDashboard(ignoredFileCount = 0) {
  elements.currentAccountBadge.textContent = state.isDemo
    ? tr("demo.badge")
    : tr("results.accountBadge", { username: state.accountUsername });
  elements.followersCount.textContent = formatNumber(state.followers.size);
  elements.followingCount.textContent = formatNumber(state.following.size);
  elements.mutualCount.textContent = formatNumber(state.datasets.mutuals.length);
  elements.notFollowingCount.textContent = formatNumber(state.datasets.nonFollowers.length);

  const summaryParts = [
    state.datasets.nonFollowers.length
      ? tr("results.nonFollowersCount", { count: formatNumber(state.datasets.nonFollowers.length) })
      : tr("results.allFollowBack")
  ];
  if (state.isDemo) {
    summaryParts.unshift(tr("demo.summary"));
  } else if (state.viewingHistoricalSnapshot && state.currentSnapshot) {
    summaryParts.unshift(tr("results.snapshotViewing", { date: formatHistoryDateTime(state.currentSnapshot.createdAt) }));
  } else if (state.historyPersisted) summaryParts.unshift(tr("results.snapshotSaved", { username: state.accountUsername }));
  else summaryParts.unshift(tr("results.noStorage"));
  elements.storageWarning.hidden = state.isDemo || state.viewingHistoricalSnapshot || state.historyPersisted;
  elements.storageWarning.textContent = tr("results.noStorage");
  if (ignoredFileCount) summaryParts.push(tr("results.ignoredFiles", {
    count: formatNumber(ignoredFileCount),
    files: tr(ignoredFileCount === 1 ? "words.file" : "words.files")
  }));
  elements.analysisSummary.textContent = summaryParts.join(" ");

  renderFileSummary();
  renderHistory();
  renderDatasetTabs();
  renderCurrentDataset();
}

function renderFileSummary() {
  elements.fileSummary.replaceChildren();
  const fragment = document.createDocumentFragment();
  if (state.isDemo) {
    const demoChip = document.createElement("span");
    demoChip.className = "file-chip demo-chip";
    demoChip.textContent = tr("demo.dataLabel");
    fragment.append(demoChip);
  }
  if (state.viewingHistoricalSnapshot && state.currentSnapshot) {
    const snapshotChip = document.createElement("span");
    snapshotChip.className = "file-chip archive-chip";
    snapshotChip.textContent = tr("results.snapshotChip", {
      date: formatHistoryDateTime(state.currentSnapshot.createdAt),
      source: state.currentSnapshot.sourceName || tr("history.source")
    });
    fragment.append(snapshotChip);
  }
  if (state.importedArchiveName) {
    const archiveChip = document.createElement("span");
    archiveChip.className = "file-chip archive-chip";
    archiveChip.textContent = tr("results.archiveChip", { name: state.importedArchiveName });
    fragment.append(archiveChip);
  }
  state.importedFiles.forEach((file) => {
    const chip = document.createElement("span");
    chip.className = "file-chip";
    chip.textContent = `${file.name} · ${formatNumber(file.profiles.size)}`;
    fragment.append(chip);
  });
  elements.fileSummary.append(fragment);
}

function renderHistory() {
  const hasPrevious = Boolean(state.previousSnapshot);
  const lostCount = state.datasets.lostFollowers.length;
  const newCount = state.datasets.newFollowers.length;
  elements.historyInsight.classList.toggle("has-losses", lostCount > 0);
  elements.historyDeltas.hidden = !hasPrevious;
  elements.viewLostButton.hidden = !hasPrevious || lostCount === 0;

  if (!state.storageAvailable && !state.isDemo) {
    elements.historyInsightTitle.textContent = tr("history.unavailableTitle");
    elements.historyInsightDescription.textContent = tr("history.unavailableDescription");
  } else if (!hasPrevious) {
    elements.historyInsightTitle.textContent = tr("history.firstTitle");
    elements.historyInsightDescription.textContent = tr("history.firstDescription");
  } else {
    elements.lostFollowersCount.textContent = formatNumber(lostCount);
    elements.newFollowersCount.textContent = formatNumber(newCount);
    const followerDelta = state.currentSnapshot.followersCount - state.previousSnapshot.followersCount;
    const followingDelta = state.currentSnapshot.followingCount - state.previousSnapshot.followingCount;
    elements.followersDeltaCount.textContent = formatSignedNumber(followerDelta);
    elements.followingDeltaCount.textContent = formatSignedNumber(followingDelta);
    elements.historyInsightTitle.textContent = lostCount
      ? tr("history.lostTitle", {
        count: formatNumber(lostCount),
        people: tr(lostCount === 1 ? "words.person" : "words.people"),
        verb: tr(lostCount === 1 ? "words.left" : "words.leftPlural")
      })
      : tr("history.nobodyLeft");
    elements.historyInsightDescription.textContent = tr("history.comparisonWith", { date: formatHistoryDate(state.previousSnapshot.createdAt) });
  }

  renderHistoryList();
}

function renderHistoryList() {
  elements.historyList.replaceChildren();
  elements.resultsHistoryActions.hidden = state.isDemo;
  elements.resultsHistoryDeviceNote.hidden = state.isDemo;
  elements.historyTitle.textContent = state.isDemo ? tr("demo.historyTitle") : tr("history.title");
  elements.historySubtitle.textContent = state.isDemo
    ? tr("demo.historyHelp")
    : state.storageAvailable
    ? tr("history.automatic", { username: state.accountUsername })
    : tr("history.unavailable");

  if (!state.snapshots.length) {
    const empty = document.createElement("p");
    empty.className = "history-device-note";
    empty.textContent = tr("history.empty");
    elements.historyList.append(empty);
    return;
  }

  const fragment = document.createDocumentFragment();
  state.snapshots.slice(0, 12).forEach((snapshot, index) => {
    const row = document.createElement("button");
    const isCurrent = snapshot.id === state.currentSnapshot?.id;
    row.type = "button";
    row.className = `history-entry${isCurrent ? " is-current" : ""}`;
    row.setAttribute("aria-label", tr("history.openSnapshot", { date: formatHistoryDateTime(snapshot.createdAt) }));
    if (isCurrent) row.setAttribute("aria-current", "true");
    const dot = document.createElement("span");
    dot.className = "history-entry-dot";
    dot.setAttribute("aria-hidden", "true");
    const copy = document.createElement("div");
    copy.className = "history-entry-copy";
    const title = document.createElement("strong");
    title.textContent = index === 0
      ? tr("history.latest", { date: formatHistoryDateTime(snapshot.createdAt) })
      : formatHistoryDateTime(snapshot.createdAt);
    const source = document.createElement("span");
    source.textContent = snapshot.sourceName || tr("history.source");
    copy.append(title, source);
    const meta = document.createElement("span");
    meta.className = "history-entry-meta";
    meta.textContent = tr("history.counts", {
      followers: formatNumber(snapshot.followersCount),
      following: formatNumber(snapshot.followingCount)
    });
    const action = document.createElement("span");
    action.className = "history-entry-action";
    action.textContent = isCurrent ? tr("history.viewing") : tr("history.viewResults");
    row.append(dot, copy, meta, action);
    row.addEventListener("click", () => openSnapshotResults(snapshot.id));
    fragment.append(row);
  });
  elements.historyList.append(fragment);
}

async function openSnapshotResults(snapshotId, options = {}) {
  if (state.importInProgress && !options.allowDuringImport) return;
  await storageReady;
  const isDemoSnapshot = String(snapshotId).startsWith(DEMO_ACCOUNT_KEY + ":");
  if (!state.database && !isDemoSnapshot) {
    showHistoryMessage(tr("messages.historyUnavailable"));
    return;
  }

  let snapshots = state.snapshots;
  let snapshot = snapshots.find((item) => item.id === snapshotId);
  if (!snapshot) {
    if (!state.database) return;
    const allSnapshots = await getSnapshotsForAllAccounts();
    snapshot = allSnapshots.find((item) => item.id === snapshotId);
    if (!snapshot) return;
    snapshots = await getSnapshots(snapshot.accountKey);
  }

  state.accountKey = snapshot.accountKey;
  state.accountUsername = snapshot.accountUsername;
  state.snapshots = snapshots;
  state.currentSnapshot = snapshot;
  state.previousSnapshot = snapshots.find((item) => (
    item.createdAt < snapshot.createdAt
    && item.fingerprint !== snapshot.fingerprint
  )) || null;
  state.followers = createSnapshotProfileMap(snapshot.followers, snapshot.followerDates);
  state.following = createSnapshotProfileMap(snapshot.following, snapshot.followingDates);
  state.datasets = buildDatasets([]);
  state.availableDatasetKeys = ["nonFollowers", "followersOnly", "mutuals"];
  buildComparisonDatasets();
  if (state.previousSnapshot) state.availableDatasetKeys = ["lostFollowers", "newFollowers", ...state.availableDatasetKeys];
  state.currentDataset = state.previousSnapshot ? "lostFollowers" : "nonFollowers";
  state.importedFiles = [];
  state.importedArchiveName = "";
  state.viewingHistoricalSnapshot = true;
  state.isDemo = snapshot.isDemo === true;
  state.query = "";
  state.filter = "all";
  elements.accountInput.value = snapshot.accountUsername;
  elements.editAccountButton.hidden = state.isDemo;
  elements.searchInput.value = "";
  resetFilterButtons();
  renderDashboard();
  await renderSavedAccounts();
  elements.startView.hidden = true;
  elements.resultsView.hidden = false;
  elements.tutorialFab.hidden = false;
  if (options.updateRoute !== false) setRoute(ROUTES.analysis);
  if (!options.keepScroll) window.scrollTo({ top: 0, behavior: "smooth" });
}

function createSnapshotProfileMap(usernames, dates = {}) {
  const profiles = new Map();
  usernames.forEach((username) => {
    const key = String(username).toLocaleLowerCase("en-US");
    const profile = normalizeProfile(username, dates?.[key]);
    if (profile) profiles.set(profile.key, profile);
  });
  return profiles;
}

function renderDatasetTabs() {
  elements.datasetTabs.replaceChildren();
  const fragment = document.createDocumentFragment();
  state.availableDatasetKeys.forEach((key) => {
    const config = DATASET_CONFIG[key];
    const button = document.createElement("button");
    const count = document.createElement("span");
    const isActive = state.currentDataset === key;
    button.type = "button";
    button.className = `dataset-tab${isActive ? " active" : ""}`;
    button.dataset.dataset = key;
    button.setAttribute("role", "tab");
    button.setAttribute("aria-selected", String(isActive));
    button.textContent = config.label;
    count.textContent = formatNumber(state.datasets[key].length);
    button.append(count);
    button.addEventListener("click", () => selectDataset(key));
    fragment.append(button);
  });
  elements.datasetTabs.append(fragment);
}

function selectDataset(key, scrollToList = false) {
  if (!state.availableDatasetKeys.includes(key)) return;
  state.currentDataset = key;
  state.query = "";
  state.filter = "all";
  elements.searchInput.value = "";
  resetFilterButtons();
  renderDatasetTabs();
  renderCurrentDataset();
  if (scrollToList) document.querySelector(".list-card").scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderCurrentDataset() {
  const config = DATASET_CONFIG[state.currentDataset];
  const profiles = state.datasets[state.currentDataset];
  let description = config.description;
  if (["lostFollowers", "newFollowers"].includes(state.currentDataset) && state.previousSnapshot) {
    description = `${description} ${tr("list.comparisonWith", { date: formatHistoryDate(state.previousSnapshot.createdAt) })}`;
  }
  elements.datasetDescription.textContent = description;
  elements.listTitle.textContent = config.title;
  elements.progressCard.hidden = !config.actionable;
  elements.statusFilters.hidden = !config.actionable;
  elements.resetButton.hidden = !config.actionable;
  elements.pendingFilterLabel.textContent = tr("filters.pending");
  elements.reviewedFilterLabel.textContent = config.filterReviewedLabel || tr("filters.reviewed");
  if (config.actionable) renderProgress(profiles, config);
  renderProfiles();
}

function renderProgress(profiles, config) {
  const progress = getProgressSet(state.currentDataset);
  const reviewedCount = profiles.filter((profile) => progress.has(profile.key)).length;
  const pendingCount = profiles.length - reviewedCount;
  const percentage = profiles.length ? Math.round((reviewedCount / profiles.length) * 100) : 0;
  elements.progressLabel.textContent = config.progressLabel;
  elements.allFilterCount.textContent = formatNumber(profiles.length);
  elements.pendingFilterCount.textContent = formatNumber(pendingCount);
  elements.removedFilterCount.textContent = formatNumber(reviewedCount);
  const progressWord = state.currentDataset === "pendingRequests"
    ? tr(profiles.length === 1 ? "words.requestReviewed" : "words.requestsReviewed")
    : tr(profiles.length === 1 ? "words.reviewedItem" : "words.reviewedItems");
  elements.progressText.textContent = tr("progress.count", {
    reviewed: formatNumber(reviewedCount),
    total: formatNumber(profiles.length),
    items: progressWord
  });
  elements.progressPercentage.textContent = `${percentage}%`;
  elements.progressBar.setAttribute("aria-valuemax", String(profiles.length));
  elements.progressBar.setAttribute("aria-valuenow", String(reviewedCount));
  elements.progressFill.style.width = `${percentage}%`;
  elements.resetButton.disabled = reviewedCount === 0;
}

function renderProfiles() {
  const config = DATASET_CONFIG[state.currentDataset];
  const progress = getProgressSet(state.currentDataset);
  const profiles = state.datasets[state.currentDataset];
  const visibleProfiles = sortProfilesForView(profiles.filter((profile) => {
    const isReviewed = progress.has(profile.key);
    const matchesFilter = !config.actionable || state.filter === "all" || (state.filter === "removed" ? isReviewed : !isReviewed);
    return matchesFilter && (!state.query || profile.key.includes(state.query));
  }));

  state.visibleProfiles = visibleProfiles;
  elements.profileList.replaceChildren();
  const fragment = document.createDocumentFragment();
  visibleProfiles.forEach((profile) => fragment.append(createProfileRow(profile, config, progress.has(profile.key))));
  elements.profileList.append(fragment);
  const count = visibleProfiles.length;
  elements.visibleCount.textContent = tr("list.visibleCount", {
    count: formatNumber(count),
    profiles: tr(count === 1 ? "words.profile" : "words.profiles")
  });
  elements.copyButton.disabled = count === 0;
  elements.exportButton.disabled = count === 0;
  elements.emptyState.hidden = count > 0;
  elements.profileList.hidden = count === 0;
  if (!count) updateEmptyState(config, profiles.length);
}

function sortProfilesForView(profiles) {
  const sorted = [...profiles];
  if (state.sort === "reverseAlphabetical") {
    return sorted.sort((first, second) => second.username.localeCompare(first.username, getLocale(), { sensitivity: "base" }));
  }
  if (["newest", "oldest"].includes(state.sort)) {
    const direction = state.sort === "newest" ? -1 : 1;
    return sorted.sort((first, second) => {
      const firstDate = getConnectionTimestamp(first);
      const secondDate = getConnectionTimestamp(second);
      if (!firstDate && !secondDate) return first.username.localeCompare(second.username, getLocale(), { sensitivity: "base" });
      if (!firstDate) return 1;
      if (!secondDate) return -1;
      return (firstDate - secondDate) * direction
        || first.username.localeCompare(second.username, getLocale(), { sensitivity: "base" });
    });
  }
  return sorted.sort((first, second) => first.username.localeCompare(second.username, getLocale(), { sensitivity: "base" }));
}

function getConnectionTimestamp(profile) {
  const dates = [profile.followedAt, profile.followedYouAt, profile.timestamp, profile.detectedAt]
    .map(normalizeTimestamp)
    .filter(Boolean);
  return dates.length ? Math.max(...dates) : null;
}

function createProfileRow(profile, config, isReviewed) {
  const row = document.createElement("article");
  row.className = `profile-row${isReviewed ? " is-removed" : ""}`;
  const avatar = document.createElement("span");
  avatar.className = "avatar-placeholder";
  avatar.setAttribute("aria-hidden", "true");
  avatar.textContent = profile.username.charAt(0);
  const identity = document.createElement("div");
  identity.className = "profile-identity";
  const username = document.createElement("span");
  username.className = "username";
  username.textContent = `@${profile.username}`;
  const status = document.createElement("span");
  status.className = "profile-status";
  const relationshipStatus = config.status(profile);
  status.textContent = isReviewed && config.reviewedStatus
    ? `${config.reviewedStatus} · ${relationshipStatus}`
    : relationshipStatus;
  identity.append(username, status);
  const actions = document.createElement("div");
  actions.className = "profile-actions";
  const profileLink = document.createElement("a");
  profileLink.className = "profile-link";
  profileLink.href = `https://www.instagram.com/${profile.key}/`;
  profileLink.target = "_blank";
  profileLink.rel = "noopener noreferrer";
  profileLink.textContent = tr("actions.openProfile");
  profileLink.setAttribute("aria-label", tr("actions.openProfileAria", { username: profile.username }));
  actions.append(profileLink);

  if (config.actionable) {
    const toggle = document.createElement("label");
    toggle.className = "removed-toggle";
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = isReviewed;
    checkbox.setAttribute("aria-label", config.actionAria(profile.username));
    checkbox.addEventListener("change", () => toggleProfileProgress(profile.key, checkbox.checked));
    const checkmark = document.createElement("span");
    checkmark.className = "checkmark";
    checkmark.setAttribute("aria-hidden", "true");
    checkmark.textContent = "✓";
    const toggleText = document.createElement("span");
    toggleText.textContent = config.actionLabel;
    toggle.append(checkbox, checkmark, toggleText);
    actions.append(toggle);
  }

  row.append(avatar, identity, actions);
  return row;
}

function toggleProfileProgress(key, isReviewed) {
  const progress = getProgressSet(state.currentDataset);
  if (isReviewed) progress.add(key);
  else progress.delete(key);
  if (!state.isDemo) saveProgress();
  renderCurrentDataset();
}

function resetCurrentProgress() {
  const config = DATASET_CONFIG[state.currentDataset];
  if (!config.actionable) return;
  const progress = getProgressSet(state.currentDataset);
  const currentKeys = state.datasets[state.currentDataset].map((profile) => profile.key);
  if (!currentKeys.some((key) => progress.has(key))) return;
  if (!window.confirm(config.resetMessage)) return;
  currentKeys.forEach((key) => progress.delete(key));
  if (!state.isDemo) saveProgress();
  renderCurrentDataset();
}

function updateEmptyState(config, totalProfiles) {
  if (state.query) {
    elements.emptyTitle.textContent = tr("empty.noUsername");
    elements.emptyDescription.textContent = tr("empty.tryAnother");
    return;
  }
  if (config.actionable && state.filter === "pending" && totalProfiles) {
    elements.emptyTitle.textContent = tr("empty.nonePending");
    elements.emptyDescription.textContent = config.pendingEmptyDescription;
    return;
  }
  if (config.actionable && state.filter === "removed") {
    elements.emptyTitle.textContent = tr("empty.noneReviewed");
    elements.emptyDescription.textContent = config.reviewedEmptyDescription;
    return;
  }
  elements.emptyTitle.textContent = config.emptyTitle;
  elements.emptyDescription.textContent = config.emptyDescription;
}

async function initializeStorage() {
  try {
    state.database = await openDatabase();
    await renderSavedAccounts();
  } catch {
    state.storageAvailable = false;
    state.database = null;
    elements.startHistoryTools.hidden = true;
    elements.openHistoryButton.hidden = true;
  }
}

function openDatabase() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error("IndexedDB indisponível"));
      return;
    }
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains("accounts")) database.createObjectStore("accounts", { keyPath: "accountKey" });
      if (!database.objectStoreNames.contains("snapshots")) {
        const store = database.createObjectStore("snapshots", { keyPath: "id" });
        store.createIndex("accountKey", "accountKey", { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error("Banco local bloqueado"));
  });
}

async function saveSnapshotAndAccount(snapshot, snapshotCount) {
  const transaction = state.database.transaction(["snapshots", "accounts"], "readwrite");
  transaction.objectStore("snapshots").put(snapshot);
  transaction.objectStore("accounts").put({
    accountKey: state.accountKey,
    accountUsername: state.accountUsername,
    lastUsedAt: Date.now(),
    lastSnapshotAt: snapshot.createdAt,
    snapshotCount
  });
  await waitForTransaction(transaction);
}

async function saveAccountRecord(snapshotCount, lastSnapshotAt) {
  const transaction = state.database.transaction("accounts", "readwrite");
  transaction.objectStore("accounts").put({
    accountKey: state.accountKey,
    accountUsername: state.accountUsername,
    lastUsedAt: Date.now(),
    lastSnapshotAt,
    snapshotCount
  });
  await waitForTransaction(transaction);
}

async function getSnapshots(accountKey) {
  if (!state.database) return [];
  const transaction = state.database.transaction("snapshots", "readonly");
  const request = transaction.objectStore("snapshots").index("accountKey").getAll(accountKey);
  const snapshots = await requestResult(request);
  return snapshots.sort((first, second) => second.createdAt - first.createdAt);
}

async function getSnapshotsForAllAccounts() {
  if (!state.database) return [];
  const transaction = state.database.transaction("snapshots", "readonly");
  const snapshots = await requestResult(transaction.objectStore("snapshots").getAll());
  return snapshots.sort((first, second) => second.createdAt - first.createdAt);
}

async function getAccounts() {
  if (!state.database) return [];
  const transaction = state.database.transaction("accounts", "readonly");
  const accounts = await requestResult(transaction.objectStore("accounts").getAll());
  return accounts.sort((first, second) => second.lastUsedAt - first.lastUsedAt);
}

async function renderSavedAccounts() {
  if (!state.database) return;
  const accounts = await getAccounts();
  elements.savedAccounts.replaceChildren();
  elements.savedAccounts.hidden = accounts.length === 0;
  elements.startHistoryTools.hidden = accounts.length === 0;
  elements.openHistoryButton.hidden = accounts.length === 0;
  elements.backupButtons.forEach((button) => { button.disabled = accounts.length === 0; });

  if (accounts.length && !elements.accountInput.value.trim()) elements.accountInput.value = accounts[0].accountUsername;
  const fragment = document.createDocumentFragment();
  accounts.forEach((account) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "saved-account-button";
    button.dataset.account = account.accountKey;
    button.textContent = tr("account.chip", {
      username: account.accountUsername,
      count: formatNumber(account.snapshotCount),
      snapshots: tr(account.snapshotCount === 1 ? "words.snapshot" : "words.snapshots")
    });
    button.addEventListener("click", () => {
      elements.accountInput.value = account.accountUsername;
      updateSavedAccountSelection();
    });
    fragment.append(button);
  });
  elements.savedAccounts.append(fragment);
  updateSavedAccountSelection();
}

function updateSavedAccountSelection() {
  const account = normalizeProfile(elements.accountInput.value);
  document.querySelectorAll(".saved-account-button").forEach((button) => {
    const isActive = account?.key === button.dataset.account;
    button.classList.toggle("active", isActive);
  });
  elements.openHistoryButton.disabled = elements.openHistoryButton.hidden;
}

function requestResult(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function waitForTransaction(transaction) {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
}

async function exportHistoryBackup() {
  if (state.importInProgress) return;
  await storageReady;
  if (!state.database) {
    showHistoryMessage(tr("messages.historyUnavailable"));
    return;
  }
  const accounts = await getAccounts();
  const snapshots = await getSnapshotsForAllAccounts();
  if (!snapshots.length) {
    showHistoryMessage(tr("messages.noBackup"));
    return;
  }
  const backup = {
    app: "InstaCheck",
    version: 1,
    exportedAt: new Date().toISOString(),
    accounts,
    snapshots,
    progress: serializeProgress()
  };
  downloadBlob(JSON.stringify(backup), `instacheck-backup-${formatFileDate(Date.now())}.json`, "application/json");
  showHistoryMessage(tr("messages.backupCreated"), "success");
}

async function isInstaCheckBackup(file) {
  if (!file?.name?.toLocaleLowerCase("en-US").endsWith(".json") || file.size > MAX_BACKUP_SIZE) return false;
  try { return isInstaCheckBackupData((await readJsonFile(file)).data); }
  catch { return false; }
}

async function restoreHistoryBackup(file, options = {}) {
  if (state.importInProgress) return;
  if (file.size > MAX_BACKUP_SIZE) { showHistoryMessage(tr("messages.backupLarge")); return; }
  state.importInProgress = true;
  setProcessing(true);
  try {
    await storageReady;
    if (!state.database) throw new Error(tr("messages.storageUnavailable"));
    const parsed = await readJsonFile(file);
    if (!isInstaCheckBackupData(parsed.data)) throw new Error(tr("messages.invalidBackup"));
    await restoreHistoryBackupData(parsed.data, { ...options, allowDuringImport: true });
  } catch (error) { showHistoryMessage(error.message || tr("messages.restoreError")); }
  finally { state.importInProgress = false; setProcessing(false); }
}
async function restoreHistoryBackupData(data, options = {}) {
  if (data?.app !== "InstaCheck" || data?.version !== 1 || !Array.isArray(data.snapshots)) {
    showHistoryMessage(tr("messages.invalidBackup")); return false;
  }
  if (!state.database) { showHistoryMessage(tr("messages.storageUnavailable")); return false; }
  try {
    const snapshots = data.snapshots.map(validateSnapshot).filter(Boolean);
    if (!snapshots.length) throw new Error(tr("messages.emptyBackup"));
    const accounts = new Map();
    snapshots.forEach((snapshot) => {
      const current = accounts.get(snapshot.accountKey);
      if (!current || snapshot.createdAt > current.lastSnapshotAt) accounts.set(snapshot.accountKey, {
        accountKey: snapshot.accountKey, accountUsername: snapshot.accountUsername,
        lastUsedAt: Date.now(), lastSnapshotAt: snapshot.createdAt, snapshotCount: 0
      });
    });
    snapshots.forEach((snapshot) => { accounts.get(snapshot.accountKey).snapshotCount += 1; });
    const transaction = state.database.transaction(["snapshots", "accounts"], "readwrite");
    snapshots.forEach((snapshot) => transaction.objectStore("snapshots").put(snapshot));
    accounts.forEach((account) => transaction.objectStore("accounts").put(account));
    await waitForTransaction(transaction);
    for (const account of accounts.values()) {
      const mergedSnapshots = await getSnapshots(account.accountKey);
      const accountTransaction = state.database.transaction("accounts", "readwrite");
      accountTransaction.objectStore("accounts").put({
        ...account, lastSnapshotAt: mergedSnapshots[0]?.createdAt || account.lastSnapshotAt,
        snapshotCount: mergedSnapshots.length
      });
      await waitForTransaction(accountTransaction);
    }
    mergeRestoredProgress(data.progress);
    await renderSavedAccounts();
    if (options.openLatest) {
      const newestSnapshot = [...snapshots].sort((a, b) => b.createdAt - a.createdAt)[0];
      await openSnapshotResults(newestSnapshot.id, { allowDuringImport: options.allowDuringImport });
    }
    showHistoryMessage(tr(snapshots.length === 1 ? "messages.restoredOne" : "messages.restoredMany", {
      count: formatNumber(snapshots.length)
    }), "success");
    return true;
  } catch (error) {
    showHistoryMessage(error.message || tr("messages.restoreError"));
    return false;
  }
}

function validateSnapshot(snapshot) {
  const account = normalizeProfile(snapshot?.accountUsername || snapshot?.accountKey);
  const createdAt = Number(snapshot?.createdAt);
  if (!account || !Number.isFinite(createdAt) || createdAt <= 0 || createdAt > MAX_SUPPORTED_TIMESTAMP
    || !Number.isFinite(new Date(createdAt).getTime())
    || !Array.isArray(snapshot.followers) || !Array.isArray(snapshot.following)) return null;
  const followers = snapshot.followers.map((item) => normalizeProfile(item)?.username).filter(Boolean);
  const following = snapshot.following.map((item) => normalizeProfile(item)?.username).filter(Boolean);
  const normalizedFollowers = sortStrings(followers.map((item) => item.toLocaleLowerCase("en-US")));
  const normalizedFollowing = sortStrings(following.map((item) => item.toLocaleLowerCase("en-US")));
  const fingerprint = hashString(normalizedFollowers.join("|") + "::" + normalizedFollowing.join("|"));
  const followerDates = validateTimestampRecord(snapshot.followerDates, followers);
  const followingDates = validateTimestampRecord(snapshot.followingDates, following);
  return {
    id: account.key + ":" + createdAt + ":" + fingerprint,
    accountKey: account.key, accountUsername: account.username, createdAt,
    sourceName: String(snapshot.sourceName || tr("history.restoredBackup")).slice(0, 180),
    fingerprint, followers, following, followerDates, followingDates,
    followersCount: followers.length, followingCount: following.length
  };
}

function validateTimestampRecord(record, usernames) {
  if (!record || typeof record !== "object" || Array.isArray(record)) return Object.create(null);
  const allowedKeys = new Set(usernames.map((username) => username.toLocaleLowerCase("en-US")));
  const timestamps = Object.create(null);
  Object.keys(record).forEach((rawKey) => {
    if (!Object.prototype.hasOwnProperty.call(record, rawKey)) return;
    const key = String(rawKey).toLocaleLowerCase("en-US");
    const timestamp = normalizeTimestamp(record[rawKey]);
    if (allowedKeys.has(key) && timestamp) timestamps[key] = timestamp;
  });
  return timestamps;
}

function showHistoryMessage(message, type = "error") {
  const target = elements.resultsView.hidden ? elements.uploadMessage : elements.historyMessage;
  target.textContent = message;
  target.classList.toggle("success", type === "success");
  target.classList.toggle("warning", type === "warning");
  target.hidden = false;
}

function getProgressSet(datasetKey) {
  if (!PROGRESS_DATASETS.has(datasetKey) || state.isDemo) return new Set();
  const rawAccountKey = state.accountKey || "default";
  const account = normalizeProfile(rawAccountKey);
  if (!account || account.key !== rawAccountKey) return new Set();
  const accountKey = account.key;
  let accountProgress = state.progress.get(accountKey);
  if (!accountProgress) { accountProgress = new Map(); state.progress.set(accountKey, accountProgress); }
  let values = accountProgress.get(datasetKey);
  if (!values) { values = new Set(); accountProgress.set(datasetKey, values); }
  return values;
}

function loadProgress() {
  pendingLegacyProgress = null;
  const progress = new Map();
  try {
    const saved = JSON.parse(localStorage.getItem(PROGRESS_STORAGE_KEY));
    if (saved && typeof saved === "object" && !Array.isArray(saved)) {
      deserializeProgress(saved).forEach((datasets, accountKey) => progress.set(accountKey, datasets));
      return progress;
    }
    const previous = JSON.parse(localStorage.getItem(PREVIOUS_PROGRESS_STORAGE_KEY));
    if (previous && typeof previous === "object" && !Array.isArray(previous)) {
      pendingLegacyProgress = deserializeDatasetProgress(previous);
      return progress;
    }
    const legacy = JSON.parse(localStorage.getItem(LEGACY_STORAGE_KEY));
    if (Array.isArray(legacy)) pendingLegacyProgress = new Map([["nonFollowers", new Set(legacy.map(normalizeProgressUsername).filter(Boolean))]]);
  } catch { return progress; }
  return progress;
}

function claimLegacyProgress(accountKey) {
  const account = normalizeProfile(accountKey);
  if (!account || !pendingLegacyProgress || state.progress.has(account.key)) return;
  state.progress.set(account.key, pendingLegacyProgress);
  pendingLegacyProgress = null;
  saveProgress();
}

function deserializeProgress(saved) {
  const progress = new Map();
  if (!saved || typeof saved !== "object" || Array.isArray(saved)) return progress;
  Object.keys(saved).forEach((rawAccountKey) => {
    if (!Object.prototype.hasOwnProperty.call(saved, rawAccountKey)) return;
    const account = normalizeProfile(rawAccountKey);
    if (account) progress.set(account.key, deserializeDatasetProgress(saved[rawAccountKey]));
  });
  return progress;
}

function deserializeDatasetProgress(datasets) {
  const progress = new Map();
  if (!datasets || typeof datasets !== "object" || Array.isArray(datasets)) return progress;
  Object.keys(datasets).forEach((datasetKey) => {
    if (!Object.prototype.hasOwnProperty.call(datasets, datasetKey) || !PROGRESS_DATASETS.has(datasetKey)) return;
    const values = Array.isArray(datasets[datasetKey]) ? datasets[datasetKey].map(normalizeProgressUsername).filter(Boolean) : [];
    progress.set(datasetKey, new Set(values));
  });
  return progress;
}
function normalizeProgressUsername(value) {
  if (typeof value !== "string") return null;
  return normalizeProfile(value)?.key || null;
}

function serializeProgress() {
  const serialized = Object.create(null);
  state.progress.forEach((datasets, accountKey) => {
    const account = normalizeProfile(accountKey);
    if (!account || account.key !== accountKey) return;
    const serializedDatasets = Object.create(null);
    datasets.forEach((values, datasetKey) => {
      if (PROGRESS_DATASETS.has(datasetKey)) serializedDatasets[datasetKey] = [...values].filter((value) => normalizeProgressUsername(value) === value);
    });
    serialized[accountKey] = serializedDatasets;
  });
  return serialized;
}

function mergeRestoredProgress(restored) {
  if (!restored || typeof restored !== "object" || Array.isArray(restored)) return;
  deserializeProgress(restored).forEach((datasets, accountKey) => {
    let target = state.progress.get(accountKey);
    if (!target) { target = new Map(); state.progress.set(accountKey, target); }
    datasets.forEach((values, datasetKey) => {
      if (!PROGRESS_DATASETS.has(datasetKey)) return;
      let targetValues = target.get(datasetKey);
      if (!targetValues) { targetValues = new Set(); target.set(datasetKey, targetValues); }
      values.forEach((value) => targetValues.add(value));
    });
  });
  saveProgress();
}

function saveProgress() {
  try {
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(serializeProgress()));
  } catch {
    // A análise continua funcional quando o navegador bloqueia o armazenamento local.
  }
}

async function copyVisibleUsernames() {
  if (!state.visibleProfiles.length) return;
  const text = state.visibleProfiles.map((profile) => `@${profile.username}`).join("\n");
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.append(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
  }
  flashButtonLabel(elements.copyButton, tr("actions.copied"));
}

function exportVisibleProfiles() {
  if (!state.visibleProfiles.length) return;
  const rows = [[tr("csv.username"), tr("csv.profile"), tr("csv.followedAt"), tr("csv.followedYouAt"), tr("csv.recordDate")]];
  state.visibleProfiles.forEach((profile) => rows.push([
    profile.username,
    `https://www.instagram.com/${profile.key}/`,
    formatIsoTimestamp(profile.followedAt),
    formatIsoTimestamp(profile.followedYouAt),
    formatIsoTimestamp(profile.timestamp)
  ]));
  const csv = `\uFEFF${rows.map((row) => row.map(escapeCsvCell).join(",")).join("\r\n")}`;
  downloadBlob(csv, `instacheck-${DATASET_CONFIG[state.currentDataset].fileSlug}.csv`, "text/csv;charset=utf-8");
  flashButtonLabel(elements.exportButton, tr("actions.exported"));
}

function downloadBlob(content, filename, type) {
  const blob = content instanceof Blob ? content : new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

function openShareDialog() {
  drawShareCanvas();
  if (typeof elements.shareDialog.showModal === "function") elements.shareDialog.showModal();
  else elements.shareDialog.setAttribute("open", "");
}

function closeShareDialog() {
  if (typeof elements.shareDialog.close === "function") elements.shareDialog.close();
  else elements.shareDialog.removeAttribute("open");
}

document.querySelectorAll('input[name="shareFormat"]').forEach((input) => input.addEventListener("change", drawShareCanvas));

function drawShareCanvas() {
  const format = document.querySelector('input[name="shareFormat"]:checked')?.value || "story";
  const canvas = elements.shareCanvas;
  const width = 1080;
  const height = format === "story" ? 1920 : 1080;
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  const scale = height / 1080;
  const padding = format === "story" ? 86 : 70;
  const followers = state.followers.size;
  const following = state.following.size;
  const mutuals = state.datasets.mutuals.length;
  const nonFollowers = state.datasets.nonFollowers.length;
  const newFollowers = state.datasets.newFollowers.length;
  const lostFollowers = state.datasets.lostFollowers.length;

  context.fillStyle = "#fafafa";
  context.fillRect(0, 0, width, height);
  context.fillStyle = "rgba(198,253,80,.22)";
  context.beginPath();
  context.arc(width - 70, 95, format === "story" ? 270 : 210, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = "rgba(19,19,17,.045)";
  context.beginPath();
  context.arc(40, height - 80, format === "story" ? 330 : 220, 0, Math.PI * 2);
  context.fill();

  drawCanvasPill(context, padding, padding, 260, 60, "#131311");
  context.fillStyle = "#ffffff";
  context.font = '800 26px "Poppins", sans-serif';
  context.fillText("InstaCheck", padding + 28, padding + 40);

  const titleY = padding + (format === "story" ? 190 : 135);
  context.fillStyle = "#131311";
  context.font = `800 ${format === "story" ? 76 : 62}px "Poppins", sans-serif`;
  context.fillText(tr("share.imageTitle"), padding, titleY);
  context.font = `500 ${format === "story" ? 30 : 25}px "Inter", sans-serif`;
  context.fillStyle = "#5f625a";
  context.fillText(tr("share.imageSubtitle"), padding, titleY + 62);

  const cardsTop = titleY + (format === "story" ? 150 : 105);
  const gap = 22;
  const cardWidth = (width - padding * 2 - gap) / 2;
  const cardHeight = format === "story" ? 190 : 142;
  const stats = [
    [tr("metrics.followers"), followers, "#ffffff"],
    [tr("metrics.following"), following, "#f3f2ea"],
    [tr("metrics.mutuals"), mutuals, "#ffffff"],
    [tr("metrics.nonFollowers"), nonFollowers, "#c6fd50"]
  ];
  stats.forEach(([label, value, color], index) => {
    const x = padding + (index % 2) * (cardWidth + gap);
    const y = cardsTop + Math.floor(index / 2) * (cardHeight + gap);
    drawCanvasCard(context, x, y, cardWidth, cardHeight, color);
    context.fillStyle = "#5f625a";
    context.font = `700 ${format === "story" ? 24 : 20}px "Inter", sans-serif`;
    context.fillText(label, x + 28, y + 42);
    context.fillStyle = "#131311";
    context.font = `800 ${format === "story" ? 58 : 44}px "Poppins", sans-serif`;
    context.fillText(formatNumber(value), x + 28, y + cardHeight - 34);
  });

  const changeY = cardsTop + 2 * (cardHeight + gap) + (format === "story" ? 36 : 18);
  drawCanvasCard(context, padding, changeY, width - padding * 2, format === "story" ? 180 : 132, "#131311");
  context.font = `800 ${format === "story" ? 36 : 28}px "Poppins", sans-serif`;
  context.fillStyle = "#c6fd50";
  context.fillText(`+${formatNumber(newFollowers)} ${tr("history.new")}`, padding + 34, changeY + (format === "story" ? 70 : 55));
  context.fillStyle = "#ffffff";
  context.fillText(`−${formatNumber(lostFollowers)} ${tr("history.lost")}`, padding + 34, changeY + (format === "story" ? 130 : 102));

  if (format === "story") {
    const privacyY = changeY + 270;
    context.fillStyle = "#131311";
    context.font = '800 42px "Poppins", sans-serif';
    context.fillText(tr("share.localTitle"), padding, privacyY);
    context.fillStyle = "#5f625a";
    context.font = '500 28px "Inter", sans-serif';
    context.fillText(tr("share.localText"), padding, privacyY + 52);
  }

  context.fillStyle = "#131311";
  context.font = `750 ${format === "story" ? 26 : 22}px "Inter", sans-serif`;
  context.fillText(CREATOR.instagramHandle, padding, height - padding);
}

function drawCanvasCard(context, x, y, width, height, fill) {
  context.fillStyle = "#131311";
  roundCanvasRect(context, x + 8, y + 8, width, height, 26);
  context.fill();
  context.fillStyle = fill;
  roundCanvasRect(context, x, y, width, height, 26);
  context.fill();
  context.strokeStyle = "#131311";
  context.lineWidth = 3;
  context.stroke();
}

function drawCanvasPill(context, x, y, width, height, fill) {
  context.fillStyle = fill;
  roundCanvasRect(context, x, y, width, height, height / 2);
  context.fill();
}

function roundCanvasRect(context, x, y, width, height, radius) {
  context.beginPath();
  if (typeof context.roundRect === "function") {
    context.roundRect(x, y, width, height, radius);
    return;
  }
  const safeRadius = Math.min(radius, width / 2, height / 2);
  context.moveTo(x + safeRadius, y);
  context.arcTo(x + width, y, x + width, y + height, safeRadius);
  context.arcTo(x + width, y + height, x, y + height, safeRadius);
  context.arcTo(x, y + height, x, y, safeRadius);
  context.arcTo(x, y, x + width, y, safeRadius);
  context.closePath();
}

async function generateAndShareResult() {
  elements.generateShareButton.disabled = true;
  try {
    drawShareCanvas();
    const blob = await new Promise((resolve) => elements.shareCanvas.toBlob(resolve, "image/png"));
    if (!blob) throw new Error(tr("share.error"));
    const format = document.querySelector('input[name="shareFormat"]:checked')?.value || "story";
    const filename = `instacheck-minha-analise-${format}.png`;
    const file = new File([blob], filename, { type: "image/png" });
    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: "InstaCheck", text: tr("share.defaultText") });
        return;
      } catch (error) {
        if (error.name === "AbortError") return;
      }
    }
    downloadBlob(blob, filename, "image/png");
    flashButtonLabel(elements.generateShareButton, tr("share.downloaded"));
  } catch (error) {
    window.alert(error.message || tr("share.error"));
  } finally {
    elements.generateShareButton.disabled = false;
  }
}

async function downloadShareImage() {
  elements.downloadShareButton.disabled = true;
  try {
    drawShareCanvas();
    const blob = await new Promise((resolve) => elements.shareCanvas.toBlob(resolve, "image/png"));
    if (!blob) throw new Error(tr("share.error"));
    const format = document.querySelector('input[name="shareFormat"]:checked')?.value || "story";
    downloadBlob(blob, `instacheck-minha-analise-${format}.png`, "image/png");
    flashButtonLabel(elements.downloadShareButton, tr("share.downloaded"));
  } catch (error) {
    elements.shareFallbackNote.textContent = error.message || tr("share.error");
  } finally {
    elements.downloadShareButton.disabled = false;
  }
}

function escapeCsvCell(value) {
  return `"${String(value).replace(/"/g, '""')}"`;
}

function flashButtonLabel(button, label) {
  const originalLabel = button.dataset.originalLabel || button.textContent;
  button.dataset.originalLabel = originalLabel;
  button.textContent = label;
  window.setTimeout(() => { button.textContent = originalLabel; }, 1600);
}

function setProcessing(isProcessing) {
  elements.dropZone.classList.toggle("processing", isProcessing);
  elements.dropZone.setAttribute("aria-busy", String(isProcessing));
  document.body.classList.toggle("import-in-progress", isProcessing);
  elements.fileInput.disabled = isProcessing;
  elements.uploadTitle.textContent = tr(isProcessing ? "upload.processing" : "upload.title");
  const lockable = [elements.selectButton, elements.demoButton, elements.accountInput, elements.newAnalysisButton,
    ...elements.backupButtons, ...elements.restoreButtons];
  lockable.forEach((element) => {
    if (!element) return;
    if (isProcessing) {
      if (!Object.prototype.hasOwnProperty.call(element.dataset, "wasDisabledBeforeImport")) {
        element.dataset.wasDisabledBeforeImport = String(element.disabled);
      }
      element.disabled = true;
    } else if (Object.prototype.hasOwnProperty.call(element.dataset, "wasDisabledBeforeImport")) {
      element.disabled = element.dataset.wasDisabledBeforeImport === "true";
      delete element.dataset.wasDisabledBeforeImport;
    }
  });
  elements.selectButton.textContent = tr(isProcessing ? "upload.opening" : "upload.button");
}

function showMessage(message, type = "error") {
  elements.uploadMessage.textContent = message;
  elements.uploadMessage.classList.toggle("warning", type === "warning");
  elements.uploadMessage.classList.toggle("success", type === "success");
  elements.uploadMessage.hidden = false;
}

function hideMessage() {
  elements.uploadMessage.hidden = true;
  elements.uploadMessage.textContent = "";
}

function resetFilterButtons() {
  state.filter = "all";
  updateFilterButtons();
}

function updateFilterButtons() {
  elements.filterButtons.forEach((button) => {
    const isActive = button.dataset.filter === state.filter;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

function sortStrings(items) {
  return items.sort((first, second) => first.localeCompare(second, getLocale(), { sensitivity: "base" }));
}

function hashString(input) {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function formatMutualStatus(profile) {
  const dates = [];
  if (profile.followedAt) dates.push(tr("datasets.mutuals.followedAt", { date: formatProfileDate(profile.followedAt) }));
  if (profile.followedYouAt) dates.push(tr("datasets.mutuals.followedYouAt", { date: formatProfileDate(profile.followedYouAt) }));
  return dates.length ? dates.join(" · ") : tr("datasets.mutuals.status");
}

function formatProfileDate(timestamp) {
  const date = safeDate(timestamp);
  return date ? new Intl.DateTimeFormat(getLocale(), { day: "2-digit", month: "short", year: "numeric" }).format(date) : "";
}
function formatHistoryDate(timestamp) {
  const date = safeDate(timestamp);
  return date ? new Intl.DateTimeFormat(getLocale(), { day: "2-digit", month: "long", year: "numeric" }).format(date) : "";
}
function formatHistoryDateTime(timestamp) {
  const date = safeDate(timestamp);
  return date ? new Intl.DateTimeFormat(getLocale(), { dateStyle: "medium", timeStyle: "short" }).format(date) : "";
}
function formatFileDate(timestamp) {
  const date = safeDate(timestamp);
  return date ? date.toISOString().slice(0, 10) : "invalid-date";
}
function safeDate(timestamp) {
  const normalized = normalizeTimestamp(timestamp);
  return normalized === null ? null : new Date(normalized);
}
function formatIsoTimestamp(timestamp) {
  const date = safeDate(timestamp);
  return date ? date.toISOString() : "";
}

function joinWithAnd(items) {
  if (items.length < 2) return items[0] || "";
  return `${items.slice(0, -1).join(", ")} ${tr("words.and")} ${items[items.length - 1]}`;
}

function formatNumber(number) {
  return new Intl.NumberFormat(getLocale()).format(number);
}

function formatSignedNumber(number) {
  const value = Number(number) || 0;
  return `${value > 0 ? "+" : value < 0 ? "−" : ""}${formatNumber(Math.abs(value))}`;
}
