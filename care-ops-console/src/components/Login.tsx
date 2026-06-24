import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { api } from "../lib/axios";
import useAuthStore from "../store/useAuthStore";
import type { LoginResponse } from "../types";
import { TextField } from "./ui/Field";
import Button from "./ui/Button";
import Card from "./ui/Card";

type LoginResponseT = LoginResponse;

const schema = yup.object({
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup.string().required("Password is required"),
});
type FormValues = yup.InferType<typeof schema>;

const DEMO = [
  ["operator@care.test", "operator123", "Operator — sees everything"],
  ["amara@care.test", "carer123", "Carer — only own visits + chat"],
  ["relative@care.test", "relative123", "Relative — follows one carer"],
];

export default function Login() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: yupResolver(schema), defaultValues: { email: "", password: "" } });

  const submit = async (values: FormValues) => {
    setServerError(null);
    try {
      // app:"ops" -> backend only lets operators into CareOps.
      const { data } = await api.post<LoginResponseT>("/auth/login", { ...values, app: "ops" });
      setAuth(data.token, data.user);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      setServerError(
        status === 403
          ? "CareOps is for operators only. Carers and relatives use the mobile app."
          : "Invalid email or password.",
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <div className="font-bold text-lg mb-1">
          Care<span className="text-secondary">Ops</span>
        </div>
        <p className="text-muted text-sm mb-4">Sign in to continue.</p>

        <form onSubmit={handleSubmit(submit)} noValidate className="flex flex-col gap-3">
          <TextField label="Email" type="email" error={errors.email?.message} {...register("email")} />
          <TextField label="Password" type="password" error={errors.password?.message} {...register("password")} />
          {serverError && <p className="text-danger text-sm">{serverError}</p>}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <div className="mt-5 border-t border-border pt-3">
          <p className="text-xs text-muted mb-2">Demo accounts (click to fill):</p>
          <div className="flex flex-col gap-1">
            {DEMO.map(([email, pw, label]) => (
              <button
                key={email}
                type="button"
                onClick={() => {
                  setValue("email", email);
                  setValue("password", pw);
                }}
                className="text-left text-xs text-muted hover:text-text transition-colors"
              >
                <span className="text-primary">{email}</span> — {label}
              </button>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
