export function shortCode(value, length = 4, fallback = "GEN") {
  const cleaned = String(value ?? "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
  return cleaned.slice(0, length) || fallback;
}

export function generateSku({ metalCode, categoryName, sequence }) {
  const metalPart = shortCode(metalCode, 3, "MTL");
  const categoryPart = shortCode(categoryName, 4, "CAT");
  const seqPart = String(sequence).padStart(4, "0");
  return `${metalPart}-${categoryPart}-${seqPart}`;
}

export function comboKey(attributeValueIds) {
  return [...(attributeValueIds ?? [])].map(Number).sort((a, b) => a - b).join(",");
}

// selectedAttributes: [{ attributeId, attributeName, values: [{ id, value }] }]
export function buildVariantCombosFromAttributes(selectedAttributes) {
  const usable = selectedAttributes.filter((attribute) => attribute.values.length);
  if (!usable.length) return [];

  return usable.reduce(
    (combos, attribute) =>
      combos.flatMap((combo) =>
        attribute.values.map((value) => [
          ...combo,
          {
            attributeId: attribute.attributeId,
            attributeName: attribute.attributeName,
            valueId: value.id,
            value: value.value,
          },
        ]),
      ),
    [[]],
  );
}

let variantKeySeed = 0;
export function nextVariantKey() {
  variantKeySeed += 1;
  return `variant-${Date.now()}-${variantKeySeed}`;
}

export function blankVariant({ attributes = null, attributeValueIds = [], name = null, expanded = false } = {}) {
  return {
    _key: nextVariantKey(),
    id: undefined,
    sku: "",
    skuAuto: true,
    name,
    attributes,
    attributeValueIds,
    expanded,
    tunch: "",
    purity: "",
    karat: "",
    publicPurity: "",
    publicKarat: "",
    weightGrams: "",
    basePrice: "",
    openingStock: "0",
    reorderLevel: "5",
    imageFiles: [],
    existingImages: [],
    removedImageIds: [],
  };
}
