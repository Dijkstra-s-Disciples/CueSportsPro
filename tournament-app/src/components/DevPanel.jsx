import React, { useEffect, useState } from 'react';
import axios from 'axios';

const DevPanel = () => {
    const [users, setUsers] = useState([]);
    const [tournaments, setTournaments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        axios.get('http://localhost:5001/users')
            .then(response => {
                setUsers(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error("Error fetching users:", error);
                setError("Failed to fetch users.");
                setLoading(false);
            });

        axios.get('http://localhost:5001/tournaments')
            .then(response => {
                setTournaments(response.data);
            })
            .catch(error => {
                console.error("Error fetching tournaments:", error);
            });
    }, []);

    const handleInputChange = (e, id, field, type) => {
        const { value } = e.target;
        if (type === 'user') {
            setUsers(prevUsers =>
                prevUsers.map(user => user._id === id ? { ...user, [field]: value } : user)
            );
        } else if (type === 'tournament') {
            setTournaments(prevTournaments =>
                prevTournaments.map(tournament => tournament._id === id ? { ...tournament, [field]: value } : tournament)
            );
        }
    };

    const handleSaveAll = () => {
        axios.put('http://localhost:5001/users/update-all', { users })
            .then(() => alert("All users updated successfully"))
            .catch(error => alert("Error updating users: " + error.message));

        axios.put('http://localhost:5001/tournaments/update-all', { tournaments })
            .then(() => alert("All tournaments updated successfully"))
            .catch(error => alert("Error updating tournaments: " + error.message));
    };

    if (loading) return <p>Loading data...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <div className="p-6 bg-gray-900 text-white min-h-screen">
            <h2 className="text-3xl font-bold mb-4">🛠 Admin Panel</h2>
            <div className="space-y-5">
                <h3 className="text-2xl font-semibold">Users</h3>
                {users.map(user => (
                    <div key={user._id} className="border border-gray-700 p-4 bg-gray-800 rounded-lg">
                        <h3 className="text-xl font-semibold mb-2">{user.username}</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {Object.keys(user).map(key => (
                                key !== "_id" && (
                                    <div key={key}>
                                        <label className="block text-sm text-gray-300">{key}</label>
                                        <input
                                            type="text"
                                            value={user[key] || ''}
                                            onChange={(e) => handleInputChange(e, user._id, key, 'user')}
                                            className="bg-gray-700 border border-gray-600 p-2 w-full text-white rounded"
                                        />
                                    </div>
                                )
                            ))}
                        </div>
                    </div>
                ))}

                <h3 className="text-2xl font-semibold">Tournaments</h3>
                {tournaments.map(tournament => (
                    <div key={tournament._id} className="border border-gray-700 p-4 bg-gray-800 rounded-lg">
                        <h3 className="text-xl font-semibold mb-2">{tournament.name}</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {Object.keys(tournament).map(key => (
                                key !== "_id" ? (
                                    <div key={key}>
                                        <label className="block text-sm text-gray-300">{key}</label>
                                        <input
                                            type="text"
                                            value={tournament[key] || ''}
                                            onChange={(e) => handleInputChange(e, tournament._id, key, 'tournament')}
                                            className="bg-gray-700 border border-gray-600 p-2 w-full text-white rounded"
                                        />
                                    </div>
                                ) : null
                            ))}
                        </div>
                    </div>
                ))}

                <button onClick={handleSaveAll} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4">
                    Save All
                </button>
            </div>
        </div>
    );
};

export default DevPanel;
