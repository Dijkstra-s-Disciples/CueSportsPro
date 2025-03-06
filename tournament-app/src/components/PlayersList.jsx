import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from "react-router-dom";

const PlayersList = () => {
    const [players, setPlayers] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:5001/users')
            .then(response => setPlayers(response.data))
            .catch(error => console.error('Error fetching players:', error));
    }, []);

    return (
        <div className="max-w-5xl mx-auto p-8 bg-gray-900 text-white rounded-lg shadow-lg">
            <h2 className="text-3xl font-extrabold mb-6 text-center">Players and Stats</h2>
            <div>
                {players.length === 0 ? (
                    <p className="text-center text-gray-400">No players found.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {players.map((player) => (
                            <div key={player._id} className="flex items-center bg-gray-800 p-4 rounded-lg shadow-md space-x-4 hover:bg-gray-700 transition">
                                <img
                                    src={player.profilePicture}
                                    alt={`${player.username}'s profile`}
                                    className="w-16 h-16 rounded-full border-4 border-blue-500 shadow-lg"
                                />
                                <div>
                                    <Link to={`/profile/${player._id}`} className="font-semibold text-xl text-blue-300 hover:text-blue-500 transition">{player.username}</Link>
                                    <p className="text-green-400">🏆 Wins: {player.wins}</p>
                                    <p className="text-red-400">❌ Losses: {player.losses}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PlayersList;