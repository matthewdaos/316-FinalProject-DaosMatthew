import { useContext, useState } from "react";
import {
    Card,
    CardContent,
    Typography,
    Box,
    Button,
    Avatar,
    IconButton,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { GlobalStoreContext } from "../store";

export default function PlaylistCard({ playlist }) {
    const { store } = useContext(GlobalStoreContext);
    const [expanded, setExpanded] = useState(false);

    const name = playlist.name || "(untitled)";

    const ownerDisplay =
        playlist.ownerUsername ||
        playlist.ownerName ||
        playlist.ownerEmail ||
        "";

    const listeners = playlist.listeners ?? 0;

    const avatarLetter = ownerDisplay
        ? ownerDisplay[0].toUpperCase()
        : "?";

    function handleDelete() {
        if (store.markListForDeletion) {
            store.markListForDeletion(playlist._id);
        }
    }

    function handleEdit() {
        if (store.showEditPlaylistModal) {
            store.showEditPlaylistModal(playlist._id);
        }
    }

    function handleCopy() {
        if (store.copyPlaylist) {
            store.copyPlaylist(playlist._id);
        }
    }

    function handlePlay() {
        if (store.setCurrentList) {
            store.setCurrentList(playlist._id);
        }
    }

    function toggleExpanded() {
        setExpanded((prev) => !prev);
    }

    function formatDuration(d) {
        if (d === undefined || d === null) return "--:--";
        if (typeof d === "string") return d;

        const totalSeconds = Number(d);
        if (Number.isNaN(totalSeconds)) return "--:--";

        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    }

    const songs = playlist.songs || [];

    return (
        <Card sx={{ mb: 2, borderRadius: "12px" }}>
            <CardContent>
                <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                >
                    <Box display="flex" alignItems="center">
                        <Avatar sx={{ mr: 2 }}>
                            {avatarLetter}
                        </Avatar>

                        <Box>
                            <Typography variant="h6">
                                {name}
                            </Typography>
                            <Typography
                                variant="subtitle2"
                                color="text.secondary"
                            >
                                {ownerDisplay}
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{ color: "#0080ff", mt: 0.5 }}
                            >
                                {listeners} Listeners
                            </Typography>
                        </Box>
                    </Box>

                    <Box
                        display="flex"
                        flexDirection="column"
                        alignItems="flex-end"
                    >
                        <Box display="flex" gap={1} mb={1} flexWrap="wrap">
                            <Button
                                variant="outlined"
                                color="error"
                                size="small"
                                onClick={handleDelete}
                            >
                                Delete
                            </Button>
                            <Button
                                variant="contained"
                                size="small"
                                onClick={handleEdit}
                            >
                                Edit
                            </Button>
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={handleCopy}
                            >
                                Copy
                            </Button>
                            <Button
                                variant="contained"
                                size="small"
                                onClick={handlePlay}
                            >
                                Play
                            </Button>
                        </Box>

                        <IconButton
                            size="small"
                            onClick={toggleExpanded}
                            sx={{
                                transform: expanded
                                    ? "rotate(180deg)"
                                    : "rotate(0deg)",
                                transition: "transform 0.2s",
                            }}
                        >
                            <ExpandMoreIcon />
                        </IconButton>
                    </Box>
                </Box>

                {expanded && (
                    <Box mt={2} pl={7}>
                        {songs.length === 0 ? (
                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                No songs in this playlist.
                            </Typography>
                        ) : (
                            songs.map((song, index) => (
                                <Box
                                    key={song._id || index}
                                    display="flex"
                                    justifyContent="space-between"
                                    mb={0.5}
                                >
                                    <Typography variant="body2">
                                        {index + 1}. {song.title}
                                    </Typography>
                                    <Typography variant="body2">
                                        {formatDuration(song.duration)}
                                    </Typography>
                                </Box>
                            ))
                        )}
                    </Box>
                )}
            </CardContent>
        </Card>
    );
}