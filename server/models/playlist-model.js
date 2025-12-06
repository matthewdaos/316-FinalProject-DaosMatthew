const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = Schema.Types.ObjectId

const PlaylistSchema = new Schema(
    {
        name: { type: String, required: true },
        ownerEmail: { type: String },
        owner: { type: ObjectId, ref: 'User', required: true },
        songs: [{ type: ObjectId, ref: 'Song' }],

        differentListeners: { type: Number, default: 0 },
        listenedBy: { type: [String], default: [] }
    },
    { timestamps: true },
)

PlaylistSchema.index({ owner: 1, name: 1 }, { unique: true })

module.exports = mongoose.model('Playlist', PlaylistSchema)
