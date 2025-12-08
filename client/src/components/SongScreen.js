import { useState, useEffect, useContext } from "react";
import { Box, Typography, Divider, Button } from "@mui/material";
import SongFiltersPanel from "./SongFiltersPanel";
import SortMenu from "./SortMenu";
import SongCatalog from "./SongCatalog";
import { GlobalStoreContext } from "../store";
import MUIEditSongModal from "./MUIEditSongModal";
import MUIDeleteModal from "./MUIDeleteModal";
import MUIDeleteSongModal from "./MUIDeleteSongModal";

export default function SongScreen() {
    const { store } = useContext(GlobalStoreContext);

    const [filters, setFilters] = useState({
        title: "",
        artist: "",
        year: "",
    });

    const [sortMethod, setSortMethod] = useState("Listens (Hi–Lo)");

    const [filteredSongs, setFilteredSongs] = useState([]);

    useEffect(() => {
        if (store.loadSongCatalog) {
            store.loadSongCatalog();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const allSongs = store.catalogSongs || [];
        setFilteredSongs(allSongs);
    }, [store.catalogSongs]);

    function handleSearch() {
        const allSongs = store.catalogSongs || [];
        const { title, artist, year } = filters;

        const t = title.trim().toLowerCase();
        const a = artist.trim().toLowerCase();
        const y = year.trim();

        // Filter
        let results = allSongs.filter((song) => {
            const sTitle = (song.title || "").toLowerCase();
            const sArtist = (song.artist || "").toLowerCase();
            const sYear = song.year ? String(song.year) : "";

            if (t && !sTitle.includes(t)) return false;
            if (a && !sArtist.includes(a)) return false;
            if (y && !sYear.includes(y)) return false;

            return true;
        });

        results = [...results]; 
        switch (sortMethod) {
            case "Listens (Lo–Hi)":
                results.sort(
                    (x, y) => (Number(x.listens ?? 0) - Number(y.listens ?? 0))
                );
                break;
            case "Title (A–Z)":
                results.sort((x, y) =>
                    (x.title || "").localeCompare(y.title || "")
                );
                break;
            case "Title (Z–A)":
                results.sort((x, y) =>
                    (y.title || "").localeCompare(x.title || "")
                );
                break;
            case "Year (New–Old)":
                results.sort(
                    (x, y) => Number(y.year ?? 0) - Number(x.year ?? 0)
                );
                break;
            case "Year (Old–New)":
                results.sort(
                    (x, y) => Number(x.year ?? 0) - Number(y.year ?? 0)
                );
                break;
            case "Listens (Hi–Lo)":
            default:
                results.sort(
                    (x, y) => Number(y.listens ?? 0) - Number(x.listens ?? 0)
                );
                break;
        }

        setFilteredSongs(results);
    }

    function handleClear() {
        setFilters({ title: "", artist: "", year: "" });
        setSortMethod("Listens (Hi–Lo)");

        const allSongs = store.catalogSongs || [];
        setFilteredSongs(allSongs);
    }

    function handleNewSong() {
        if (store.createNewCatalogSong) {
            store.createNewCatalogSong();
        }
    }

    const songs = filteredSongs || [];
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
            <MUIDeleteSongModal />
        </Box>
    );
}
