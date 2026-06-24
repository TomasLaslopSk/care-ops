import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import NewVisitForm from "../components/NewVisitForm";

export default function Scheduling() {
  const navigate = useNavigate();
  return (
    <Box>
      <Typography variant="h5" fontWeight={700}>
        Scheduling
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Schedule a new visit and define the carer's tasks.
      </Typography>
      <NewVisitForm onDone={() => navigate("/visits")} />
    </Box>
  );
}
