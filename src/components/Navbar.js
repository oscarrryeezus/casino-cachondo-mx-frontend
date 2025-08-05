// components/Navbar.jsx
import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import api from "../services/api";
import { logoutOscar } from "../services/auth";

const Navbar = () => {
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.error("No se pudo limpiar cookie en servidor", err);
    } finally {
      logout();
      logoutOscar()
      navigate("/");
    }
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const renderNavLinks = () => (
    <>
      <Button color="inherit" component={Link} to="/">
        Inicio
      </Button>
      {isAuthenticated && (
        <>
          <Button color="inherit" component={Link} to="/ruleta">
            Ruleta
          </Button>
          <Button color="inherit" component={Link} to="/blackjack">
            Blackjack 21
          </Button>
        </>
      )}
    </>
  );

  return (
    <AppBar
      position="static"
      sx={{ background: "linear-gradient(to right, #000000, #111111)" }}
    >
      <Toolbar>
        <Box
          component={Link}
          to="/"
          sx={{
            display: "flex",
            alignItems: "center",
            textDecoration: "none",
            color: "inherit",
            mr: 2,
          }}
        >
          <Box
            component="img"
            src="/LOGO.png"
            alt="CachandoMX"
            sx={{ height: 40 }}
          />
        </Box>

        {isMobile ? (
          <>
            <IconButton color="inherit" edge="start" onClick={handleMenu}>
              <MenuIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem component={Link} to="/" onClick={handleClose}>
                Inicio
              </MenuItem>
              {isAuthenticated && (
                <>
                  <MenuItem component={Link} to="/ruleta" onClick={handleClose}>
                    Ruleta
                  </MenuItem>
                  <MenuItem
                    component={Link}
                    to="/blackjack"
                    onClick={handleClose}
                  >
                    Blackjack 21
                  </MenuItem>
                </>
              )}
              {isAuthenticated && (
                <MenuItem
                  onClick={() => {
                    handleLogout();
                    handleClose();
                  }}
                >
                  Cerrar Sesión
                </MenuItem>
              )}
            </Menu>
          </>
        ) : (
          <>
            <Box sx={{ flexGrow: 1 }}>{renderNavLinks()}</Box>
            {isAuthenticated && (
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Typography sx={{ color: "gold", mr: 2 }}>
                  {user?.nombre || "Usuario"}
                </Typography>
                <Typography sx={{ color: "gold", mr: 2 }} component={Link} to="/saldo">
                  Saldo: ${user?.fondos?.toFixed(2)}
                </Typography>
                <Button color="error" variant="outlined" onClick={handleLogout}>
                  Cerrar Sesión
                </Button>
              </Box>
            )}
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
