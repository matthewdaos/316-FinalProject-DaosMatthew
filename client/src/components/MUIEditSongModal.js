import { useContext, useEffect, useState } from "react";
import {
    Modal,
    Box,
    Typography,
    TextField,
    Button,
    IconButton,
    InputAdornment,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { GlobalStoreContext } from "../store";

const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 380,
    bgcolor: "#b8ffb2", 
    border: "3px solid #000",
    boxShadow: 24,
    p: 0,
    borderRadius: "6px",
};

const headerStyle = {
    bgcolor: "#00a000",
    color: "white",
    px: 2,
    py: 1,
    fontWeight: "bold",
    fontSize: "1.1rem",
};

const contentStyle = {
    p: 2.5,
    pt: 2,
};

export default function MUIEditSongModal() {
    const { store } = useContext(GlobalStoreContext);

    const open =
        store.isEditSongModalOpen && store.isEditSongModalOpen();

    const song = store.currentSong || {
        title: "",
        artist: "",
        year: "",
        youTubeId: "",
    };

    const [title, setTitle] = useState(song.title || "");
    const [artist, setArtist] = useState(song.artist || "");
    const [year, setYear] = useState(song.year || "");
    const [youTubeId, setYouTubeId] = useState(song.youTubeId || "");

    useEffect(() => {
        setTitle(song.title || "");
        setArtist(song.artist || "");
        setYear(song.year || "");
        setYouTubeId(song.youTubeId || "");
    }, [song, open]);

    function handleClose() {
        store.hideModals();
    }

    const disabled =
        !title.trim() ||
        !artist.trim() ||
        !String(year).trim() ||
        !youTubeId.trim();

    async function handleComplete() {
        const newSongData = {
            title: title.trim(),
            artist: artist.trim(),
            year: String(year).trim(),
            youTubeId: youTubeId.trim(),
        };

        if (song._id && store.updateCatalogSong) {
            await store.updateCatalogSong(song._id, newSongData);
        } else if (store.addUpdateSongTransaction) {
            store.addUpdateSongTransaction(
                store.currentSongIndex,
                newSongData
            );
        }

        store.hideModals();
    }

    const textFieldCommon = {
        fullWidth: true,
        margin: "dense",
        variant: "outlined",
        InputProps: {
            sx: { bgcolor: "#D3D3D3" }, 
        },
    };

    return (
        <Modal open={open} onClose={handleClose}>
            <Box sx={modalStyle}>
                <Typography component="div" sx={headerStyle}>
                    Edit Song
                </Typography>

                <Box sx={contentStyle}>
                    <TextField
                        {...textFieldCommon}
                        placeholder="Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        InputProps={{
                            ...textFieldCommon.InputProps,
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        size="small"
                                        onClick={() => setTitle("")}
                                    >
                                        <CloseIcon fontSize="small" />
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />

                    <TextField
                        {...textFieldCommon}
                        placeholder="Artist"
                        value={artist}
                        onChange={(e) => setArtist(e.target.value)}
                        InputProps={{
                            ...textFieldCommon.InputProps,
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        size="small"
                                        onClick={() => setArtist("")}
                                    >
                                        <CloseIcon fontSize="small" />
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />

                    <TextField
                        {...textFieldCommon}
                        placeholder="Year"
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        InputProps={{
                            ...textFieldCommon.InputProps,
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        size="small"
                                        onClick={() => setYear("")}
                                    >
                                        <CloseIcon fontSize="small" />
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />

                    <TextField
                        {...textFieldCommon}
                        placeholder="YouTube Id"
                        value={youTubeId}
                        onChange={(e) => setYouTubeId(e.target.value)}
                        InputProps={{
                            ...textFieldCommon.InputProps,
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        size="small"
                                        onClick={() => setYouTubeId("")}
                                    >
                                        <CloseIcon fontSize="small" />
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />

                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            mt: 3,
                        }}
                    >
                        <Button
                            variant="contained"
                            disabled={disabled}
                            sx={{
                                bgcolor: disabled ? "#c0c0c0" : "#dddddd",
                                color: "#000",
                                "&:hover": {
                                    bgcolor: disabled
                                        ? "#c0c0c0"
                                        : "#e0e0e0",
                                },
                                px: 4,
                            }}
                            onClick={handleComplete}
                        >
                            Complete
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleClose}
                            sx={{
                                bgcolor: "#000",
                                color: "#fff",
                                px: 4,
                                "&:hover": {
                                    bgcolor: "#222",
                                },
                            }}
                        >
                            Cancel
                        </Button>
                    </Box>
                </Box>
            </Box>
        </Modal>
    );
}
