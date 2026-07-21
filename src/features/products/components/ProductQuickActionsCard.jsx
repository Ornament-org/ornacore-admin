import { Save, Trash2 } from "lucide-react";
import { Button } from "../../../components/common/Button.jsx";
import { Card } from "../../../components/common/Card.jsx";

export function ProductQuickActionsCard({ saving, onSaveDraft, editing, isDraft, deleting, onDelete }) {
  return (
    <Card className="product-quick-actions-card">
      <div className="card-heading">
        <h2>Quick Actions</h2>
      </div>
      <div className="product-quick-actions-card__list">
        <Button variant="secondary" icon={Save} loading={saving} onClick={onSaveDraft}>
          Save Draft
        </Button>
        {editing && isDraft && (
          <Button variant="danger" icon={Trash2} loading={deleting} onClick={onDelete}>
            Delete Draft
          </Button>
        )}
      </div>
    </Card>
  );
}
