// src/theme.js
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#6366f1" },      // indigo-500
    secondary: { main: "#06b6d4" },    // cyan-500
    background: { default: "#f8fafc", paper: "#ffffff" },
    text: { primary: "#0f172a", secondary: "#475569" },
  },
  shape: { borderRadius: 16 },
  typography: {
    fontFamily: `Inter, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`,
    h4: { fontWeight: 800, letterSpacing: -0.2 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiPaper: { styleOverrides: { root: { borderRadius: 16 } } },
    MuiButton: { defaultProps: { disableElevation: true }, styleOverrides: { root: { borderRadius: 12 } } },
    MuiChip: { styleOverrides: { root: { borderRadius: 10 } } },
    MuiDialog: { styleOverrides: { paper: { borderRadius: 16 } } },
    MuiTabs:  { styleOverrides: { indicator: { height: 3, borderRadius: 3 } } },
    MuiTableContainer: { styleOverrides: { root: { borderRadius: 16 } } },
  },
});

export default theme;
