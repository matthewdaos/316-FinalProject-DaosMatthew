import { useState, useEffect, useContext } from "react";
import { Box, Typography, Button, Divider } from "@mui/material";
import PlaylistFiltersPanel from "./PlaylistFiltersPanel";
import PlaylistList from "./PlaylistList";
import SortMenu from "./SortMenu";
import { GlobalStoreContext } from "../store";
import MUIDeleteModal from "./MUIDeleteModal";
import MUIEditPlaylistModal from "./MUIEditPlaylistModal";

export default function PlaylistsScreen() {
    const { store } = useContext(GlobalStoreContext);

    const [filters, setFilters] = useState({
        name: "",
        user: "",
        title: "",
        artist: "",
        year: "",
    });

    const [sortMethod, setSortMethod] = useState("Listeners (Hi–Lo)");

    useEffect(() => {
        if (store.loadUserPlaylists) {
            store.loadUserPlaylists();
        }
    }, []);

    function handleSearch() {
        if (store.searchPlaylists) {
            store.searchPlaylists(filters, sortMethod);
        }
    }

    function handleClear() {
        setFilters({ name: "", user: "", title: "", artist: "", year: "" });
        if (store.loadUserPlaylists) {
            store.loadUserPlaylists();
        }
    }

    const playlistCount = Array.isArray(store.playlists) ? store.playlists.length : 0;

    return (
        <Box sx={{ width: "100%", mt: 4, px: 4, boxSizing: "border-box" }}>
            <Box display="flex" alignItems="flex-start">
                <Box sx={{ width: "30%" }}>
                    <PlaylistFiltersPanel
                        filters={filters}
                        setFilters={setFilters}
                    />
                </Box>

                <Divider orientation="vertical" flexItem sx={{ mx: 3 }} />

                <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
                    <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                    >
                        <SortMenu
                            sortMethod={sortMethod}
                            setSortMethod={setSortMethod}
                        />
                        <Typography variant="h6">
                            {playlistCount} Playlists
                        </Typography>
                    </Box>
                    <Box
                        sx={{
                            mt: 2,
                            maxHeight: "60vh",       
                            overflowY: "auto",
                            pr: 1,                    
                        }}
                    >
                        <PlaylistList playlists={store.playlists || []} />
                    </Box>
                </Box>
            </Box>

            <Box
                mt={3}
                display="flex"
                justifyContent="space-between"
                alignItems="center"
            >
                <Box>
                    <Button
                        variant="contained"
                        sx={{ mr: 2, borderRadius: "20px", px: 3 }}
                        onClick={handleSearch}
                    >
                        Search
                    </Button>
                    <Button
                        variant="outlined"
                        sx={{ borderRadius: "20px", px: 3 }}
                        onClick={handleClear}
                    >
                        Clear
                    </Button>
                </Box>

                <Button
                    variant="contained"
                    sx={{ borderRadius: "20px", px: 3 }}
                    onClick={() => store.createNewList && store.createNewList()}
                >
                    New Playlist
                </Button>
            </Box>

            <MUIDeleteModal />
            <MUIEditPlaylistModal />
        </Box>
    );
}