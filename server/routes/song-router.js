const express = require('express');
const router = express.Router();
const SongController = require('../controllers/song-controller');
const auth = require('../auth');

router.post('/', auth.verify, SongController.createSong);
router.put('/:id', auth.verify, SongController.updateSong);
router.delete('/:id', auth.verify, SongController.deleteSong);
router.post('/:id/add-to-playlist', auth.verify, SongController.addSongToPlaylist);

router.get('/', auth.guestVerify, SongController.searchSongs);

module.exports = router;