import mongoose from 'mongoose';

const matchHistorySchema = new mongoose.Schema({
    opponent: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // The user they played against
    tournament: { type: mongoose.Schema.Types.ObjectId, ref: 'Tournament' }, // Tournament in which the match occurred
    result: { type: String, enum: ['win', 'loss'], required: true }, // 'win' or 'loss'
    score: { type: String }, // Score of the match
    date: { type: Date, default: Date.now } // Date of the match
});

const userSchema = new mongoose.Schema({
    googleId: { type: String, unique: true, sparse: true }, // Sparse allows users without Google ID
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String }, // Optional if using Google OAuth
    role: { type: String, enum: ['player', 'admin', 'tournament-official'], default: 'player' },
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },

    matchHistory: [matchHistorySchema], // Array of match history

    bio: { type: String, default: "This user hasn't added a bio yet." },
    profilePicture: { type: String, default: 'https://upload.wikimedia.org/wikipedia/commons/3/34/PICA.jpg' },
    country: { type: String, default: "Unknown" },
    privacySettings: { type: String, enum: ['public', 'private'], default: 'public' },

    optInTournamentEmails: { type: Boolean, default: false },
    optInNotificationEmails: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('User', userSchema);
