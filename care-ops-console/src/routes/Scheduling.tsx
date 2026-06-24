import { useNavigate } from "@tanstack/react-router";
import NewVisitForm from "../components/NewVisitForm";

export default function Scheduling() {
  const navigate = useNavigate();
  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Scheduling</h1>
      <p className="text-muted text-sm mb-6">Schedule a new visit and define the carer's tasks.</p>
      <NewVisitForm onDone={() => navigate({ to: "/visits" })} />
    </div>
  );
}
