import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'; // React Router
import PlayersList from './components/PlayersList';
import TournamentList from "./components/TournamentList.jsx";
import TournamentCreationForm from "./components/TournamentCreationForm.jsx";
import PastTournaments from "./components/PastTournaments.jsx"; // Import PlayersList component
import SignIn from './components/SignIn';

const App = () => {
    const [tournaments, setTournaments] = useState([]);

    // This might need a dependency so it will load when a new one is submitted
    // Fetch tournaments on component load
    useEffect(() => {
        axios.get('http://localhost:5001/tournaments')
            .then((response) => setTournaments(response.data))
            .catch((error) => console.log('Error fetching tournaments:', error));
    }, []);

    return (
        <Router>
            <div className="min-h-screen bg-green-900 text-white">
                {/* Header Section */}
                <header className="bg-black py-6">
                    <h1 className="text-4xl font-bold text-center text-gold-500">
                        🎱 Cue Sports Club Tournament Management
                    </h1>
                </header>

                {/* Navigation Bar */}
                <nav className="flex justify-center space-x-6 bg-green-800 p-4 text-lg font-semibold">
                    <Link to="/" className="hover:text-gold-400 transition">🏆 Home</Link>
                    <Link to="/create-tournament" className="hover:text-gold-400 transition">➕ Create Tournament</Link>
                    <Link to="/players" className="hover:text-gold-400 transition">🎮 Players</Link>
                    <Link to="/past-tournaments" className="hover:text-gold-400 transition">Past Tournaments</Link>
                    <Link to="/signin" className="hover:text-gold-400 transition">🔐 Sign In</Link> {/* New Sign In Button */}
                </nav>

                {/* Main Content */}
                <div className="container mx-auto p-6">
                    <Routes>
                        <Route exact path="/" element={<TournamentList tournaments={tournaments} />} />
                        <Route path="/create-tournament" element={<TournamentCreationForm />} />
                        <Route path="/players" element={<PlayersList />} />
                        <Route path="/past-tournaments" element={<PastTournaments />} />
                        <Route path="/signin" element={<SignIn />} />
                    </Routes>
                </div>

                {/* Footer */}
                <footer className="bg-black text-center p-4 text-sm">
                    © 2025 Cue Sports Club | Developed for Tournament Enthusiasts 🎱
                </footer>
            </div>
        </Router>
    );
};

export default App;
