const Playlist = require('../models/playlist-model')
const Song = require('../models/song-model')
const User = require('../models/user-model');
const auth = require('../auth')

copyPlaylist = async(req, res) => {
    const userId = req.userId;

    try {
        const source = await Playlist.findById(req.params.id).populate('owner');
        if(!source) {
            return res.status(404).json({ errorMessage: 'Playlist not found' });
        }

        const user = await User.findById(userId);
        if(!user) {
            return res.status(404).json({ errorMessage: 'User not found' });
        }

        let copyName = `Copy of ${source.name}`;
        let name = copyName;
        let suffix = 1;
        while(await Playlist.findOne({ owner: userId, name})) {
            name = `${copyName} (${suffix++})`;
        }

        const copy = new Playlist({ 
            name, 
            ownerEmail: user.email,
            owner: user._id,
            songs: [...source.songs]
        })


        await copy.save();
        await user.save();

        return res.status(201).json({ success: true, playlist: copy });
    } catch(err) {
        console.log(err);
        return res.status(500).json({ success: false, errorMessage: 'Failed to copy playlist' });
    }
}
createPlaylist = async (req, res) => {
    const userId = req.userId;

    const { name, songs } = req.body;
    console.log("createPlaylist body: " + JSON.stringify(body));
    if (!name) {
        return res.status(400).json({
            success: false,
            error: 'Playlist name is required',
        })
    }
    
    try {
        const user = await User.findById(userId);
        if(!user) {
            return res.status(404).json({ errorMessage: 'User not found' });
        }

        const existingUser = await Playlist.findOne({ owner: userId, name });
        if(existingUser) {
            return res.status(400).json({ success: false, errorMessage: 'Already have playlist of that name' })
        }

        const playlist = new Playlist({
            name, 
            ownerEmail: user.email,
            owner: user._id,
            songs: songs || []
        })

        await playlist.save();
        await user.save();

        return res.status(201).json({ success: true, playlist });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, errorMessage: 'Failed to create playlist' });
    }
}
deletePlaylist = async (req, res) => {
    const userId = req.userId;

    try {
        const playlist = await Playlist.findById(req.params.id).populate('owner');
        if(!playlist) {
            return res.status(404).json({ errorMessage: 'Playlist not found' });
        }
        if(playlist,owner.toString() !== userId) {
            return res.status(403).json({ errorMessage: 'authentication error' })
        }

        await Playlist.deleteOne({ _id: playlist._id });

        await User.updateOne(
            { _id: userId },
            { $pull: { playlists: playlist._id } }
        );

        return res.status(200).json({ success: true });
    } catch(err) {
        console.log(err);
        return res.status(500).json({ success: false, errorMessage: 'Failed to delete playlist' });
    }
}
getPlaylistById = async (req, res) => {
    try {
        const list = await Playlist.findById({ _id: req.params.id }).exec();
        if(!list) {
            return res.status(404).json({ success: false, error: 'Playlist not found '});
        }

        return res.status(200).json({ success: true, playlist: list });
    } catch (err) {
        console.error("getPlaylistById error:", err);
        return res.status(400).json({ success: false, error: err });
    }
}
getPlaylistPairs = async (req, res) => {
    const userId = req.userId;

    try {
        const user = await User.findById(userId).exec();
        if(!user) {
            return res.status(400).json({ success: false, error: "User not found" });
        }

        const email = user.email;
        const playlists = await Playlist.find({ ownerEmail: email }).exec();

        if(!playlists || playlists.length === 0) {
            return res.status(400).json({ success: false, error: 'Playlists not found' });
        }

        const pairs = playlists.map(list => ({
            _id: list._id,
            name: list.name
        }));

        return res.status(200).json({ success: true, idNamePairs: pairs });
    } catch(err) {
        console.error("getPlaylistPairs error:", err);
        return res.status(400).json({ success: false, error: err });
    }
}
getPlaylists = async (req, res) => {
    try {
        const playlists = await Playlist.find({}).exec();
        if(!playlists || playlists.length === 0) {
            return res.status(404).json({ success: false, error: 'Playlists not found '});
        }

        return res.status(200).json({ success: true, data: playlists });
    } catch (err) {
        console.error("getPlaylists error:", err);
        return res.status(400).json({ success: false, error: err });
    }
}

playPlaylist = async(req, res) => {
    const userId = req.userId;

    try {
        const playlist = await Playlist.findById(req.params.id);
        if(!playlist) {
            return res.status(404).json({ errorMessage: 'Playlist not found' });
        }

        const listenKey = userId || 'guest';
        if(!playlist.listenedBy.includes(listenKey)) {
            playlist.listenedBy.push(listenKey);
            playlist.differentListeners = playlist.listenedBy.length;
        }

        await Song.updateMany(
            { _id: { $in: playlist.songs } },
            { $inc: { listens: 1 } }
        )

        await playlist.save();
        return res.status(200).json({ success: true, playlist });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, errorMessage: 'Failed to register play' });
    }
}
updatePlaylist = async (req, res) => {
    const userId = req.userId;

    const body = req.body;
    if(!body) {
        return res.status(400).json({ success: false, error: 'Provide a body to update' });
    }

    try {
        const playlist = await Playlist.findById(req.params.id);
        if(!playlist) {
            return res.status(404).json({ errorMessage: 'Playlist not found' })
        }

        if(playlist.owner.toString() !== userId) {
            return res.status(403).json({ success: false, errorMessage: 'authentication error' });
        }

        if(body.name && body.name !== playlist.name) {
            const existingPlaylist = await Playlist.findOne({
                owner: userId,
                name: body.name
            })
            if(existing) {
                return res.status(400).json({ success: false, errorMessage: 'Already have a playlist of that name' })
            }

            playlist.name = body.name;
        }

        if(Array.isArray(body.songs)) {
            playlist.songs = body.songs;
        }
        await playlist.save();
        return res.status(200).json({ success: true, playlist })
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, errorMessage: 'Playlist not updated' });
    }
}
module.exports = {
    copyPlaylist,
    createPlaylist,
    deletePlaylist,
    getPlaylistById,
    getPlaylistPairs,
    getPlaylists,
    playPlaylist,
    updatePlaylist
}