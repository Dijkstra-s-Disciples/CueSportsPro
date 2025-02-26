import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import passportLocal from 'passport-local';
import bcrypt from 'bcryptjs';
import session from 'express-session';
import cors from 'cors';

dotenv.config();

const app = express();

// Enable CORS
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

// Middleware
app.use(express.json());
app.use(session({
    secret: process.env.SESSION_SECRET || 'secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set secure: true if using HTTPS in production
}));
app.use(passport.initialize());
app.use(passport.session());

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('✅ MongoDB connected'))
    .catch((err) => console.log('❌ MongoDB connection error:', err));

// ✅ User Schema
const userSchema = new mongoose.Schema({
    googleId: { type: String, unique: true, sparse: true }, // Google login
    username: { type: String, unique: true, sparse: true },
    password: { type: String },
    email: { type: String, unique: true, sparse: true },
    role: { type: String, enum: ['player', 'tournament_official'], default: 'player' },
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 }
});
const User = mongoose.model('User', userSchema);

// ✅ Tournament Schema
// Tournament Schema in server.js
const tournamentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true},
    ruleset: { type: String, required: true },
    format: { type: String, required: true },
    status: { type: String, enum: ['open', 'in-progress', 'completed'], default: 'open' },
    players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Initially empty
});


const Tournament = mongoose.model('Tournament', tournamentSchema);

// ✅ Match Schema
const matchSchema = new mongoose.Schema({
    tournament: { type: mongoose.Schema.Types.ObjectId, ref: 'Tournament' },
    player1: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    player2: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    score1: Number,
    score2: Number,
    winner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    date: Date
});
const Match = mongoose.model('Match', matchSchema);

// ✅ Local Authentication (Username & Password)
passport.use(new passportLocal.Strategy(
    async (username, password, done) => {
        try {
            const user = await User.findOne({ username });
            if (!user) return done(null, false, { message: 'Incorrect username' });

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) return done(null, false, { message: 'Incorrect password' });

            return done(null, user);
        } catch (error) {
            return done(error);
        }
    }
));

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:5001/auth/google/callback',
    scope: ['profile', 'email'],
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
            user = new User({
                googleId: profile.id,
                username: profile.displayName,
                email: profile.emails[0].value,
                role: 'player'
            });
            await user.save();
        }

        return done(null, user);
    } catch (error) {
        return done(error, null);
    }
}));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

// ✅ Log Authentication Requests
app.use((req, res, next) => {
    if (req.path.startsWith('/login/federated/google') || req.path.startsWith('/auth/google/callback')) {
        console.log(`🛠️ Request received at: ${req.path}`);
    }
    next();
});

// ✅ Google Authentication Routes
app.get('/login/federated/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback', passport.authenticate('google', {
    successRedirect: 'http://localhost:5173/',
    failureRedirect: '/login'
}));

app.post('/logout', (req, res) => {
    req.logout((err) => {
        if (err) return res.status(500).json({ message: 'Logout error' });
        req.session.destroy();
        res.status(200).json({ message: 'Logged out successfully' });
    });
});

app.get('/user', (req, res) => {
    if (req.isAuthenticated()) {
        res.json(req.user); // Sends the authenticated user's data
    } else {
        res.status(401).json({ message: 'Not authenticated' });
    }
});


// ✅ Player List Endpoint
app.get('/players', async (req, res) => {
    try {
        const players = await User.find({ role: 'player' }).select('username wins losses');
        res.json(players);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching players', error });
    }
});

// ✅ Register a User
app.post('/register', async (req, res) => {
    const { username, password, role } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, password: hashedPassword, role });
        await newUser.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error registering user', error });
    }
});

// ✅ User Login (Local)
app.post('/login', passport.authenticate('local', { failureRedirect: '/login' }), (req, res) => {
    res.status(200).json({ message: 'Logged in successfully' });
});

