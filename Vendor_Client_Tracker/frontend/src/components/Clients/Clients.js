import React, { useEffect, useState } from "react";
import { Box, Typography, Grid, TextField, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import AddClientModal from "./AddClientModal";
import { getClients } from "../../api/clientsApi";

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const navigate = useNavigate();

  const fetchClients = async () => {
    try {
      const res = await getClients();
      const list = Array.isArray(res.data) ? res.data.reverse() : [];
      setClients(list);
      setFiltered(list);
    } catch (e) {
      console.error("❌ Failed to load clients", e);
    }
  };

  useEffect(() => {
    fetchClients();
    window.addEventListener("clientAdded", fetchClients);
    return () => window.removeEventListener("clientAdded", fetchClients);
  }, []);

  useEffect(() => {
    setFiltered(
      clients.filter((c) => (c?.name || "").toLowerCase().includes(search.toLowerCase()))
    );
  }, [search, clients]);

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>Clients</Typography>
        <Button variant="contained" onClick={() => setAddOpen(true)}>+ New Client</Button>
      </Box>

      <TextField
        placeholder="Search a client..."
        fullWidth
        size="small"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 3 }}
      />

      {filtered.length === 0 ? (
        <Typography>No clients found</Typography>
      ) : (
        <Grid container spacing={2}>
          {filtered.map((c) => (
            <Grid
              item xs={6} sm={4} md={3} lg={2}
              key={c.id}
              onClick={() => navigate(`/dashboard/clients/${c.id}`)}
            >
              <Box
                sx={{
                  borderRadius: 2,
                  bgcolor: "#fff",
                  border: "1px solid #e5e7eb",
                  textAlign: "center",
                  px: 2,
                  py: 1.5,
                  cursor: "pointer",
                  "&:hover": { bgcolor: "#f0f9ff", borderColor: "#3b82f6" },
                }}
              >
                <Typography fontWeight={500}>{c.name}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      )}

      <AddClientModal open={addOpen} onClose={() => setAddOpen(false)} />
    </Box>
  );
};

export default Clients;
