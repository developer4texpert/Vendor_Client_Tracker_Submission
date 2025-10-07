// src/components/Vendors/Vendors.js
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Stack,
  Typography,
  Button,
  TextField,
  InputAdornment,
  CircularProgress,
  Grid,
  Snackbar,
  Alert,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { getVendors } from "../../api/vendorsApi";
import AddVendorModal from "./AddVendorModal";   // ✅ import modal

const Vendors = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [toast, setToast] = useState({ open: false, type: "success", msg: "" });

  // ✅ modal state
  const [addOpen, setAddOpen] = useState(false);

  const navigate = useNavigate();

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const res = await getVendors();
      const list = Array.isArray(res.data)
        ? res.data
        : res.data?.results || res.data?.data || [];
      setVendors(list);
    } catch (e) {
      console.error("❌ Failed to load vendors", e);
      setToast({ open: true, type: "error", msg: "Failed to load vendors." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
    // ✅ refresh list after vendor is added
    const refresh = () => fetchVendors();
    window.addEventListener("vendorAdded", refresh);
    return () => window.removeEventListener("vendorAdded", refresh);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim().toLowerCase()), 300);
    return () => clearTimeout(t);
  }, [query]);

  const filtered = useMemo(() => {
    if (!debounced) return vendors;
    return vendors.filter((v) =>
      (v.name || "").toLowerCase().includes(debounced)
    );
  }, [vendors, debounced]);

  if (loading) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header with search + button */}
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <TextField
          placeholder="Search a Vendor..."
          fullWidth
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <Button
          onClick={() => setAddOpen(true)}   // ✅ open modal instead of navigate
          variant="contained"
          color="primary"
        >
          + New Vendor
        </Button>
      </Stack>

      <Typography variant="body2" sx={{ mb: 2 }}>
        Showing {filtered.length} vendor{filtered.length !== 1 && "s"}
      </Typography>

      {filtered.length === 0 ? (
        <Typography>No vendors found.</Typography>
      ) : (
        <Grid container spacing={2}>
          {filtered.map((v) => (
            <Grid item xs={6} sm={4} md={3} lg={2} key={v.id}>
              <Box
                sx={{
                  borderRadius: 2,
                  bgcolor: "#fff",
                  border: "1px solid #e5e7eb",
                  textAlign: "center",
                  p: 2,
                  cursor: "pointer",
                  "&:hover": {
                    bgcolor: "#f0f9ff",
                    borderColor: "#3b82f6",
                  },
                }}
                onClick={() => navigate(`/dashboard/vendors/${v.id}`)}
              >
                <Typography fontWeight={500}>
                  {v.name || "(unnamed vendor)"}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Toast */}
      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
      >
        <Alert severity={toast.type}>{toast.msg}</Alert>
      </Snackbar>

      {/* ✅ Add Vendor Modal */}
      <AddVendorModal open={addOpen} onClose={() => setAddOpen(false)} />
    </Box>
  );
};

export default Vendors;
