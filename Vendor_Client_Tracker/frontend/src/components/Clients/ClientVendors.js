// src/components/Clients/ClientVendors.js
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Snackbar,
  Alert,
  Stack,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import coreApi from "../../api/core";

const ClientVendors = ({ clientId }) => {
  const [vendors, setVendors] = useState([]);
  const [allVendors, setAllVendors] = useState([]);
  const [openAttach, setOpenAttach] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, msg: "", type: "success" });
  const [selectedVendor, setSelectedVendor] = useState("");
  const [role, setRole] = useState("");
  const [detachVendorId, setDetachVendorId] = useState(null);

  // ✅ Fetch vendors already attached to client
  const fetchVendors = async () => {
    try {
      const res = await coreApi.get(`client/GetVendorsForClient/${clientId}/`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
      });
      setVendors(res.data?.data || []);
    } catch (e) {
      console.error("❌ Error fetching vendors", e);
    }
  };

  // ✅ Fetch all available vendors
  const fetchAllVendors = async () => {
    try {
      const res = await coreApi.get("vendor/GetVendor/", {
        headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
      });
      const data = Array.isArray(res.data?.data) ? res.data.data : [];
      setAllVendors(data);
    } catch (e) {
      console.error("❌ Error fetching all vendors", e);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, [clientId]);

  // ✅ Open Attach Dialog
  const handleOpenAttach = () => {
    setSelectedVendor("");
    setRole("");
    fetchAllVendors();
    setOpenAttach(true);
  };

  const handleCloseAttach = () => setOpenAttach(false);

  // ✅ Attach Vendor to Client
  const handleAttach = async () => {
    if (!selectedVendor || !role) {
      setSnackbar({
        open: true,
        msg: "Please select both vendor and role",
        type: "error",
      });
      return;
    }

    try {
      setSaving(true);

      const payload = {
        vendor_id: Number(selectedVendor),
        role,
      };

      console.log("📤 Attaching vendor payload →", payload);

      const req = coreApi.post(`client/AttachVendor/${clientId}/`, payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access")}`,
          "Content-Type": "application/json",
        },
      });

      await Promise.all([req, new Promise((r) => setTimeout(r, 2000))]);

      setSnackbar({ open: true, msg: "Vendor attached successfully", type: "success" });
      setOpenAttach(false);
      await fetchVendors();
    } catch (e) {
      console.error("❌ Failed to attach vendor", e.response?.data || e.message);
      setSnackbar({ open: true, msg: "Failed to attach vendor", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  // ✅ Detach Vendor (opens confirm popup)
  const handleDetach = (vendorId) => {
    setDetachVendorId(vendorId);
    setConfirmOpen(true);
  };

  // ✅ Confirm Detach Vendor
  const confirmDetach = async () => {
    try {
      setDeleting(true);
      const req = coreApi.delete(
        `client/DetachVendorFromClient/${clientId}/${detachVendorId}/`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
        }
      );

      await Promise.all([req, new Promise((r) => setTimeout(r, 2000))]);

      setSnackbar({
        open: true,
        msg: "Vendor detached successfully",
        type: "success",
      });

      await fetchVendors();
    } catch (e) {
      console.error("❌ Failed to detach vendor", e.response?.data || e.message);
      setSnackbar({ open: true, msg: "Failed to detach vendor", type: "error" });
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
      setDetachVendorId(null);
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography fontWeight={600}>Vendors</Typography>
        <Button variant="contained" onClick={handleOpenAttach}>
          Attach Vendor
        </Button>
      </Box>

      {/* Vendor List */}
      {vendors.length === 0 ? (
        <Typography>No vendors attached yet.</Typography>
      ) : (
        <Grid container spacing={2}>
          {vendors.map((link) => (
            <Grid item xs={12} md={6} key={link.id}>
              <Paper sx={{ p: 2, borderRadius: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography fontWeight={600}>{link.vendor?.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Role: {link.role || "-"}
                    </Typography>
                  </Box>
                  <IconButton
                    color="error"
                    size="small"
                    onClick={() => handleDetach(link.vendor?.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Attach Vendor Dialog */}
      <Dialog open={openAttach} onClose={handleCloseAttach} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: "bold" }}>Attach Vendor</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            {/* Vendor Dropdown */}
            <FormControl size="small" fullWidth>
              <InputLabel id="vendor-select-label">Vendor</InputLabel>
              <Select
                labelId="vendor-select-label"
                label="Vendor"
                value={selectedVendor}
                onChange={(e) => setSelectedVendor(e.target.value)}
              >
                {allVendors.length === 0 ? (
                  <MenuItem disabled>Loading vendors...</MenuItem>
                ) : (
                  allVendors.map((v) => (
                    <MenuItem key={v.id} value={v.id}>
                      {v.name}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>

            {/* Role Dropdown */}
            <FormControl size="small" fullWidth>
              <InputLabel id="role-select-label">Role</InputLabel>
              <Select
                labelId="role-select-label"
                label="Role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <MenuItem value="Vendor">Vendor</MenuItem>
                <MenuItem value="Prime Vendor">Prime Vendor</MenuItem>
                <MenuItem value="Implementation Partner">
                  Implementation Partner
                </MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAttach} disabled={saving}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleAttach}
            disabled={saving}
            startIcon={saving ? <CircularProgress size={18} color="inherit" /> : null}
          >
            {saving ? "Attaching..." : "Attach"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Detach Dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle sx={{ fontWeight: "bold" }}>Confirm Detach</DialogTitle>
        <DialogContent dividers>
          <Typography>Are you sure you want to detach this vendor?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} disabled={deleting}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={confirmDetach}
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={18} color="inherit" /> : null}
          >
            {deleting ? "Detaching..." : "Confirm"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snackbar.type}>{snackbar.msg}</Alert>
      </Snackbar>
    </Box>
  );
};

export default ClientVendors;
