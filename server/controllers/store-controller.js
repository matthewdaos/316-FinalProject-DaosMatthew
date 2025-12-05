const Playlist = require('../models/playlist-model')
const User = require('../models/user-model');
const auth = require('../auth')
/*
    This is our back-end API. It provides all the data services
    our database needs. Note that this file contains the controller
    functions for each endpoint.
    
    @author McKilla Gorilla
*/
createPlaylist = (req, res) => {

    const body = req.body;
    console.log("createPlaylist body: " + JSON.stringify(body));
    if (!body) {
        return res.status(400).json({
            success: false,
            error: 'You must provide a Playlist',
        })
    }
    
    const playlist = new Playlist(body);
    console.log("playlist: " + playlist.toString());
    if (!playlist) {
        return res.status(400).json({ success: false, error: err })
    }

    User.findOne({ _id: req.userId }, (err, user) => {
        if(err || !user) {
            return res.status(400).json({ errorMessage: 'User not found' })
        }
        console.log("user found: " + JSON.stringify(user));
        user.playlists.push(playlist._id);
        user.save().then(() => {
            playlist.save()
                .then(() => {
                    return res.status(201).json({ playlist: playlist })
                })
                .catch(error => {return res.status(400).json({ errorMessage: 'Playlist Not Created!' })
            })
        });
    })
}
deletePlaylist = async (req, res) => {
    if(auth.verifyUser(req) === null){
        return res.status(400).json({
            errorMessage: 'UNAUTHORIZED'
        })
    }
    console.log("delete Playlist with id: " + JSON.stringify(req.params.id));
    console.log("delete " + req.params.id);
    Playlist.findById({ _id: req.params.id }, (err, playlist) => {
        console.log("playlist found: " + JSON.stringify(playlist));
        if (err) {
            return res.status(404).json({
                errorMessage: 'Playlist not found!',
            })
        }

        // DOES THIS LIST BELONG TO THIS USER?
        async function asyncFindUser(list) {
            User.findOne({ email: list.ownerEmail }, (err, user) => {
                console.log("user._id: " + user._id);
                console.log("req.userId: " + req.userId);
                if (user._id == req.userId) {
                    console.log("correct user!");
                    Playlist.findOneAndDelete({ _id: req.params.id }, () => {
                        return res.status(200).json({});
                    }).catch(err => console.log(err))
                }
                else {
                    console.log("incorrect user!");
                    return res.status(400).json({ 
                        errorMessage: "authentication error" 
                    });
                }
            });
        }
        asyncFindUser(playlist);
    })
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
    if(auth.verifyUser(req) === null){
        return res.status(400).json({
            errorMessage: 'UNAUTHORIZED'
        })
    } 
    
    try {
        const user = await User.findById(req.userId).exec();
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
updatePlaylist = async (req, res) => {
    if(auth.verifyUser(req) === null){
        return res.status(400).json({
            errorMessage: 'UNAUTHORIZED'
        })
    }
    const body = req.body
    console.log("updatePlaylist: " + JSON.stringify(body));
    console.log("req.body.name: " + req.body.name);

    if (!body) {
        return res.status(400).json({
            success: false,
            error: 'You must provide a body to update',
        })
    }

    Playlist.findOne({ _id: req.params.id }, (err, playlist) => {
        console.log("playlist found: " + JSON.stringify(playlist));
        if (err) {
            return res.status(404).json({
                err,
                message: 'Playlist not found!',
            })
        }

        // DOES THIS LIST BELONG TO THIS USER?
        async function asyncFindUser(list) {
            await User.findOne({ email: list.ownerEmail }, (err, user) => {
                console.log("user._id: " + user._id);
                console.log("req.userId: " + req.userId);
                if (user._id == req.userId) {
                    console.log("correct user!");
                    console.log("req.body.name: " + req.body.name);

                    list.name = body.playlist.name;
                    list.songs = body.playlist.songs;
                    list
                        .save()
                        .then(() => {
                            console.log("SUCCESS!!!");
                            return res.status(200).json({
                                success: true,
                                id: list._id,
                                message: 'Playlist updated!',
                            })
                        })
                        .catch(error => {
                            console.log("FAILURE: " + JSON.stringify(error));
                            return res.status(404).json({
                                error,
                                message: 'Playlist not updated!',
                            })
                        })
                }
                else {
                    console.log("incorrect user!");
                    return res.status(400).json({ success: false, description: "authentication error" });
                }
            });
        }
        asyncFindUser(playlist);
    })
}
module.exports = {
    createPlaylist,
    deletePlaylist,
    getPlaylistById,
    getPlaylistPairs,
    getPlaylists,
    updatePlaylist
}