// ✅ Create a Tournament
app.post('/tournaments', async (req, res) => {
    console.log("Received POST request:", req.body);
    const { name, date, time, ruleset, format } = req.body;

    if (!name || !date || !time || !ruleset || !format) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    try {
        const newTournament = new Tournament({ name, date, time, ruleset, format });
        await newTournament.save();
        res.status(201).json({ message: 'Tournament created successfully', tournament: newTournament });

    } catch (error) {
        console.error("Error creating tournament:", error);
        res.status(500).json({ message: "Server error", error });
    }
});

// ✅ Fetch All Tournaments
app.get('/tournaments', async (req, res) => {
    try {
        const tournaments = await Tournament.find({status: "open"}).populate('players');
        res.json(tournaments);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching tournaments', error });
    }
});

app.get('/past-tournaments', async (req, res) => {
    try {
        const tournaments = await Tournament.find({status: "closed"}).populate('players');
        res.json(tournaments);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching tournaments', error });
    }
});

// Fetch bracket data for a specific tournament
// Backend - Get the bracket for a specific tournament
app.get('/tournament/:id/bracket', async (req, res) => {
    const tournamentId = req.params.id; // Extract tournament id from URL

    try {
        if (!tournamentId) {
            return res.status(400).json({ message: 'Tournament ID is missing' });
        }

        // Ensure the tournament ID is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(tournamentId)) {
            return res.status(400).json({ message: 'Invalid tournament ID' });
        }

        const tournament = await Tournament.findById(tournamentId).populate('players');
        if (!tournament) {
            return res.status(404).json({ message: 'Tournament not found' });
        }

        res.json(tournament);
    } catch (error) {
        console.error('Error fetching bracket:', error);
        res.status(500).json({ message: 'Error fetching bracket', error });
    }
});

// Register a player for a specific match in the tournament
// Player registration route
app.post('/tournament/:id/register', async (req, res) => {
    const tournamentId = req.params.id;
    const { userId } = req.body;

    // Check if the user is authenticated
    if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'You must be signed in to register.' });
    }

    try {
        const tournament = await Tournament.findById(tournamentId);

        if (!tournament) {
            return res.status(404).json({ message: 'Tournament not found' });
        }

        if (tournament.players.length >= 32) {
            return res.status(400).json({ message: 'Tournament is already full.' });
        }

        if (tournament.players.includes(userId)) {
            return res.status(400).json({ message: 'You are already registered for this tournament.' });
        }

        // Add the player to the tournament's players array
        tournament.players.push(userId);
        await tournament.save();

        res.status(200).json({ message: 'Successfully registered for the tournament!' });
    } catch (error) {
        console.error('Error registering for tournament:', error);
        res.status(500).json({ message: 'Error registering for the tournament', error });
    }
});

app.post('/tournament/:id/withdraw', async (req, res) => {
    const tournamentId = req.params.id;
    const { userId } = req.body; // The userId of the logged-in player attempting to register

    // Check if the user is authenticated
    if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'You must be signed in to withdraw.' });
    }

    try {
        const tournament = await Tournament.findById(tournamentId).populate('players');

        if (!tournament) {
            return res.status(404).json({ message: 'Tournament not found' });
        }

        if (tournament.players.find(player => player._id.toString() === userId.toString()) === undefined) {
            return res.status(400).json({ message: 'You are not already registered for this tournament.' });
        }
        tournament.players = tournament.players.filter(player => player._id.toString() !== userId.toString());
        await tournament.save();

        res.status(200).json({ message: 'Successfully withdrawn from the tournament!' });
    } catch (error) {
        console.error('Error withdrawing from tournament:', error);
        res.status(500).json({ message: 'Error withdrawing from the tournament', error });
    }
});

// ✅ Root Route
app.get('/', (req, res) => {
    res.send('Welcome to the Cue Sports Club Tournament Management System');
});

app.get('/test-user', async (req, res) => {
    const test = await User.findOne({username:"Devin Mihaichuk"})
    res.json(test);
});

app.get('/member/:id', async (req, res) => {
    const memberId = req.params.id;

    try {
        const user = await User.findById(memberId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Error finding user:', error);
        res.status(500).json({ message: 'Error finding user', error });
    }
});

// ✅ Start Server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});