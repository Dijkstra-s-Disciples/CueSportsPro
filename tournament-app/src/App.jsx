import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'; // React Router
import PlayersList from './components/PlayersList'; // Import PlayersList component
import SignIn from './components/SignIn';

const App = () => {
    const [tournaments, setTournaments] = useState([]);
    const [newTournament, setNewTournament] = useState({ name: '', date: '', format: '' });

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
                    <Link to="/signin" className="hover:text-gold-400 transition">🔐 Sign In</Link> {/* New Sign In Button */}
                </nav>

                {/* Main Content */}
                <div className="container mx-auto p-6">
                    <Routes>
                        <Route exact path="/" element={<TournamentList tournaments={tournaments} />} />
                        <Route path="/signin" element={<SignIn />} />
                        <Route path="/create-tournament" element={<TournamentCreationForm newTournament={newTournament} setNewTournament={setNewTournament} />} />
                        <Route path="/players" element={<PlayersList />} />
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

/* Tournament List Component */
const TournamentList = ({ tournaments }) => (
    <div>
        <h2 className="text-3xl font-bold text-center mb-6">🏆 Upcoming Tournaments</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tournaments.length === 0 ? (
                <p className="text-center">No tournaments available.</p>
            ) : (
                tournaments.map((tournament) => (
                    <div key={tournament._id} className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gold-500">
                        <h3 className="text-xl font-semibold text-gold-400">{tournament.name}</h3>
                        <p className="text-sm text-gray-300">📅 {new Date(tournament.date).toLocaleDateString()}</p>
                        <p className="text-sm text-gray-300">🎯 Format: {tournament.format}</p>
                        <button
                            className="mt-4 w-full bg-gold-500 text-black py-2 px-4 rounded-lg hover:bg-gold-400 transition"
                        >
                            Register
                        </button>
                    </div>
                ))
            )}
        </div>
    </div>
);

/* Tournament Creation Form */
const TournamentCreationForm = ({ newTournament, setNewTournament }) => (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-lg mx-auto">
        <h2 className="text-2xl font-bold text-center mb-4 text-gold-400">➕ Create New Tournament</h2>
        <form className="space-y-4">
            <input
                type="text"
                className="w-full p-2 border border-gray-600 bg-gray-900 text-white rounded-md"
                placeholder="Tournament Name"
                value={newTournament.name}
                onChange={(e) => setNewTournament({ ...newTournament, name: e.target.value })}
            />
            <input
                type="date"
                className="w-full p-2 border border-gray-600 bg-gray-900 text-white rounded-md"
                value={newTournament.date}
                onChange={(e) => setNewTournament({ ...newTournament, date: e.target.value })}
            />
            <select
                className="w-full p-2 border border-gray-600 bg-gray-900 text-white rounded-md"
                value={newTournament.format}
                onChange={(e) => setNewTournament({ ...newTournament, format: e.target.value })}
            >
                <option value="single elimination">Single Elimination</option>
                <option value="round robin">Round Robin</option>
            </select>
            <button type="submit" className="w-full bg-gold-500 text-black py-2 px-4 rounded-lg hover:bg-gold-400 transition">
                Create Tournament
            </button>
        </form>
    </div>
);

export default App;
