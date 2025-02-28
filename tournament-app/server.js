import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import passportLocal from 'passport-local';
import bcrypt from 'bcryptjs';
import session from 'express-session';
import cors from 'cors';
import nodemailer from 'nodemailer';
import User from './src/models/Users.js'; //



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


// Tournament Schema
// Tournament Schema
const tournamentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    ruleset: { type: String, required: true },
    format: { type: String, required: true },
    status: { type: String, enum: ['open', 'in-progress', 'completed'], default: 'open' },
    players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    tournamentOfficial: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    bracket: { type: Array, default: [] } // New field to persist the bracket
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

// Backend - Set tournament official
app.post('/tournament/:id/officiate', async (req, res) => {
    const tournamentId = req.params.id;
    const { userId } = req.body;

    // Check if the user is authenticated and has the 'tournament-official' role
    if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'You must be signed in to officiate.' });
    }

    if (req.user.role !== 'tournament-official') {
        return res.status(403).json({ message: 'You do not have permission to officiate a tournament.' });
    }

    try {
        // Find the tournament
        const tournament = await Tournament.findById(tournamentId);

        if (!tournament) {
            return res.status(404).json({ message: 'Tournament not found' });
        }

        // If the tournament already has an official, prevent assigning a new one
        if (tournament.tournamentOfficial) {
            return res.status(400).json({ message: 'This tournament already has an official.' });
        }

        // Assign the tournament official
        tournament.tournamentOfficial = userId;
        await tournament.save();

        res.status(200).json({ message: 'Tournament official assigned successfully!' });
    } catch (error) {
        console.error('Error officiating the tournament:', error);
        res.status(500).json({ message: 'Error officiating the tournament', error });
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

        // Send email to all players after tournament creation
        await sendEmailToPlayers(name); // Pass the tournament name

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

const transporter = nodemailer.createTransport({
    service: 'gmail', // Use 'gmail' for Gmail, or use a different service for production
    auth: {
        user: process.env.EMAIL, // Use your email address here
        pass: process.env.EMAIL_PASSWORD, // Use your email password here
    },
});


app.get('/past-tournaments', async (req, res) => {
    try {
        const tournaments = await Tournament.find({status: "closed"}).populate('players');
        res.json(tournaments);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching tournaments', error });
    }
});

// Helper function to generate a bracket given an array of players
const generateBracket = (players) => {
    const n = players.length;
    // Determine the next power of 2 greater than or equal to n
    let totalSlots = 1;
    while (totalSlots < n) {
        totalSlots *= 2;
    }
    // Fill the first round with players followed by nulls (byes)
    let roundPlayers = [...players];
    while (roundPlayers.length < totalSlots) {
        roundPlayers.push(null);
    }
    const rounds = [];
    // Generate rounds until one match remains
    while (roundPlayers.length > 1) {
        const round = [];
        for (let i = 0; i < roundPlayers.length; i += 2) {
            round.push({
                player1: roundPlayers[i],
                player2: roundPlayers[i + 1],
                winner: null
            });
        }
        rounds.push(round);
        // For the next round, we create placeholders (winners will be set later)
        roundPlayers = new Array(round.length).fill(null);
    }
    return rounds;
};

// Set Tournament Status to "In-Progress"
app.post('/tournament/:id/start', async (req, res) => {
    const tournamentId = req.params.id;

    // Ensure the user is authenticated and is a tournament official
    if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'You must be signed in to start the tournament.' });
    }
    if (req.user.role !== 'tournament-official') {
        return res.status(403).json({ message: 'You do not have permission to start the tournament.' });
    }

    try {
        const tournament = await Tournament.findById(tournamentId);

        if (!tournament) {
            return res.status(404).json({ message: 'Tournament not found' });
        }

        // Check if the tournament is already in progress
        if (tournament.status === 'in-progress') {
            return res.status(400).json({ message: 'Tournament is already in progress.' });
        }

        // Generate the bracket if the tournament status is "open"
        const bracket = generateBracket(tournament.players); // You may need to use the existing generateBracket function
        tournament.bracket = bracket;
        tournament.status = 'in-progress'; // Set the status to in-progress

        await tournament.save();
        res.status(200).json({ message: 'Tournament has started and bracket has been generated!' });
    } catch (error) {
        console.error('Error starting tournament:', error);
        res.status(500).json({ message: 'Error starting tournament', error });
    }
});

// Set Tournament Status to "Completed"
app.post('/tournament/:id/complete', async (req, res) => {
    const tournamentId = req.params.id;

    // Ensure the user is authenticated and is a tournament official
    if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'You must be signed in to complete the tournament.' });
    }
    if (req.user.role !== 'tournament-official') {
        return res.status(403).json({ message: 'You do not have permission to complete the tournament.' });
    }

    try {
        const tournament = await Tournament.findById(tournamentId);

        if (!tournament) {
            return res.status(404).json({ message: 'Tournament not found' });
        }

        // If the tournament is not in progress, it cannot be marked as completed
        if (tournament.status !== 'in-progress') {
            return res.status(400).json({ message: 'Tournament is not in progress.' });
        }

        tournament.status = 'completed'; // Set the status to completed
        await tournament.save();

        res.status(200).json({ message: 'Tournament is now completed!' });
    } catch (error) {
        console.error('Error completing tournament:', error);
        res.status(500).json({ message: 'Error completing tournament', error });
    }
});


