import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import passport from 'passport';
import passportLocal from 'passport-local';
import bcrypt from 'bcryptjs';
import session from 'express-session';
import cors from 'cors'; // Import CORS

// Initialize dotenv
dotenv.config();

const app = express();

// Enable CORS for all routes
app.use(cors());

app.use(cors({
    origin: '*',
    credentials: true
}));

// Middleware to parse JSON
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.log('MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['player', 'tournament_official'], default: 'player' },
});

const User = mongoose.model('User', userSchema);

// Tournament Schema
const tournamentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    date: { type: Date, required: true },
    format: { type: String, required: true },
    status: { type: String, enum: ['open', 'in-progress', 'completed'], default: 'open' },
    players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
});

const Tournament = mongoose.model('Tournament', tournamentSchema);

// Match Schema
const matchSchema = new mongoose.Schema({
    tournament: { type: mongoose.Schema.Types.ObjectId, ref: 'Tournament' },
    player1: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    player2: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    score1: Number,
    score2: Number,
    winner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    date: Date,
});

const Match = mongoose.model('Match', matchSchema);

// Passport Local Strategy
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

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

// Session management
app.use(session({
    secret: process.env.SESSION_SECRET || 'secret_key',
    resave: false,
    saveUninitialized: true,
}));

app.use(passport.initialize());
app.use(passport.session());

// Route for User Registration
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

// Route for User Login
app.post('/login', passport.authenticate('local', { failureRedirect: '/login' }), (req, res) => {
    res.status(200).json({ message: 'Logged in successfully' });
});

// Root Route (Home Page or testing route)
app.get('/', (req, res) => {
    res.send('Welcome to the Cue Sports Club Tournament Management System');
});

// Other routes (create tournament, register, etc.)
app.post('/tournaments', async (req, res) => {
    console.log("Received POST request:", req.body); // Debugging Log

    const { name, date, format } = req.body;
    if (!name || !date || !format) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    try {
        const newTournament = new Tournament({ name, date, format });
        await newTournament.save();
        res.status(201).json({ message: 'Tournament created successfully', tournament: newTournament });
    } catch (error) {
        console.error("Error creating tournament:", error);
        res.status(500).json({ message: "Server error", error });
    }
});


// Route to fetch all tournaments
app.get('/tournaments', async (req, res) => {
    try {
        const tournaments = await Tournament.find().populate('players');
        res.json(tournaments);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching tournaments', error });
    }
});

// Other routes continue...

// Start Server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
