import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    id: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    image: String,
    bio: String,
    thoughts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Thought'
        }
    ],
    onboarded: {
        type: Boolean,
        default: false,
    },
    spaces: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Spaces'
        }
    ]
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;