import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import CircularProgress from "@mui/material/CircularProgress";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import { Link as RouterLink } from "react-router-dom";
import useGetVisits from "../hooks/useGetVisits";
import useGetCarers from "../hooks/useGetCarers";
import useAssignVisit from "../hooks/useAssignVisit";
import type { VisitStatus } from "../types";

const colorByStatus: Record<VisitStatus, "default" | "info" | "success" | "error"> = {
  scheduled: "default",
  in_progress: "info",
  completed: "success",
  missed: "error",
};

const fmt = (iso: string) =>
  new Date(iso).toLocaleString([], { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

export default function Visits() {
  const { data, isLoading, isError } = useGetVisits(200);
  const { data: carers } = useGetCarers("", "");
  const assign = useAssignVisit();
  const visits = data?.data ?? [];

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <Typography variant="h5" fontWeight={700}>
          Visits
        </Typography>
        <Button variant="contained" component={RouterLink} to="/scheduling">
          New visit
        </Button>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Live schedule from care-api{data ? ` — showing ${visits.length} of ${data.total}` : ""}. Reassign a carer in the Carer column.
      </Typography>

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      ) : isError ? (
        <Typography color="error" sx={{ py: 4 }}>
          Failed to load visits.
        </Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Visit</TableCell>
                <TableCell>Client</TableCell>
                <TableCell>Carer (reassign)</TableCell>
                <TableCell>Scheduled</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {visits.map((v) => (
                <TableRow key={v.id} hover>
                  <TableCell>
                    <Link component={RouterLink} to={`/visits/${v.id}`} underline="hover">
                      {v.id}
                    </Link>
                  </TableCell>
                  <TableCell>{v.client}</TableCell>
                  <TableCell>
                    <Select
                      size="small"
                      value={v.carerId}
                      disabled={assign.isPending}
                      onChange={(e) => assign.mutate({ visitId: v.id, carerId: e.target.value })}
                      sx={{ minWidth: 160 }}
                    >
                      {(carers?.data ?? []).map((c) => (
                        <MenuItem key={c.id} value={c.id}>
                          {c.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </TableCell>
                  <TableCell>{fmt(v.scheduledAt)}</TableCell>
                  <TableCell>
                    <Chip
                      label={v.status.replace("_", " ")}
                      color={colorByStatus[v.status]}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
