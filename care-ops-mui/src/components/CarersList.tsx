import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import StatusChip from "./StatusChip";
import type { Carer } from "../types";

interface Props {
  carers: Carer[];
  isLoading: boolean;
  isError: boolean;
}

// Loading / empty / error states handled as one pattern (a JD point).
export default function CarersList({ carers, isLoading, isError }: Props) {
  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Typography color="error" sx={{ py: 4 }}>
        Failed to load carers.
      </Typography>
    );
  }

  if (carers.length === 0) {
    return (
      <Typography color="text.secondary" sx={{ py: 4 }}>
        No carers match these filters.
      </Typography>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Region</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="right">Visits / week</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {carers.map((c) => (
            <TableRow key={c.id} hover>
              <TableCell>{c.id}</TableCell>
              <TableCell>{c.name}</TableCell>
              <TableCell>{c.region}</TableCell>
              <TableCell>
                <StatusChip status={c.status} />
              </TableCell>
              <TableCell align="right">{c.visitsThisWeek}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
