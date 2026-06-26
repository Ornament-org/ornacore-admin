import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card } from "../../../components/common/Card.jsx";
import { FormAlert } from "../../../components/common/FormAlert.jsx";
import { khatabookService } from "../../../services/resourceServices.js";
import { PaymentHeaderCard } from "../components/PaymentHeaderCard.jsx";
import { CurrentPositionCard } from "../components/CurrentPositionCard.jsx";
import { CollectionTypeSelector } from "../components/CollectionTypeSelector.jsx";
import { GoldCollectionForm } from "../components/GoldCollectionForm.jsx";
import { CashCollectionForm } from "../components/CashCollectionForm.jsx";
import { SettlementPreviewCard } from "../components/SettlementPreviewCard.jsx";
import { PaymentActions } from "../components/PaymentActions.jsx";
import { SkeletonPaymentPage } from "../../../components/skeleton/SkeletonPaymentPage.jsx";
import "./AddReceivedPaymentPage.scss";

export function AddReceivedPaymentPage() {
  const { shopkeeperId } = useParams();
  const navigate = useNavigate();
  const [shopkeeper, setShopkeeper] = useState(null);
  const [metals, setMetals] = useState([]);
  const [selectedMetalId, setSelectedMetalId] = useState("");
  const [position, setPosition] = useState(null);
  const [collectionType, setCollectionType] = useState("metal");
  const [goldReceived, setGoldReceived] = useState("");
  const [cashAmount, setCashAmount] = useState("");
  const [cashRate, setCashRate] = useState("");
  const [note, setNote] = useState("");
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const selectedMetal = metals?.find((m) => String(m.metal.id) === String(selectedMetalId))?.metal;

  useEffect(() => {
    loadShopkeeperData();
  }, [shopkeeperId]);

  useEffect(() => {
    if (selectedMetalId) {
      loadPosition();
    }
  }, [selectedMetalId]);

  useEffect(() => {
    if (selectedMetalId && (goldReceived || (cashAmount && cashRate))) {
      loadPreview();
    } else {
      setPreview(null);
    }
  }, [selectedMetalId, collectionType, goldReceived, cashAmount, cashRate]);

  const loadShopkeeperData = async () => {
    try {
      setLoading(true);
      const [summaryData, metalsData] = await Promise.all([
        khatabookService.summary(shopkeeperId),
        khatabookService.metals(shopkeeperId),
      ]);
      setShopkeeper(summaryData.shopkeeper);
      setMetals(metalsData);
      if (metalsData.length > 0) {
        setSelectedMetalId(String(metalsData[0].metal.id));
      }
    } catch (err) {
      setError(err.message || "Failed to load shopkeeper data");
    } finally {
      setLoading(false);
    }
  };

  const loadPosition = async () => {
    try {
      const data = await khatabookService.paymentPreview(shopkeeperId, selectedMetalId);
      setPosition(data);
    } catch (err) {
      console.error("Failed to load position:", err);
    }
  };

  const loadPreview = async () => {
    try {
      const payload = {
        shopkeeperId: Number(shopkeeperId),
        metalId: Number(selectedMetalId),
      };
      if (collectionType === "metal" && goldReceived) {
        payload.receivedQuantity = Number(goldReceived);
      } else if (collectionType === "cash" && cashAmount && cashRate) {
        payload.cashAmount = Number(cashAmount);
        payload.metalRate = Number(cashRate);
      } else {
        setPreview(null);
        return;
      }
      const data = await khatabookService.previewOrder(payload);
      setPreview(data);
    } catch (err) {
      console.error("Failed to load preview:", err);
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError("");
      const payload = {
        shopkeeperId: Number(shopkeeperId),
        metalId: Number(selectedMetalId),
        notes: note || null,
      };
      if (collectionType === "metal") {
        payload.receivedQuantity = Number(goldReceived);
        await khatabookService.createGoldCollection(payload);
      } else {
        payload.cashAmount = Number(cashAmount);
        payload.metalRate = Number(cashRate);
        await khatabookService.createCashCollection(payload);
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
    (collectionType === "metal" && !goldReceived) ||
    (collectionType === "cash" && (!cashAmount || !cashRate));

  if (loading) return <SkeletonPaymentPage />;
  if (error && !shopkeeper) return <FormAlert>{error}</FormAlert>;

  return (
    <div className="payment-page">
      <div className="payment-page__header">
        <div>
          <h1>Add Received Payment</h1>
          <p>Add gold or cash payment received from {shopkeeper?.shopName}</p>
        </div>
        <PaymentActions onCancel={() => navigate(-1)} onSubmit={handleSubmit} disabled={isSubmitDisabled} />
      </div>

      {error && <FormAlert>{error}</FormAlert>}

      <PaymentHeaderCard shopkeeper={shopkeeper} />

      <div className="payment-page__grid">
        <CurrentPositionCard position={position} metal={selectedMetal} />
        <CollectionTypeSelector collectionType={collectionType} onChange={setCollectionType} />
      </div>

      <div className="payment-page__grid">
        {collectionType === "metal" ? (
          <GoldCollectionForm
            value={goldReceived}
            onChange={setGoldReceived}
            note={note}
            onNoteChange={setNote}
          />
        ) : (
          <CashCollectionForm
            amount={cashAmount}
            onAmountChange={setCashAmount}
            rate={cashRate}
            onRateChange={setCashRate}
            note={note}
            onNoteChange={setNote}
            convertedValue={preview?.fineDelivered}
          />
        )}
        {preview && <SettlementPreviewCard preview={preview} />}
      </div>
    </div>
  );
}
