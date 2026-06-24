import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import { useShallow } from "zustand/shallow";
import useCarersStore from "../store/useCarersStore";
import useGetCarers from "../hooks/useGetCarers";
import Filters from "../components/Filters";
import CarersList from "../components/CarersList";
import NewCarerForm from "../components/NewCarerForm";

export default function Carers() {
  const { region, status } = useCarersStore(
    useShallow((s) => ({ region: s.region, status: s.status })),
  );
  const { data, isLoading, isError } = useGetCarers(region, status);
  const [toast, setToast] = useState<string | null>(null);

  return (
    <Box>
      <Typography variant="h5" fontWeight={700}>
        Carers
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Filterable roster backed by the shared care-api.
      </Typography>

      <NewCarerForm onSubmit={(v) => setToast(`Would create carer: ${v.name} (${v.region})`)} />
      <Filters />
      <CarersList carers={data?.data ?? []} isLoading={isLoading} isError={isError} />

      <Snackbar
        open={!!toast}
        autoHideDuration={3000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" variant="filled">
          {toast}
        </Alert>
      </Snackbar>
    </Box>
  );
}
