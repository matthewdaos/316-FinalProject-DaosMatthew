const Song = require('../models/song-model')
const Playlist = require('../models/playlist-model')

addSongToPlaylist = async (req, res) => {
    const userId = req.userId;

    const { playlistId } = req.body;
    if(!playlistId) {
        return res.status(400).json({ success: false, errorMessage: 'playlistId required'});
    }

    try {
        const [song, playlist] = await Promise.all([
            Song.findById(req.params.id),
            Playlist.findById(playlistId)
        ]);

        if (!song || !playlist) {
            return res.status(404).json({ success: false, errorMessage: 'Song or playlist not found'});
        }

        if (playlist.owner.toString() !== userId) {
            return res.status(403).json({ success: false, errorMessage: "You do not own this playlist"});
        }

        playlist.songs.push(song._id);
        await playlist.save();

        song.playlistCount += 1;
        await song.save();

        return res.status(200).json({ success: true, playlist })
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
        const song = new Song({
            title,
            artist, 
            year,
            youTubeId,
            owner: userId
        })

        await song.save();
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
    const userId = req.userId;

    try {
        const song = await Song.findById(req.params.id);
        if(!song) {
            return res.status(404).json({ success: false, errorMessage: 'Song not found' });
        }
        if(song.owner.toString() !== userId) {
            return res.status(403).json({ success: false, errorMessage: 'Only owner can remove song' });
        }

        await Playlist.updateMany(
            { songs: song._id },
            { $pull: { songs: song._id } }
        );

        await Song.deleteOne({ _id: song._id });
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
        const filter = {};
        
        if (title && title.trim() !== '') {
            filter.title = { $regex: title.trim(), $options: 'i' };
        }
        if (artist && artist.trim() !== '') {
            filter.artist = { $regex: artist.trim(), $options: 'i' };
        }
        if(year && !isNaN(year)) {
            filter.year = Number(year);
        }

        if(userId && scope === 'mine') {
            filter.owner = userId;
        }

        const dir = sortDir === 'asc' ? 1 : -1;
        const sort = {};

        switch(sortBy) {
            case 'listens':
                sort.listens = dir;
                break;
            case 'playlists':
                sort.playlistCount = dir;
                break;
            case 'title':
                sort.title = dir;
                break;
            case 'artist':
                sort.artist = dir;
                break;
            case 'year':
                sort.year = dir;
                break;
            default: 
                sort.listens = -1;
        }

        const songs = await Song.find(filter).sort(sort);

        return res.status(200).json({ success: true, songs });
    } catch(err) {
        console.error(err);
        return res.status(500).json({ success: false, errorMessage: 'Failed to search songs' });
    }
}

updateSong = async(req, res) => {
    const userId = req.userId;

    const { title, artist, year, youTubeId } = req.body;

    try {
        const song = await Song.findById(req.params.id);
        if(!song) {
            return res.status(404).json({ success: false, errorMessage: 'Song not found' });
        }
        if(song.owner.toString() !== userId) {
            return res.status(403).json({ success: false, errorMessage: 'Only owner can update song' });
        }

        if(title !== undefined) song.title = title;
        if(artist !== undefined) song.artist = artist;
        if(year !== undefined) song.year = year;
        if(youTubeId !== undefined) song.youTubeId = youTubeId;

        await song.save();
        return res.status(200).json({ success: true, song });
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