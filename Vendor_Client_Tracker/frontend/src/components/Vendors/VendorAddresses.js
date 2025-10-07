// src/components/Vendors/VendorAddresses.js
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Button,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
  Stack,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import coreApi from "../../api/core";
import { useStates } from "../../context/StatesContext";

const VendorAddresses = ({ vendorId }) => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, msg: "", type: "success" });
  const [formData, setFormData] = useState({
    street_address: "",
    city: "",
    state: "",
    country: "",
    zipcode: "",
  });

  const { states, loading: statesLoading, fetchStates } = useStates();

  useEffect(() => {
    if (fetchStates) fetchStates();
  }, []);

  // ✅ Fetch vendor addresses
  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const res = await coreApi.post(
        "vendor/GetVendorAddresses/",
        { vendor_id: vendorId },
        { headers: { Authorization: `Bearer ${localStorage.getItem("access")}` } }
      );
      setAddresses(res.data?.data || []);
    } catch (e) {
      console.error("❌ Error fetching vendor addresses", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, [vendorId]);

  // ✅ Open Add/Edit dialog
  const handleOpenForm = (addr = null) => {
    if (addr) {
      setEditing(addr);
      setFormData({
        street_address: addr.street_address,
        city: addr.city,
        state: addr.state,
        country: addr.country,
        zipcode: addr.zipcode,
      });
    } else {
      setEditing(null);
      setFormData({
        street_address: "",
        city: "",
        state: "",
        country: "",
        zipcode: "",
      });
    }
    setOpenForm(true);
  };

  const handleCloseForm = () => setOpenForm(false);

  // ✅ Save Add/Edit
  const handleSave = async () => {
    try {
      setSaving(true); // Start loading

      const endpoint = editing
        ? "vendor/UpdateVendorAddress/"
        : "vendor/AddVendorAddress/";

      const payload = editing
        ? { ...formData, vendor_id: vendorId, address_id: editing.id }
        : { ...formData, vendor_id: vendorId };

      const method = editing ? coreApi.patch : coreApi.post;

      // Make API call + simulate 2-second delay
      await Promise.all([
        method(endpoint, payload, {
          headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
        }),
        new Promise((resolve) => setTimeout(resolve, 2000)),
      ]);

      setSnackbar({
        open: true,
        msg: editing ? "Address updated successfully" : "Address added successfully",
        type: "success",
      });

      setOpenForm(false);
      await fetchAddresses();
    } catch (e) {
      console.error("❌ Failed to save address", e.response?.data || e.message);
      setSnackbar({ open: true, msg: "Failed to save address", type: "error" });
    } finally {
      setSaving(false); // Stop loading
    }
  };



  // ✅ Delete address
  // ✅ Open confirm dialog for delete
  const handleDelete = (id) => {
    setDeleteId(id);
    setConfirmOpen(true);
  };

  // Confirm delete action

  const confirmDelete = async () => {
  try {
    setDeleting(true);

    const payload = {
      vendor_id: Number(vendorId),
      address_id: Number(deleteId),
    };

    console.log("🗑️ Deleting vendor address (DELETE):", payload);

    await Promise.all([
      coreApi.delete("vendor/DeleteVendorAddress/", {
        data: payload, // ✅ body must go inside `data` for DELETE
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access")}`,
          "Content-Type": "application/json",
        },
      }),
      new Promise((resolve) => setTimeout(resolve, 2000)), // simulate 2s loader
    ]);

    setSnackbar({
      open: true,
      msg: "Vendor address deleted successfully",
      type: "success",
    });

    await fetchAddresses();
  } catch (e) {
    console.error("❌ Failed to delete vendor address", e.response?.data || e.message);
    setSnackbar({ open: true, msg: "Failed to delete vendor address", type: "error" });
  } finally {
    setDeleting(false);
    setConfirmOpen(false);
    setDeleteId(null);
  }
};



  return (
    <Box>
      {/* Header */}
      <Stack direction="row" justifyContent="flex-end" sx={{ mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenForm()}
        >
          Add Address
        </Button>
      </Stack>

      {/* Table Section */}
      {loading ? (
        <CircularProgress />
      ) : addresses.length === 0 ? (
        <Typography>No addresses found.</Typography>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Street Address</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>City</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>State</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Country</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Zipcode</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {addresses.map((addr) => (
                <TableRow key={addr.id} hover>
                  <TableCell>{addr.street_address}</TableCell>
                  <TableCell>{addr.city}</TableCell>
                  <TableCell>{addr.state}</TableCell>
                  <TableCell>{addr.country}</TableCell>
                  <TableCell>{addr.zipcode}</TableCell>
                  <TableCell align="center">
                    <IconButton
                      color="primary"
                      size="small"
                      onClick={() => handleOpenForm(addr)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      size="small"
                      onClick={() => handleDelete(addr.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add/Edit Address Dialog */}
      <Dialog open={openForm} onClose={handleCloseForm} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: "bold" }}>
          {editing ? "Edit Address" : "Add Address"}
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <TextField
              label="Street Address"
              value={formData.street_address}
              onChange={(e) => setFormData({ ...formData, street_address: e.target.value })}
              fullWidth
              size="small"
            />
            <TextField
              label="City"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              fullWidth
              size="small"
            />
            <FormControl size="small" fullWidth>
              <InputLabel id="state-label">State</InputLabel>
              <Select
                labelId="state-label"
                id="state-select"
                label="State"
                value={formData.state || ""}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              >
                {statesLoading ? (
                  <MenuItem disabled>Loading states...</MenuItem>
                ) : (
                  states.map((s) => (
                    <MenuItem key={s.abbr} value={s.abbr}>
                      {s.name} ({s.abbr})
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
            <TextField
              label="Country"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              fullWidth
              size="small"
            />
            <TextField
              label="Zipcode"
              value={formData.zipcode}
              onChange={(e) => setFormData({ ...formData, zipcode: e.target.value })}
              fullWidth
              size="small"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseForm}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving}
            startIcon={saving ? <CircularProgress size={18} color="inherit" /> : null}
          >
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ✅ Delete Confirmation Dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle sx={{ fontWeight: "bold" }}>Confirm Delete</DialogTitle>
        <DialogContent dividers>
          <Typography>Are you sure you want to delete this vendor address?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} disabled={deleting}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={confirmDelete}
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={18} color="inherit" /> : null}
          >
            {deleting ? "Deleting..." : "Delete"}
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

export default VendorAddresses;
