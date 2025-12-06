const dbManager = require('../db/mongo/index')

addSongToPlaylist = async (req, res) => {
    const ownerId = req.userId;
    const songId = req.params.id;
    const { playlistId } = req.body;

    if(!playlistId) {
        return res.status(400).json({ success: false, errorMessage: 'playlistId required'});
    }

    try {
        const result = await dbManager.addSongToPlaylist({
            ownerId,
            songId,
            playlistId
        });

        if(result.ok === false) {
            if(result.reason === 'song or playlist not found') {
                return res.status(404).json({ success: false, errorMessage: 'Song or playlist not found'});
            }
            if(result.reason === 'not playlist owner') {
                return res.status(403).json({ success: false, errorMessage: 'You do not own this playlist'});
            }
        }

        return res.status(200).json({ success: true, playlist: result.playlist })
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, errorMessage: 'Failed to add song to playlist'});
    }
}

createSong = async (req, res) => {
    const userId = req.userId;

    const { title, artist, year, youTubeId } = req.body;
    if (!title || !artist || !year || !youTubeId) {
        return res.status(400).json({ success: false, errorMessage: 'Song fields missing'});
    }

    try {
        const song = await dbManager.createSong({
            ownerId,
            title,
            artist,
            year,
            youTubeId
        })
        return res.status(201).json({ success: true, song });
    } catch(err) {
        if(err.code === 11000) {
            return res.status(400).json({ success: false, errorMessage: 'Song already exists' });
        }
        console.error(err);
        return res.status(500).json({ success: false, errorMessage: 'Failed to create song' });
    }
}

deleteSong = async (req, res) => {
    const ownerId = req.userId;
    const songId = req.params.id;

    try {
        const result = await dbManager.deleteSong({ ownerId, songId });

        if(result.ok === false) {
            if(result.reason === 'song not found') {
                return res.status(404).json({ success: false, errorMessage: 'Song not found'});
            }
            if(result.reason === 'not song owner') {
                return res.status(403).json({ success: false, errorMessage: 'Only owner can remove song'});
            }
        }
        return res.status(200).json({ success: true });
    } catch(err) {
        console.error(err);
        return res.status(500).json({ success: false, errorMessage: 'Failed to delete song' });
    }
}

searchSongs = async (req, res) => {
    const userId = req.userId;

    const { title, artist, year, scope, sortBy, sortDir } = req.query;

    try {
        const songs = await dbManager.searchSong({
            title,
            artist,
            year,
            scope,
            sortBy,
            sortDir,
            userId
        })

        return res.status(200).json({ success: true, songs });
    } catch(err) {
        console.error(err);
        return res.status(500).json({ success: false, errorMessage: 'Failed to search songs' });
    }
}

updateSong = async(req, res) => {
    const ownerId = req.userId;
    const songId = req.params.id;
    const data = req.body;

    try {
        const result = await dbManager.updateSong({ ownerId, songId, data });

        if(result.ok === false) {
            if(result.reason === 'song not found') {
                return res.status(404).json({ success: false, errorMessage: 'Song not found'});
            }
            if(result.reason === 'not song owner') {
                return res.status(403).json({ success: false, errorMessage: 'Only owner can update song'});
            }
        }
        return res.status(200).json({ success: true, song: result.song });
    } catch(err) {
        console.error(err);
        return res.status(500).json({ success: false, errorMessage: 'Failed to update song' });
    }
}

module.exports = {
    addSongToPlaylist,
    createSong,
    deleteSong,
    searchSongs,
    updateSong
}