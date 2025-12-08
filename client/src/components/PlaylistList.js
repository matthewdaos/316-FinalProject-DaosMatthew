import PlaylistCard from "./PlaylistCard";
import { Box } from "@mui/material";

export default function PlaylistList({ playlists }) {
    return (
        <Box mt={3}>
            {playlists.map((playlist) => (
                <PlaylistCard key={playlist._id} playlist={playlist} />
            ))}
        </Box>
    );
}