// src/components/Vendors/VendorContacts.js
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
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
  CircularProgress,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import coreApi from "../../api/core";

const VendorContacts = ({ vendorId }) => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, msg: "", type: "success" });

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    designation: "",
    phone: "",
  });

  // ✅ Fetch contacts
  const fetchContacts = async () => {
    try {
      setLoading(true);
      const res = await coreApi.get(`vendor/GetVendorContacts/${vendorId}/`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
      });

      const data = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
        ? res.data.data
        : [];
      setContacts(data);
    } catch (e) {
      console.error("❌ Error fetching vendor contacts", e);
      setContacts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (vendorId) fetchContacts();
  }, [vendorId]);

  // ✅ Open Add/Edit form
  const handleOpenForm = (contact = null) => {
    if (contact) {
      setEditing(contact);
      setFormData({
        full_name: contact.full_name || "",
        email: contact.email || "",
        designation: contact.designation || "",
        phone: contact.phone || "",
      });
    } else {
      setEditing(null);
      setFormData({
        full_name: "",
        email: "",
        designation: "",
        phone: "",
      });
    }
    setOpenForm(true);
  };

  const handleCloseForm = () => setOpenForm(false);

  // ✅ Save (Add/Edit)
  const handleSave = async () => {
  try {
    setSaving(true);

    const payload = {
      full_name: formData.full_name?.trim() || "",
      email: formData.email?.trim() || "",
      designation: formData.designation?.trim() || "",
      phone: formData.phone?.trim() || "",
    };

    let endpoint = "";
    let req;

    if (editing) {
      endpoint = "vendor/UpdateVendorContact/";
      const updatePayload = {
        vendor_id: Number(vendorId),
        contact_id: Number(editing.id),
        ...payload,
      };

      req = coreApi.patch(endpoint, updatePayload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access")}`,
          "Content-Type": "application/json",
        },
      });
    } else {
      endpoint = `vendor/AddVendorContact/${vendorId}/`;
      req = coreApi.post(endpoint, payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access")}`,
          "Content-Type": "application/json",
        },
      });
    }

    await Promise.all([req, new Promise((r) => setTimeout(r, 2000))]);

    setSnackbar({
      open: true,
      msg: editing ? "Contact updated successfully" : "Contact added successfully",
      type: "success",
    });

    setOpenForm(false);
    await fetchContacts();
  } catch (e) {
    console.error("❌ Failed to save contact", e.response?.data || e.message);
    setSnackbar({ open: true, msg: "Failed to save contact", type: "error" });
  } finally {
    setSaving(false);
  }
};


  // ✅ Delete contact
  const handleDelete = (id) => {
    setDeleteId(id);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    try {
      setDeleting(true);

      await Promise.all([
        coreApi.delete("vendor/DeleteVendorContact/", {
          data: { vendor_id: Number(vendorId), contact_id: Number(deleteId) },
          headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
        }),
        new Promise((r) => setTimeout(r, 2000)),
      ]);

      setSnackbar({
        open: true,
        msg: "Contact deleted successfully",
        type: "success",
      });

      await fetchContacts();
    } catch (e) {
      console.error("❌ Failed to delete contact", e.response?.data || e.message);
      setSnackbar({ open: true, msg: "Failed to delete contact", type: "error" });
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
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenForm()}>
          Add Contact
        </Button>
      </Stack>

      {/* Table Section */}
      {loading ? (
        <CircularProgress />
      ) : contacts.length === 0 ? (
        <Typography>No contacts found.</Typography>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Full Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Designation</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Phone</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {contacts.map((c) => (
                <TableRow key={c.id} hover>
                  <TableCell>{c.full_name}</TableCell>
                  <TableCell>{c.email}</TableCell>
                  <TableCell>{c.designation}</TableCell>
                  <TableCell>{c.phone}</TableCell>
                  <TableCell align="center">
                    <IconButton color="primary" size="small" onClick={() => handleOpenForm(c)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton color="error" size="small" onClick={() => handleDelete(c.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={openForm} onClose={handleCloseForm} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: "bold" }}>
          {editing ? "Edit Contact" : "Add Contact"}
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <TextField
              label="Full Name"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              fullWidth
              size="small"
            />
            <TextField
              label="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              fullWidth
              size="small"
            />
            <TextField
              label="Designation"
              value={formData.designation}
              onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
              fullWidth
              size="small"
            />
            <TextField
              label="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle sx={{ fontWeight: "bold" }}>Confirm Delete</DialogTitle>
        <DialogContent dividers>
          <Typography>Are you sure you want to delete this contact?</Typography>
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

export default VendorContacts;
