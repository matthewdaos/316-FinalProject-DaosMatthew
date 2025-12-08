import { useState, useContext } from "react";
import { Box, Typography, IconButton, Menu, MenuItem } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { GlobalStoreContext } from "../store";

export default function SongCatalog({ song }) {
    const { store } = useContext(GlobalStoreContext);

    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    function handleMenu(e) {
        setAnchorEl(e.currentTarget);
    }

    function closeMenu() {
        setAnchorEl(null);
    }

    function edit() {
        closeMenu();
        store.showEditSongModal(0, song);
    }

    function remove() {
        closeMenu();
        if(store.showDeleteSongModal) {
            store.showDeleteSongModal(song);
        }
    }

    async function addToPlaylist(playlistId) {
        closeMenu();

        if (!song || !song._id) {
            console.error("Cannot add song to playlist — missing _id:", song);
            return;
        }

        await store.addSongToPlaylist(song._id, playlistId);
    }

    const listens = Number(song.listens ?? 0);
    const playlistsCount = Number(song.numPlaylists ?? 0);

    return (
        <Box
            sx={{
                backgroundColor: "#FFFACD",
                borderLeft: "4px solid #EE4444",
                padding: 2,
                mb: 1.5,
                borderRadius: "6px",
                position: "relative",
            }}
        >
            <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                {song.title} by {song.artist}{" "}
                {song.year && `(${song.year})`}
            </Typography>

            <Typography variant="caption" sx={{ display: "block", mt: 0.5 }}>
                Listens: {listens.toLocaleString()}
            </Typography>

            <Typography variant="caption">
                Playlists: {playlistsCount}
            </Typography>

            <IconButton
                sx={{ position: "absolute", top: 5, right: 5 }}
                onClick={handleMenu}
            >
                <MoreVertIcon />
            </IconButton>

            <Menu anchorEl={anchorEl} open={open} onClose={closeMenu}>
                <MenuItem disabled>Add to Playlist</MenuItem>

                {/* ⭐ Playlist selection menu */}
                {store.playlists && store.playlists.length > 0 ? (
                    store.playlists.map((p) => (
                        <MenuItem
                            key={p._id}
                            sx={{ pl: 4 }}
                            onClick={() => addToPlaylist(p._id)}
                        >
                            {p.name}
                        </MenuItem>
                    ))
                ) : (
                    <MenuItem sx={{ pl: 4 }}>No Playlists</MenuItem>
                )}

                <MenuItem onClick={edit}>Edit Song</MenuItem>
                <MenuItem onClick={remove}>Remove from Catalog</MenuItem>
            </Menu>
        </Box>
    );
}
