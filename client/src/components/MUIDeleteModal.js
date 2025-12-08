import { useContext } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box } from "@mui/material";
import { GlobalStoreContext } from "../store";

export default function MUIDeleteModal() {
    const { store } = useContext(GlobalStoreContext);

    const open = store.isDeleteListModalOpen();
    const playlist = store.listMarkedForDeletion;

    const name = playlist ? playlist.name : "";

    function handleConfirm() {
        store.deleteMarkedList();
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
            <DialogTitle sx={{ fontWeight: "bold", backgroundColor: "#008000", color: "white" }}>
                Delete playlist?
            </DialogTitle>

            <DialogContent sx={{ pt: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                    Are you sure you want to delete the {name} playlist?
                </Typography>
                <Typography variant="body2">
                    Doing so means it will be permanently removed.
                </Typography>
            </DialogContent>

            <DialogActions>
                <Box sx={{ display: "flex", justifyContent: "flex-start", width: "100%", pl: 2, pb: 2 }}>
                    <Button
                        variant="contained"
                        color="error"
                        sx={{ mr: 2 }}
                        onClick={handleConfirm}
                    >
                        Delete Playlist
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={handleCancel}
                    >
                        Cancel
                    </Button>
                </Box>
            </DialogActions>
        </Dialog>
    );
}