import React, { useEffect, useState } from 'react';
import axios from 'axios';

const PlayersList = () => {
    const [players, setPlayers] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:5001/players')
            .then(response => setPlayers(response.data))
            .catch(error => console.error('Error fetching players:', error));
    }, []);

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Players and Stats</h2>
            <div>
                {players.length === 0 ? (
                    <p>No players found.</p>
                ) : (
                    players.map((player) => (
                        <div key={player._id} className="border p-4 mb-4">
                            <h3 className="font-semibold">{player.username}</h3>
                            <p>Wins: {player.wins}</p>
                            <p>Losses: {player.losses}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default PlayersList;
