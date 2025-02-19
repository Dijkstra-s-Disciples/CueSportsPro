import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'; // React Router

// Tailwind CSS classes are used throughout for styling

const App = () => {
    const [tournaments, setTournaments] = useState([]);
    const [newTournament, setNewTournament] = useState({ name: '', date: '', format: '' });
    const [matchScore, setMatchScore] = useState({ player1: '', player2: '', score1: '', score2: '' });

    // Fetch tournaments on component load
    useEffect(() => {
        axios.get('http://localhost:5001/tournaments')
            .then((response) => setTournaments(response.data))
            .catch((error) => console.log('Error fetching tournaments:', error));
    }, []);

    // Handle tournament registration
    const handleRegister = (tournamentId) => {
        axios.post(`http://localhost:5001/tournaments/${tournamentId}/register`, {}, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}` // Assuming you store the JWT token in localStorage
            }
        })
            .then((response) => alert('Registered successfully!'))
            .catch((error) => alert('Error registering for tournament.'));
    };

    // Handle match score input
    const handleMatchScoreSubmit = () => {
        axios.post('http://localhost:5001/matches', matchScore, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        })
            .then((response) => alert('Match score updated!'))
            .catch((error) => alert('Error updating match score.'));
    };

    // Handle tournament creation
    const handleCreateTournament = () => {
        axios.post('http://localhost:5001/tournaments', newTournament, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        })
            .then((response) => {
                setTournaments([...tournaments, response.data]);
                alert('Tournament created!');
            })
            .catch((error) => alert('Error creating tournament.'));
    };

    return (
        <Router>
            <div className="container mx-auto p-4">
                <header>
                    <h1 className="text-4xl font-bold text-center mb-8">Cue Sports Club Tournament Management</h1>
                </header>

                <nav className="flex justify-between mb-8">
                    <Link to="/" className="text-blue-500">Home</Link>
                    <Link to="/create-tournament" className="text-blue-500">Create Tournament</Link>
                </nav>

                <Routes>
                    <Route exact path="/" element={<TournamentList tournaments={tournaments} onRegister={handleRegister} />} />
                    <Route path="/create-tournament" element={<TournamentCreationForm newTournament={newTournament} setNewTournament={setNewTournament} onCreate={handleCreateTournament} />} />
                </Routes>
            </div>
        </Router>
    );
};

const TournamentList = ({ tournaments, onRegister }) => (
    <div>
        <h2 className="text-2xl font-bold mb-4">Tournaments</h2>
        <div>
            {tournaments.length === 0 ? (
                <p>No tournaments available.</p>
            ) : (
                tournaments.map((tournament) => (
                    <div key={tournament._id} className="border p-4 mb-4">
                        <h3 className="font-semibold">{tournament.name}</h3>
                        <p>Date: {new Date(tournament.date).toLocaleDateString()}</p>
                        <p>Format: {tournament.format}</p>
                        <button
                            onClick={() => onRegister(tournament._id)}
                            className="mt-2 bg-blue-500 text-white py-2 px-4 rounded"
                        >
                            Register
                        </button>
                    </div>
                ))
            )}
        </div>
    </div>
);

const TournamentCreationForm = ({ newTournament, setNewTournament, onCreate }) => (
    <div>
        <h2 className="text-2xl font-bold mb-4">Create New Tournament</h2>
        <form onSubmit={(e) => { e.preventDefault(); onCreate(); }} className="space-y-4">
            <input
                type="text"
                className="w-full p-2 border"
                placeholder="Tournament Name"
                value={newTournament.name}
                onChange={(e) => setNewTournament({ ...newTournament, name: e.target.value })}
            />
            <input
                type="date"
                className="w-full p-2 border"
                value={newTournament.date}
                onChange={(e) => setNewTournament({ ...newTournament, date: e.target.value })}
            />
            <select
                className="w-full p-2 border"
                value={newTournament.format}
                onChange={(e) => setNewTournament({ ...newTournament, format: e.target.value })}
            >
                <option value="single elimination">Single Elimination</option>
                <option value="round robin">Round Robin</option>
            </select>
            <button type="submit" className="w-full bg-blue-500 text-white py-2 px-4 rounded">
                Create Tournament
            </button>
        </form>
    </div>
);

export default App;
