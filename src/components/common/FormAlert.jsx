import "./FormAlert.scss";

export function FormAlert({ children, icon: Icon, role = "alert" }) {
  return (
    <div className="form-alert" role={role}>
      {Icon && <Icon size={17} />}
      <span>{children}</span>
    </div>
  );
}
