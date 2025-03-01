import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const PastTournaments = () => {
    const [tournaments, setTournaments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        axios.get('http://localhost:5001/past-tournaments')
            .then(response => {
                setTournaments(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching past tournaments:', error);
                setError('Failed to load past tournaments');
                setLoading(false);
            });
    }, []);

    // Helper function to find the winner of a tournament
    const findTournamentWinner = (tournament) => {
        if (!tournament.bracket || tournament.bracket.length === 0) {
            return "Unknown";
        }
        
        // Get the final match from the last round
        const lastRound = tournament.bracket[tournament.bracket.length - 1];
        if (!lastRound || lastRound.length === 0) {
            return "Unknown";
        }
        
        const finalMatch = lastRound[0];
        if (!finalMatch || !finalMatch.winner) {
            return "Unknown";
        }
        
        // Find the winner player object
        const winnerPlayer = tournament.players.find(
            player => player._id === finalMatch.winner
        );
        
        return winnerPlayer ? winnerPlayer.username : "Unknown";
    };

    if (loading) {
        return <div className="text-center text-white">Loading past tournaments...</div>;
    }

    if (error) {
        return <div className="text-center text-red-500">{error}</div>;
    }

    return (
        <div className="bg-gray-900 p-8 rounded-lg shadow-xl">
            <h2 className="text-3xl font-bold text-center text-white mb-8">🏆 Past Tournaments</h2>
            
            {tournaments.length === 0 ? (
                <p className="text-center text-white">No past tournaments found.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tournaments.map((tournament) => (
                        <div key={tournament._id} className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gold-500">
                            <h3 className="text-xl font-semibold text-gold-400 mb-2">{tournament.name}</h3>
                            
                            <div className="mb-4">
                                <p className="text-sm text-gray-300">📅 {new Date(tournament.date).toLocaleDateString()}</p>
                                <p className="text-sm text-gray-300">🕰️ Time: {tournament.time}</p>
                                <p className="text-sm text-gray-300">🎯 Format: {tournament.format}</p>
                                <p className="text-sm text-gray-300">👥 Players: {tournament.players.length}</p>
                            </div>
                            
                            <div className="winner-section bg-gray-700 p-3 rounded-lg mb-4">
                                <h4 className="text-center text-white font-semibold mb-1">Winner</h4>
                                <p className="text-center text-gold-400 font-bold">
                                    {findTournamentWinner(tournament)}
                                </p>
                            </div>
                            
                            <div className="flex justify-center">
                                <Link 
                                    to={`/tournament/${tournament._id}/bracket`} 
                                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                                >
                                    View Bracket
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PastTournaments;