import {
  Boxes,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FolderTree,
  Gem,
  Info,
  Plus,
  Save,
  Search,
  Star,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../../../components/common/Button.jsx";
import { Card } from "../../../components/common/Card.jsx";
import { FormAlert } from "../../../components/common/FormAlert.jsx";
import { StatusBadge } from "../../../components/common/StatusBadge.jsx";
import { StatusToggle } from "../../../components/common/StatusToggle.jsx";
import { PageHeader } from "../../../components/layout/PageHeader.jsx";
import { apiErrorMessage } from "../../../services/apiClient.js";
import {
  categoryService,
  mediaService,
  metalService,
  productService,
} from "../../../services/resourceServices.js";
import { calculateMetalPurityFromTunch } from "../../../utils/goldPurity.js";
import "../Products.scss";

const steps = [
  { label: "Product Details", icon: Info },
  { label: "Jewelry Details", icon: Gem },
  { label: "Pricing, Stock & Images", icon: Boxes },
  { label: "Review", icon: Check },
];

const MAX_PRODUCT_IMAGES = 10;
const ACCEPTED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const CATEGORY_SCOPE_METAL = "metal";
const CATEGORY_SCOPE_ALL = "all";

const blankProduct = {
  name: "",
  designCode: "",
  description: "",
  status: "ACTIVE",
  metalId: "",
  categoryIds: [],
  primaryCategoryId: "",
  sku: "",
  variantName: "",
  purity: "22K",
  karat: "22",
  tunch: "",
  weightGrams: "",
  minimumOrderQuantity: "1",
  basePrice: "",
  openingStock: "0",
  reorderLevel: "5",
};

function Field({ label, required = false, children, className }) {
  return (
    <label className={`product-field ${className || ""}`}>
      <span>
        {label} {required && <em>*</em>}
      </span>
      {children}
    </label>
  );
}

function formatMoney(value) {
  if (value === "" || value === null || value === undefined) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value));
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
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(blankProduct);
  const [imageFiles, setImageFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [removedImageIds, setRemovedImageIds] = useState([]);
  const [imageError, setImageError] = useState("");
  const [draggingImages, setDraggingImages] = useState(false);
  const [options, setOptions] = useState({ metals: [], categories: [] });
  const [categoryScope, setCategoryScope] = useState(CATEGORY_SCOPE_METAL);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const imageFilesRef = useRef([]);
  const imageInputRef = useRef(null);
  const ActiveStepIcon = steps[step].icon;

  useEffect(() => {
    imageFilesRef.current = imageFiles;
  }, [imageFiles]);

  useEffect(
    () => () => {
      imageFilesRef.current.forEach((entry) => URL.revokeObjectURL(entry.previewUrl));
    },
    [],
  );

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
  }, [editing]);

  useEffect(() => {
    if (!editing) return;
    productService
      .get(id)
      .then((response) => {
        const product = response.data;
        const variant = product.variants?.[0] ?? {};
        const categoryMappings = [...(product.categoryMappings ?? [])].sort(
          (first, second) => first.sortOrder - second.sortOrder,
        );
        const fallbackCategoryId = product.categoryId ? String(product.categoryId) : "";
        const mappedCategoryIds = categoryMappings.map(({ categoryId }) => String(categoryId));
        const primaryMapping = categoryMappings.find(({ isPrimary }) => isPrimary);
        setExistingImages(
          [...(product.images ?? [])].sort(
            (first, second) => first.displayOrder - second.displayOrder,
          ),
        );
        setForm({
          name: product.name ?? "",
          designCode: product.designCode ?? "",
          description: product.description ?? "",
          status: product.status ?? "DRAFT",
          metalId: String(product.metalId ?? ""),
          categoryIds: mappedCategoryIds.length
            ? mappedCategoryIds
            : fallbackCategoryId
              ? [fallbackCategoryId]
              : [],
          primaryCategoryId: String(primaryMapping?.categoryId ?? fallbackCategoryId),
          variantId: variant.id,
          sku: variant.sku ?? "",
          variantName: variant.name ?? "",
          purity: variant.purity ?? "",
          karat: variant.karat ?? "",
          tunch: variant.tunch ?? "",
          weightGrams: variant.weightGrams ?? "",
          minimumOrderQuantity: variant.minimumOrderQuantity ?? "1",
          basePrice: "",
          openingStock: variant.inventory?.onHandQuantity ?? "0",
          reorderLevel: variant.inventory?.reorderLevel ?? "5",
        });
      })
      .catch((requestError) => setError(apiErrorMessage(requestError)));
  }, [editing, id]);

  const setValue = (name) => (event) => {
    const value = event.target.value;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const setMetal = (event) => {
    const metalId = event.target.value;
    setCategoryScope(CATEGORY_SCOPE_METAL);
    setForm((current) => {
      const categoryIds = current.categoryIds.filter((categoryId) => {
        const category = options.categories.find(({ id }) => String(id) === String(categoryId));
        return category && (!category.metalId || String(category.metalId) === String(metalId));
      });
      const primaryCategoryId = categoryIds.includes(current.primaryCategoryId)
        ? current.primaryCategoryId
        : (categoryIds[0] ?? "");

      return { ...current, metalId, categoryIds, primaryCategoryId };
    });
  };

  const setTunch = (event) => {
    const tunch = event.target.value;
    const calculated = calculateMetalPurityFromTunch(tunch);
    setForm((current) => ({
      ...current,
      tunch,
      purity: calculated.purity,
      karat: calculated.karat,
    }));
  };

  const toggleCategory = (categoryId) => {
    const normalizedId = String(categoryId);
    const category = options.categories.find(({ id }) => String(id) === normalizedId);
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
        ? current.categoryIds.filter((id) => id !== normalizedId)
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

  const addImageFiles = (selectedFiles) => {
    setImageError("");
    const candidates = Array.from(selectedFiles ?? []);
    const invalidFile = candidates.find((file) => !ACCEPTED_IMAGE_TYPES.has(file.type));

    if (invalidFile) {
      setImageError("Only JPG, PNG, and WebP images are supported.");
      if (imageInputRef.current) imageInputRef.current.value = "";
      return;
    }

    const occupiedSlots = existingImages.length + imageFiles.length;
    const availableSlots = Math.max(MAX_PRODUCT_IMAGES - occupiedSlots, 0);
    const knownFiles = new Set(
      imageFiles.map((entry) => `${entry.file.name}-${entry.file.size}-${entry.file.lastModified}`),
    );
    const uniqueFiles = candidates.filter((file) => {
      const key = `${file.name}-${file.size}-${file.lastModified}`;
      if (knownFiles.has(key)) return false;
      knownFiles.add(key);
      return true;
    });
    const acceptedFiles = uniqueFiles.slice(0, availableSlots);

    if (acceptedFiles.length < uniqueFiles.length || (candidates.length && !availableSlots)) {
      setImageError(`A product can have a maximum of ${MAX_PRODUCT_IMAGES} images.`);
    }

    setImageFiles((current) => [
      ...current,
      ...acceptedFiles.map((file) => ({
        id: `${file.name}-${file.size}-${file.lastModified}`,
        file,
        previewUrl: URL.createObjectURL(file),
      })),
    ]);

    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const removeNewImage = (imageId) => {
    setImageFiles((current) => {
      const removed = current.find((entry) => entry.id === imageId);
      if (removed) URL.revokeObjectURL(removed.previewUrl);
      return current.filter((entry) => entry.id !== imageId);
    });
    setImageError("");
  };

  const removeExistingImage = (imageId) => {
    setExistingImages((current) => current.filter((image) => image.id !== imageId));
    setRemovedImageIds((current) => [...new Set([...current, imageId])]);
    setImageError("");
  };

  const handleImageDrop = (event) => {
    event.preventDefault();
    setDraggingImages(false);
    addImageFiles(event.dataTransfer.files);
  };

  const payload = (status = form.status) => ({
    name: form.name,
    designCode: form.designCode,
    description: form.description || null,
    status,
    metalId: Number(form.metalId),
    categoryMappings: form.categoryIds.map((categoryId, index) => ({
      categoryId: Number(categoryId),
      isPrimary: categoryId === form.primaryCategoryId,
      sortOrder: index,
    })),
    jewelryAttributes: {
      purity: form.purity || null,
      karat: form.karat ? Number(form.karat) : null,
    },
    variants: [
      {
        ...(form.variantId ? { id: form.variantId } : {}),
        sku: form.sku,
        name: form.variantName || null,
        purity: form.purity || null,
        karat: form.karat ? Number(form.karat) : null,
        tunch: form.tunch === "" ? null : Number(form.tunch),
        weightGrams: form.weightGrams ? Number(form.weightGrams) : null,
        minimumOrderQuantity: Number(form.minimumOrderQuantity || 1),
        ...(!editing && form.basePrice !== "" ? { basePrice: Number(form.basePrice) } : {}),
        ...(!editing ? { openingStock: Number(form.openingStock || 0) } : {}),
        ...(!editing ? { reorderLevel: Number(form.reorderLevel || 0) } : {}),
      },
    ],
  });

  const save = async (status = form.status) => {
    setSaving(true);
    setError(null);
    try {
      const response = editing
        ? await productService.update(id, payload(status))
        : await productService.create(payload(status));
      const product = response.data;
      if (editing && removedImageIds.length) {
        for (const imageId of removedImageIds) {
          await productService.removeImage(product.id, imageId);
        }
      }
      if (imageFiles.length) {
        const uploaded = await mediaService.upload(
          imageFiles.map((entry) => entry.file),
          {
            folder: "products",
            ownerType: "PRODUCT",
            ownerId: product.id,
          },
        );
        await productService.addImages(product.id, {
          images: (uploaded.data ?? []).map((media, index) => ({
            mediaId: media.id,
            altText: form.name,
            isPrimary: existingImages.length === 0 && index === 0,
            displayOrder: existingImages.length + index,
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

  const next = () => {
    if (step === steps.length - 1) save(form.status);
    else setStep((value) => value + 1);
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
  const totalImageCount = existingImages.length + imageFiles.length;

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Products"
        title={editing ? "Edit Product" : "Create Product"}
        description="Build a product with complete catalog, pricing, stock, and media information."
        actions={
          <Button loading={saving} variant="secondary" icon={Save} onClick={() => save("DRAFT")}>
            Save Draft
          </Button>
        }
      />
      {error && <FormAlert>{error}</FormAlert>}
      <Card className="product-wizard" padded={false}>
        <div className="product-steps">
          {steps.map((item, index) => (
            <button
              type="button"
              key={item.label}
              className={`${index === step ? "active" : ""} ${index < step ? "complete" : ""}`}
              onClick={() => setStep(index)}
            >
              <span>{index < step ? <Check size={16} /> : <item.icon size={16} />}</span>
              <small>Step {index + 1}</small>
              <strong>{item.label}</strong>
            </button>
          ))}
        </div>
        <div className="product-wizard__body">
          <div className="product-wizard__heading">
            <div>
              <span>
                Step {step + 1} of {steps.length}
              </span>
              <h2>{steps[step].label}</h2>
              <p>Information is validated again by the OrnaCore API before it is saved.</p>
            </div>
            <span className="wizard-progress">
              {Math.round(((step + 1) / steps.length) * 100)}%
            </span>
          </div>

          {step === 0 && (
            <div className="product-form-grid">
              <Field label="Product Name" required>
                <input value={form.name} onChange={setValue("name")} />
              </Field>
              <Field label="Design Code" required>
                <input value={form.designCode} onChange={setValue("designCode")} />
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
              <div className="product-category-picker product-field--full">
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
              <Field label="Description" className="product-field--full">
                <textarea rows="5" value={form.description} onChange={setValue("description")} />
              </Field>
              <div className="product-status-panel">
                <span>
                  <strong>Product availability</strong>
                  <small>
                    Active products can be ordered by shopkeepers. Use Save Draft for unfinished
                    products.
                  </small>
                </span>
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
          )}

          {step === 1 && (
            <div className="product-form-grid">
              <Field label="SKU" required>
                <input value={form.sku} onChange={setValue("sku")} />
              </Field>
              <Field label="Variant name">
                <input value={form.variantName} onChange={setValue("variantName")} />
              </Field>
              <Field label="Tunch">
                <input
                  min="0"
                  max="100"
                  step="0.01"
                  type="number"
                  value={form.tunch}
                  onChange={setTunch}
                />
              </Field>
              <Field label="Purity / Karat">
                <input readOnly placeholder="Calculated automatically" value={form.purity} />
              </Field>
              <Field label="Weight (grams)">
                <input
                  min="0"
                  step="0.001"
                  type="number"
                  value={form.weightGrams}
                  onChange={setValue("weightGrams")}
                />
              </Field>
              <Field label="Minimum order quantity" required>
                <input
                  min="0.001"
                  step="0.001"
                  type="number"
                  value={form.minimumOrderQuantity}
                  onChange={setValue("minimumOrderQuantity")}
                />
              </Field>
            </div>
          )}

          {step === 2 && (
            <div className="product-step-sections">
              <section className="product-step-section">
                <div className="product-step-section__heading">
                  <div>
                    <h3>Pricing & inventory</h3>
                    <p>Set the opening commercial values for this product.</p>
                  </div>
                  <Boxes size={18} />
                </div>
                <div className="product-form-grid product-form-grid--compact">
                  <Field label="Base price (INR)" required={!editing}>
                    <input
                      disabled={editing}
                      min="0"
                      step="0.01"
                      type="number"
                      value={form.basePrice}
                      onChange={setValue("basePrice")}
                    />
                  </Field>
                  <Field label="Opening stock" required={!editing}>
                    <input
                      disabled={editing}
                      min="0"
                      step="0.001"
                      type="number"
                      value={form.openingStock}
                      onChange={setValue("openingStock")}
                    />
                  </Field>
                  <Field label="Low stock threshold" required={!editing}>
                    <input
                      disabled={editing}
                      min="0"
                      step="0.001"
                      type="number"
                      value={form.reorderLevel}
                      onChange={setValue("reorderLevel")}
                    />
                  </Field>
                </div>
                {editing ? (
                  <div className="wizard-note">
                    Existing pricing and stock are changed through their dedicated modules to
                    preserve ledger and movement history.
                  </div>
                ) : (
                  <div className="wizard-note">
                    Advanced price-group rules and shopkeeper overrides remain managed from Pricing.
                  </div>
                )}
              </section>

              <section className="product-step-section">
                <div className="product-step-section__heading">
                  <div>
                    <h3>Product images</h3>
                    <p>Add multiple product views. The first image becomes the primary image.</p>
                  </div>
                  <span className="image-count">
                    {totalImageCount}/{MAX_PRODUCT_IMAGES}
                  </span>
                </div>
                {imageError && <p className="product-images-error">{imageError}</p>}
                <div className="product-media-grid">
                  {existingImages.map((image, index) => (
                    <article className="product-media-tile" key={`existing-${image.id}`}>
                      <img
                        alt={image.altText || form.name || `Product image ${index + 1}`}
                        src={image.media?.secureUrl}
                      />
                      <span>{index === 0 ? "Primary" : `Image ${index + 1}`}</span>
                      <button
                        aria-label={`Remove saved image ${index + 1}`}
                        type="button"
                        onClick={() => removeExistingImage(image.id)}
                      >
                        <X size={14} />
                      </button>
                    </article>
                  ))}
                  {imageFiles.map((entry, index) => {
                    const imageNumber = existingImages.length + index + 1;
                    return (
                      <article className="product-media-tile" key={entry.id}>
                        <img
                          alt={`${form.name || "Product"} preview ${imageNumber}`}
                          src={entry.previewUrl}
                        />
                        <span>{imageNumber === 1 ? "Primary" : `Image ${imageNumber}`}</span>
                        <button
                          aria-label={`Remove selected image ${imageNumber}`}
                          type="button"
                          onClick={() => removeNewImage(entry.id)}
                        >
                          <X size={14} />
                        </button>
                      </article>
                    );
                  })}
                  {totalImageCount < MAX_PRODUCT_IMAGES && (
                    <button
                      className={`product-media-upload ${draggingImages ? "is-dragging" : ""}`}
                      type="button"
                      onClick={() => imageInputRef.current?.click()}
                      onDragEnter={(event) => {
                        event.preventDefault();
                        setDraggingImages(true);
                      }}
                      onDragLeave={(event) => {
                        event.preventDefault();
                        setDraggingImages(false);
                      }}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={handleImageDrop}
                    >
                      <span>
                        <Plus size={25} />
                      </span>
                      <strong>Add images</strong>
                      <small>Choose or drop multiple</small>
                    </button>
                  )}
                  <input
                    ref={imageInputRef}
                    accept="image/jpeg,image/png,image/webp"
                    hidden
                    multiple
                    type="file"
                    onChange={(event) => addImageFiles(event.target.files)}
                  />
                </div>
                <p className="product-media-help">
                  JPG, PNG, or WebP · maximum {MAX_PRODUCT_IMAGES} images
                </p>
              </section>
            </div>
          )}

          {step === 3 && (
            <div className="product-review">
              <div className="product-review__hero">
                <span>
                  <ActiveStepIcon size={28} />
                </span>
                <div>
                  <small>Ready to save</small>
                  <h3>{form.name || "Untitled product"}</h3>
                  <p>
                    {form.designCode || "No design code"} · {form.sku || "No SKU"}
                  </p>
                </div>
              </div>
              <div className="product-review__sections">
                <section>
                  <h4>Product</h4>
                  <dl>
                    <div>
                      <dt>Metal</dt>
                      <dd>{selectedMetal?.name || "—"}</dd>
                    </div>
                    <div>
                      <dt>Primary category</dt>
                      <dd>{selectedPrimaryCategory?.path || "—"}</dd>
                    </div>
                    <div>
                      <dt>All categories</dt>
                      <dd>
                        {selectedCategories.length
                          ? selectedCategories.map(({ name }) => name).join(", ")
                          : "—"}
                      </dd>
                    </div>
                    <div>
                      <dt>Status</dt>
                      <dd>{form.status}</dd>
                    </div>
                  </dl>
                </section>
                <section>
                  <h4>Jewelry</h4>
                  <dl>
                    <div>
                      <dt>Tunch</dt>
                      <dd>{form.tunch || "—"}</dd>
                    </div>
                    <div>
                      <dt>Purity / Karat</dt>
                      <dd>{form.purity || "—"}</dd>
                    </div>
                    <div>
                      <dt>Weight</dt>
                      <dd>{form.weightGrams ? `${form.weightGrams} g` : "—"}</dd>
                    </div>
                    <div>
                      <dt>MOQ</dt>
                      <dd>{form.minimumOrderQuantity}</dd>
                    </div>
                  </dl>
                </section>
                <section>
                  <h4>Commerce</h4>
                  <dl>
                    <div>
                      <dt>Base price</dt>
                      <dd>{editing ? "Managed in Pricing" : formatMoney(form.basePrice)}</dd>
                    </div>
                    <div>
                      <dt>Opening stock</dt>
                      <dd>{editing ? "Managed in Inventory" : form.openingStock || "0"}</dd>
                    </div>
                    <div>
                      <dt>Low stock alert</dt>
                      <dd>{editing ? "Managed in Inventory" : form.reorderLevel || "0"}</dd>
                    </div>
                    <div>
                      <dt>Images</dt>
                      <dd>{totalImageCount}</dd>
                    </div>
                  </dl>
                </section>
              </div>
              {totalImageCount > 0 && (
                <div className="product-review__images">
                  {existingImages.map((image, index) => (
                    <img
                      alt={image.altText || `${form.name} ${index + 1}`}
                      key={`review-existing-${image.id}`}
                      src={image.media?.secureUrl}
                    />
                  ))}
                  {imageFiles.map((entry, index) => (
                    <img
                      alt={`${form.name || "Product"} ${existingImages.length + index + 1}`}
                      key={`review-new-${entry.id}`}
                      src={entry.previewUrl}
                    />
                  ))}
                </div>
              )}
              {form.description && (
                <div className="wizard-note">
                  <strong>Description:</strong> {form.description}
                </div>
              )}
            </div>
          )}
        </div>
        <div className="product-wizard__footer">
          <Button
            variant="ghost"
            icon={ChevronLeft}
            disabled={step === 0}
            onClick={() => setStep((value) => Math.max(value - 1, 0))}
          >
            Previous
          </Button>
          <div>
            <Button variant="secondary" onClick={() => navigate("/products")}>
              Cancel
            </Button>
            <Button
              loading={saving}
              icon={step === steps.length - 1 ? Check : ChevronRight}
              onClick={next}
            >
              {step === steps.length - 1
                ? editing
                  ? "Update Product"
                  : "Create Product"
                : "Save & Continue"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
