const HOUSE_CLASSES = [
  "hp-house-gryffindor",
  "hp-house-slytherin",
  "hp-house-ravenclaw",
  "hp-house-hufflepuff",
] as const;

const STORAGE_KEY = "hp_sorted_house";
const INDICATOR_ID = "hp-house-indicator";
const BANNER_ID = "hp-house-banner";

type HouseKey = "gryffindor" | "slytherin" | "ravenclaw" | "hufflepuff";

const HOUSE_DATA: Record<
  HouseKey,
  {
    key: HouseKey;
    className: (typeof HOUSE_CLASSES)[number];
    color: string;
    display: string;
    motto: string;
    animal: string;
  }
> = {
  gryffindor: {
    key: "gryffindor",
    className: "hp-house-gryffindor",
    color: "#D3A625",
    display: "Gryffindor",
    motto: "Brave at heart.",
    animal: "🦁",
  },
  slytherin: {
    key: "slytherin",
    className: "hp-house-slytherin",
    color: "#7ecb8f",
    display: "Slytherin",
    motto: "Ambitious above all.",
    animal: "🐍",
  },
  ravenclaw: {
    key: "ravenclaw",
    className: "hp-house-ravenclaw",
    color: "#7b9fd4",
    display: "Ravenclaw",
    motto: "Wit beyond measure.",
    animal: "🦅",
  },
  hufflepuff: {
    key: "hufflepuff",
    className: "hp-house-hufflepuff",
    color: "#f5d06a",
    display: "Hufflepuff",
    motto: "Just and loyal.",
    animal: "🦡",
  },
};

let checkedReloadThisPage = false;

const normalizeHouseKey = (houseKey: string | null | undefined): HouseKey | null => {
  if (!houseKey) return null;
  const key = houseKey.trim().toLowerCase() as HouseKey;
  return key in HOUSE_DATA ? key : null;
};

const removeHouseClasses = () => {
  const body = document.body;
  HOUSE_CLASSES.forEach((cls) => body.classList.remove(cls));
};

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const shouldSkipRestoreOnReload = () => {
  if (checkedReloadThisPage) return false;
  checkedReloadThisPage = true;
  const navEntry = performance.getEntriesByType("navigation")[0] as
    | PerformanceNavigationTiming
    | undefined;
  if (navEntry?.type === "reload") return true;
  const legacyNavigation = performance.navigation;
  return legacyNavigation?.type === legacyNavigation?.TYPE_RELOAD;
};

function showHouseBanner(house: (typeof HOUSE_DATA)[HouseKey]) {
  const existing = document.getElementById(BANNER_ID);
  if (existing) existing.remove();

  const banner = document.createElement("div");
  banner.id = BANNER_ID;
  banner.innerHTML = `
    <span class="banner-animal">${house.animal}</span>
    <span class="banner-house">${house.display}</span>
    <span class="banner-motto">${house.motto}</span>
  `;
  if (prefersReducedMotion()) banner.style.animation = "none";
  document.body.appendChild(banner);

  window.setTimeout(() => {
    banner.style.opacity = "0";
    banner.style.transform = "translateX(-50%) translateY(-20px)";
    window.setTimeout(() => banner.remove(), 600);
  }, 4000);
}

function updateHouseIndicator(houseKey: HouseKey | null) {
  const existing = document.getElementById(INDICATOR_ID);
  if (existing) existing.remove();
  if (!houseKey) return;

  const house = HOUSE_DATA[houseKey];
  const logo = document.querySelector<HTMLElement>(
    "body.theme-wizarding .site-title, body.theme-wizarding .site-logo, body.theme-wizarding .logo",
  );
  if (!logo) return;

  const indicator = document.createElement("span");
  indicator.id = INDICATOR_ID;
  indicator.textContent = house.display;
  indicator.style.cssText = `
    font-family: "Cinzel", serif;
    font-size: 10px;
    color: ${house.color};
    border: 1px solid ${house.color}66;
    border-radius: 3px;
    padding: 1px 6px;
    margin-left: 8px;
    vertical-align: middle;
    opacity: 0.85;
    letter-spacing: 0.06em;
  `;
  logo.insertAdjacentElement("afterend", indicator);
}

export function applySortingHouse(houseKey: string) {
  if (!document.documentElement.classList.contains("theme-wizarding")) return;
  const key = normalizeHouseKey(houseKey);
  if (!key) return;

  const house = HOUSE_DATA[key];
  removeHouseClasses();
  sessionStorage.setItem(STORAGE_KEY, key);

  if (prefersReducedMotion()) {
    document.body.classList.add(house.className);
    showHouseBanner(house);
    updateHouseIndicator(key);
    return;
  }

  const flash = document.createElement("div");
  flash.className = "hp-sorting-flash";
  flash.style.cssText = `
    position: fixed;
    inset: 0;
    z-index: 10000;
    pointer-events: none;
    background: radial-gradient(circle at 50% 40%, ${house.color}22 0%, ${house.color}08 50%, transparent 80%);
    opacity: 0;
    transition: opacity 0.4s ease;
  `;
  document.body.appendChild(flash);

  requestAnimationFrame(() => {
    flash.style.opacity = "1";
    window.setTimeout(() => {
      document.body.classList.add(house.className);
      flash.style.opacity = "0";
      flash.style.transition = "opacity 1.8s ease";
      window.setTimeout(() => flash.remove(), 1900);
    }, 400);
  });

  showHouseBanner(house);
  updateHouseIndicator(key);
}

export function restoreSortedHouseOnLoad() {
  if (!document.documentElement.classList.contains("theme-wizarding")) return;
  if (shouldSkipRestoreOnReload()) {
    sessionStorage.removeItem(STORAGE_KEY);
    removeHouseClasses();
    updateHouseIndicator(null);
    return;
  }

  const saved = normalizeHouseKey(sessionStorage.getItem(STORAGE_KEY));
  if (!saved) return;

  removeHouseClasses();
  document.body.classList.add(HOUSE_DATA[saved].className);
  updateHouseIndicator(saved);
}

export function clearSortedHouse() {
  removeHouseClasses();
  updateHouseIndicator(null);
}
