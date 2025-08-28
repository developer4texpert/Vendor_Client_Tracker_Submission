// src/components/clients/Clients.js
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AddClientModal from "./AddClient";
import api from "../../api/axios";

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");

  // pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // modals
  const [addOpen, setAddOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  // **NEW: loading state**
  const [loading, setLoading] = useState(true);

  // **UPDATED fetchClients (uses axios response.data and sets loading in finally)**
  const fetchClients = async () => {
    setLoading(true);
    try {
      // use the same api instance (axios) instead of fetch+response.json()
      const response = await api.get("client/GetAllClients/", {
        headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
      });
      const data = response.data;
      const reversed = Array.isArray(data) ? data.slice().reverse() : [];
      setClients(reversed); // latest client first
      setFiltered(reversed);
    } catch (error) {
      console.error("Error fetching clients", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
    window.addEventListener("clientAdded", fetchClients);
    return () => window.removeEventListener("clientAdded", fetchClients);
  }, []);

  // handle search
  useEffect(() => {
    const result = clients.filter((c) =>
      (c?.name || "").toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(result);
  }, [search, clients]);

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  return (
    <Box sx={{ p: 4 }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Clients
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setAddOpen(true)}
          sx={{
            backgroundImage: "linear-gradient(90deg, #0ea5e9, #06b6d4)",
            fontWeight: 600,
          }}
        >
          Add New Client
        </Button>
      </Box>

      {/* Search bar */}
      <TextField
        placeholder="Search clients..."
        variant="outlined"
        fullWidth
        size="small"
        sx={{ mb: 3 }}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* If loading show simple message inside a Paper, otherwise show table */}
      {loading ? (
        <Paper sx={{ borderRadius: 3, boxShadow: 3, p: 4 }}>
          <Typography align="center">Loading clients...</Typography>
        </Paper>
      ) : (
        <Paper sx={{ borderRadius: 3, boxShadow: 3 }}>
          <TableContainer>
            <Table>
              <TableHead sx={{ backgroundColor: "#f1f5f9" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold" }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Address</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>State</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((client) => (
                    <TableRow key={client.id} hover>
                      <TableCell>{client.name}</TableCell>
                      <TableCell>{client.city}</TableCell>
                      <TableCell>{client.state || "—"}</TableCell>
                      <TableCell>
                        <span
                          style={{
                            color:
                              client.status === "Active" ? "#16a34a" : "#dc2626",
                            fontWeight: 600,
                          }}
                        >
                          {client.status || "Active"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          startIcon={<VisibilityIcon />}
                          onClick={() => {
                            setSelectedClient(client);
                            setDetailsOpen(true);
                          }}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <TablePagination
            component="div"
            count={filtered.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      )}

      {/* Add Client Modal */}
      <AddClientModal open={addOpen} onClose={() => setAddOpen(false)} />

      {/* View Details Modal */}
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Client Details</DialogTitle>
        <DialogContent dividers>
          {selectedClient && (
            <Box>
              <Typography variant="h6">{selectedClient.name}</Typography>
              <Typography>📍 {selectedClient.city}</Typography>
              <Typography>🏙️ {selectedClient.state}</Typography>
              <Typography>👤 {selectedClient.contact_name}</Typography>
              <Typography>📧 {selectedClient.contact_email}</Typography>
              <Typography>📞 {selectedClient.contact_phone}</Typography>
              <Typography>Status: {selectedClient.status || "Active"}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Clients;