// Fetch bracket data for a specific tournament
// Backend - Get the bracket for a specific tournament
app.get('/tournament/:id/bracket', async (req, res) => {
    const tournamentId = req.params.id;
    try {
        if (!tournamentId) {
            return res.status(400).json({ message: 'Tournament ID is missing' });
        }
        if (!mongoose.Types.ObjectId.isValid(tournamentId)) {
            return res.status(400).json({ message: 'Invalid tournament ID' });
        }

        // Fetch tournament with populated player1 and player2 in the bracket
        const tournament = await Tournament.findById(tournamentId)
            .populate('players') // Populate the players array with full user details
            .populate('bracket.player1') // Populate player1 in the bracket
            .populate('bracket.player2') // Populate player2 in the bracket
            .populate('tournamentOfficial'); // Ensure the official is populated

        console.log('Fetched Tournament:', tournament); // Debug statement to check the tournament data

        if (!tournament) {
            return res.status(404).json({ message: 'Tournament not found' });
        }

        // If the tournament hasn't begun, send the players list; otherwise, send the bracket
        if (tournament.status === 'open') {
            console.log('Returning Players:', tournament.players); // Debug statement for players list
            res.json({
                name: tournament.name,
                status: tournament.status,
                players: tournament.players
            });
        } else {
            console.log('Returning Bracket:', tournament.bracket); // Debug statement for bracket
            res.json({
                name: tournament.name,
                status: tournament.status,
                bracket: tournament.bracket
            });
        }
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

// ✅ Send email function
const sendEmailToPlayers = async (tournamentName) => {
    try {
        const players = await User.find({ role: 'player' });

        for (const player of players) {
            const mailOptions = {
                from: process.env.EMAIL, // Sender address
                to: player.email, // List of recipients (player's email)
                subject: `New Tournament Available: ${tournamentName}`, // Subject line
                text: `Hello ${player.username},\n\nA new tournament has been created: ${tournamentName}.\n\nYou can now sign up to participate. Don't miss out!\n\nBest regards,\nCue Sports Club Tournament Management`, // Body of the email
            };

            // Send email
            await transporter.sendMail(mailOptions);
        }
        console.log('Emails sent successfully to all players!');
    } catch (error) {
        console.error('Error sending emails:', error);
    }
};

// Endpoint to begin a tournament (generate and persist the bracket)
app.post('/tournament/:id/begin', async (req, res) => {
    const tournamentId = req.params.id;

    // Verify user is authenticated and is a tournament official
    if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'You must be signed in to begin the tournament.' });
    }
    if (req.user.role !== 'tournament_official') {
        return res.status(403).json({ message: 'You do not have permission to begin the tournament.' });
    }
    try {
        // Populate players for proper bracket generation
        const tournament = await Tournament.findById(tournamentId).populate('players');
        if (!tournament) {
            return res.status(404).json({ message: 'Tournament not found' });
        }
        if (tournament.status !== 'open') {
            return res.status(400).json({ message: 'Tournament has already begun.' });
        }
        // Generate and persist the bracket
        const bracket = generateBracket(tournament.players);
        tournament.bracket = bracket;
        tournament.status = 'in-progress';
        await tournament.save();
        res.status(200).json({ message: 'Tournament has begun and bracket generated.', bracket });
    } catch (error) {
        console.error('Error beginning tournament:', error);
        res.status(500).json({ message: 'Error beginning tournament', error });
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

// Fetch In-Progress Tournaments
app.get('/tournaments/in-progress', async (req, res) => {
    try {
        const tournaments = await Tournament.find({ status: 'in-progress' }).populate('players');
        res.json(tournaments);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching in-progress tournaments', error });
    }
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
app.put('/member/:id', async (req, res) => {
    const memberId = req.params.id; // ✅ Extract user ID from URL
    const updateData = req.body; // ✅ Get updated fields dynamically

    console.log("🔹 Received update request for user ID:", memberId);
    console.log("🔹 Update Data:", updateData); // Debugging

    try {
        // ✅ Find user by `_id` instead of `googleId`
        const updatedUser = await User.findByIdAndUpdate(
            memberId,
            updateData, // ✅ Update only the provided fields
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            console.log("❌ User not found in database.");
            return res.status(404).json({ message: 'User not found' });
        }

        console.log("✅ Profile/settings updated successfully:", updatedUser);
        res.status(200).json({ message: 'Update successful', user: updatedUser });
    } catch (error) {
        console.error('❌ Error updating user:', error);
        res.status(500).json({ message: 'Error updating user', error });
    }
});



// ✅ Start Server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});