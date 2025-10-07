import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from "@mui/material";

const ConfirmDialog = ({ open, title, content, onCancel, onConfirm }) => (
  <Dialog open={open} onClose={onCancel}>
    <DialogTitle>{title}</DialogTitle>
    <DialogContent>
      <Typography>{content}</Typography>
    </DialogContent>
    <DialogActions>
      <Button onClick={onCancel}>Cancel</Button>
      <Button onClick={onConfirm} color="error" variant="contained">
        Confirm
      </Button>
    </DialogActions>
  </Dialog>
);

export default ConfirmDialog;
