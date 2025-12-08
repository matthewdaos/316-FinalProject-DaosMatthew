import { useContext, useState, useEffect } from 'react';
import { GlobalStoreContext } from '../store';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';

const style1 = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 345,
    height: 250,
    backgroundSize: "contain",
    backgroundImage: `url(https://i.insider.com/602ee9ced3ad27001837f2ac?)`,
    border: '3px solid #000',
    padding: '20px',
    boxShadow: 24,
};

export default function MUIEditSongModal() {
    const { store } = useContext(GlobalStoreContext);

    // Safe fallback if nothing selected yet
    const song = store.currentSong || {
        title: "",
        artist: "",
        year: "",
        youTubeId: ""
    };

    const [title, setTitle] = useState(song.title || "");
    const [artist, setArtist] = useState(song.artist || "");
    const [year, setYear] = useState(
        song.year !== undefined && song.year !== null
            ? song.year.toString()
            : ""
    );
    const [youTubeId, setYouTubeId] = useState(song.youTubeId || "");

    // Sync local state whenever the modal opens or the selected song changes
    useEffect(() => {
        if (store.currentSong) {
            setTitle(store.currentSong.title || "");
            setArtist(store.currentSong.artist || "");
            setYear(
                store.currentSong.year !== undefined &&
                store.currentSong.year !== null
                    ? store.currentSong.year.toString()
                    : ""
            );
            setYouTubeId(store.currentSong.youTubeId || "");
        }
    }, [store.currentSong, store.currentModal]);

    // Do not render at all if modal isn't open or no song selected
    if (store.currentModal !== "EDIT_SONG" || !store.currentSong) return null;

    function handleConfirmEditSong() {
        const newSongData = {
            title,
            artist,
            year,
            youTubeId
        };

        // CASE 1: Editing a song inside a playlist (use TPS transaction)
        if (store.currentList) {
            store.addUpdateSongTransaction(store.currentSongIndex, newSongData);
        }
        // CASE 2: Editing a catalog song (no currentList, but we have a song _id)
        else if (store.currentSong && store.currentSong._id) {
            // this should be the helper you added in store/index.js
            store.updateCatalogSong(store.currentSong._id, newSongData);
        }

        store.hideModals();
    }

    function handleCancel() {
        store.hideModals();
    }

    return (
        <Modal open={true}>
            <Box sx={style1}>
                <Typography sx={{ fontWeight: 'bold' }} variant="h4">
                    Edit Song
                </Typography>

                <Divider sx={{ borderBottomWidth: 5, my: 1 }} />

                <Typography sx={{ mt: 1, color: "#702963", fontWeight: "bold", fontSize: "30px" }}>
                    Title:
                    <input
                        className="modal-textfield"
                        type="text"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                    />
                </Typography>

                <Typography sx={{ color: "#702963", fontWeight: "bold", fontSize: "30px" }}>
                    Artist:
                    <input
                        className="modal-textfield"
                        type="text"
                        value={artist}
                        onChange={e => setArtist(e.target.value)}
                    />
                </Typography>

                <Typography sx={{ color: "#702963", fontWeight: "bold", fontSize: "30px" }}>
                    Year:
                    <input
                        className="modal-textfield"
                        type="text"
                        value={year}
                        onChange={e => setYear(e.target.value)}
                    />
                </Typography>

                <Typography sx={{ color: "#702963", fontWeight: "bold", fontSize: "25px" }}>
                    YouTubeId:
                    <input
                        className="modal-textfield"
                        type="text"
                        value={youTubeId}
                        onChange={e => setYouTubeId(e.target.value)}
                    />
                </Typography>

                <Button
                    sx={{ mt: 2, color: "#8932CC", backgroundColor: "#CBC3E3" }}
                    variant="outlined"
                    onClick={handleConfirmEditSong}
                >
                    Confirm
                </Button>

                <Button
                    sx={{ mt: 2, ml: 15, color: "#8932CC", backgroundColor: "#CBC3E3" }}
                    variant="outlined"
                    onClick={handleCancel}
                >
                    Cancel
                </Button>
            </Box>
        </Modal>
    );
}
