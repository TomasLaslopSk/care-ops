import useGetClients from "../hooks/useGetClients";
import Card from "../components/ui/Card";

export default function Clients() {
  const { data, isLoading, isError } = useGetClients();
  const clients = data?.data ?? [];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Clients</h1>
      <p className="text-muted text-sm mb-6">
        People receiving care{data ? ` — ${data.total}` : ""}.
      </p>

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
    </div>
  );
}
