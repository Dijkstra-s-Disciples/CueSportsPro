import React, { useEffect, useState } from 'react';
import axios from 'axios';

const PastTournaments = () => {
    const [tournaments, setTournaments] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:5001/past-tournaments')
            .then(response => setTournaments(response.data))
            .catch(error => console.error('Error fetching players:', error));
    }, []);

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Past Tournaments</h2>
            <div>
                {tournaments.length === 0 ? (
                    <p>No past tournaments found.</p>
                ) : (
                    tournaments.map((tournament) => (
                        <div key={tournament._id} className="border p-4 mb-4">
                            <h3 className="font-semibold">{tournament.name}</h3>
                            <p>Date: {new Date(tournament.date).toLocaleDateString()}</p>
                            <p>Format: {tournament.format}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default PastTournaments;