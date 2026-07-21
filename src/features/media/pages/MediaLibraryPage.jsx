import { FolderPlus, Image as ImageIcon, RefreshCw, RotateCcw, Search, Trash2, Upload, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "../../../components/common/Button.jsx";
import { PageHeader } from "../../../components/layout/PageHeader.jsx";
import { apiErrorMessage } from "../../../services/apiClient.js";
import { mediaService } from "../../../services/resourceServices.js";
import "./MediaLibraryPage.scss";

const formatBytes = (bytes) => {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export function MediaLibraryPage() {
  const fileInputRef = useRef(null);
  const [tab, setTab] = useState("library");
  const [files, setFiles] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [folders, setFolders] = useState([]);
  const [folderId, setFolderId] = useState("");
  const [selected, setSelected] = useState(null);
  const [altDraft, setAltDraft] = useState("");
  const [savingAlt, setSavingAlt] = useState(false);

  const loadFolders = () =>
    mediaService.listFolders().then((response) => setFolders(response.data?.folders || [])).catch(() => {});

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await mediaService.list({
        page,
        limit: 30,
        search: search || undefined,
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
    loadFolders();
  }, []);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, tab, folderId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      load();
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const openDetail = (file) => {
    setSelected(file);
    setAltDraft(file.altText || "");
  };

  const closeDetail = () => setSelected(null);

  const onUploadChange = async (event) => {
    const picked = Array.from(event.target.files || []);
    event.target.value = "";
    if (!picked.length) return;
    setUploading(true);
    setError("");
    try {
      await mediaService.upload(picked, { folder: "library", folderId: folderId || undefined });
      setNotice(`${picked.length} file${picked.length > 1 ? "s" : ""} uploaded.`);
      setPage(1);
      setTab("library");
      await load();
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  const trashFile = async (id) => {
    await mediaService.trash(id);
    if (selected?.id === id) closeDetail();
    load();
  };

  const restoreFile = async (id) => {
    await mediaService.restore(id);
    load();
  };

  const purgeFile = async (id) => {
    if (!window.confirm("Permanently delete this file? This cannot be undone.")) return;
    await mediaService.purge(id);
    if (selected?.id === id) closeDetail();
    load();
  };

  const saveAltText = async () => {
    if (!selected) return;
    setSavingAlt(true);
    try {
      const response = await mediaService.update(selected.id, { altText: altDraft });
      const asset = response.data;
      setSelected(asset);
      setFiles((current) => current.map((file) => (file.id === asset.id ? asset : file)));
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setSavingAlt(false);
    }
  };

  const createFolder = async () => {
    const name = window.prompt("Folder name");
    if (!name?.trim()) return;
    try {
      await mediaService.createFolder({ name: name.trim() });
      await loadFolders();
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  };

  const fileCountLabel = useMemo(() => `${files.length} file${files.length === 1 ? "" : "s"}`, [files.length]);

  return (
    <div className="page-stack media-library">
      <PageHeader
        eyebrow="Administration / Media"
        title="Media Library"
        description="Reuse images across products, categories, and store settings from one source."
        actions={
          <>
            <Button variant="secondary" icon={RefreshCw} onClick={load}>Refresh</Button>
            <Button variant="secondary" icon={FolderPlus} onClick={createFolder}>New Folder</Button>
            <Button icon={Upload} onClick={() => fileInputRef.current?.click()} loading={uploading}>
              Upload
            </Button>
            <input ref={fileInputRef} type="file" accept="image/*" multiple hidden onChange={onUploadChange} />
          </>
        }
      />

      {error ? <div className="media-library__alert">{error}</div> : null}
      {notice ? <div className="media-library__notice">{notice}</div> : null}

      <div className="media-library__tabs">
        <button type="button" className={tab === "library" ? "active" : ""} onClick={() => { setTab("library"); setPage(1); }}>Library</button>
        <button type="button" className={tab === "trash" ? "active" : ""} onClick={() => { setTab("trash"); setPage(1); }}>Trash</button>
        <span className="media-library__count">{fileCountLabel}</span>
      </div>

      <div className="media-library__toolbar">
        <div className="media-library__search">
          <Search size={16} />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name or alt text" />
        </div>
        <select value={folderId} onChange={(event) => setFolderId(event.target.value)}>
          <option value="">All folders</option>
          {folders.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
        </select>
      </div>

      <div className="media-library__body">
        <div className="media-library__grid">
          {loading ? <div className="media-library__empty">Loading…</div> : null}
          {!loading && !files.length ? (
            <div className="media-library__empty">
              <ImageIcon size={32} />
              <strong>{tab === "trash" ? "Trash is empty" : "No media yet"}</strong>
              <span>{tab === "trash" ? "" : "Upload your first asset to get started."}</span>
            </div>
          ) : null}
          {files.map((file) => (
            <div
              key={file.id}
              className={selected?.id === file.id ? "media-library__card media-library__card--active" : "media-library__card"}
              onClick={() => openDetail(file)}
            >
              <div className="media-library__thumb">
                {file.mimeType?.startsWith("image/") ? <img src={file.secureUrl} alt={file.altText || ""} /> : <ImageIcon size={24} />}
              </div>
              <span className="media-library__filename" title={file.originalFilename || ""}>{file.originalFilename || "Untitled"}</span>
              {tab === "trash" ? (
                <div className="media-library__trash-actions" onClick={(event) => event.stopPropagation()}>
                  <button type="button" onClick={() => restoreFile(file.id)}><RotateCcw size={12} /> Restore</button>
                  <button type="button" className="media-library__danger" onClick={() => purgeFile(file.id)}><Trash2 size={12} /></button>
                </div>
              ) : null}
            </div>
          ))}
        </div>

        {selected ? (
          <aside className="media-library__detail">
            <div className="media-library__detail-header">
              <strong>Asset Details</strong>
              <button type="button" onClick={closeDetail}><X size={16} /></button>
            </div>
            <div className="media-library__detail-preview">
              {selected.mimeType?.startsWith("image/") ? <img src={selected.secureUrl} alt="" /> : <ImageIcon size={32} />}
            </div>
            <dl className="media-library__detail-meta">
              <div><dt>File name</dt><dd title={selected.originalFilename}>{selected.originalFilename || "—"}</dd></div>
              <div><dt>Type</dt><dd>{selected.mimeType}</dd></div>
              <div><dt>Size</dt><dd>{formatBytes(selected.sizeBytes)}</dd></div>
              {selected.width ? <div><dt>Dimensions</dt><dd>{selected.width} × {selected.height}</dd></div> : null}
              <div><dt>Uploaded</dt><dd>{selected.createdAt ? new Date(selected.createdAt).toLocaleDateString() : "—"}</dd></div>
            </dl>

            <label className="media-library__alt-label">
              Alt text
              <div className="media-library__alt-row">
                <input value={altDraft} onChange={(event) => setAltDraft(event.target.value)} placeholder="Describe this image" />
                <button type="button" onClick={saveAltText} disabled={savingAlt}>Save</button>
              </div>
            </label>

            <button type="button" className="media-library__trash-detail-btn" onClick={() => trashFile(selected.id)}>
              <Trash2 size={14} /> Move to Trash
            </button>
          </aside>
        ) : null}
      </div>

      {pagination && pagination.totalPages > 1 ? (
        <div className="media-library__pagination">
          <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</button>
          <span>Page {pagination.page} of {pagination.totalPages}</span>
          <button type="button" disabled={page >= pagination.totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
        </div>
      ) : null}
    </div>
  );
}
