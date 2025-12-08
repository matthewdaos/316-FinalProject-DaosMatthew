import { Box, Typography, TextField, IconButton } from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";

export default function PlaylistFiltersPanel({ filters, setFilters }) {
    function updateField(field, value) {
        setFilters(prev => ({ ...prev, [field]: value }));
    }

    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 2, color: "#006CA5" }}>
                Playlists
            </Typography>
            {[
                ["name", "by Playlist Name"],
                ["user", "by User Name"],
                ["title", "by Song Title"],
                ["artist", "by Song Artist"],
                ["year", "by Song Year"],
            ].map(([field, label]) => (
                <Box key={field} sx={{ position: "relative", mb: 2 }}>
                    <TextField
                        fullWidth
                        variant="outlined"
                        label={label}
                        value={filters[field]}
                        onChange={(e) => updateField(field, e.target.value)}
                    />
                    {filters[field] !== "" && (
                        <IconButton
                            size="small"
                            sx={{ position: "absolute", right: 10, top: 12 }}
                            onClick={() => updateField(field, "")}
                        >
                            <ClearIcon />
                        </IconButton>
                    )}
                </Box>
            ))}
        </Box>
    );
}