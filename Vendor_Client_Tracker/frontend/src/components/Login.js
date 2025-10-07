// src/components/Login.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import authApi from "../api/auth";
import {
  TextField,
  Button,
  Typography,
  Box,
  Paper,
  CircularProgress,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await authApi.post("token/", { username, password });
      const { access, refresh } = response.data;
      localStorage.setItem("access", access);
      localStorage.setItem("refresh", refresh);

      setTimeout(() => {
        setLoading(false);
        navigate("/dashboard");
      }, 800); // small delay for smoothness
    } catch (error) {
      setLoading(false);
      alert("❌ Login failed! Check credentials.");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, #f9fafb 0%, #f1f5f9 100%)", // light gray
        p: 2,
      }}
    >
      <Paper
        elevation={6}
        sx={{
          width: "100%",
          maxWidth: 420,
          p: 4,
          borderRadius: 4,
          background: "#ffffff",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Box
            sx={{
              bgcolor: "linear-gradient(90deg, #0ea5e9, #06b6d4)",
              width: 56,
              height: 56,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundImage: "linear-gradient(135deg, #0ea5e9, #06b6d4)",
              color: "#fff",
            }}
          >
            <LockOutlinedIcon />
          </Box>
        </Box>

        <Typography
          variant="h4"
          align="center"
          sx={{ fontWeight: 800, color: "#0f172a", mb: 0.5 }}
        >
          VC Tracker
        </Typography>
        <Typography
          variant="subtitle1"
          align="center"
          sx={{ mb: 3, color: "#475569" }}
        >
          Manage Clients • Vendors
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            label="Username"
            variant="outlined"
            fullWidth
            margin="normal"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            label="Password"
            type="password"
            variant="outlined"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{
              mt: 2,
              py: 1.3,
              fontWeight: 600,
              backgroundImage: "linear-gradient(90deg, #0ea5e9, #06b6d4)",
              boxShadow: "0 4px 14px rgba(14,165,233,0.25)",
              "&:hover": {
                backgroundImage: "linear-gradient(90deg, #0284c7, #0891b2)",
              },
            }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={22} sx={{ color: "#fff" }} /> : "Sign In"}
          </Button>

          <Button
            fullWidth
            variant="outlined"
            sx={{ mt: 1.5, py: 1.2, fontWeight: 600 }}
            onClick={() => {
              setUsername("");
              setPassword("");
            }}
          >
            Cancel
          </Button>
        </form>

        <Typography
          variant="body2"
          align="center"
          sx={{ mt: 2, color: "#64748b" }}
        >
          <a href="#" style={{ color: "#0ea5e9", textDecoration: "none" }}>
            Forgot Password?
          </a>
        </Typography>
      </Paper>
    </Box>
  );
};

export default Login;
