import { useContext, useEffect, useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Box,
    Typography,
    Button,
    Avatar,
    List,
    ListItemButton,
    ListItemText,
} from "@mui/material";
import { GlobalStoreContext } from "../store";

export default function MUIPlayPlaylistModal() {
    const { store } = useContext(GlobalStoreContext);

    const open = store.isPlayPlaylistModalOpen
        ? store.isPlayPlaylistModalOpen()
        : false;

    const playlist = store.currentList;

    // Local index of the current song being played
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (playlist && Array.isArray(playlist.songs) && playlist.songs.length > 0) {
            setCurrentIndex(0);
        }
    }, [playlist]);

    if (!playlist) return null;

    const songs = playlist.songs || [];
    const currentSong = songs[currentIndex];

    const ownerName =
        playlist.ownerUsername ||
        playlist.ownerName ||
        playlist.ownerEmail ||
        "";

    const avatarLetter = ownerName ? ownerName[0].toUpperCase() : "?";

    // Youtube embed URL (basic embed API)
    const youTubeId = currentSong?.youTubeId || "dQw4w9WgXcQ";
    const embedUrl = `https://www.youtube.com/embed/${youTubeId}?autoplay=1`;

    function handleClose() {
        store.hideModals();
    }

    function handleSelectSong(index) {
        setCurrentIndex(index);
    }

    function handlePrev() {
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
    }

    function handleNext() {
        if (!songs.length) return;
        setCurrentIndex((prev) =>
            prev < songs.length - 1 ? prev + 1 : prev
        );
    }

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="lg"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 4,
                    backgroundColor: "#b6ffb6",
                    height: "70vh",
                },
            }}
        >
            {/* Title bar */}
            <DialogTitle
                sx={{
                    backgroundColor: "#008000",
                    color: "white",
                    fontWeight: "bold",
                    pb: 1,
                }}
            >
                Play Playlist
            </DialogTitle>

            <DialogContent
                sx={{
                    pt: 2,
                    backgroundColor: "#b6ffb6",
                }}
            >
                <Box display="flex" height="100%">
                    {/* LEFT: playlist info + list of songs */}
                    <Box
                        sx={{
                            flex: 1,
                            mr: 2,
                            backgroundColor: "white",
                            borderRadius: 2,
                            display: "flex",
                            flexDirection: "column",
                            overflow: "hidden",
                        }}
                    >
                        {/* Header with avatar and playlist title */}
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                p: 2,
                                borderBottom: "1px solid #ddd",
                            }}
                        >
                            <Avatar sx={{ mr: 2 }}>
                                {avatarLetter}
                            </Avatar>
                            <Box>
                                <Typography variant="subtitle1">
                                    {playlist.name || "(untitled)"}
                                </Typography>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    {ownerName}
                                </Typography>
                            </Box>
                        </Box>

                        {/* Song list */}
                        <Box sx={{ flex: 1, overflowY: "auto" }}>
                            <List disablePadding>
                                {songs.map((song, index) => (
                                    <ListItemButton
                                        key={song._id || index}
                                        selected={index === currentIndex}
                                        onClick={() => handleSelectSong(index)}
                                        sx={{
                                            borderBottom: "1px solid #eee",
                                            backgroundColor:
                                                index === currentIndex
                                                    ? "#ffeb99"
                                                    : "inherit",
                                        }}
                                    >
                                        <ListItemText
                                            primary={`${index + 1}. ${
                                                song.title
                                            }${
                                                song.year
                                                    ? ` (${song.year})`
                                                    : ""
                                            }`}
                                            secondary={
                                                song.artist
                                                    ? song.artist
                                                    : ""
                                            }
                                        />
                                    </ListItemButton>
                                ))}
                                {songs.length === 0 && (
                                    <Box p={2}>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                        >
                                            No songs in this playlist.
                                        </Typography>
                                    </Box>
                                )}
                            </List>
                        </Box>
                    </Box>

                    {/* RIGHT: YouTube player + controls */}
                    <Box
                        sx={{
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
                        }}
                    >
                        {/* YouTube embed */}
                        <Box
                            sx={{
                                position: "relative",
                                paddingTop: "56.25%", // 16:9
                                backgroundColor: "#000",
                                borderRadius: 2,
                                overflow: "hidden",
                            }}
                        >
                            <iframe
                                src={embedUrl}
                                title={currentSong?.title || "YouTube player"}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                style={{
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    width: "100%",
                                    height: "100%",
                                }}
                            />
                        </Box>

                        {/* Controls */}
                        <Box
                            sx={{
                                mt: 2,
                                display: "flex",
                                justifyContent: "center",
                                gap: 2,
                            }}
                        >
                            <Button
                                variant="contained"
                                onClick={handlePrev}
                                disabled={currentIndex === 0}
                            >
                                ⏮
                            </Button>

                            {/* We rely on autoplay when changing song index,
                                so we don't need a special play/pause button.
                                You could still add one to reload the iframe. */}
                            <Button
                                variant="contained"
                                onClick={handleNext}
                                disabled={
                                    songs.length === 0 ||
                                    currentIndex === songs.length - 1
                                }
                            >
                                ⏭
                            </Button>
                        </Box>
                    </Box>
                </Box>
            </DialogContent>

            <DialogActions
                sx={{
                    backgroundColor: "#b6ffb6",
                    justifyContent: "flex-end",
                    pr: 3,
                    pb: 2,
                }}
            >
                <Button
                    variant="contained"
                    onClick={handleClose}
                    sx={{ borderRadius: "20px" }}
                >
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
}