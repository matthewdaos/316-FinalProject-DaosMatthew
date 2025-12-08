import { useState, useEffect, useContext } from "react";
import { Box, Typography, Divider, Button } from "@mui/material";
import SongFiltersPanel from "./SongFiltersPanel";
import SortMenu from "./SortMenu";
import SongCatalog from "./SongCatalog";
import { GlobalStoreContext } from "../store";
import MUIEditSongModal from "./MUIEditSongModal";
import MUIDeleteModal from "./MUIDeleteModal";

export default function SongScreen() {
    const { store } = useContext(GlobalStoreContext);

    const [filters, setFilters] = useState({
        title: "",
        artist: "",
        year: "",
    });

    const [sortMethod, setSortMethod] = useState("Listens (Hi–Lo)");

    useEffect(() => {
        if (store.loadSongCatalog) {
            store.loadSongCatalog();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function handleSearch() {
        if (store.searchSongs) {
            store.searchSongs(filters, sortMethod);
        }
    }

    function handleClear() {
        setFilters({ title: "", artist: "", year: "" });
        if (store.loadSongCatalog) {
            store.loadSongCatalog();
        }
    }

    function handleNewSong() {
        if (store.createNewCatalogSong) {
            store.createNewCatalogSong();
        }
    }

    const songs = store.catalogSongs || [];
    const count = songs.length;

    return (
        <Box sx={{ mt: 4, px: 4 }}>
            <Box display="flex" alignItems="flex-start">
                {/* LEFT SIDE – Filters */}
                <Box sx={{ width: "28%", minWidth: 260 }}>
                    <Typography
                        variant="h4"
                        sx={{ color: "#006CA5", mb: 1 }}
                    >
                        Songs Catalog
                    </Typography>

                    <SongFiltersPanel filters={filters} setFilters={setFilters} />

                    <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
                        <Button variant="contained" onClick={handleSearch}>
                            Search
                        </Button>
                        <Button variant="outlined" onClick={handleClear}>
                            Clear
                        </Button>
                    </Box>
                </Box>

                <Divider orientation="vertical" flexItem sx={{ mx: 3 }} />

                {/* RIGHT SIDE – Sort, count, New Song, list */}
                <Box sx={{ flexGrow: 1 }}>
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 2,
                        }}
                    >
                        <Box>
                            <SortMenu
                                sortMethod={sortMethod}
                                setSortMethod={setSortMethod}
                            />
                        </Box>

                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                            <Typography variant="subtitle1">
                                {count} Songs
                            </Typography>
                            <Button
                                variant="contained"
                                size="small"
                                onClick={handleNewSong}
                            >
                                New Song
                            </Button>
                        </Box>
                    </Box>

                    <Box sx={{ maxHeight: "70vh", overflowY: "auto", pr: 1 }}>
                        {songs.map((s) => (
                            <SongCatalog
                                key={s._id || s.title + s.artist + s.year}
                                song={s}
                            />
                        ))}
                    </Box>
                </Box>
            </Box>

            <MUIEditSongModal />
            <MUIDeleteModal />
        </Box>
    );
}
