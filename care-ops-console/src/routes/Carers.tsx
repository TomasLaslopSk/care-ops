import { useEffect, useState } from "react";
import { useShallow } from "zustand/shallow";
import useCarersStore from "../store/useCarersStore";
import useGetCarers from "../hooks/useGetCarers";
import Filters from "../components/Filters";
import CarersTable from "../components/CarersTable";
import NewCarerForm from "../components/NewCarerForm";

export default function Carers() {
  const { region, status } = useCarersStore(
    useShallow((s) => ({ region: s.region, status: s.status })),
  );
  const { data, isLoading, isError } = useGetCarers(region, status);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Carers</h1>
      <p className="text-muted text-sm mb-6">Filterable roster backed by the shared care-api.</p>

      <NewCarerForm onSubmit={(v) => setToast(`Would create carer: ${v.name} (${v.region})`)} />
      <Filters />
      <CarersTable carers={data?.data ?? []} isLoading={isLoading} isError={isError} />

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-success text-white text-sm px-4 py-2 rounded-lg shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
