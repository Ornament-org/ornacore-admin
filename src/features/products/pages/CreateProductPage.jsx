import { Check, ChevronDown, FolderTree, Layers, Package, Search, Star, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../../../components/common/Button.jsx";
import { Card } from "../../../components/common/Card.jsx";
import { FormAlert } from "../../../components/common/FormAlert.jsx";
import { StatusBadge } from "../../../components/common/StatusBadge.jsx";
import { StatusToggle } from "../../../components/common/StatusToggle.jsx";
import { PageHeader } from "../../../components/layout/PageHeader.jsx";
import { apiErrorMessage, getApiError } from "../../../services/apiClient.js";
import {
  attributeService,
  categoryService,
  metalService,
  productService,
} from "../../../services/resourceServices.js";
import { calculateMetalPurityFromTunch } from "../../../utils/goldPurity.js";
import { ProductLivePreviewCard } from "../components/ProductLivePreviewCard.jsx";
import { ProductMediaGallery } from "../components/ProductMediaGallery.jsx";
import { ProductQuickActionsCard } from "../components/ProductQuickActionsCard.jsx";
import { ProductReadinessCard } from "../components/ProductReadinessCard.jsx";
import { VariantCard } from "../components/VariantCard.jsx";
import { VariantOptionsBuilder } from "../components/VariantOptionsBuilder.jsx";
import {
  blankVariant,
  buildVariantCombosFromAttributes,
  comboKey,
  generateSku,
} from "../utils/productVariants.js";
import "../Products.scss";

const MAX_PRODUCT_IMAGES = 10;
const CATEGORY_SCOPE_METAL = "metal";
const CATEGORY_SCOPE_ALL = "all";

const blankProduct = {
  name: "",
  designCode: "",
  description: "",
  status: "ACTIVE",
  productType: "SIMPLE",
  metalId: "",
  categoryIds: [],
  primaryCategoryId: "",
};

function Field({ label, required = false, hint, children, className }) {
  return (
    <label className={`product-field ${className || ""}`}>
      <span>
        {label} {required && <em>*</em>}
      </span>
      {children}
      {hint && <small className="field-hint">{hint}</small>}
    </label>
  );
}

function flattenCategoryTree(categories, depth = 0) {
  return categories.flatMap((category) => [
    { ...category, depth },
    ...flattenCategoryTree(category.children ?? [], depth + 1),
  ]);
}

function findDefaultMetalId(metals = []) {
  const activeMetals = metals.filter((metal) => metal.isActive !== false);
  return activeMetals[0]?.id ? String(activeMetals[0].id) : "";
}

function CategoryMultiSelect({
  categories,
  selectedIds,
  primaryId,
  selectedMetalId,
  categoryScope,
  onScopeChange,
  onToggle,
  onPrimary,
  onClear,
}) {
  const rootRef = useRef(null);
  const searchRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selectedCategories = useMemo(
    () =>
      selectedIds
        .map((categoryId) =>
          categories.find((category) => String(category.id) === String(categoryId)),
        )
        .filter(Boolean),
    [categories, selectedIds],
  );
  const primaryCategory = selectedCategories.find(
    (category) => String(category.id) === String(primaryId),
  );
  const visibleCategories = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return categories;
    return categories.filter((category) =>
      `${category.name} ${category.path ?? ""}`.toLowerCase().includes(normalizedQuery),
    );
  }, [categories, query]);

  useEffect(() => {
    if (!open) return undefined;

    const closeFromOutside = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
        setQuery("");
      }
    };
    const closeFromKeyboard = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
        setQuery("");
      }
    };

    document.addEventListener("mousedown", closeFromOutside);
    document.addEventListener("keydown", closeFromKeyboard);
    requestAnimationFrame(() => searchRef.current?.focus());
    return () => {
      document.removeEventListener("mousedown", closeFromOutside);
      document.removeEventListener("keydown", closeFromKeyboard);
    };
  }, [open]);

  const closeDropdown = () => {
    setOpen(false);
    setQuery("");
  };

  return (
    <div className="product-category-select" ref={rootRef}>
      <div className="product-category-select__scope" role="tablist" aria-label="Category scope">
        <button
          aria-selected={categoryScope === CATEGORY_SCOPE_METAL}
          className={categoryScope === CATEGORY_SCOPE_METAL ? "is-active" : ""}
          disabled={!selectedMetalId}
          role="tab"
          type="button"
          onClick={() => onScopeChange(CATEGORY_SCOPE_METAL)}
        >
          Selected metal
        </button>
        <button
          aria-selected={categoryScope === CATEGORY_SCOPE_ALL}
          className={categoryScope === CATEGORY_SCOPE_ALL ? "is-active" : ""}
          role="tab"
          type="button"
          onClick={() => onScopeChange(CATEGORY_SCOPE_ALL)}
        >
          All
        </button>
      </div>

      <button
        aria-expanded={open}
        className={`product-category-select__trigger ${open ? "is-open" : ""}`}
        disabled={!selectedMetalId}
        type="button"
        onClick={() => setOpen((current) => !current)}
      >
        <span className="product-category-select__trigger-icon">
          <FolderTree size={17} />
        </span>
        <span className="product-category-select__trigger-copy">
          <strong>
            {selectedMetalId
              ? (primaryCategory?.name ?? selectedCategories[0]?.name ?? "Select product categories")
              : "Select a metal first"}
          </strong>
          <small>
            {!selectedMetalId
              ? "Categories load after metal selection"
              : selectedCategories.length
                ? `${selectedCategories.length} categor${
                    selectedCategories.length === 1 ? "y" : "ies"
                  } selected${primaryCategory ? ` · ${primaryCategory.name} is primary` : ""}`
                : "Choose one or more categories"}
          </small>
        </span>
        {selectedCategories.length > 0 && (
          <span className="product-category-select__count">{selectedCategories.length}</span>
        )}
        <ChevronDown className="product-category-select__chevron" size={17} strokeWidth={2} />
      </button>

      {open && (
        <div className="product-category-select__dropdown">
          <div className="product-category-select__search">
            <Search size={15} />
            <input
              ref={searchRef}
              aria-label="Search categories"
              placeholder="Search categories or hierarchy..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            {query && (
              <button aria-label="Clear category search" type="button" onClick={() => setQuery("")}>
                <X size={14} />
              </button>
            )}
          </div>

          <div
            aria-label="Product categories"
            aria-multiselectable="true"
            className="product-category-select__options"
            role="listbox"
          >
            {visibleCategories.map((category) => {
              const categoryId = String(category.id);
              const selected = selectedIds.includes(categoryId);
              const primary = String(primaryId) === categoryId;
              const inactive = category.status !== "ACTIVE";
              const metalMismatch =
                selectedMetalId &&
                category.metalId &&
                String(category.metalId) !== String(selectedMetalId);
              const pathParts = (category.path ?? category.name).split(" / ");
              const parentName =
                pathParts.length > 1 ? pathParts[pathParts.length - 2] : "Root category";

              return (
                <div
                  aria-selected={selected}
                  className={`product-category-select__option ${
                    selected ? "is-selected" : ""
                  } ${primary ? "is-primary" : ""} ${
                    inactive || metalMismatch ? "is-inactive" : ""
                  } ${category.depth > 0 ? "is-child" : "is-root"}`}
                  key={category.id}
                  role="option"
                  style={{ "--category-depth": category.depth ?? 0 }}
                >
                  <label>
                    <span className="product-category-select__branch" aria-hidden="true" />
                    <input
                      checked={selected}
                      disabled={(inactive || metalMismatch) && !selected}
                      type="checkbox"
                      onChange={() => onToggle(categoryId)}
                    />
                    <span className="product-category-select__option-copy">
                      <strong>{category.name}</strong>
                      <small>
                        {category.depth > 0 ? `Child of ${parentName}` : "Root category"}
                        {inactive ? " · Inactive" : ""}
                        {metalMismatch ? ` · ${category.metal?.name ?? "Different metal"}` : ""}
                      </small>
                    </span>
                  </label>
                  {selected && (
                    <button
                      className="product-category-select__primary"
                      title={primary ? "Primary category" : "Make primary category"}
                      type="button"
                      onClick={() => onPrimary(categoryId)}
                    >
                      <Star fill={primary ? "currentColor" : "none"} size={14} />
                      <span>{primary ? "Primary" : "Set primary"}</span>
                    </button>
                  )}
                </div>
              );
            })}
            {!visibleCategories.length && (
              <div className="product-category-select__no-results">
                <Search size={18} />
                <strong>No categories found</strong>
                <small>Try a different name or hierarchy path.</small>
              </div>
            )}
          </div>

          <div className="product-category-select__footer">
            <span>
              {selectedCategories.length
                ? `${selectedCategories.length} selected`
                : "No category selected"}
            </span>
            <div>
              {selectedCategories.length > 0 && (
                <button type="button" onClick={onClear}>
                  Clear all
                </button>
              )}
              <button className="is-done" type="button" onClick={closeDropdown}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedCategories.length > 0 && (
        <div className="product-category-select__chips">
          {selectedCategories.map((category) => {
            const categoryId = String(category.id);
            const primary = String(primaryId) === categoryId;
            return (
              <span className={primary ? "is-primary" : ""} key={category.id}>
                {primary && <Star fill="currentColor" size={11} />}
                <b>{category.name}</b>
                <button
                  aria-label={`Remove ${category.name}`}
                  type="button"
                  onClick={() => onToggle(categoryId)}
                >
                  <X size={12} />
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function CreateProductPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const editing = Boolean(id);
  const [form, setForm] = useState(blankProduct);
  const [selectedAttributeRows, setSelectedAttributeRows] = useState([]);
  const [attributeCatalog, setAttributeCatalog] = useState([]);
  const [attributesLoading, setAttributesLoading] = useState(true);
  const [variants, setVariants] = useState(() => [blankVariant({ expanded: true })]);
  const [images, setImages] = useState([]);
  const [removedImageIds, setRemovedImageIds] = useState([]);
  const [options, setOptions] = useState({ metals: [], categories: [] });
  const [categoryScope, setCategoryScope] = useState(CATEGORY_SCOPE_METAL);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);
  const skuCounterRef = useRef(1);

  useEffect(() => {
    Promise.all([
      metalService.list({ isActive: true, pageSize: 100, sortBy: "displayOrder", sortDirection: "ASC" }),
      categoryService.tree(),
    ])
      .then(([metals, categories]) => {
        const categoryTree = categories.data?.tree ?? [];
        const metalOptions = metals.data ?? [];
        setOptions({
          metals: metalOptions,
          categories: categoryTree.length
            ? flattenCategoryTree(categoryTree)
            : (categories.data?.flat ?? []),
        });
        if (!editing) {
          setForm((current) => ({
            ...current,
            metalId: current.metalId || findDefaultMetalId(metalOptions),
          }));
        }
      })
      .catch((requestError) => setError(apiErrorMessage(requestError)));

    attributeService
      .list({ pageSize: 100 })
      .then((response) => setAttributeCatalog(response.data ?? []))
      .catch((requestError) => setError(apiErrorMessage(requestError)))
      .finally(() => setAttributesLoading(false));
  }, [editing]);

  useEffect(() => {
    if (!editing) return;
    productService
      .get(id)
      .then((response) => {
        const product = response.data;
        const categoryMappings = [...(product.categoryMappings ?? [])].sort(
          (first, second) => first.sortOrder - second.sortOrder,
        );
        const mappedCategoryIds = categoryMappings.map(({ categoryId }) => String(categoryId));
        const primaryMapping = categoryMappings.find(({ isPrimary }) => isPrimary);
        const allImages = [...(product.images ?? [])].sort(
          (first, second) => first.displayOrder - second.displayOrder,
        );
        const productLevelImages = allImages.filter((image) => !image.productVariantId);
        setImages(
          productLevelImages.map((image) => ({
            key: `existing-${image.id}`,
            mediaId: image.mediaId,
            secureUrl: image.media?.secureUrl,
            productImageId: image.id,
          })),
        );

        const loadedVariants = (product.variants ?? []).map((variant, index) => {
          const attributeValues = variant.attributeValues ?? [];
          const attributes = Object.fromEntries(
            attributeValues.map((av) => [av.attribute?.name ?? `Attribute ${av.attributeId}`, av.value]),
          );
          return {
            ...blankVariant({
              attributes,
              attributeValueIds: attributeValues.map((av) => av.id),
              name: variant.name ?? null,
              expanded: index === 0,
            }),
            id: variant.id,
            sku: variant.sku ?? "",
            skuAuto: false,
            purity: variant.purity ?? "",
            karat: variant.karat ?? "",
            publicPurity: variant.publicPurity ?? "",
            publicKarat: variant.publicKarat ?? "",
            tunch: variant.tunch ?? "",
            weightGrams: variant.weightGrams ?? "",
            openingStock: variant.inventory?.onHandQuantity ?? "0",
            reorderLevel: variant.inventory?.reorderLevel ?? "5",
            existingImages: allImages.filter((image) => image.productVariantId === variant.id),
          };
        });

        const attributeRows = new Map();
        loadedVariants.forEach((variant) => {
          (product.variants.find((row) => row.id === variant.id)?.attributeValues ?? []).forEach((av) => {
            const row = attributeRows.get(av.attributeId) ?? { attributeId: String(av.attributeId), valueIds: [] };
            if (!row.valueIds.includes(av.id)) row.valueIds.push(av.id);
            attributeRows.set(av.attributeId, row);
          });
        });
        setSelectedAttributeRows(Array.from(attributeRows.values()));

        setForm({
          name: product.name ?? "",
          designCode: product.designCode ?? "",
          description: product.description ?? "",
          status: product.status ?? "DRAFT",
          productType: product.productType ?? "SIMPLE",
          metalId: String(product.metalId ?? ""),
          categoryIds: mappedCategoryIds,
          primaryCategoryId: String(primaryMapping?.categoryId ?? ""),
        });
        setVariants(loadedVariants.length ? loadedVariants : [blankVariant({ expanded: true })]);
        skuCounterRef.current = loadedVariants.length + 1;
      })
      .catch((requestError) => setError(apiErrorMessage(requestError)));
  }, [editing, id]);

  const setValue = (name) => (event) => {
    const value = event.target.value;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const selectedMetal = options.metals.find((metal) => String(metal.id) === form.metalId);
  const visibleCategories = useMemo(() => {
    if (!form.metalId) return [];
    if (categoryScope === CATEGORY_SCOPE_ALL) return options.categories;
    return options.categories.filter(
      (category) => !category.metalId || String(category.metalId) === String(form.metalId),
    );
  }, [categoryScope, form.metalId, options.categories]);
  const selectedCategories = form.categoryIds
    .map((categoryId) => options.categories.find((category) => String(category.id) === categoryId))
    .filter(Boolean);
  const selectedPrimaryCategory = selectedCategories.find(
    (category) => String(category.id) === form.primaryCategoryId,
  );
  const skuCategoryName = selectedPrimaryCategory?.name ?? selectedCategories[0]?.name;

  // Keep auto-generated SKUs (untouched by the admin) in sync with metal/category selection.
  useEffect(() => {
    const metalCode = selectedMetal?.code;
    setVariants((current) =>
      current.map((variant) =>
        variant.skuAuto
          ? {
              ...variant,
              sku: generateSku({
                metalCode,
                categoryName: skuCategoryName,
                sequence: variant.skuSequence ?? 1,
              }),
            }
          : variant,
      ),
    );
  }, [selectedMetal?.code, skuCategoryName]);

  const setMetal = (event) => {
    const metalId = event.target.value;
    setCategoryScope(CATEGORY_SCOPE_METAL);
    setForm((current) => {
      const categoryIds = current.categoryIds.filter((categoryId) => {
        const category = options.categories.find(({ id: catId }) => String(catId) === String(categoryId));
        return category && (!category.metalId || String(category.metalId) === String(metalId));
      });
      const primaryCategoryId = categoryIds.includes(current.primaryCategoryId)
        ? current.primaryCategoryId
        : (categoryIds[0] ?? "");

      return { ...current, metalId, categoryIds, primaryCategoryId };
    });
  };

  const toggleCategory = (categoryId) => {
    const normalizedId = String(categoryId);
    const category = options.categories.find(({ id: catId }) => String(catId) === normalizedId);
    if (
      !form.categoryIds.includes(normalizedId) &&
      category?.metalId &&
      String(category.metalId) !== String(form.metalId)
    ) {
      return;
    }

    setForm((current) => {
      const selected = current.categoryIds.includes(normalizedId);
      const categoryIds = selected
        ? current.categoryIds.filter((catId) => catId !== normalizedId)
        : [...current.categoryIds, normalizedId];
      const primaryCategoryId = selected
        ? current.primaryCategoryId === normalizedId
          ? (categoryIds[0] ?? "")
          : current.primaryCategoryId
        : current.primaryCategoryId || normalizedId;

      return { ...current, categoryIds, primaryCategoryId };
    });
  };

  const setPrimaryCategory = (categoryId) =>
    setForm((current) => ({
      ...current,
      primaryCategoryId: String(categoryId),
    }));

  const clearCategories = () =>
    setForm((current) => ({
      ...current,
      categoryIds: [],
      primaryCategoryId: "",
    }));

  const setProductType = (productType) => {
    setForm((current) => ({ ...current, productType }));
    setSelectedAttributeRows([]);
    if (productType === "SIMPLE") {
      const sequence = skuCounterRef.current;
      skuCounterRef.current += 1;
      const variant = blankVariant({ expanded: true });
      variant.skuSequence = sequence;
      variant.sku = generateSku({
        metalCode: selectedMetal?.code,
        categoryName: skuCategoryName,
        sequence,
      });
      setVariants([variant]);
    } else {
      setVariants([]);
    }
  };

  const addAttributeValue = async (attributeId, value) => {
    const created = await attributeService.addValue(attributeId, { value });
    const newValue = created.data;
    setAttributeCatalog((current) =>
      current.map((attribute) =>
        String(attribute.id) === String(attributeId)
          ? { ...attribute, values: [...(attribute.values ?? []), newValue] }
          : attribute,
      ),
    );
    setSelectedAttributeRows((current) =>
      current.map((row) =>
        String(row.attributeId) === String(attributeId)
          ? { ...row, valueIds: [...row.valueIds, newValue.id] }
          : row,
      ),
    );
  };

  const generateVariants = () => {
    const resolvedAttributes = selectedAttributeRows
      .map((row) => {
        const attribute = attributeCatalog.find((item) => String(item.id) === String(row.attributeId));
        if (!attribute) return null;
        return {
          attributeId: attribute.id,
          attributeName: attribute.name,
          values: (attribute.values ?? []).filter((value) => row.valueIds.includes(value.id)),
        };
      })
      .filter(Boolean);

    const combos = buildVariantCombosFromAttributes(resolvedAttributes);
    if (!combos.length) return;

    setVariants((current) => {
      const existingByKey = new Map(
        current.map((variant) => [comboKey(variant.attributeValueIds), variant]),
      );
      const nextVariants = combos.map((combo) => {
        const attributeValueIds = combo.map(({ valueId }) => valueId);
        const key = comboKey(attributeValueIds);
        const existing = existingByKey.get(key);
        if (existing) return existing;

        const attributes = Object.fromEntries(combo.map(({ attributeName, value }) => [attributeName, value]));
        const sequence = skuCounterRef.current;
        skuCounterRef.current += 1;
        const variant = blankVariant({
          attributes,
          attributeValueIds,
          name: combo.map(({ value }) => value).join(" / "),
        });
        variant.skuSequence = sequence;
        variant.sku = generateSku({
          metalCode: selectedMetal?.code,
          categoryName: skuCategoryName,
          sequence,
        });
        return variant;
      });

      if (nextVariants.length && !nextVariants.some((variant) => variant.expanded)) {
        nextVariants[0] = { ...nextVariants[0], expanded: true };
      }
      return nextVariants;
    });
  };

  const toggleVariantExpanded = (key) =>
    setVariants((current) =>
      current.map((variant) =>
        variant._key === key ? { ...variant, expanded: !variant.expanded } : variant,
      ),
    );

  const updateVariant = (key, patch) =>
    setVariants((current) =>
      current.map((variant) => (variant._key === key ? { ...variant, ...patch } : variant)),
    );

  const setVariantTunch = (key, tunch) => {
    const calculated = calculateMetalPurityFromTunch(tunch);
    updateVariant(key, { tunch, purity: calculated.purity, karat: calculated.karat });
  };

  const removeVariant = (key) =>
    setVariants((current) => current.filter((variant) => variant._key !== key));

  const addVariantImages = (key, pickedImages) => {
    const used = usedMediaIds();
    const fresh = pickedImages.filter((entry) => !used.has(String(entry.mediaId)));
    if (!fresh.length) return;
    setVariants((current) =>
      current.map((variant) =>
        variant._key === key ? { ...variant, newImages: [...variant.newImages, ...fresh] } : variant,
      ),
    );
  };

  const removeVariantNewImage = (key, mediaId) => {
    setVariants((current) =>
      current.map((variant) =>
        variant._key === key
          ? { ...variant, newImages: variant.newImages.filter((entry) => entry.mediaId !== mediaId) }
          : variant,
      ),
    );
  };

  const removeVariantExistingImage = (key, imageId) => {
    setVariants((current) =>
      current.map((variant) => {
        if (variant._key !== key) return variant;
        return {
          ...variant,
          existingImages: variant.existingImages.filter((image) => image.id !== imageId),
          removedImageIds: [...new Set([...variant.removedImageIds, imageId])],
        };
      }),
    );
  };

  // (product_id, media_id) is unique on the backend regardless of which
  // variant an image belongs to — the same media can only ever be attached
  // to a product once. Re-picking an already-attached image from the
  // library used to reach the server and fail there with a raw DB
  // constraint error; filtering it out here catches it before that.
  const usedMediaIds = () => {
    const ids = new Set(images.map((image) => String(image.mediaId)));
    for (const variant of variants) {
      for (const image of variant.existingImages ?? []) ids.add(String(image.mediaId));
      for (const image of variant.newImages ?? []) ids.add(String(image.mediaId));
    }
    return ids;
  };

  const addProductImages = (pickedImages) => {
    const used = usedMediaIds();
    const fresh = pickedImages.filter((entry) => !used.has(String(entry.mediaId)));
    if (!fresh.length) return;
    setImages((current) => [
      ...current,
      ...fresh.map((entry, index) => ({
        key: `new-${entry.mediaId}-${Date.now()}-${index}`,
        mediaId: entry.mediaId,
        secureUrl: entry.secureUrl,
      })),
    ]);
  };

  const removeProductImage = (key) => {
    setImages((current) => {
      const target = current.find((image) => image.key === key);
      if (target?.productImageId) {
        setRemovedImageIds((ids) => [...new Set([...ids, target.productImageId])]);
      }
      return current.filter((image) => image.key !== key);
    });
  };

  const buildVariantPayload = (variant) => ({
    ...(variant.id ? { id: variant.id } : {}),
    sku: variant.sku,
    name: variant.name || null,
    purity: variant.purity || null,
    karat: variant.karat ? Number(variant.karat) : null,
    publicPurity: variant.publicPurity || null,
    publicKarat: variant.publicKarat ? Number(variant.publicKarat) : null,
    tunch: variant.tunch === "" ? null : Number(variant.tunch),
    weightGrams: variant.weightGrams ? Number(variant.weightGrams) : null,
    minimumOrderQuantity: 1,
    attributes: variant.attributes ?? null,
    attributeValueIds: variant.attributeValueIds ?? [],
    ...(!variant.id
      ? {
          ...(variant.basePrice !== "" ? { basePrice: Number(variant.basePrice) } : {}),
          openingStock: Number(variant.openingStock || 0),
          reorderLevel: Number(variant.reorderLevel || 0),
        }
      : {}),
  });

  const payload = (status, variantsOverride) => ({
    name: form.name,
    designCode: form.designCode || null,
    description: form.description || null,
    status,
    productType: form.productType,
    metalId: Number(form.metalId),
    categoryMappings: form.categoryIds.map((categoryId, index) => ({
      categoryId: Number(categoryId),
      isPrimary: categoryId === form.primaryCategoryId,
      sortOrder: index,
    })),
    variants: (variantsOverride ?? variants).map(buildVariantPayload),
  });

  const MAX_SKU_RETRIES = 5;

  const isSkuConflict = (requestError) => {
    const apiError = getApiError(requestError);
    return (
      apiError.code === "DUPLICATE_RESOURCE" &&
      apiError.details.some((detail) => /sku/i.test(detail))
    );
  };

  const regenerateNewVariantSkus = (list) =>
    list.map((variant) => {
      if (variant.id) return variant;
      const sequence = skuCounterRef.current;
      skuCounterRef.current += 1;
      return {
        ...variant,
        skuSequence: sequence,
        sku: generateSku({ metalCode: selectedMetal?.code, categoryName: skuCategoryName, sequence }),
      };
    });

  const save = async (status = form.status) => {
    setSaving(true);
    setError(null);
    let workingVariants = variants;
    try {
      let response;
      for (let attempt = 0; ; attempt += 1) {
        try {
          response = editing
            ? await productService.update(id, payload(status, workingVariants))
            : await productService.create(payload(status, workingVariants));
          break;
        } catch (requestError) {
          if (attempt >= MAX_SKU_RETRIES - 1 || !isSkuConflict(requestError)) throw requestError;
          workingVariants = regenerateNewVariantSkus(workingVariants);
        }
      }
      if (workingVariants !== variants) setVariants(workingVariants);
      const product = response.data;

      if (editing && removedImageIds.length) {
        for (const imageId of removedImageIds) {
          await productService.removeImage(product.id, imageId);
        }
      }
      for (const variant of workingVariants) {
        for (const imageId of variant.removedImageIds) {
          await productService.removeImage(product.id, imageId);
        }
      }

      const newProductImages = images.filter((image) => !image.productImageId);
      if (newProductImages.length) {
        const existingCount = images.length - newProductImages.length;
        await productService.addImages(product.id, {
          images: newProductImages.map((image, index) => ({
            mediaId: image.mediaId,
            altText: form.name,
            isPrimary: images.indexOf(image) === 0,
            displayOrder: existingCount + index,
          })),
        });
      }

      for (const variant of workingVariants) {
        if (!variant.newImages.length) continue;
        const savedVariant = product.variants.find((row) => row.sku === variant.sku);
        if (!savedVariant) continue;
        await productService.addImages(product.id, {
          images: variant.newImages.map((entry, index) => ({
            mediaId: entry.mediaId,
            productVariantId: savedVariant.id,
            altText: variant.name || form.name,
            isPrimary: false,
            displayOrder: variant.existingImages.length + index,
          })),
        });
      }

      navigate("/products");
    } catch (requestError) {
      setError(apiErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  };

  const deleteDraft = async () => {
    if (!editing) return;
    if (!window.confirm("Delete this draft product? This cannot be undone.")) return;
    setDeleting(true);
    try {
      await productService.remove(id);
      navigate("/products");
    } catch (requestError) {
      setError(apiErrorMessage(requestError));
    } finally {
      setDeleting(false);
    }
  };

  const isVariable = form.productType === "VARIABLE";

  const readinessItems = [
    { label: "Product name", done: Boolean(form.name.trim()) },
    { label: "Metal selected", done: Boolean(form.metalId) },
    { label: "Category assigned", done: form.categoryIds.length > 0 },
    { label: "At least one image", done: images.length > 0 },
    { label: "Pricing set", done: variants.some((variant) => Number(variant.basePrice) > 0) },
    { label: "Description added", done: Boolean(form.description.trim()) },
  ];

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Products"
        title={editing ? "Edit Product" : "Create Product"}
        description="Build a product with complete catalog, pricing, stock, and media information."
        actions={
          <>
            <Button variant="secondary" onClick={() => navigate("/products")}>
              Cancel
            </Button>
            <Button icon={Check} loading={saving} onClick={() => save(form.status)}>
              {editing ? "Update Product" : "Create Product"}
            </Button>
          </>
        }
      />
      {error && <FormAlert>{error}</FormAlert>}

      <div className="product-workspace">
        <main className="product-main">
          <Card className="product-panel">
            <div className="card-heading product-details-heading">
              <h2>Details</h2>
              <div className="product-status-panel product-status-panel--actions-only">
                {["OUT_OF_STOCK", "ARCHIVED"].includes(form.status) ? (
                  <StatusBadge status={form.status.replaceAll("_", " ")} />
                ) : (
                  <StatusToggle
                    activeLabel="Active"
                    checked={form.status === "ACTIVE"}
                    inactiveLabel={form.status === "DRAFT" ? "Draft" : "Inactive"}
                    onChange={(active) =>
                      setForm((current) => ({
                        ...current,
                        status: active ? "ACTIVE" : "INACTIVE",
                      }))
                    }
                  />
                )}
              </div>
            </div>
            <div className="product-form-grid">
              <Field label="Product Name" required hint="Shown to shopkeepers and customers everywhere.">
                <input placeholder="e.g. Floral Gold Necklace" value={form.name} onChange={setValue("name")} />
              </Field>
              <Field label="Design Code" hint="Your internal reference code. Leave blank if you don't use one.">
                <input placeholder="e.g. RNG-001" value={form.designCode} onChange={setValue("designCode")} />
              </Field>
              <Field label="Metal" required>
                <select value={form.metalId} onChange={setMetal}>
                  <option value="">Select metal</option>
                  {options.metals.map((metal) => (
                    <option key={metal.id} value={metal.id}>
                      {metal.name}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          </Card>

          <Card className="product-panel">
            <div className="card-heading">
              <h2>Category</h2>
            </div>
            <div className="product-category-picker">
              <div className="product-category-picker__heading">
                <span>
                  <strong>
                    Categories <em>*</em>
                  </strong>
                  <small>
                    {selectedMetal
                      ? `${selectedMetal.name} categories are shown by default. Switch to All to inspect the full hierarchy.`
                      : "Select metal first to load matching categories."}
                  </small>
                </span>
                <b>{form.categoryIds.length} selected</b>
              </div>
              <CategoryMultiSelect
                categories={visibleCategories}
                categoryScope={categoryScope}
                primaryId={form.primaryCategoryId}
                selectedMetalId={form.metalId}
                selectedIds={form.categoryIds}
                onClear={clearCategories}
                onPrimary={setPrimaryCategory}
                onScopeChange={setCategoryScope}
                onToggle={toggleCategory}
              />
              {!form.categoryIds.length && (
                <p className="product-category-picker__empty">
                  Select at least one category to continue.
                </p>
              )}
            </div>
          </Card>

          <Card className="product-panel">
            <div className="card-heading">
              <h2>Description</h2>
            </div>
            <textarea
              className="product-description-input"
              placeholder="Describe the craftsmanship, occasion, or styling details…"
              rows="5"
              value={form.description}
              onChange={setValue("description")}
            />
          </Card>

          <Card className="product-panel">
            <div className="card-heading">
              <h2>Product Images</h2>
            </div>
            <ProductMediaGallery
              images={images}
              maxImages={MAX_PRODUCT_IMAGES}
              onAdd={addProductImages}
              onRemove={removeProductImage}
            />
          </Card>

          <Card className="product-panel">
            <div className="card-heading">
              <h2>Product Type</h2>
            </div>
            <div className="product-type-cards" role="radiogroup" aria-label="Product type">
              <button
                aria-checked={!isVariable}
                className={`product-type-card ${!isVariable ? "is-active" : ""}`}
                role="radio"
                type="button"
                onClick={() => setProductType("SIMPLE")}
              >
                <Package size={20} />
                <strong>Simple product</strong>
                <span>One SKU, one price, one stock count.</span>
              </button>
              <button
                aria-checked={isVariable}
                className={`product-type-card ${isVariable ? "is-active" : ""}`}
                role="radio"
                type="button"
                onClick={() => setProductType("VARIABLE")}
              >
                <Layers size={20} />
                <strong>Variable product</strong>
                <span>Multiple SKUs generated from options like Size or Color.</span>
              </button>
            </div>

            {isVariable && (
              <VariantOptionsBuilder
                attributeCatalog={attributeCatalog}
                loadingAttributes={attributesLoading}
                selectedRows={selectedAttributeRows}
                onChange={setSelectedAttributeRows}
                onGenerate={generateVariants}
                onAddValue={addAttributeValue}
              />
            )}
          </Card>

          <Card className="product-panel">
            <div className="card-heading">
              <h2>{isVariable ? "Variants" : "Pricing & Inventory"}</h2>
            </div>
            <div className="variant-list">
              {variants.map((variant) => (
                <VariantCard
                  key={variant._key}
                  variant={variant}
                  collapsible={isVariable}
                  expanded={!isVariable || variant.expanded}
                  showAttributes={isVariable}
                  showRemove={isVariable && !variant.id}
                  showImages={isVariable}
                  onToggleExpand={() => toggleVariantExpanded(variant._key)}
                  onFieldChange={(field, value, extra) =>
                    updateVariant(variant._key, { [field]: value, ...extra })
                  }
                  onTunchChange={(tunch) => setVariantTunch(variant._key, tunch)}
                  onRemove={() => removeVariant(variant._key)}
                  onAddImages={(picked) => addVariantImages(variant._key, picked)}
                  onRemoveNewImage={(mediaId) => removeVariantNewImage(variant._key, mediaId)}
                  onRemoveExistingImage={(imageId) => removeVariantExistingImage(variant._key, imageId)}
                />
              ))}
              {isVariable && !variants.length && (
                <p className="wizard-note">
                  Add options above and click Generate Variants to build SKUs.
                </p>
              )}
            </div>
          </Card>
        </main>

        <aside className="product-sidebar">
          <ProductLivePreviewCard
            name={form.name}
            coverImageUrl={images[0]?.secureUrl}
            status={form.status}
            metalName={selectedMetal?.name}
            purity={variants[0]?.publicPurity || variants[0]?.purity}
            categoryName={selectedPrimaryCategory?.name}
            description={form.description}
            variants={variants}
          />
          <ProductReadinessCard items={readinessItems} />
          <ProductQuickActionsCard
            saving={saving}
            onSaveDraft={() => save("DRAFT")}
            editing={editing}
            isDraft={form.status === "DRAFT"}
            deleting={deleting}
            onDelete={deleteDraft}
          />
        </aside>
      </div>
    </div>
  );
}
