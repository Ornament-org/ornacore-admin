import "./FormAlert.scss";

export function FormAlert({ children, icon: Icon, role = "alert", tone = "error" }) {
  return (
    <div className={`form-alert form-alert--${tone}`} role={role}>
      {Icon && <Icon size={17} />}
      <span>{children}</span>
    </div>
  );
}
