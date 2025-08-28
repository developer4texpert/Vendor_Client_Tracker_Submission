import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
} from "@mui/material";

const Vendors = () => {
  const [vendors, setVendors] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editVendor, setEditVendor] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    email: "",
    phone: "",
    client: "",
  });

  // Fetch vendors
  const fetchVendors = async () => {
    try {
      const token = localStorage.getItem("access");
      const response = await api.get("vendors/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVendors(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching vendors:", error);
      setLoading(false);
    }
  };

  // Fetch clients (for dropdown)
  const fetchClients = async () => {
    try {
      const token = localStorage.getItem("access");
      const response = await api.get("clients/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClients(response.data);
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  };

  useEffect(() => {
    fetchVendors();
    fetchClients();
  }, []);

  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Open Add/Edit dialog
  const handleOpen = (vendor = null) => {
    if (vendor) {
      setEditVendor(vendor);
      setFormData(vendor);
    } else {
      setEditVendor(null);
      setFormData({
        name: "",
        role: "",
        email: "",
        phone: "",
        client: "",
      });
    }
    setOpen(true);
  };

  // Close dialog
  const handleClose = () => {
    setOpen(false);
    setEditVendor(null);
  };

  // Add or Update vendor
  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("access");
      if (editVendor) {
        // Update
        await api.put(`vendors/${editVendor.id}/`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        // Create
        await api.post("vendors/", formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      fetchVendors();
      handleClose();
    } catch (error) {
      console.error("Error saving vendor:", error);
    }
  };

  // Delete vendor
  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("access");
      await api.delete(`vendors/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchVendors();
    } catch (error) {
      console.error("Error deleting vendor:", error);
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <div>
      <Typography variant="h5" sx={{ mb: 2, textAlign: "center" }}>
        Vendors
      </Typography>

      <Button
        variant="contained"
        color="primary"
        onClick={() => handleOpen()}
        sx={{ mb: 2 }}
      >
        Add Vendor
      </Button>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Client</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {vendors.map((vendor) => (
              <TableRow key={vendor.id}>
                <TableCell>{vendor.id}</TableCell>
                <TableCell>{vendor.name}</TableCell>
                <TableCell>{vendor.role}</TableCell>
                <TableCell>{vendor.email}</TableCell>
                <TableCell>{vendor.phone}</TableCell>
                <TableCell>
                  {vendor.client ? vendor.client.name : "N/A"}
                </TableCell>
                <TableCell>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => handleOpen(vendor)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    variant="outlined"
                    onClick={() => handleDelete(vendor.id)}
                    sx={{ ml: 1 }}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editVendor ? "Edit Vendor" : "Add Vendor"}</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            margin="dense"
            label="Role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            margin="dense"
            label="Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            margin="dense"
            label="Phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            select
            margin="dense"
            label="Client"
            name="client"
            value={formData.client}
            onChange={handleChange}
            fullWidth
          >
            {clients.map((client) => (
              <MenuItem key={client.id} value={client.id}>
                {client.name}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSubmit} color="primary" variant="contained">
            {editVendor ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Vendors;
