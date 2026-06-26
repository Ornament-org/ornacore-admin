import { Card } from "../../../components/common/Card.jsx";

export function CollectionTypeSelector({ collectionType, onChange }) {
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
            <strong>Gold Received</strong>
            <small>Add gold directly</small>
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
            <small>Add cash & convert to gold</small>
          </div>
        </label>
      </div>
    </Card>
  );
}
