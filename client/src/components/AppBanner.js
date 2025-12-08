
import React, { useContext, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import AuthContext from '../auth';

import AccountCircle from '@mui/icons-material/AccountCircle';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

export default function AppBanner() {
    const { auth } = useContext(AuthContext);
    const history = useHistory();
    const location = useLocation();

    const [anchorEl, setAnchorEl] = useState(null);
    const isMenuOpen = Boolean(anchorEl);

    const handleProfileMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = async () => {
        handleMenuClose();
        const result = await auth.logoutUser();
        if (result.ok) {
            history.push("/");
        }
    };

    const handleHomeClick = () => {
        if (auth.loggedIn) history.push("/playlists");
        else history.push("/");
    };

    const menuId = "primary-account-menu";

    const loggedOutMenu = (
        <Menu anchorEl={anchorEl} id={menuId} open={isMenuOpen} onClose={handleMenuClose}>
            <MenuItem onClick={() => { handleMenuClose(); history.push("/login"); }}>Login</MenuItem>
            <MenuItem onClick={() => { handleMenuClose(); history.push("/create-account"); }}>Create Account</MenuItem>
        </Menu>
    );

    const loggedInMenu = (
        <Menu anchorEl={anchorEl} id={menuId} open={isMenuOpen} onClose={handleMenuClose}>
            <MenuItem onClick={() => { handleMenuClose(); history.push("/edit-account"); }}>Edit Account</MenuItem>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
        </Menu>
    );

    const getAccountMenuIcon = () => {
        if (!auth.loggedIn) return <AccountCircle />;
        if (auth.getUserInitials) return <div>{auth.getUserInitials()}</div>;
        return <AccountCircle />;
    };

    const hideMenuButtons =
        !auth.loggedIn || location.pathname === "/edit-account";

    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static" sx={{ backgroundColor: "#006CA5" }}>
                <Toolbar>

                    <Typography variant="h4" component="div" sx={{ cursor: "pointer" }}>
                        <span
                            onClick={handleHomeClick}
                            style={{
                                textDecoration: "none",
                                color: "white",
                                fontSize: "2.3rem"
                            }}
                        >
                            ⌂
                        </span>
                    </Typography>

                    {!hideMenuButtons && (
                        <>
                            <Button color="inherit" onClick={() => history.push("/playlists")}>
                                Playlists
                            </Button>

                            <Button color="inherit" onClick={() => history.push("/songs")}>
                                Song Catalog
                            </Button>
                        </>
                    )}

                    <Box sx={{ flexGrow: 1 }} />

                    <IconButton onClick={handleProfileMenuOpen} color="inherit">
                        {getAccountMenuIcon()}
                    </IconButton>
                </Toolbar>
            </AppBar>

            {auth.loggedIn ? loggedInMenu : loggedOutMenu}
        </Box>
    );
}