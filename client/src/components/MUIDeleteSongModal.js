import { useContext } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box } from "@mui/material";
import { GlobalStoreContext } from "../store";

export default function MUIDeleteSongFromCatalogModal() {
    const { store } = useContext(GlobalStoreContext);

    const open = store.isDeleteSongModalOpen && store.isDeleteSongModalOpen();
    const song = store.songMarkedForDeletion;

    const songName = song
        ? `${song.title} by ${song.artist}${song.year ? " (" + song.year + ")" : ""}`
        : "";

    function handleConfirm() {
        store.deleteCatalogSong();
    }

    function handleCancel() {
        store.hideModals();
    }

    return (
        <Dialog
            open={open}
            onClose={handleCancel}
            maxWidth="xs"
            fullWidth
            PaperProps={{
                sx: {
                    backgroundColor: "#b6ffb6"   
                },
            }}
        >
            <DialogTitle
                sx={{
                    fontWeight: "bold",
                    backgroundColor: "#008000",
                    color: "white"
                }}
            >
                Delete song?
            </DialogTitle>

            <DialogContent sx={{ pt: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                    Are you sure you want to remove:
                </Typography>

                <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
                    {songName}
                </Typography>

                <Typography variant="body2">
                    This will permanently remove this song from the catalog.
                </Typography>
            </DialogContent>

            <DialogActions>
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "flex-start",
                        width: "100%",
                        pl: 2,
                        pb: 2
                    }}
                >
                    <Button
                        variant="contained"
                        color="error"
                        sx={{ mr: 2 }}
                        onClick={handleConfirm}
                    >
                        Delete Song
                    </Button>

                    <Button variant="outlined" onClick={handleCancel}>
                        Cancel
                    </Button>
                </Box>
            </DialogActions>
        </Dialog>
    );
}
