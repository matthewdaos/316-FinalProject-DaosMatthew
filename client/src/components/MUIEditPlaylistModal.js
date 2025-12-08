import { useContext, useEffect, useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Box,
    Typography,
    TextField,
    IconButton,
    Button,
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";

import { GlobalStoreContext } from "../store";

export default function MUIEditPlaylistModal() {
    const { store } = useContext(GlobalStoreContext);

    const open = store.isEditPlaylistModalOpen
        ? store.isEditPlaylistModalOpen()
        : false;

    const playlist = store.currentList;

    const [name, setName] = useState("");

    useEffect(() => {
        if (playlist) {
            setName(playlist.name || "");
        }
    }, [playlist]);

    if (!playlist) return null;

    const songs = playlist.songs || [];

    function handleConfirm() {
        if (name !== playlist.name) {
            store.changeListName(playlist._id, name);
        }
        store.updateCurrentList();

        store.hideModals();
    }

    function handleNameBlur() {
        if (name && name !== playlist.name) {
            store.changeListName(playlist._id, name);
        }
    }

    function handleAddSong() {
        if(store.canAddNewSong && !store.canAddNewSong()) return;
        if(store.addNewSong) {
            store.addNewSong();
        }
    }

    function handleEditSong(index, song) {
        store.showEditSongModal(index, song);
    }

    function handleDeleteSong(index, song) {
        store.addRemoveSongTransaction(song, index);
    }

    function handleUndo() {
        store.undo();
    }

    function handleRedo() {
        store.redo();
    }

    return (
        <Dialog
            open={open}
            maxWidth={false}
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 4,
                    backgroundColor: "#b6ffb6", 
                    width: "60vw",
                    maxWidth: "800px",
                    height: "60vh",
                    maxHeight: "700px"
                },
            }}
        >
            <DialogTitle
                sx={{
                    backgroundColor: "#008000",
                    color: "white",
                    fontWeight: "bold",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    pb: 1,
                }}
            >
                <Typography variant="h6" component="span">
                    Edit Playlist
                </Typography>

                <Button
                    variant="contained"
                    size="small"
                    sx={{
                        backgroundColor: "white",
                        color: "#008000",
                        fontWeight: "bold",
                        "&:hover": { backgroundColor: "#e4ffe4" }
                    }}
                    onClick={handleAddSong}
                >
                    + Add Song
                </Button>
            </DialogTitle>

            <DialogContent
                sx={{
                    pt: 2,
                    background: "linear-gradient(to bottom, #b6ffb6, #d6ffd6)",
                }}
            >
                <Box
                    sx={{
                        backgroundColor: "#7be57b",
                        borderRadius: "8px",
                        p: 1,
                        mb: 2,
                        display: "flex",
                        alignItems: "center",
                    }}
                >
                    <TextField
                        fullWidth
                        variant="outlined"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onBlur={handleNameBlur}
                        sx={{
                            backgroundColor: "white",
                            borderRadius: "6px",
                        }}
                    />
                </Box>

                <Box
                    sx={{
                        backgroundColor: "#fffbe6",
                        borderRadius: "8px",
                        p: 1,
                        maxHeight: "45vh",
                        overflowY: "auto",
                    }}
                >
                    {songs.length === 0 ? (
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ p: 2 }}
                        >
                            No songs in this playlist yet.
                        </Typography>
                    ) : (
                        songs.map((song, index) => (
                            <Box
                                key={song._id || index}
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    backgroundColor: "#ffe69b",
                                    borderRadius: "6px",
                                    p: 1,
                                    mb: 1,
                                }}
                            >
                                <Typography variant="body1" sx={{ fontSize: "0.95rem" }}>
                                    {index + 1}. {song.title} by {song.artist}{" "}
                                    {song.year ? `(${song.year})` : ""}
                                </Typography>

                                <Box>
                                    <IconButton
                                        size="small"
                                        onClick={() => handleEditSong(index, song)}
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton
                                        size="small"
                                        onClick={() => handleDeleteSong(index, song)}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </Box>
                            </Box>
                        ))
                    )}
                </Box>
            </DialogContent>

            <DialogActions
                sx={{
                    backgroundColor: "#b6ffb6",
                    display: "flex",
                    justifyContent: "space-between",
                    px: 3,
                    pb: 2,
                }}
            >
                <Box>
                    <Button
                        variant="contained"
                        disabled={!store.canUndo()}
                        sx={{ mr: 2, borderRadius: "20px" }}
                        onClick={handleUndo}
                    >
                        Undo
                    </Button>
                    <Button
                        variant="contained"
                        disabled={!store.canRedo()}
                        sx={{ borderRadius: "20px" }}
                        onClick={handleRedo}
                    >
                        Redo
                    </Button>
                </Box>

                <Button
                    variant="contained"
                    sx={{ borderRadius: "20px" }}
                    onClick={handleConfirm}
                >
                    Confirm
                </Button>
            </DialogActions>
        </Dialog>
    );
}
