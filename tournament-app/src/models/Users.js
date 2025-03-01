import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    googleId: { type: String, unique: true, sparse: true }, // Sparse allows users without Google ID
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String }, // Optional if using Google OAuth
    role: { type: String, enum: ['player', 'admin', 'tournament-official'], default: 'player' },
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },

    bio: { type: String, default: "This user hasn't added a bio yet." },
    profilePicture: { type: String, default: 'https://via.placeholder.com/150' },
    country: { type: String, default: "Unknown" },
    privacySettings: { type: String, enum: ['public', 'private'], default: 'public' },

    optInTournamentEmails: { type: Boolean, default: true },
    optInNotificationEmails: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('User', userSchema);
