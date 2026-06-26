import { Bell, Database, KeyRound, Save, ShieldCheck, SlidersHorizontal } from "lucide-react";
import { Button } from "../../../components/common/Button.jsx";
import { Card } from "../../../components/common/Card.jsx";
import { PageHeader } from "../../../components/layout/PageHeader.jsx";
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

export function SettingsPage() {
  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Administration"
        title="Settings"
        description="Configure the toolbox experience and review integration health."
        actions={<Button icon={Save}>Save Changes</Button>}
      />
      <div className="settings-layout">
        <Card className="settings-nav">
          {sections.map((section, index) => (
            <button className={index === 0 ? "active" : ""} key={section.title}>
              <section.icon size={18} />
              <span>{section.title}</span>
            </button>
          ))}
        </Card>
        <Card className="settings-panel">
          <div className="card-heading">
            <div>
              <h2>Business preferences</h2>
              <p>Defaults used throughout OrnaCore operations.</p>
            </div>
          </div>
          <div className="settings-form-grid">
            <label>
              <span>Business name</span>
              <input defaultValue="OrnaCore Jewelry" />
            </label>
            <label>
              <span>Base currency</span>
              <select defaultValue="INR">
                <option>INR</option>
              </select>
            </label>
            <label>
              <span>Application timezone</span>
              <select defaultValue="Asia/Kolkata">
                <option>Asia/Kolkata</option>
              </select>
            </label>
            <label>
              <span>Date format</span>
              <select defaultValue="DD MMM YYYY">
                <option>DD MMM YYYY</option>
              </select>
            </label>
          </div>
          <div className="integration-health">
            <h3>Integration health</h3>
            <div>
              <span className="status-pulse" /> Backend API <strong>Connected</strong>
            </div>
            <div>
              <span className="status-pulse" /> MySQL database <strong>Connected</strong>
            </div>
            <div>
              <span className="status-pulse status-pulse--warning" /> Cloudinary{" "}
              <strong>Not configured</strong>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
