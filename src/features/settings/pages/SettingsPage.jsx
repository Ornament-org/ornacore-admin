import { Bell, Database, Edit3, KeyRound, Save, ShieldCheck, SlidersHorizontal } from "lucide-react";
import { useEffect, useRef, useState } from "react";
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
    title: "Business preferences",
    icon: SlidersHorizontal,
    description: "Currency, timezone, and operational defaults.",
  },
  {
    title: "Security",
    icon: ShieldCheck,
    description: "Session policy and administrative safeguards.",
  },
  {
    title: "API connections",
    icon: Database,
    description: "Backend, Cloudinary, Redis, and mail provider health.",
  },
  {
    title: "Notifications",
    icon: Bell,
    description: "Email and in-app event delivery preferences.",
  },
  {
    title: "Credentials",
    icon: KeyRound,
    description: "Password and future multi-factor authentication options.",
  },
];

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
  const { hasPermission } = usePermissions();
  const canManage = hasPermission("settings.manage");

  const [activeSection, setActiveSection] = useState(0);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const savedRef = useRef(emptyForm);

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

  const fieldsDisabled = !isEditing || saving;
  const activeMeta = sections[activeSection];

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Administration"
        title="Settings"
        description="Configure the toolbox experience and review integration health."
        actions={
          activeSection === 0 ? (
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
          {sections.map((section, index) => (
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
          {notice ? <FormAlert>{notice}</FormAlert> : null}
          {!canManage ? <FormAlert>You have read-only access to store settings.</FormAlert> : null}

          {activeSection !== 0 ? (
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

          {activeSection === 0 && !loading && (
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
