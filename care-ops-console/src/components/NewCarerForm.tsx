import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { REGIONS } from "../types";
import { TextField, SelectField } from "./ui/Field";
import Button from "./ui/Button";

// Same react-hook-form + yup pattern as care-ops-mui's NewCarerForm.
const schema = yup.object({
  name: yup.string().required("Name is required").min(2, "Too short"),
  region: yup.string().oneOf(REGIONS as unknown as string[]).required("Pick a region"),
});

type FormValues = yup.InferType<typeof schema>;

export default function NewCarerForm({ onSubmit }: { onSubmit: (values: FormValues) => void }) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: { name: "", region: "" },
  });

  const submit = (values: FormValues) => {
    onSubmit(values);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="mb-4">
      <div className="flex gap-3 items-start flex-wrap">
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Carer name"
              error={errors.name?.message}
              className="w-60"
            />
          )}
        />
        <Controller
          name="region"
          control={control}
          render={({ field }) => (
            <SelectField {...field} label="Region" error={errors.region?.message} className="w-48">
              <option value="">—</option>
              {REGIONS.map((r) => (
                <option value={r} key={r}>
                  {r}
                </option>
              ))}
            </SelectField>
          )}
        />
        <Button type="submit" disabled={isSubmitting} className="mt-[22px]">
          Add carer
        </Button>
      </div>
    </form>
  );
}
