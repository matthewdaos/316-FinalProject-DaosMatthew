const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../../models/user-model');
const Playlist = require('../../models/playlist-model');
const Song = require('../../models/song-model');
dotenv.config();

class DatabaseManager {
    async connect() {
        await mongoose
            .connect(process.env.DB_CONNECT, { useNewUrlParser: true })
            .catch(e => {
                console.error('Connection error', e.message);
            })
    }

    async disconnect() {
        await mongoose.connection.close();
    }

    // USER 
    async createUser(userData) {
        const user = new User(userData);
        return user.save();
    }

    async findUserByEmail(email) {
        return User.findOne({ email }).exec();
    }

    async findUserById(id) {
        return User.findById(id).exec();
    }

    //PLAYLIST
    async copyPlaylist({ ownerId, sourcePlaylistId }) {
        const source = await Playlist.findById(sourcePlaylistId).exec();
        if(!source) {
            return { ok: false, reason: 'playlist not found' };
        }

        const user = await this.findUserById(ownerId);
        if(!user) {
            return { ok: false, reason: 'user not found' };
        }

        let copyName = `Copy of ${source.name}`;
        let name = copyName;
        let suffix = 1;

        while(await Playlist.findOne({ owner: ownerId, name}).exec()) {
            name = `${copyName} (${suffix})`;
            suffix++;
        }
        
        const copy = new Playlist({ 
            name, 
            ownerEmail: user.email,
            owner: user._id,
            songs: [...source.songs]
        });
        
        
        const savedCopy = await copy.save();
        
        user.playlists.push(savedCopy._id);
        await user.save();

        return savedCopy;
    }


    async createPlaylist({ ownerId, name, songs }) {
        const user = await this.findUserById(ownerId);
        if(!user) {
            return { ok: false, reason: 'user not found' };
        }

        const existingPlaylist = await Playlist.findOne({ owner: ownerId, name }).exec();
        if(existingPlaylist) {
            return { ok: false, reason: 'playlist name conflict' };
        }

        const playlist = new Playlist({
            name, 
            ownerEmail: user.email,
            owner: user._id,
            songs: songs || []
        });

        const saved = await playlist.save();

        user.playlists.push(saved._id);
        await user.save();

        return saved;
    }

    async deletePlaylist({ ownerId, playlistId }) {
        const playlist = await Playlist.findById(playlistId).exec();
        if(!playlist) {
            return { ok: false, reason: 'playlist not found' };
        }
        if(playlist.owner.toString() !== ownerId.toString()) {
            return { ok: false, reason: 'not playlist owner' };
        }

        await Playlist.deleteOne({ _id: playlist._id });
        await User.updateOne(
            { _id: ownerId, },
            { $pull: { playlists: playlist._id } }
        ).exec();
    }

    async getPlaylistById(id) {
        return Playlist.findById(id).exec();
    }

    async getUserPlaylistPairs(userId) {
        const playlists = await Playlist.find({ owner: userId }).exec();
        return playlists.map((p) => ({
            _id: p._id,
            name: p.name
        }));
    }

    async playPlaylist({ listenerId, playlistId }) {
        const playlist = await Playlist.findById(playlistId).exec();
        if(!playlist) {
            return { ok: false, reason: 'playlist not found' };
        }
        
        const listenKey = listenerId ? listenerId.toString() : 'guest';
        if(!playlist.listenedBy.includes(listenKey)) {
            playlist.listenedBy.push(listenKey);
            playlist.differentListeners = playlist.listenedBy.length;
        }
        
        await Song.updateMany(
            { _id: { $in: playlist.songs } },
            { $inc: { listens: 1 } }
        ).exec();
        
        await playlist.save();
        return playlist;
    }

