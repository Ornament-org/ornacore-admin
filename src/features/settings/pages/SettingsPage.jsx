import { Bell, Database, Edit3, KeyRound, Save, ShieldCheck, SlidersHorizontal, XCircle } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { Button } from "../../../components/common/Button.jsx";
import { Card } from "../../../components/common/Card.jsx";
import { FormAlert } from "../../../components/common/FormAlert.jsx";
import { FormField } from "../../../components/common/FormField.jsx";
import { ImageUploadField } from "../../../components/forms/ImageUploadField/ImageUploadField.jsx";
import { PageHeader } from "../../../components/layout/PageHeader.jsx";
import { usePermissions } from "../../auth/permissions.js";
import { apiErrorMessage } from "../../../services/apiClient.js";
import { storeSettingsService } from "../../../services/resourceServices.js";
import { fetchBranding } from "../store/brandingSlice.js";
import "../Settings.scss";

const sections = [
  {
    key: "business",
    title: "Business preferences",
    icon: SlidersHorizontal,
    description: "Currency, timezone, and operational defaults.",
  },
  {
    key: "security",
    title: "Security",
    icon: ShieldCheck,
    description: "Session policy and administrative safeguards.",
  },
  {
    key: "api",
    title: "API connections",
    icon: Database,
    description: "Backend, Cloudinary, Redis, and mail provider health.",
  },
  {
    key: "notifications",
    title: "Notifications",
    icon: Bell,
    description: "Email and in-app event delivery preferences.",
  },
  {
    key: "credentials",
    title: "Credentials",
    icon: KeyRound,
    description: "Password and future multi-factor authentication options.",
  },
];

const backupSection = {
  key: "backups",
  title: "Database backup",
  icon: Database,
  description: "Send a fresh encrypted database export to the Super Admin email.",
};

const backupJobStorageKey = "ornacore:last-database-backup-job-id";
const activeBackupStatuses = new Set(["QUEUED", "BACKING_UP", "EMAILING"]);
const backupPollIntervalMs = 5000;
const maxBackupPolls = 12;

const backupJobMessage = (job) => {
  if (!job) return "";
  if (job.status === "QUEUED") return `Backup job queued for ${job.recipientEmail}.`;
  if (job.status === "BACKING_UP") return "Creating the database backup file.";
  if (job.status === "EMAILING") return `Backup file created. Sending email to ${job.recipientEmail}.`;
  if (job.status === "SENT") return `Backup email sent to ${job.recipientEmail}.`;
  if (job.status === "FAILED") return job.error?.message || "Backup email failed.";
  if (job.status === "CANCELLED") return "Backup job cancelled.";
  return "Backup job status is updating.";
};

const backupJobTone = (job) => {
  if (job?.status === "FAILED") return "error";
  if (job?.status === "SENT") return "success";
  return "info";
};

const emptyForm = {
  businessName: "",
  displayName: "",
  logo: null,
  favicon: null,
  currency: "INR",
  timezone: "Asia/Kolkata",
  dateFormat: "DD MMM YYYY",
};

