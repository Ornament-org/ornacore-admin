import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FormAlert } from "../../../components/common/FormAlert.jsx";
import { khatabookService } from "../../../services/resourceServices.js";
import { PaymentHeaderCard } from "../components/PaymentHeaderCard.jsx";
import { CurrentPositionCard } from "../components/CurrentPositionCard.jsx";
import { CollectionTypeSelector } from "../components/CollectionTypeSelector.jsx";
import { MetalCollectionForm } from "../components/MetalCollectionForm.jsx";
import { CashCollectionForm } from "../components/CashCollectionForm.jsx";
import { PaymentActions } from "../components/PaymentActions.jsx";
import { SkeletonPaymentPage } from "../../../components/skeleton/SkeletonPaymentPage.jsx";
import "./AddReceivedPaymentPage.scss";

export function AddReceivedPaymentPage() {
  const { shopkeeperId } = useParams();
  const navigate = useNavigate();

  const [shopkeeper, setShopkeeper] = useState(null);
  const [metals, setMetals]         = useState([]);
  const [selectedMetalId, setSelectedMetalId] = useState("");

  const [collectionType, setCollectionType] = useState("metal");
  const [metalReceived, setMetalReceived]   = useState("");
  const [cashAmount, setCashAmount]         = useState("");
  const [cashRate, setCashRate]             = useState("");
  const [note, setNote]                     = useState("");
  const [loading, setLoading]               = useState(true);
  const [submitting, setSubmitting]         = useState(false);
  const [error, setError]                   = useState("");

  const selectedMetal    = metals?.find((m) => String(m.metal.id) === String(selectedMetalId));
  const selectedMetalObj = selectedMetal?.metal;
  const metalName        = selectedMetalObj?.name ?? "Metal";

  const position = selectedMetal
    ? {
        outstandingDue:  selectedMetal.outstandingDue,
        creditLimit:     selectedMetal.creditLimit,
        availableCredit: selectedMetal.availableCredit,
      }
    : null;

  useEffect(() => {
    loadShopkeeperData();
  }, [shopkeeperId]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadShopkeeperData = async () => {
    try {
      setLoading(true);
      const [summaryData, metalsData] = await Promise.all([
        khatabookService.summary(shopkeeperId),
        khatabookService.metals(shopkeeperId),
      ]);
      setShopkeeper(summaryData.shopkeeper);
      const list = Array.isArray(metalsData) ? metalsData : (metalsData?.data ?? []);
      setMetals(list);
      if (list.length > 0) setSelectedMetalId(String(list[0].metal.id));
    } catch (err) {
      setError(err.message || "Failed to load shopkeeper data");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError("");
      const base = {
        shopkeeperId: Number(shopkeeperId),
        metalId:      Number(selectedMetalId),
        notes:        note || null,
      };
      if (collectionType === "metal") {
        await khatabookService.createMetalCollection({
          ...base,
          receivedQuantity: Number(metalReceived),
        });
      } else {
        await khatabookService.createCashCollection({
          ...base,
          cashAmount: Number(cashAmount),
          metalRate:  Number(cashRate),
        });
      }
      navigate(`/shopkeepers/${shopkeeperId}/khatabook`, {
        state: { message: "Payment received successfully" },
      });
    } catch (err) {
      setError(err.response?.data?.error?.message || err.message || "Failed to receive payment");
    } finally {
      setSubmitting(false);
    }
  };

  const isSubmitDisabled =
    submitting ||
    !selectedMetalId ||
    (collectionType === "metal" && !(Number(metalReceived) > 0)) ||
    (collectionType === "cash" && (!(Number(cashAmount) > 0) || !(Number(cashRate) > 0)));

  if (loading) return <SkeletonPaymentPage />;
  if (error && !shopkeeper) return <FormAlert>{error}</FormAlert>;

  return (
    <div className="payment-page">
      <div className="payment-page__header">
        <div>
          <h1>Add Received Payment</h1>
          <p>Add {metalName.toLowerCase()} or cash payment received from {shopkeeper?.shopName}</p>
        </div>
        <PaymentActions onCancel={() => navigate(-1)} onSubmit={handleSubmit} disabled={isSubmitDisabled} />
      </div>

      {error && <FormAlert>{error}</FormAlert>}

      <PaymentHeaderCard shopkeeper={shopkeeper} />

      <div className="payment-page__grid">
        <CurrentPositionCard position={position} metal={selectedMetalObj} />
        <CollectionTypeSelector
          collectionType={collectionType}
          metalName={metalName}
          onChange={(type) => {
            setCollectionType(type);
            if (type === "cash")  setMetalReceived("");
            if (type === "metal") { setCashAmount(""); setCashRate(""); }
          }}
        />
      </div>

      <div className="payment-page__grid">
        {collectionType === "metal" ? (
          <MetalCollectionForm
            value={metalReceived}
            onChange={setMetalReceived}
            note={note}
            onNoteChange={setNote}
            metalName={metalName}
          />
        ) : (
          <CashCollectionForm
            amount={cashAmount}
            onAmountChange={setCashAmount}
            rate={cashRate}
            onRateChange={setCashRate}
            note={note}
            onNoteChange={setNote}
          />
        )}
      </div>
    </div>
  );
}