    async searchPlaylist(filters) {
        const { userId, name, userName, songTitle, songArtist, songYear, scope, sortBy, sortDir } = filters;

        const match = {};
        
        if (userId && scope === 'mine') {
            match.owner = new mongoose.Types.ObjectId(userId);
        }
        
        if (name && name.trim() !== '') {
            match.name = { $regex: name.trim(), $options: 'i' };
        }
        
        const pipeline = [
            { $match: match },
            {
                $lookup: {
                    from: 'users',
                    localField: 'owner',
                    foreignField: '_id',
                    as: 'ownerDoc'
                }
            },
            { $unwind: '$ownerDoc'},
            {
                $lookup: {
                    from: 'songs',
                    localField: 'songs',
                    foreignField: '_id',
                    as: 'songDocs'
                }
            }
        ];
        
        if (userName && userName.trim() !== '') {
            pipeline.push({
                $match: {
                    'ownerDoc.firstName': { $exists: true },
                    $or: [
                        { 'ownerDoc.firstName': { $regex: userName.trim(), $options: 'i' } },
                        { 'ownerDoc.lastName': { $regex: userName.trim(), $options: 'i' } }
                    ]
                }
            })
        }
        
        const songMatch = {};
        if(songTitle && songTitle.trim() !== '') {
            songMatch['songDocs.title'] = { $regex: songTitle.trim(), $options: 'i' }
        }
        if(songArtist && songArtist.trim() !== '') {
            songMatch['songDocs.artist'] = { $regex: songArtist.trim(), $options: 'i' }
        }
        if(songYear && !isNaN(songYear)) {
            songMatch['songDocs.year'] = Number(songYear)
        }
        if(Object.keys(songMatch).length > 0) {
            pipeline.push({ $match: songMatch })
        }
        
        const dir = sortDir === 'asc' ? 1 : -1;
        let sortStage = {};
        if (sortBy === 'playlistName') {
            sortStage = { name: dir };
        } else if (sortBy === 'userName') {
            sortStage = { 'ownerDoc.lastName': dir, 'ownerDoc.firstName': dir }; 
        } else if (sortBy === 'listeners') {
            sortStage = { differentListeners: dir };
        } else {
            sortStage = { differentListeners: -1 }
        }

        pipeline.push({ $sort: sortStage });
        
        return Playlist.aggregate(pipeline);
    }

    async updatePlaylist({ ownerId, playlistId, name, songs }) {
        const playlist = await Playlist.findById(playlistId).exec();
        if (!playlist) {
            return { ok: false, reason: 'playlist not found' };
        }

        if (playlist.owner.toString() !== ownerId.toString()) {
            return { ok: false, reason: 'not playlist owner' };
        }

        if (typeof name === "string" && name.trim().length > 0 && name !== playlist.name) {
            const existing = await Playlist.findOne({ owner: ownerId, name }).exec();
            if (existing) {
                return { ok: false, reason: 'playlist name conflict' };
            }
            playlist.name = name;
        }

        if (Array.isArray(songs)) {
            playlist.songs = songs; 
        }

        const saved = await playlist.save();
        return saved;
    }

    // SONG
    async addSongToPlaylist({ ownerId, songId, playlistId }) {
        const [song, playlist] = await Promise.all([
            Song.findById(songId).exec(),
            Playlist.findById(playlistId).exec()
        ]);
        
        if (!song || !playlist) {
            return { ok: false, reason: 'song or playlist not found' }
        }
        
        if (playlist.owner.toString() !== ownerId.toString()) {
            return { ok: false, reason: 'not playlist owner' }

        }
        
        if(!playlist.songs.includes(song._id)) {
            playlist.songs.push(song._id);
            await playlist.save();

            song.playlistCount += 1;
            await song.save();
        }

        return { ok: true, playlist };
    }

    async createSong({ ownerId, title, artist, year, youTubeId }) {
        const song = new Song({
            title,
            artist,
            year,
            youTubeId,
            owner: ownerId
        })

        return song.save();
    }

    async deleteSong({ ownerId, songId }) {
        const song = await Song.findById(songId);
        if(!song) {
            return { ok: false, reason: 'song not found' }
        }
         if(song.owner.toString() !== ownerId.toString()) {
            return { ok: false, reason: 'not song owner' }
        }
        
        await Playlist.updateMany(
            { songs: song._id },
            { $pull: { songs: song._id } }
        );
        
        await Song.deleteOne({ _id: song._id }).exec();
        return { ok: true };
    }

    async searchSong(filters) {
        const { title, artist, year, scope, sortBy, sortDir, userId } = filters;

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
            filter.owner = new mongoose.Types.ObjectId(userId);
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
        
        return Song.find(filter).sort(sort).exec();
    }

    async updateSong({ ownerId, songId, data}) {
        const song = await Song.findById(songId);
        if(!song) {
            return { ok: false, reason: 'song not found' }
        }
        if(song.owner.toString() !== ownerId.toString()) {
            return { ok: false, reason: 'not song owner' }
        }

        const { title, artist, year, youTubeId } = data;

        if(title !== undefined) song.title = title;
        if(artist !== undefined) song.artist = artist;
        if(year !== undefined) song.year = year;
        if(youTubeId !== undefined) song.youTubeId = youTubeId;
        
        const saved = await song.save();
        return { ok: true, song: saved }
    }
}

module.exports = new DatabaseManager();