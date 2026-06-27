import { Card } from "../../../components/common/Card.jsx";

export function CollectionTypeSelector({ collectionType, onChange, metalName = "Metal" }) {
  return (
    <Card className="collection-type-selector">
      <h3>Select Collection Type</h3>
      <div className="collection-type-selector__options">
        <label className={collectionType === "metal" ? "is-selected" : ""}>
          <input
            type="radio"
            name="collectionType"
            value="metal"
            checked={collectionType === "metal"}
            onChange={() => onChange("metal")}
          />
          <div>
            <strong>{metalName} Received</strong>
            <small>Add {metalName.toLowerCase()} directly</small>
          </div>
        </label>
        <label className={collectionType === "cash" ? "is-selected" : ""}>
          <input
            type="radio"
            name="collectionType"
            value="cash"
            checked={collectionType === "cash"}
            onChange={() => onChange("cash")}
          />
          <div>
            <strong>Cash Received</strong>
            <small>Add cash & convert to {metalName.toLowerCase()}</small>
          </div>
        </label>
      </div>
    </Card>
  );
}
