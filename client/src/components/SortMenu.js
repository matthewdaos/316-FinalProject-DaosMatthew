import { Box, Typography, Menu, MenuItem } from "@mui/material";
import { useState } from "react";

export default function SortMenu({ sortMethod, setSortMethod }) {
    const [anchorEl, setAnchorEl] = useState(null);

    const sortOptions = [
        "Listeners (Hi–Lo)",
        "Listeners (Lo–Hi)",
        "Playlist Name (A–Z)",
        "Playlist Name (Z–A)",
        "User Name (A–Z)",
        "User Name (Z–A)"
    ];

    return (
        <Box display="flex" alignItems="center">
            <Typography variant="body1" sx={{ mr: 1 }}>
                Sort:
            </Typography>
            <Typography 
                sx={{ color: "#0080ff", cursor: "pointer" }}
                onClick={(e) => setAnchorEl(e.currentTarget)}
            >
                {sortMethod}
            </Typography>

            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
                {sortOptions.map(option => (
                    <MenuItem key={option} onClick={() => { setSortMethod(option); setAnchorEl(null); }}>
                        {option}
                    </MenuItem>
                ))}
            </Menu>
        </Box>
    );
}