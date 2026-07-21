import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { FormAlert } from "../../../components/common/FormAlert.jsx";
import { ResourceFormModal } from "../../../components/common/ResourceFormModal.jsx";
import { SkeletonShopkeeperDetails } from "../../../components/skeleton/SkeletonShopkeeperDetails.jsx";
import { metalService, shopkeeperService } from "../../../services/resourceServices.js";
import { KhatabookPage } from "../../khatabook/pages/KhatabookPage.jsx";
import { MetalCreditLimitEditor } from "../components/MetalCreditLimitEditor.jsx";
import { ShopOverview } from "../components/overview/ShopOverview.jsx";
import { ShopkeeperHeaderCard } from "../components/shopkeeper-details/ShopkeeperHeaderCard.jsx";
import "../components/shopkeeper-details/ShopkeeperDetails.scss";
import { OverviewAnalyticsCard } from "../components/shopkeeper-details/OverviewAnalyticsCard.jsx";

const tabs = ["Overview", "Orders (Khatabook)", "Ledger"];

const emptyState = {
  details: null,
  analytics: null,
  ordersSummary: null,
  ledgerSummary: null,
  recentActivity: [],
};

export function ShopkeeperDetailsPage() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("Overview");
  const [state, setState] = useState(emptyState);
  const [metals, setMetals] = useState([]);
  const [modal, setModal] = useState({ open: false, type: null });
  const [loading, setLoading] = useState(true);
  const [analyticsKey, setAnalyticsKey] = useState(0);
  const handleCollectionAdded = useCallback(() => setAnalyticsKey((k) => k + 1), []);
  const [error, setError] = useState("");

  const loadDetails = useCallback(() => {
    return Promise.all([
      shopkeeperService.details(id),
      shopkeeperService.analytics(id),
      shopkeeperService.ordersSummary(id),
      shopkeeperService.ledgerSummary(id),
      shopkeeperService.recentActivity(id),
    ])
      .then(([details, analytics, ordersSummary, ledgerSummary, recentActivity]) => {
        setState({
          details: details.data,
          analytics: analytics.data,
          ordersSummary: ordersSummary.data,
          ledgerSummary: ledgerSummary.data,
          recentActivity: recentActivity.data ?? [],
        });
      })
      .catch((requestError) => {
        setError(requestError.userMessage || requestError.message || "Unable to load shopkeeper details.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    let alive = true;
    loadDetails();
    metalService
      .list({ isActive: true, pageSize: 100 })
      .then((response) => { if (alive) setMetals(response.data ?? []); })
      .catch(() => { if (alive) setMetals([]); });

    return () => { alive = false; };
  }, [loadDetails]);

  const creditLimitField = useMemo(
    () => ({
      name: "creditLimits",
      label: "Credit limits in gm",
      type: "custom",
      fullWidth: true,
      defaultValue: [],
      render: ({ value, setValue }) => (
        <MetalCreditLimitEditor metals={metals} value={value} onChange={setValue} />
      ),
      serialize: (value = []) =>
        value
          .filter((row) => row.metalId && row.creditLimitGrams !== "")
          .map((row) => ({
            metalId: Number(row.metalId),
            creditLimitGrams: Number(row.creditLimitGrams),
          })),
    }),
    [metals],
  );

  const editFields = useMemo(
    () => [
      { name: "ownerName",    label: "Owner name",    required: true },
      { name: "shopName",     label: "Shop name",     required: true },
      { name: "businessType", label: "Business type", nullable: true },
      { name: "gstNumber",    label: "GST number",    nullable: true },
      { name: "city",         label: "City",          nullable: true },
      { name: "state",        label: "State",         nullable: true },
      { name: "pincode",      label: "Pincode",       nullable: true },
      { name: "addressLine1", label: "Address", type: "textarea", nullable: true, fullWidth: true },
      creditLimitField,
    ],
    [creditLimitField],
  );

  if (loading) return <SkeletonShopkeeperDetails />;

  if (error) return <FormAlert>{error}</FormAlert>;

  if (!state.details) {
    return <div className="shopkeeper-details__state">No shopkeeper found.</div>;
  }

  const ms = state.details?.metalSummary;
  const summary = {
    primaryMetal:   ms?.primaryMetal,
    totalDue:       ms?.totalDue,
    totalDelivered: ms?.totalDelivered,
    totalReceived:  ms?.totalReceived,
    availableCredit: state.analytics?.metalSummary?.creditRemaining,
  };
  const metalName = ms?.primaryMetal?.name ?? "Metal";
  const ledgerSummary = state.ledgerSummary;

  return (
    <div className="shopkeeper-details">

      <ShopkeeperHeaderCard
        details={state.details}
        onEdit={() => setModal({ open: true, type: "edit" })}
        onEditLimits={() => setModal({ open: true, type: "limits" })}
      />
      <OverviewAnalyticsCard shopkeeperId={id} refreshKey={analyticsKey} />


      <div className="shopkeeper-details__tabs" role="tablist" aria-label="Shopkeeper sections">
        {tabs.map((tab) => (
          <button
            className={activeTab === tab ? "is-active" : ""}
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Overview" && (
        <ShopOverview
          shopkeeperId={id}
          ledgerSummary={ledgerSummary}
          ordersSummary={state.ordersSummary}
          recentActivity={state.recentActivity}
          metalName={metalName}
        />
      )}

      {activeTab === "Orders (Khatabook)" && <KhatabookPage shopkeeperId={id} shopName={state.details?.shop?.shopName} onCollectionAdded={handleCollectionAdded} view="orders" />}

      {activeTab === "Ledger" && <KhatabookPage shopkeeperId={id} shopName={state.details?.shop?.shopName} onCollectionAdded={handleCollectionAdded} view="ledger" />}

      <ResourceFormModal
        description="Update shopkeeper profile and optional per-metal credit limits."
        fields={modal.type === "limits" ? [creditLimitField] : editFields}
        open={modal.open}
        record={{
          ownerName:    state.details.owner?.ownerName,
          shopName:     state.details.shop?.shopName,
          businessType: state.details.shop?.businessType,
          gstNumber:    state.details.shop?.gstNumber,
          city:         state.details.address?.city,
          state:        state.details.address?.state,
          pincode:      state.details.address?.pincode,
          addressLine1: state.details.address?.addressLine1,
          creditLimits: state.details.creditLimits ?? [],
        }}
        submitLabel="Save changes"
        title={modal.type === "limits" ? "Update metal limits" : "Edit shopkeeper"}
        onClose={() => setModal({ open: false, type: null })}
        onSubmit={async (payload) => {
          await shopkeeperService.update(id, payload);
          await loadDetails();
        }}
      />
    </div>
  );
}
