import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { AxiosError } from "axios";
import useGetUsers from "../hooks/useGetUsers";
import useCreateUser from "../hooks/useCreateUser";
import { TextField, SelectField } from "../components/ui/Field";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import type { Role } from "../types";

const CREATABLE_ROLES = ["operator", "admin"] as const;

const schema = yup.object({
  name: yup.string().required("Name is required").min(2, "Too short"),
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup.string().required("Password is required").min(6, "At least 6 characters"),
  role: yup.string().oneOf(CREATABLE_ROLES as unknown as string[]).required("Pick a role"),
});

type FormValues = yup.InferType<typeof schema>;

const roleTone = (role: Role) =>
  role === "admin" ? "warning" : role === "operator" ? "info" : "neutral";

export default function Administration() {
  const { data, isLoading, isError } = useGetUsers();
  const createUser = useCreateUser();
  const [toast, setToast] = useState<string | null>(null);
  const users = data?.data ?? [];

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: { name: "", email: "", password: "", role: "" },
  });

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const submit = (values: FormValues) =>
    createUser.mutate(values as { name: string; email: string; password: string; role: "operator" | "admin" }, {
      onSuccess: (u) => {
        setToast(`User created: ${u.name} (${u.role})`);
        reset();
      },
      onError: (e) => {
        const msg = (e as AxiosError<{ error?: string }>)?.response?.data?.error;
        setToast(msg ? `Failed: ${msg}` : "Failed to create user");
      },
    });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Administration</h1>
      <p className="text-muted text-sm mb-6">
        Manage staff accounts. Only admins can see this page and create new operators or admins.
      </p>

      <Card className="mb-6">
        <h2 className="text-sm font-semibold mb-3">Create operator or admin</h2>
        <form onSubmit={handleSubmit(submit)} noValidate>
          <div className="flex gap-3 items-start flex-wrap">
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Full name" error={errors.name?.message} className="w-52" />
              )}
            />
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Email" type="email" error={errors.email?.message} className="w-60" />
              )}
            />
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Temporary password"
                  type="password"
                  error={errors.password?.message}
                  className="w-52"
                />
              )}
            />
            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <SelectField {...field} label="Role" error={errors.role?.message} className="w-40">
                  <option value="">—</option>
                  {CREATABLE_ROLES.map((r) => (
                    <option value={r} key={r}>
                      {r}
                    </option>
                  ))}
                </SelectField>
              )}
            />
            <Button type="submit" disabled={isSubmitting || createUser.isPending} className="mt-[22px]">
              Create user
            </Button>
          </div>
        </form>
      </Card>

      <h2 className="text-sm font-semibold mb-2">Staff accounts</h2>
      {isLoading ? (
        <p className="text-muted text-sm">Loading…</p>
      ) : isError ? (
        <p className="text-danger">Failed to load users.</p>
      ) : (
        <Card className="p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted border-b border-border">
                <th className="px-4 py-2 font-medium">Name</th>
                <th className="px-4 py-2 font-medium">Email</th>
                <th className="px-4 py-2 font-medium">Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-border/60 hover:bg-surface-2 transition-colors">
                  <td className="px-4 py-2">{u.name}</td>
                  <td className="px-4 py-2 text-muted">{u.email}</td>
                  <td className="px-4 py-2">
                    <Badge tone={roleTone(u.role)}>{u.role}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-success text-white text-sm px-4 py-2 rounded-lg shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
