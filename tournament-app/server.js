import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import nodemailer from 'nodemailer';

// Initialize dotenv for environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Use JSON middleware to handle JSON request bodies
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.log('MongoDB connection error:', err));

// Define tournament and player schemas
const tournamentSchema = new mongoose.Schema({
    name: String,
    date: Date,
    players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Player' }],
    format: String,  // e.g., 'single elimination', 'round robin'
    status: String,  // 'open', 'in progress', 'completed'
});

const matchSchema = new mongoose.Schema({
    tournament: { type: mongoose.Schema.Types.ObjectId, ref: 'Tournament' },
    player1: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
    player2: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
    score1: Number,
    score2: Number,
    winner: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
    date: Date,
});

const playerSchema = new mongoose.Schema({
    name: String,
    email: String,
    role: { type: String, enum: ['player', 'tournament_official'], default: 'player' },
    tournaments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tournament' }],
    matchHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Match' }],
});

const Tournament = mongoose.model('Tournament', tournamentSchema);
const Match = mongoose.model('Match', matchSchema);
const Player = mongoose.model('Player', playerSchema);

// Auth0 Passport JWT Strategy for user authentication
passport.use(new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.AUTH0_CLIENT_SECRET,
}, (jwtPayload, done) => {
    return done(null, jwtPayload);
}));

app.use(passport.initialize());

// Authenticated route for viewing tournaments (Player and TO)
app.get('/tournaments', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const tournaments = await Tournament.find();
        res.json(tournaments);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching tournaments', error });
    }
});

// Register for a tournament (Player only)
app.post('/tournaments/:id/register', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const { id } = req.params;
    try {
        const tournament = await Tournament.findById(id);
        const player = await Player.findById(req.user.id);

        if (!tournament || !player) {
            return res.status(404).json({ message: 'Tournament or player not found' });
        }

        if (tournament.status === 'in progress' || tournament.status === 'completed') {
            return res.status(400).json({ message: 'Cannot register for ongoing or completed tournaments' });
        }

        tournament.players.push(player._id);
        await tournament.save();

        // Send an email notification to the player
        sendEmailNotification(player.email, 'Tournament Registration Successful', `You have successfully registered for the tournament: ${tournament.name}`);

        res.json({ message: 'Successfully registered for the tournament', tournament });
    } catch (error) {
        res.status(500).json({ message: 'Error registering for the tournament', error });
    }
});

// Create a new tournament (Tournament Official only)
app.post('/tournaments', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const { name, date, format } = req.body;
    const user = await Player.findById(req.user.id);

    if (user.role !== 'tournament_official') {
        return res.status(403).json({ message: 'Only tournament officials can create tournaments' });
    }

    try {
        const newTournament = new Tournament({ name, date, format, status: 'open' });
        await newTournament.save();

        res.status(201).json({ message: 'Tournament created successfully', tournament: newTournament });
    } catch (error) {
        res.status(500).json({ message: 'Error creating tournament', error });
    }
});

// Input match score (TO)
app.post('/matches', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const { tournamentId, player1Id, player2Id, score1, score2 } = req.body;
    const user = await Player.findById(req.user.id);

    if (user.role !== 'tournament_official') {
        return res.status(403).json({ message: 'Only tournament officials can input scores' });
    }

    try {
        const match = new Match({ tournament: tournamentId, player1: player1Id, player2: player2Id, score1, score2 });
        match.winner = score1 > score2 ? player1Id : player2Id;
        await match.save();

        // Update the tournament status based on match results (optional)
        const tournament = await Tournament.findById(tournamentId);
        if (tournament) {
            // Here you can check if the tournament is finished based on remaining matches and update status
        }

        res.status(201).json({ message: 'Match score updated', match });
    } catch (error) {
        res.status(500).json({ message: 'Error inputting match score', error });
    }
});

// Email notification function (using nodemailer)
const sendEmailNotification = (recipientEmail, subject, text) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    const mailOptions = {
        from: process.env.EMAIL_USERNAME,
        to: recipientEmail,
        subject: subject,
        text: text,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('Error sending email:', error);
        } else {
            console.log('Email sent:', info.response);
        }
    });
};

// Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
