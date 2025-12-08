import { Box, TextField, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

export default function SongFiltersPanel({ filters, setFilters }) {
    const handleChange = (field) => (event) => {
        const value = event.target.value;
        setFilters((prev) => ({ ...prev, [field]: value }));
    };

    const clearField = (field) => () => {
        setFilters((prev) => ({ ...prev, [field]: "" }));
    };

    const fieldBox = (label, fieldKey) => (
        <Box sx={{ position: "relative", mb: 1.5 }}>
            <TextField
                fullWidth
                size="small"
                label={label}
                value={filters[fieldKey]}
                onChange={handleChange(fieldKey)}
            />
            {filters[fieldKey] && (
                <IconButton
                    size="small"
                    onClick={clearField(fieldKey)}
                    sx={{ position: "absolute", right: 4, top: 4 }}
                >
                    <CloseIcon fontSize="small" />
                </IconButton>
            )}
        </Box>
    );

    return (
        <Box sx={{ width: "100%", mt: 1 }}>
            {fieldBox("by Song Title", "title")}
            {fieldBox("by Song Artist", "artist")}
            {fieldBox("by Song Year", "year")}
        </Box>
    );
}
