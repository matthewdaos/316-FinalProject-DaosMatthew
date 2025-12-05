const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = Schema.Types.ObjectId

const UserSchema = new Schema(
    {
        firstName: { type: String },
        lastName: { type: String },

        username: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        passwordHash: { type: String, required: true },
        avatar: { type: String, required: true },

        playlists: [{type: ObjectId, ref: 'Playlist'}]
        
    },
    { timestamps: true },
)

UserSchema.index({ email: 1 }, { unique: true })

module.exports = mongoose.model('User', UserSchema)
