import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import Paper from "@mui/material/Paper";
import CircularProgress from "@mui/material/CircularProgress";
import useGetClients from "../hooks/useGetClients";

export default function Clients() {
  const { data, isLoading, isError } = useGetClients();
  const clients = data?.data ?? [];

  return (
    <Box>
      <Typography variant="h5" fontWeight={700}>
        Clients
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        People receiving care{data ? ` — ${data.total}` : ""}.
      </Typography>

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      ) : isError ? (
        <Typography color="error" sx={{ py: 4 }}>
          Failed to load clients.
        </Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Region</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {clients.map((c) => (
                <TableRow key={c.id} hover>
                  <TableCell>{c.id}</TableCell>
                  <TableCell>{c.name}</TableCell>
                  <TableCell>{c.region}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
