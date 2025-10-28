import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  CircularProgress,
  Stack
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import AddClientModal from "./AddClientModal";
import { getClients, searchClients } from "../../api/clientsApi";

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [filters, setFilters] = useState({
    city: false,
    state: false,
    vendor: false,
  });
  const [loading, setLoading] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const navigate = useNavigate();

  // ✅ Fetch all clients initially
  const fetchClients = async () => {
    try {
      setLoading(true);
      const res = await getClients();
      const list = Array.isArray(res.data) ? res.data.reverse() : [];
      setClients(list);
    } catch (e) {
      console.error("❌ Failed to load clients", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
    window.addEventListener("clientAdded", fetchClients);
    return () => window.removeEventListener("clientAdded", fetchClients);
  }, []);

  // ✅ Handle Search (combined filters)
 const handleSearch = async () => {
  const query = searchText.trim();
  if (!query) {
    fetchClients();
    return;
  }

  try {
    setLoading(true);

    // Split by comma
    const parts = query.split(",").map((p) => p.trim()).filter(Boolean);

    const payload = {};

    // Build payload based on checkbox order
    const activeFilters = [];
    if (filters.state) activeFilters.push("state");
    if (filters.city) activeFilters.push("city");
    if (filters.vendor) activeFilters.push("vendor_name");

    // ✅ Smart assignment logic
    activeFilters.forEach((field, index) => {
      if (parts[index]) {
        payload[field] = parts[index];
      }
    });

    // ✅ No checkboxes → local name search
    if (activeFilters.length === 0) {
      const lower = query.toLowerCase();
      setClients((prev) =>
        prev.filter((c) => (c?.name || "").toLowerCase().includes(lower))
      );
      return;
    }

    console.log("🧠 Smart payload →", payload);
    const res = await searchClients(payload);

    const list = Array.isArray(res.data.results)
      ? res.data.results
      : Array.isArray(res.data)
      ? res.data
      : [];

    setClients(list);
  } catch (e) {
    console.error("❌ Search failed:", e.response ? e.response.data : e);
  } finally {
    setLoading(false);
  }
};


  const handleReset = () => {
    setSearchText("");
    setFilters({ city: false, state: false, vendor: false });
    fetchClients();
  };

  return (
    <Box sx={{ p: 4 }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>Clients</Typography>
        <Button variant="contained" onClick={() => setAddOpen(true)}>
          + New Client
        </Button>
      </Box>

      {/* 🔍 Search Bar and Filter Labels */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{ alignItems: "center", mb: 3 }}
      >
        <TextField
          placeholder="Search..."
          fullWidth
          size="small"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />

        {/* Label Checkboxes */}
        <Stack direction="row" spacing={2}>
          <FormControlLabel
            control={
              <Checkbox
                checked={filters.state}
                onChange={(e) =>
                  setFilters({ ...filters, state: e.target.checked })
                }
              />
            }
            label="State"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={filters.city}
                onChange={(e) =>
                  setFilters({ ...filters, city: e.target.checked })
                }
              />
            }
            label="City"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={filters.vendor}
                onChange={(e) =>
                  setFilters({ ...filters, vendor: e.target.checked })
                }
              />
            }
            label="Vendor"
          />
        </Stack>

        <Button variant="contained" onClick={handleSearch} disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </Button>
        <Button variant="outlined" onClick={handleReset}>Reset</Button>
      </Stack>

      {/* Results */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
          <CircularProgress />
        </Box>
      ) : clients.length === 0 ? (
        <Typography>No clients found</Typography>
      ) : (
        <Grid container spacing={2}>
          {clients.map((c) => (
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
