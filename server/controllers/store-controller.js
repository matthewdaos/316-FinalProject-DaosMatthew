const dbManager = require('../db/mongo/index')

copyPlaylist = async(req, res) => {
    const userId = req.userId;
    const playlistId = req.params.id;

    try {
        const result = await dbManager.copyPlaylist({
            ownerId: userId,
            sourcePlaylistId: playlistId
        });

        if(result && result.ok === false) {
            if(result.reason === 'user not found') {
                return res.status(404).json({ success: false, errorMessage: 'User not found' });
            }
            if(result.reason === 'playlist not found') {
                return res.status(404).json({ success: false, errorMessage: 'Playlist not found' });
            }
        }

        return res.status(201).json({ success: true, playlist: result });
    } catch(err) {
        console.log(err);
        return res.status(500).json({ success: false, errorMessage: 'Failed to copy playlist' });
    }
}
createPlaylist = async (req, res) => {
    const userId = req.userId;

    const { name, songs } = req.body;
    if (!name) {
        return res.status(400).json({ success: false, error: 'Playlist name is required', })
    }
    
    try {
        const result = await dbManager.createPlaylist({
            ownerId: userId,
            name, 
            songs
        })

        if(result && result.ok === false) {
            if(result.reason === 'user not found') {
                return res.status(404).json({ success: false, errorMessage: 'User not found' });
            }
            if(result.reason === 'playlist name conflict') {
                return res.status(400).json({ success: false, errorMessage: 'Already have playlist of that name' });
            }
        }
        return res.status(201).json({ success: true, playlist: result });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, errorMessage: 'Failed to create playlist' });
    }
}
deletePlaylist = async (req, res) => {
    const userId = req.userId;
    const playlistId = req.params.id;

    try {
        const result = await dbManager.deletePlaylist({
            ownerId: userId,
            playlistId
        })

        if(result && result.ok === false) {
            if(result.reason === 'playlist not found') {
                return res.status(404).json({ success: false, errorMessage: 'Playlist not found' });
            }
            if(result.reason === 'not playlist owner') {
                return res.status(403).json({ success: false, errorMessage: 'authentication error' });
            }
        }

        return res.status(200).json({ success: true });
    } catch(err) {
        console.log(err);
        return res.status(500).json({ success: false, errorMessage: 'Failed to delete playlist' });
    }
}
getPlaylistById = async (req, res) => {
    const userId = req.userId;
    const playlistId = req.params.id;

    try {
        const playlist = await dbManager.getPlaylistById(playlistId);
        if(!playlist) {
            return res.status(404).json({ success: false, error: 'Playlist not found', })
        }

        if(playlist.owner.toString() !== userId.toString()) {
            return res.status(403).json({ success: false, error: 'authentication error' })
        }

        return res.status(200).json({ success: true, playlist });
    } catch (err) {
        console.error(err);
        return res.status(400).json({ success: false, error: err });
    }
}
getPlaylistPairs = async (req, res) => {
    const userId = req.userId;

    try {
        const pairs = await dbManager.getUserPlaylistPairs(userId);

        return res.status(200).json({ success: true, idNamePairs: pairs });
    } catch(err) {
        console.error(err);
        return res.status(400).json({ success: false, error: err });
    }
}

playPlaylist = async(req, res) => {
    const listenerId = req.userId || null;
    const playlistId = req.params.id;

    try {
        const result = await dbManager.playPlaylist({ listenerId, playlistId });
        if(result && result.ok === false) {
            if(result.reason === 'playlist not found') {
                return res.status(404).json({ success: false, errorMessage: 'Playlist not found' });
            }
        }
        return res.status(200).json({ success: true, playlist: result });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, errorMessage: 'Failed to register play' });
    }
}

searchPlaylists = async (req, res) => {
    const userId = req.userId;

    try {
        const playlists = await dbManager.searchPlaylist({
            userId,
            name: req.query.name,
            userName: req.query.userName,
            songTitle: req.query.songTitle,
            songArtist: req.query.songArtist,
            songYear: req.query.songYear,
            scope: req.query.scope,
            sortBy: req.query.sortBy,
            sortDir: req.query.sortDir
        });
        return res.status(200).json({ success: true, playlists });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, errorMessage: 'Failed to search playlists' });
    }
}
updatePlaylist = async (req, res) => {
    const userId = req.userId;
    const playlistId = req.params.id;

    const { name, songs } = req.body;

    try {
        const result = await dbManager.updatePlaylist({
            ownerId: userId,
            playlistId,
            name,
            songs,
        });

        if (result && result.ok === false) {
            if (result.reason === 'playlist not found') {
                return res.status(404).json({ success: false, errorMessage: 'Playlist not found' });
            }
            if (result.reason === 'not playlist owner') {
                return res.status(403).json({ success: false, errorMessage: 'authentication error' });
            }
            if (result.reason === 'playlist name conflict') {
                return res.status(400).json({ success: false, errorMessage: 'Already have playlist of that name' });
            }
        }

        return res.status(200).json({ success: true, playlist: result });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, errorMessage: 'Playlist not updated' });
    }
};
module.exports = {
    copyPlaylist,
    createPlaylist,
    deletePlaylist,
    getPlaylistById,
    getPlaylistPairs,
    playPlaylist,
    searchPlaylists,
    updatePlaylist
}