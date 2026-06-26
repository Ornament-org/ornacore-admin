import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, LockKeyhole, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { BrandMark } from "../../../components/common/BrandMark.jsx";
import { Button } from "../../../components/common/Button.jsx";
import { FormAlert } from "../../../components/common/FormAlert.jsx";
import { FormField } from "../../../components/common/FormField.jsx";
import { apiErrorMessage } from "../../../services/apiClient.js";
import { authService } from "../../../services/authService.js";
import { authStorage } from "../authStorage.js";
import { authActions } from "../store/authSlice.js";
import "../Auth.scss";

const schema = z
  .object({
    currentPassword: z.string().min(1, "Temporary password is required"),
    newPassword: z
      .string()
      .min(8, "Use at least 8 characters")
      .max(72)
      .regex(/[a-z]/, "Include a lowercase letter")
      .regex(/[A-Z]/, "Include an uppercase letter")
      .regex(/[0-9]/, "Include a number"),
    confirmPassword: z.string(),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export function ChangePasswordPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const submit = async ({ currentPassword, newPassword }) => {
    setSaving(true);
    setError(null);
    try {
      await authService.changePassword({ currentPassword, newPassword });
      authStorage.clear();
      dispatch(authActions.sessionCleared());
      navigate("/login", {
        replace: true,
        state: { message: "Password changed successfully. Sign in with your new password." },
      });
    } catch (requestError) {
      setError(apiErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="password-setup-page">
      <section className="password-setup-card">
        <BrandMark />
        <span className="password-setup-icon">
          <KeyRound size={24} />
        </span>
        <div className="password-setup-heading">
          <h1>Create your private password</h1>
          <p>
            Your emailed password is temporary. Replace it before accessing the OrnaCore toolbox.
          </p>
        </div>
        {error && <FormAlert icon={LockKeyhole}>{error}</FormAlert>}
        <form className="login-form" onSubmit={handleSubmit(submit)}>
          <FormField label="Temporary password" error={errors.currentPassword?.message}>
            <input
              type="password"
              autoComplete="current-password"
              {...register("currentPassword")}
            />
          </FormField>
          <FormField label="New password" error={errors.newPassword?.message}>
            <input type="password" autoComplete="new-password" {...register("newPassword")} />
          </FormField>
          <FormField label="Confirm new password" error={errors.confirmPassword?.message}>
            <input type="password" autoComplete="new-password" {...register("confirmPassword")} />
          </FormField>
          <Button type="submit" loading={saving} icon={ShieldCheck}>
            Save password
          </Button>
        </form>
      </section>
    </main>
  );
}
