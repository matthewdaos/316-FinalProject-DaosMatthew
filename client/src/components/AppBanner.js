import { useContext, useState } from 'react';
import { Link, useHistory, useLocation } from 'react-router-dom';
import AuthContext from '../auth';

import AccountCircle from '@mui/icons-material/AccountCircle';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Toolbar from '@mui/material/Toolbar';
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

    const handleLogout = () => {
        handleMenuClose();
        auth.logoutUser();
    };

    const handleHomeClick = () => {
        history.push('/');
    };

    const menuId = 'primary-account-menu';

    const loggedOutMenu = (
        <Menu
            anchorEl={anchorEl}
            id={menuId}
            open={isMenuOpen}
            onClose={handleMenuClose}
        >
            <MenuItem
                onClick={() => {
                    handleMenuClose();
                    history.push('/login');
                }}
            >
                Login
            </MenuItem>
            <MenuItem
                onClick={() => {
                    handleMenuClose();
                    history.push('/create-account');
                }}
            >
                Create Account
            </MenuItem>
        </Menu>
    );

    const loggedInMenu = (
        <Menu
            anchorEl={anchorEl}
            id={menuId}
            open={isMenuOpen}
            onClose={handleMenuClose}
        >
            <MenuItem
                onClick={() => {
                    handleMenuClose();
                    history.push('/edit-account');
                }}
            >
                Edit Account
            </MenuItem>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
        </Menu>
    );

    function getAccountMenu() {
        if (!auth.loggedIn) return <AccountCircle />;
        const initials = auth.getUserInitials ? auth.getUserInitials() : '?';
        return <div>{initials}</div>;
    }

    const hideNavButtons =
        location.pathname === '/' ||
        location.pathname === '/login' ||
        location.pathname === '/create-account';

    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static" sx={{ backgroundColor: '#e100ff' }}>
                <Toolbar>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Link
                            onClick={handleHomeClick}
                            style={{ textDecoration: 'none', color: 'white' }}
                            to="/"
                        >
                            ⌂
                        </Link>

                        {!hideNavButtons && (
                            <>
                                <Button
                                    color="inherit"
                                    onClick={() => history.push('/playlists')}
                                >
                                    Playlists
                                </Button>
                                <Button
                                    color="inherit"
                                    onClick={() => history.push('/songs')}
                                >
                                    Song Catalog
                                </Button>
                            </>
                        )}
                    </Box>

                    <Box sx={{ flexGrow: 1 }} />

                    <IconButton onClick={handleProfileMenuOpen} color="inherit">
                        {getAccountMenu()}
                    </IconButton>
                </Toolbar>
            </AppBar>

            {auth.loggedIn ? loggedInMenu : loggedOutMenu}
        </Box>
    );
}