export function SettingsPage() {
  const dispatch = useDispatch();
  const { hasPermission, isSuperAdmin, user } = usePermissions();
  const canManage = hasPermission("settings.manage");
  const visibleSections = useMemo(
    () => (isSuperAdmin ? [...sections, backupSection] : sections),
    [isSuperAdmin],
  );

  const [activeSection, setActiveSection] = useState(0);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [backupEmail, setBackupEmail] = useState("");
  const [backupEmailConfigured, setBackupEmailConfigured] = useState(false);
  const [backupSending, setBackupSending] = useState(false);
  const [backupError, setBackupError] = useState("");
  const [backupNotice, setBackupNotice] = useState("");
  const [backupJob, setBackupJob] = useState(null);
  const [backupPollCount, setBackupPollCount] = useState(0);
  const [backupCancelling, setBackupCancelling] = useState(false);
  const [backupRefreshing, setBackupRefreshing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const savedRef = useRef(emptyForm);
  const backupJobId = backupJob?.id;
  const backupJobStatus = backupJob?.status;
  const backupJobIsActive = activeBackupStatuses.has(backupJobStatus);

  // Display Name auto-copies from Business Name until the admin edits Display Name
  // directly in this session — same convention as the reference toolbox implementation.
  const displayNameTouched = useRef(false);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await storeSettingsService.get();
      const settings = response.data?.storeSettings || {};
      displayNameTouched.current = Boolean(settings.displayName);
      const nextForm = {
        businessName: settings.businessName || "",
        displayName: settings.displayName || settings.businessName || "",
        logo: settings.logo || null,
        favicon: settings.favicon || null,
        currency: settings.currency || "INR",
        timezone: settings.timezone || "Asia/Kolkata",
        dateFormat: settings.dateFormat || "DD MMM YYYY",
      };
      savedRef.current = nextForm;
      setForm(nextForm);
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (activeSection >= visibleSections.length) setActiveSection(0);
  }, [activeSection, visibleSections.length]);

  useEffect(() => {
    if (!isSuperAdmin) return undefined;

    let cancelled = false;
    storeSettingsService
      .getBackupSettings()
      .then((response) => {
        if (cancelled) return;
        const configuredEmail = response.data?.backup?.recipientEmail || "";
        setBackupEmailConfigured(Boolean(configuredEmail));
        setBackupEmail((current) => current || configuredEmail || user?.email || "");
      })
      .catch(() => {
        if (cancelled) return;
        setBackupEmailConfigured(false);
        setBackupEmail((current) => current || user?.email || "");
      });

    return () => {
      cancelled = true;
    };
  }, [isSuperAdmin, user?.email]);

  useEffect(() => {
    if (!isSuperAdmin) return undefined;

    const jobId = window.localStorage.getItem(backupJobStorageKey);
    if (!jobId) return undefined;

    let cancelled = false;
    storeSettingsService
      .getBackupJob(jobId)
      .then((response) => {
        if (!cancelled) {
          setBackupJob(response.data?.job ?? null);
          setBackupPollCount(0);
        }
      })
      .catch(() => {
        if (!cancelled) window.localStorage.removeItem(backupJobStorageKey);
      });

    return () => {
      cancelled = true;
    };
  }, [isSuperAdmin]);

  useEffect(() => {
    if (!backupJobId || !backupJobIsActive || backupPollCount >= maxBackupPolls) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      storeSettingsService
        .getBackupJob(backupJobId)
        .then((response) => {
          setBackupJob(response.data?.job ?? null);
          setBackupPollCount((count) => count + 1);
        })
        .catch((err) => {
          setBackupError(apiErrorMessage(err));
          setBackupPollCount(maxBackupPolls);
        });
    }, backupPollIntervalMs);

    return () => window.clearTimeout(timer);
  }, [backupJobId, backupJobIsActive, backupPollCount]);

  const updateField = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const updateBusinessName = (value) => {
    setForm((current) => ({
      ...current,
      businessName: value,
      displayName: displayNameTouched.current ? current.displayName : value,
    }));
  };

  const updateDisplayName = (value) => {
    displayNameTouched.current = true;
    updateField("displayName", value);
  };

  const startEdit = () => {
    setError("");
    setNotice("");
    setIsEditing(true);
  };

  const cancel = () => {
    setForm(savedRef.current);
    displayNameTouched.current = Boolean(savedRef.current.displayName);
    setError("");
    setIsEditing(false);
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    try {
      await storeSettingsService.update(form);
      setNotice("Store settings saved.");
      setIsEditing(false);
      dispatch(fetchBranding());
      await load();
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const requestBackup = async (event) => {
    event.preventDefault();
    setBackupSending(true);
    setBackupError("");
    setBackupNotice("");
    try {
      const email = backupEmail.trim();
      const response = await storeSettingsService.requestBackup(email ? { email } : {});
      const job = response.data?.job;
      setBackupJob(job ?? null);
      setBackupPollCount(0);
      if (job?.id) window.localStorage.setItem(backupJobStorageKey, job.id);
      setBackupNotice(job?.recipientEmail ? `Backup started for ${job.recipientEmail}.` : "Backup job started.");
    } catch (err) {
      setBackupError(apiErrorMessage(err));
    } finally {
      setBackupSending(false);
    }
  };

  const refreshBackupStatus = async () => {
    if (!backupJob?.id) return;
    setBackupRefreshing(true);
    setBackupError("");
    try {
      const response = await storeSettingsService.getBackupJob(backupJob.id);
      setBackupJob(response.data?.job ?? null);
      setBackupPollCount(0);
    } catch (err) {
      setBackupError(apiErrorMessage(err));
    } finally {
      setBackupRefreshing(false);
    }
  };

  const cancelBackup = async () => {
    setBackupCancelling(true);
    setBackupError("");
    try {
      const response = await storeSettingsService.cancelBackupJobs();
      const jobs = response.data?.jobs ?? [];
      const currentJob = jobs.find((job) => job.id === backupJobId) ?? jobs[0] ?? null;
      if (currentJob) {
        setBackupJob(currentJob);
        setBackupNotice("Backup job cancelled.");
        setBackupPollCount(maxBackupPolls);
      } else {
        setBackupNotice("No running backup job found.");
      }
    } catch (err) {
      setBackupError(apiErrorMessage(err));
    } finally {
      setBackupCancelling(false);
    }
  };

  const fieldsDisabled = !isEditing || saving;
  const activeMeta = visibleSections[activeSection] ?? visibleSections[0];
  const isBusinessSection = activeMeta.key === "business";
  const isBackupSection = activeMeta.key === "backups";
  const backupActive = backupJobIsActive;

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Administration"
        title="Settings"
        description="Configure the toolbox experience and review integration health."
        actions={
          isBusinessSection ? (
            !isEditing ? (
              <Button
                icon={Edit3}
                onClick={startEdit}
                disabled={loading || !canManage}
                title={!canManage ? "You don't have permission to edit store settings" : undefined}
              >
                Edit
              </Button>
            ) : (
              <>
                <Button variant="secondary" onClick={cancel} disabled={saving}>
                  Cancel
                </Button>
                <Button icon={Save} type="submit" form="store-settings-form" loading={saving}>
                  Save Changes
                </Button>
              </>
            )
          ) : undefined
        }
      />
      <div className="settings-layout">
        <Card className="settings-nav">
          {visibleSections.map((section, index) => (
            <button
              type="button"
              className={index === activeSection ? "active" : ""}
              key={section.title}
              onClick={() => setActiveSection(index)}
            >
              <section.icon size={18} />
              <span>{section.title}</span>
            </button>
          ))}
        </Card>
        <Card className="settings-panel">
          <div className="card-heading">
            <div>
              <h2>{activeMeta.title}</h2>
              <p>{activeMeta.description}</p>
            </div>
          </div>

          {error ? <FormAlert>{error}</FormAlert> : null}
          {notice ? <FormAlert tone="success">{notice}</FormAlert> : null}
          {!canManage ? <FormAlert>You have read-only access to store settings.</FormAlert> : null}
          {backupError ? <FormAlert>{backupError}</FormAlert> : null}
          {backupNotice ? <FormAlert tone="success">{backupNotice}</FormAlert> : null}
          {backupJob ? (
            <FormAlert role={backupJob.status === "FAILED" ? "alert" : "status"} tone={backupJobTone(backupJob)}>
              {backupJobMessage(backupJob)}
            </FormAlert>
          ) : null}
          {backupSending ? (
            <FormAlert role="status" tone="info">
              Starting the backup job. You can leave this screen once it starts.
            </FormAlert>
          ) : null}
          {backupActive && backupPollCount >= maxBackupPolls ? (
            <FormAlert role="status" tone="info">
              Auto refresh paused. Tap Refresh Status or reload this screen to check again.
            </FormAlert>
          ) : null}

          {isBackupSection ? (
            <form className="settings-backup" onSubmit={requestBackup}>
              <div className="settings-backup__summary">
                <Database size={24} />
                <div>
                  <strong>Super Admin backup</strong>
                  <span>Creates a fresh MySQL dump, compresses it, and emails it as an attachment.</span>
                </div>
              </div>
              <FormField
                label="Backup email"
                hint={backupEmailConfigured ? "Loaded from SUPER_ADMIN_EMAIL." : "Enter the recipient email address."}
              >
                <input
                  type="email"
                  value={backupEmail}
                  placeholder="superadmin@example.com"
                  onChange={(event) => setBackupEmail(event.target.value)}
                />
              </FormField>
              <Button disabled={backupActive} icon={Database} loading={backupSending} type="submit">
                {backupActive ? "Backup Running" : "Get Backup"}
              </Button>
              {backupJob?.id ? (
                <Button loading={backupRefreshing} onClick={refreshBackupStatus} variant="secondary">
                  Refresh Status
                </Button>
              ) : null}
              {backupActive ? (
                <Button icon={XCircle} loading={backupCancelling} onClick={cancelBackup} variant="danger">
                  Cancel Backup
                </Button>
              ) : null}
            </form>
          ) : !isBusinessSection ? (
            <p className="settings-placeholder">This section is coming soon.</p>
          ) : loading ? (
            <p className="settings-placeholder">Loading…</p>
          ) : (
            <form id="store-settings-form" onSubmit={submit}>
              <fieldset disabled={fieldsDisabled} className="settings-fieldset">
                <div className="settings-form-grid">
                  <FormField label="Business name" hint="Legal / registered name">
                    <input
                      value={form.businessName}
                      onChange={(event) => updateBusinessName(event.target.value)}
                    />
                  </FormField>
                  <FormField label="Display name" hint="Shown across the toolbox — sidebar, browser tab, favicon">
                    <input
                      value={form.displayName}
                      onChange={(event) => updateDisplayName(event.target.value)}
                    />
                  </FormField>
                  <ImageUploadField
                    label="Logo"
                    previewUrl={form.logo}
                    folder="store-settings"
                    disabled={fieldsDisabled}
                    onSelect={(asset) => updateField("logo", asset.secureUrl)}
                    onRemove={() => updateField("logo", null)}
                  />
                  <ImageUploadField
                    label="Favicon"
                    previewUrl={form.favicon}
                    folder="store-settings"
                    disabled={fieldsDisabled}
                    onSelect={(asset) => updateField("favicon", asset.secureUrl)}
                    onRemove={() => updateField("favicon", null)}
                  />
                  <FormField label="Base currency">
                    <select value={form.currency} onChange={(event) => updateField("currency", event.target.value)}>
                      <option value="INR">INR</option>
                    </select>
                  </FormField>
                  <FormField label="Application timezone">
                    <select value={form.timezone} onChange={(event) => updateField("timezone", event.target.value)}>
                      <option value="Asia/Kolkata">Asia/Kolkata</option>
                    </select>
                  </FormField>
                  <FormField label="Date format">
                    <select value={form.dateFormat} onChange={(event) => updateField("dateFormat", event.target.value)}>
                      <option value="DD MMM YYYY">DD MMM YYYY</option>
                    </select>
                  </FormField>
                </div>
              </fieldset>
            </form>
          )}

          {isBusinessSection && !loading && (
            <div className="integration-health">
              <h3>Integration health</h3>
              <div>
                <span className="status-pulse" /> Backend API <strong>Connected</strong>
              </div>
              <div>
                <span className="status-pulse" /> MySQL database <strong>Connected</strong>
              </div>
              <div>
                <span className="status-pulse status-pulse--warning" /> Cloudinary <strong>Not configured</strong>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
