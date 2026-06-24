import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import { api } from "../lib/axios";
import useAuthStore from "../store/useAuthStore";
import type { LoginResponse } from "../types";

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
      const { data } = await api.post<LoginResponse>("/auth/login", { ...values, app: "ops" });
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
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", p: 2 }}>
      <Paper sx={{ width: "100%", maxWidth: 380, p: 3 }}>
        <Typography variant="h6" fontWeight={700}>
          Care
          <Box component="span" sx={{ color: "secondary.main" }}>
            Ops
          </Box>
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Sign in to continue.
        </Typography>

        <Box component="form" onSubmit={handleSubmit(submit)} noValidate>
          <Stack spacing={2}>
            <TextField
              label="Email"
              type="email"
              size="small"
              error={!!errors.email}
              helperText={errors.email?.message}
              {...register("email")}
            />
            <TextField
              label="Password"
              type="password"
              size="small"
              error={!!errors.password}
              helperText={errors.password?.message}
              {...register("password")}
            />
            {serverError && <Alert severity="error">{serverError}</Alert>}
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              {isSubmitting ? "Signing in…" : "Sign in"}
            </Button>
          </Stack>
        </Box>

        <Box sx={{ mt: 3, pt: 2, borderTop: "1px solid", borderColor: "divider" }}>
          <Typography variant="caption" color="text.secondary">
            Demo accounts (click to fill):
          </Typography>
          <Stack spacing={0.5} sx={{ mt: 1 }}>
            {DEMO.map(([email, pw, label]) => (
              <Link
                key={email}
                component="button"
                type="button"
                underline="none"
                onClick={() => {
                  setValue("email", email);
                  setValue("password", pw);
                }}
                sx={{ textAlign: "left", fontSize: "0.75rem", color: "text.secondary" }}
              >
                <Box component="span" sx={{ color: "primary.main" }}>
                  {email}
                </Box>{" "}
                — {label}
              </Link>
            ))}
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}
