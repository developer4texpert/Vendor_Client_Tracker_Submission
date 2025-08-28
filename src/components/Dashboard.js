import React from "react";
import { AppBar, Toolbar, Typography, Button, Box, Grid, Paper } from "@mui/material";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isRootDashboard = location.pathname === "/dashboard";
  const username = "Admin";

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    navigate("/");
  };

  return (
    <Box sx={{ flexGrow: 1, minHeight: "100vh", bgcolor: "#f8fafc" }}>
      {/* Top Navbar */}
      <AppBar
        position="static"
        sx={{
          backgroundImage: "linear-gradient(90deg, #0ea5e9, #06b6d4)",
          boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
        }}
      >
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            VC Tracker
          </Typography>

          {/* Center - Navigation Links */}
          <Box sx={{ display: "flex", gap: 3 }}>
            <Button component={Link} to="/dashboard/clients" color="inherit">
              Clients
            </Button>
            <Button component={Link} to="/dashboard/vendors" color="inherit">
              Vendors
            </Button>
            <Button component={Link} to="/dashboard/consultants" color="inherit">
              Consultants
            </Button>
            <Button component={Link} to="/dashboard/history" color="inherit">
              History
            </Button>
          </Box>

          {/* Right side */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography variant="body1">👤 {username}</Typography>
            <Button
              variant="outlined"
              sx={{
                color: "#fff",
                borderColor: "#fff",
                "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
              }}
              onClick={handleLogout}
            >
              Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box sx={{ p: 4 }}>
        {isRootDashboard ? (
          <>
            <Typography variant="h4" sx={{ fontWeight: "bold", mb: 3 }}>
              Dashboard
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper elevation={3} sx={{ p: 3, borderRadius: 3, height: "100%" }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    📌 Recent Activity
                  </Typography>
                  <ul style={{ margin: 0, paddingLeft: "20px" }}>
                    <li>Client "Acme Corp" added</li>
                    <li>Vendor "Tech Solutions" registered</li>
                    <li>Consultant "John Doe" updated</li>
                    <li>Client "Infosys" edited</li>
                  </ul>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    👤 Recently Added Clients
                  </Typography>
                  <ul style={{ margin: 0, paddingLeft: "20px" }}>
                    <li>Acme Technologies</li>
                    <li>Infosys Ltd</li>
                    <li>Wipro Solutions</li>
                  </ul>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    🏢 Recently Added Vendors
                  </Typography>
                  <ul style={{ margin: 0, paddingLeft: "20px" }}>
                    <li>Tech Solutions</li>
                    <li>Global Vendor LLC</li>
                    <li>Prime IT Services</li>
                  </ul>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    👨‍💻 Recently Added Consultants
                  </Typography>
                  <ul style={{ margin: 0, paddingLeft: "20px" }}>
                    <li>John Doe</li>
                    <li>Jane Smith</li>
                    <li>Arun Kumar</li>
                  </ul>
                </Paper>
              </Grid>
            </Grid>
          </>
        ) : (
          <Outlet /> // Show Clients, Vendors, etc.
        )}
      </Box>
    </Box>
  );
};

export default Dashboard;
