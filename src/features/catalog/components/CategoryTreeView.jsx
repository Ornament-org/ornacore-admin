import {
  ChevronDown,
  ChevronRight,
  FolderOpen,
  Image as ImageIcon,
  Pencil,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { StatusToggle } from "../../../components/common/StatusToggle.jsx";
import { apiErrorMessage } from "../../../services/apiClient.js";
import { categoryService } from "../../../services/resourceServices.js";
import {
  getActiveMetalOptions,
  getPersistedMetalId,
  persistMetalId,
} from "./categoryMetalSelection.js";
import "./CategoryTreeView.scss";

const ALL_METALS_FILTER_ID = "__all__";

function TreeNode({ category, level = 0, onEdit, onDelete, onStatusChange, setStatusError }) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = category.children && category.children.length > 0;

  return (
    <div className="category-tree-node">
      <div className="category-tree-node__content" style={{ paddingLeft: `${level * 24 + 12}px` }}>
        {hasChildren ? (
          <button
            aria-label={expanded ? "Collapse category" : "Expand category"}
            className="category-tree-node__toggle"
            type="button"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
        ) : (
          <span className="category-tree-node__spacer" />
        )}

        <span
          className={`category-tree-node__image ${category.image?.secureUrl ? "has-image" : ""}`}
        >
          {category.image?.secureUrl ? (
            <img alt="" src={category.image.secureUrl} />
          ) : (
            <ImageIcon aria-hidden="true" size={16} />
          )}
        </span>

        <div className="category-tree-node__info">
          <strong>{category.name}</strong>
          <small>{category.slug || category.path || "Category"}</small>
        </div>

        <div className="category-tree-node__meta">
          {category.metal?.name && (
            <span className="category-tree-node__metal">{category.metal.name}</span>
          )}
          <span className="category-tree-node__products">
            {category.productCount || 0} products
          </span>
          <StatusToggle
            checked={category.status === "ACTIVE"}
            compact
            onChange={async (active) => {
              setStatusError("");
              try {
                await categoryService.update(category.id, {
                  status: active ? "ACTIVE" : "INACTIVE",
                });
                onStatusChange?.();
              } catch (requestError) {
                setStatusError(apiErrorMessage(requestError));
              }
            }}
            onError={(requestError) => setStatusError(apiErrorMessage(requestError))}
          />
        </div>

        <div className="category-tree-node__actions">
          <button
            className="category-tree-node__action"
            type="button"
            onClick={() => onEdit(category)}
            title="Edit"
          >
            <Pencil size={14} />
          </button>
          <button
            className="category-tree-node__action category-tree-node__action--danger"
            type="button"
            onClick={() => onDelete(category)}
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {hasChildren && expanded && (
        <div className="category-tree-node__children">
          {category.children.map((child) => (
            <TreeNode
              key={child.id}
              category={child}
              level={level + 1}
              onEdit={onEdit}
              onDelete={onDelete}
              onStatusChange={onStatusChange}
              setStatusError={setStatusError}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function CategoryTreeView({
  categories,
  metals,
  onEdit,
  onDelete,
  onRefresh,
  statusError,
  setStatusError,
}) {
  const [selectedMetalId, setSelectedMetalId] = useState(() => getPersistedMetalId(metals));

  const metalOptions = useMemo(() => getActiveMetalOptions(metals), [metals]);
  const activeMetalId =
    selectedMetalId === ALL_METALS_FILTER_ID
      ? ""
      : metalOptions.some((metal) => String(metal.id) === selectedMetalId)
        ? selectedMetalId
        : getPersistedMetalId(metalOptions);

  const countByMetal = useMemo(() => {
    const counts = new Map();
    for (const category of categories) {
      if (!category.metalId) continue;
      const key = String(category.metalId);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return counts;
  }, [categories]);

  const filteredCategories = useMemo(
    () =>
      activeMetalId
        ? categories.filter((category) => String(category.metalId) === activeMetalId)
        : categories,
    [activeMetalId, categories],
  );

  const treeData = useMemo(() => {
    const buildTree = (items, parentId = null) =>
      items
        .filter((item) => (parentId === null ? !item.parentId : item.parentId === parentId))
        .map((item) => ({
          ...item,
          children: buildTree(items, item.id),
        }));

    return buildTree(filteredCategories);
  }, [filteredCategories]);

  const selectedMetal = metalOptions.find((metal) => String(metal.id) === activeMetalId);

  const handleMetalFilter = (metalId) => {
    setSelectedMetalId(metalId);
    persistMetalId(metalId);
  };

  return (
    <div className="category-tree">
      {statusError && <div className="category-tree__error">{statusError}</div>}
      <div
        className="category-tree__filters"
        role="tablist"
        aria-label="Filter categories by metal"
      >
        <button
          aria-selected={!activeMetalId}
          className={`category-tree__filter ${!activeMetalId ? "is-active" : ""}`}
          role="tab"
          type="button"
          onClick={() => handleMetalFilter(ALL_METALS_FILTER_ID)}
        >
          <span>All</span>
          <small>{categories.length}</small>
        </button>
        {metalOptions.map((metal) => (
          <button
            key={metal.id}
            aria-selected={activeMetalId === String(metal.id)}
            className={`category-tree__filter ${
              activeMetalId === String(metal.id) ? "is-active" : ""
            }`}
            role="tab"
            type="button"
            onClick={() => handleMetalFilter(String(metal.id))}
          >
            <span>{metal.name}</span>
            <small>{countByMetal.get(String(metal.id)) ?? 0}</small>
          </button>
        ))}
      </div>

      {treeData.length === 0 ? (
        <div className="category-tree-empty">
          <span className="category-tree-empty__icon">
            <FolderOpen size={24} />
          </span>
          <strong>
            {selectedMetal ? `No ${selectedMetal.name} categories found` : "No categories found"}
          </strong>
          <p>
            {selectedMetal
              ? "Create a category for this metal or switch back to All."
              : "Create your first category by choosing a metal and adding its hierarchy details."}
          </p>
        </div>
      ) : (
        <div className="category-tree__list">
          {treeData.map((category) => (
            <TreeNode
              key={category.id}
              category={category}
              onEdit={onEdit}
              onDelete={onDelete}
              onStatusChange={onRefresh}
              setStatusError={setStatusError}
            />
          ))}
        </div>
      )}
    </div>
  );
}
