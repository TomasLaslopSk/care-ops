import { useEffect, useState } from "react";
import useGetClients from "../hooks/useGetClients";
import useCreateClient from "../hooks/useCreateClient";
import NewClientForm from "../components/NewClientForm";
import Card from "../components/ui/Card";

export default function Clients() {
  const { data, isLoading, isError } = useGetClients();
  const createClient = useCreateClient();
  const [toast, setToast] = useState<string | null>(null);
  const clients = data?.data ?? [];

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Clients</h1>
      <p className="text-muted text-sm mb-6">
        People receiving care{data ? ` — ${data.total}` : ""}.
      </p>

      <NewClientForm
        onSubmit={(v) =>
          createClient.mutate(v, {
            onSuccess: (c) => setToast(`Client created: ${c.name} (${c.region})`),
            onError: () => setToast("Failed to create client"),
          })
        }
      />

      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="h-6 w-6 rounded-full border-2 border-border border-t-primary animate-spin" />
        </div>
      ) : isError ? (
        <p className="text-danger py-8">Failed to load clients.</p>
      ) : clients.length === 0 ? (
        <p className="text-muted py-8">No clients yet.</p>
      ) : (
        <Card className="p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted border-b border-border">
                <th className="px-4 py-2 font-medium">ID</th>
                <th className="px-4 py-2 font-medium">Name</th>
                <th className="px-4 py-2 font-medium">Region</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c.id} className="border-b border-border/60 hover:bg-surface-2 transition-colors">
                  <td className="px-4 py-2">{c.id}</td>
                  <td className="px-4 py-2">{c.name}</td>
                  <td className="px-4 py-2">{c.region}</td>
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
