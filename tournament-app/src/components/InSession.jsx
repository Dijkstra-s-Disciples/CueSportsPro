import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const InSession = () => {
    const [tournaments, setTournaments] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Fetch tournaments that are in progress
        axios.get('http://localhost:5001/tournaments/in-progress')
            .then((response) => setTournaments(response.data))
            .catch((error) => {
                setError('Error fetching in-progress tournaments');
                console.error(error);
            });
    }, []);

    if (error) {
        return <div className="text-center text-red-500">{error}</div>;
    }

    return (
        <div className="in-session-container bg-gray-900 p-8 rounded-lg shadow-xl">
            <h2 className="text-center text-2xl text-white font-bold mb-8">Now In Session</h2>
            {tournaments.length === 0 ? (
                <p className="text-center text-white">No tournaments are currently in session.</p>
            ) : (
                <div className="tournament-list">
                    {tournaments.map((tournament) => (
                        <div key={tournament._id} className="bg-gray-800 p-4 rounded-lg mb-6">
                            <h3 className="text-xl font-semibold text-gold-400">{tournament.name}</h3>
                            <p className="text-sm text-gray-300">📅 {new Date(tournament.date).toLocaleDateString()}</p>
                            <p className="text-sm text-gray-300">🕰️ Time: {tournament.time}</p>
                            <p className="text-sm text-gray-300">🎯 Format: {tournament.format}</p>
                            <p className="text-sm text-gray-300">👥 Players: {tournament.players.length} / 32</p>

                            <Link to={`/tournament/${tournament._id}/bracket`} className="text-blue-400 hover:underline">
                                View Bracket
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default InSession;
