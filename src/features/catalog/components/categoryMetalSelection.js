export const CATEGORY_METAL_SESSION_KEY = "selectedCategoryMetalId";
const LEGACY_CATEGORY_METAL_SESSION_KEY = "selectedMetalId";

const preferredGoldCodes = new Set(["G", "GLD", "GOLD"]);

export const getActiveMetalOptions = (metals = []) =>
  metals.filter((metal) => metal.isActive !== false);

export const findDefaultMetalId = (metals = []) => {
  const activeMetals = getActiveMetalOptions(metals);
  const goldMetal = activeMetals.find(
    (metal) =>
      preferredGoldCodes.has(String(metal.code ?? "").trim().toUpperCase()) ||
      String(metal.name ?? "").trim().toLowerCase() === "gold",
  );

  return goldMetal?.id ? String(goldMetal.id) : activeMetals[0]?.id ? String(activeMetals[0].id) : "";
};

export const getPersistedMetalId = (metals = []) => {
  const persisted =
    sessionStorage.getItem(CATEGORY_METAL_SESSION_KEY) ??
    sessionStorage.getItem(LEGACY_CATEGORY_METAL_SESSION_KEY);
  const activeMetals = getActiveMetalOptions(metals);

  if (persisted && activeMetals.some((metal) => String(metal.id) === persisted)) {
    return persisted;
  }

  return findDefaultMetalId(activeMetals);
};

export const persistMetalId = (metalId) => {
  if (metalId) {
    sessionStorage.setItem(CATEGORY_METAL_SESSION_KEY, metalId);
    sessionStorage.removeItem(LEGACY_CATEGORY_METAL_SESSION_KEY);
  } else {
    sessionStorage.removeItem(CATEGORY_METAL_SESSION_KEY);
    sessionStorage.removeItem(LEGACY_CATEGORY_METAL_SESSION_KEY);
  }
};
