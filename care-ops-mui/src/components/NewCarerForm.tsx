import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import { REGIONS } from "../types";

// Mirrors micro-fes form pattern: react-hook-form + yup schema via @hookform/resolvers.
// Validation lives in the schema; the schema also drives the TS type of the form values.
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
    <Box component="form" onSubmit={handleSubmit(submit)} noValidate sx={{ mb: 3 }}>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="flex-start">
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Carer name"
              size="small"
              error={!!errors.name}
              helperText={errors.name?.message}
              sx={{ width: 240 }}
            />
          )}
        />
        <Controller
          name="region"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              select
              label="Region"
              size="small"
              error={!!errors.region}
              helperText={errors.region?.message}
              sx={{ width: 200 }}
            >
              {REGIONS.map((r) => (
                <MenuItem value={r} key={r}>
                  {r}
                </MenuItem>
              ))}
            </TextField>
          )}
        />
        <Button type="submit" variant="contained" disabled={isSubmitting} sx={{ mt: 0.5 }}>
          Add carer
        </Button>
      </Stack>
    </Box>
  );
}
