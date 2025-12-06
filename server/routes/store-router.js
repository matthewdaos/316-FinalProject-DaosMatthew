const express = require('express')
const StoreController = require('../controllers/store-controller')
const router = express.Router()
const auth = require('../auth')

router.post('/playlist', auth.verify, StoreController.createPlaylist)
router.delete('/playlist/:id', auth.verify, StoreController.deletePlaylist)
router.get('/playlist/:id', auth.guestVerify, StoreController.getPlaylistById)
router.get('/playlistpairs', auth.verify, StoreController.getPlaylistPairs)
router.get('/playlists', auth.guestVerify, StoreController.searchPlaylists)
router.put('/playlist/:id', auth.verify, StoreController.updatePlaylist)
router.post('/playlist/:id/copy', auth.verify, StoreController.copyPlaylist)
router.post('/playlist/:id/play', auth.guestVerify, StoreController.playPlaylist)

module.exports = router