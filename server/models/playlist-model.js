const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = Schema.Types.ObjectId

const PlaylistSongSchema = new Schema(
    {
        song: { type: ObjectId, ref: 'Song', required: true },
        position: { type: Number, required: true }
    },
    { _id: false }
)

const PlaylistSchema = new Schema(
    {
        name: { type: String, required: true },
        owner: { type: ObjectId, ref: 'User', required: true },
        songs: { type: [PlaylistSongSchema], default: [] },

        diffListeners: { type: Number, default: 0 },
        listeners: { type: ObjectId, ref: 'User' }
    },
    { timestamps: true },
)

PlaylistSchema.index({ owner: 1, name: 1 }, { unique: true })

module.exports = mongoose.model('Playlist', PlaylistSchema)
