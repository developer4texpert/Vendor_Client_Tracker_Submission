// src/components/Clients/ClientAddresses.js
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  CircularProgress,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  DialogContentText,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import coreApi from "../../api/core";
import { useStates } from "../../context/StatesContext";

const ClientAddresses = ({ clientId }) => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [openDialog, setOpenDialog] = useState(false);
  const [editingAddr, setEditingAddr] = useState(null);
  const [formData, setFormData] = useState({
    street_address: "",
    city: "",
    state: "",
    country: "",
    zipcode: "",
    address_type: "Other",
  });

  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ open: false, msg: "", severity: "success" });

  // ✅ Delete confirmation state
  const [deleteDialog, setDeleteDialog] = useState({ open: false, addrid: null });

  // ✅ States API
  const { states, loading: statesLoading, fetchStates } = useStates();

  useEffect(() => {
    if (fetchStates) fetchStates();
  }, []);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const res = await coreApi.post(
        "client/GetClientAddresses/",
        { client_id: clientId },
        { headers: { Authorization: `Bearer ${localStorage.getItem("access")}` } }
      );
      setAddresses(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error("❌ Error fetching addresses", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, [clientId]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // ✅ Add / Update address with loader
  const handleSave = async () => {
    try {
      setSaving(true);
      let req;
      if (editingAddr) {
        req = coreApi.put(
          "client/UpdateClientAddress/",
          { addrid: editingAddr.addrid, ...formData },
          { headers: { Authorization: `Bearer ${localStorage.getItem("access")}` } }
        );
      } else {
        req = coreApi.post(
          "client/AddClientAddress/",
          { client: clientId, ...formData },
          { headers: { Authorization: `Bearer ${localStorage.getItem("access")}` } }
        );
      }

      await Promise.all([req, new Promise((res) => setTimeout(res, 2000))]);

      setToast({
        open: true,
        msg: editingAddr
          ? "✅ Address updated successfully"
          : "✅ Address added successfully",
        severity: "success",
      });

      setOpenDialog(false);
      setFormData({
        street_address: "",
        city: "",
        state: "",
        country: "",
        zipcode: "",
        address_type: "Other",
      });
      setEditingAddr(null);
      fetchAddresses();
    } catch (e) {
      console.error("❌ Failed to save address", e);
      setToast({
        open: true,
        msg: "❌ Failed to save address",
        severity: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  // ✅ Delete confirmation handlers
  const confirmDelete = (addrid) => {
    setDeleteDialog({ open: true, addrid });
  };

  const handleDelete = async () => {
    try {
      setSaving(true);
      const req = coreApi.delete("client/DeleteClientAddress/", {
        headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
        data: { addrid: deleteDialog.addrid },
      });

      await Promise.all([req, new Promise((res) => setTimeout(res, 2000))]);

      setToast({
        open: true,
        msg: "✅ Client address deleted successfully",
        severity: "success",
      });
      fetchAddresses();
    } catch (e) {
      console.error("❌ Failed to delete address", e);
      setToast({
        open: true,
        msg: "❌ Failed to delete address",
        severity: "error",
      });
    } finally {
      setSaving(false);
      setDeleteDialog({ open: false, addrid: null });
    }
  };

  return (
    <Box>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <Typography fontWeight={600}>Addresses</Typography>
        <Button
          variant="contained"
          onClick={() => {
            setEditingAddr(null);
            setFormData({
              street_address: "",
              city: "",
              state: "",
              country: "",
              zipcode: "",
              address_type: "Other",
            });
            setOpenDialog(true);
          }}
        >
          + Add Address
        </Button>
      </Stack>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      ) : addresses.length === 0 ? (
        <Typography>No addresses yet.</Typography>
      ) : (
        <Table
          sx={{
            border: "1px solid #e5e7eb",
            borderRadius: 2,
            "& th": { backgroundColor: "#f9fafb", fontWeight: 600 },
            "& td, & th": { borderBottom: "1px solid #e5e7eb" },
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell>Street Address</TableCell>
              <TableCell>City</TableCell>
              <TableCell>State</TableCell>
              <TableCell>Country</TableCell>
              <TableCell>Zip Code</TableCell>
              <TableCell>Type</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {addresses.map((addr) => (
              <TableRow key={addr.addrid}>
                <TableCell>{addr.street_address}</TableCell>
                <TableCell>{addr.city}</TableCell>
                <TableCell>{addr.state}</TableCell>
                <TableCell>{addr.country}</TableCell>
                <TableCell>{addr.zipcode}</TableCell>
                <TableCell>{addr.address_type}</TableCell>
                <TableCell align="right">
                  <IconButton
                    color="primary"
                    onClick={() => {
                      setEditingAddr(addr);
                      setFormData(addr);
                      setOpenDialog(true);
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => confirmDelete(addr.addrid)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Add / Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{editingAddr ? "Edit Address" : "Add Address"}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <TextField
              label="Street Address"
              name="street_address"
              value={formData.street_address}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="City"
              name="city"
              value={formData.city}
              onChange={handleChange}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel id="state-label">State</InputLabel>
              <Select
                labelId="state-label"
                name="state"
                value={formData.state || ""}
                onChange={handleChange}
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
              name="country"
              value={formData.country}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Zip Code"
              name="zipcode"
              value={formData.zipcode}
              onChange={handleChange}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel id="type-label">Address Type</InputLabel>
              <Select
                labelId="type-label"
                name="address_type"
                value={formData.address_type || "Other"}
                onChange={handleChange}
              >
                <MenuItem value="Home">Home</MenuItem>
                <MenuItem value="Office">Office</MenuItem>
                <MenuItem value="Billing">Billing</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : editingAddr ? "Update" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, addrid: null })}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Delete Address</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this client address? This action
            cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialog({ open: false, addrid: null })}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleDelete}
            disabled={saving}
          >
            {saving ? <CircularProgress size={20} color="inherit" /> : "Confirm"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={toast.severity}>{toast.msg}</Alert>
      </Snackbar>

      {/* Center Loader Overlay */}
      {saving && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(255,255,255,0.6)",
            zIndex: 2000,
          }}
        >
          <CircularProgress size={70} />
        </Box>
      )}
    </Box>
  );
};

export default ClientAddresses;
