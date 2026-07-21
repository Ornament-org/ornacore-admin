import { Check, FolderPlus, ImageOff, Loader2, RotateCcw, Search, Trash2, Upload } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Modal } from "../../common/Modal.jsx";
import { apiErrorMessage } from "../../../services/apiClient.js";
import { mediaService } from "../../../services/resourceServices.js";
import "./MediaPicker.scss";

const formatBytes = (bytes) => {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// Centralized asset browser used everywhere an image is attached (Categories, Store
// Settings, and — as more forms adopt it — Products/Collections). Selecting an existing
// asset never re-uploads; picking "Upload New" pushes through the same /admin/media
// endpoint so every asset lands in the library exactly once, then is immediately
// available to every other picker in the toolbox.
export function MediaPicker({ open, onClose, onSelect, multiple = false, folder = "library", title = "Select Media" }) {
  const fileInputRef = useRef(null);
  const [tab, setTab] = useState("library");
  const [files, setFiles] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [mimeFilter, setMimeFilter] = useState("");
  const [folders, setFolders] = useState([]);
  const [folderId, setFolderId] = useState("");
  const [selectedIds, setSelectedIds] = useState(() => new Set());

  const selectedFiles = useMemo(() => files.filter((file) => selectedIds.has(file.id)), [files, selectedIds]);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await mediaService.list({
        page,
        limit: 24,
        search: search || undefined,
        mimeType: mimeFilter || undefined,
        folderId: folderId || undefined,
        trashed: tab === "trash",
      });
      setFiles(response.data?.files || []);
      setPagination(response.meta?.pagination || null);
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    mediaService
      .listFolders()
      .then((response) => setFolders(response.data?.folders || []))
      .catch(() => {});
  }, [open]);

  useEffect(() => {
    if (open) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, page, tab, folderId]);

  useEffect(() => {
    if (!open) return undefined;
    const timer = setTimeout(() => {
      setPage(1);
      load();
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, mimeFilter]);

  useEffect(() => {
    if (!open) {
      setSelectedIds(new Set());
      setTab("library");
      setSearch("");
      setMimeFilter("");
      setFolderId("");
      setPage(1);
    }
  }, [open]);

  if (!open) return null;

  const toggleSelect = (file) => {
    setSelectedIds((current) => {
      const next = new Set(multiple ? current : []);
      if (next.has(file.id)) next.delete(file.id);
      else {
        if (!multiple) next.clear();
        next.add(file.id);
      }
      return next;
    });
  };

  const onUploadChange = async (event) => {
    const picked = Array.from(event.target.files || []);
    event.target.value = "";
    if (!picked.length) return;
    setUploading(true);
    setError("");
    try {
      const response = await mediaService.upload(picked, { folder, folderId: folderId || undefined });
      const uploaded = response.data || [];
      setPage(1);
      setTab("library");
      await load();
      setSelectedIds((current) => {
        const next = new Set(multiple ? current : []);
        uploaded.forEach((asset) => next.add(asset.id));
        return next;
      });
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  const confirmSelection = () => {
    onSelect(multiple ? selectedFiles : selectedFiles[0] || null);
    onClose();
  };

  const restoreFile = async (id) => {
    await mediaService.restore(id);
    load();
  };

  const purgeFile = async (id) => {
    if (!window.confirm("Permanently delete this file? This cannot be undone.")) return;
    await mediaService.purge(id);
    load();
  };

  const trashFile = async (id) => {
    await mediaService.trash(id);
    setSelectedIds((current) => {
      const next = new Set(current);
      next.delete(id);
      return next;
    });
    load();
  };

  const createFolder = async () => {
    const name = window.prompt("Folder name");
    if (!name?.trim()) return;
    try {
      await mediaService.createFolder({ name: name.trim() });
      const response = await mediaService.listFolders();
      setFolders(response.data?.folders || []);
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  };

  return (
    <Modal open={open} title={title} onClose={onClose} size="lg">
      <div className="media-picker">
        <div className="media-picker__tabs">
          <button type="button" className={tab === "library" ? "active" : ""} onClick={() => { setTab("library"); setPage(1); }}>
            Library
          </button>
          <button type="button" className={tab === "trash" ? "active" : ""} onClick={() => { setTab("trash"); setPage(1); }}>
            Trash
          </button>
        </div>

        <div className="media-picker__toolbar">
          <div className="media-picker__search">
            <Search size={15} />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by file name or alt text" />
          </div>
          <select value={mimeFilter} onChange={(event) => setMimeFilter(event.target.value)}>
            <option value="">All types</option>
            <option value="image/">Images</option>
          </select>
          <select value={folderId} onChange={(event) => setFolderId(event.target.value)}>
            <option value="">All folders</option>
            {folders.map((f) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
          {tab === "library" ? (
            <>
              <button type="button" className="media-picker__folder-btn" onClick={createFolder}>
                <FolderPlus size={15} /> New Folder
              </button>
              <button type="button" className="media-picker__upload-btn" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                {uploading ? <Loader2 size={15} className="media-picker__spinner" /> : <Upload size={15} />}
                {uploading ? "Uploading…" : "Upload New"}
              </button>
            </>
          ) : null}
          <input ref={fileInputRef} type="file" accept="image/*" multiple hidden onChange={onUploadChange} />
        </div>

        {error ? <div className="media-picker__error">{error}</div> : null}

        <div className="media-picker__grid">
          {loading ? (
            <div className="media-picker__empty">Loading…</div>
          ) : files.length ? (
            files.map((file) => (
              <div key={file.id} className={selectedIds.has(file.id) ? "media-picker__card media-picker__card--selected" : "media-picker__card"}>
                <button
                  type="button"
                  className="media-picker__thumb"
                  onClick={() => (tab === "library" ? toggleSelect(file) : null)}
                  disabled={tab === "trash"}
                >
                  {file.mimeType?.startsWith("image/") ? (
                    <img src={file.secureUrl} alt={file.altText || ""} />
                  ) : (
                    <ImageOff size={26} />
                  )}
                  {tab === "library" ? (
                    <span className="media-picker__checkbox">{selectedIds.has(file.id) ? <Check size={12} /> : null}</span>
                  ) : null}
                </button>
                <div className="media-picker__meta">
                  <span className="media-picker__filename" title={file.originalFilename || ""}>{file.originalFilename || "Untitled"}</span>
                  <span className="media-picker__filesize">{formatBytes(file.sizeBytes)}</span>
                </div>
                {tab === "trash" ? (
                  <div className="media-picker__trash-actions">
                    <button type="button" onClick={() => restoreFile(file.id)} title="Restore">
                      <RotateCcw size={13} /> Restore
                    </button>
                    <button type="button" className="media-picker__danger" onClick={() => purgeFile(file.id)} title="Delete permanently">
                      <Trash2 size={13} />
                    </button>
                  </div>
                ) : (
                  <button type="button" className="media-picker__card-trash" onClick={() => trashFile(file.id)} title="Move to trash">
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            ))
          ) : (
            <div className="media-picker__empty">
              <ImageOff size={30} />
              <strong>{tab === "trash" ? "Trash is empty" : "No media found"}</strong>
              <span>{tab === "trash" ? "" : "Upload files or adjust your search."}</span>
            </div>
          )}
        </div>

        {pagination && pagination.totalPages > 1 ? (
          <div className="media-picker__pagination">
            <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</button>
            <span>Page {pagination.page} of {pagination.totalPages}</span>
            <button type="button" disabled={page >= pagination.totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
          </div>
        ) : null}

        {tab === "library" ? (
          <footer className="media-picker__footer">
            <span>{selectedIds.size ? `${selectedIds.size} selected` : "Nothing selected"}</span>
            <div>
              <button type="button" className="media-picker__cancel" onClick={onClose}>Cancel</button>
              <button type="button" className="media-picker__confirm" onClick={confirmSelection} disabled={!selectedIds.size}>
                {multiple ? "Add Selected" : "Select"}
              </button>
            </div>
          </footer>
        ) : null}
      </div>
    </Modal>
  );
}
