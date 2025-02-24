import React, {useEffect, useState} from "react";
import axios from 'axios';

const TournamentList = ({ tournaments }) => {
    const [user, setUser] = useState(null)

    useEffect(() => {
        axios.get('http://localhost:5001/user')
        .then(response => setUser(response.data))

        // vvv Uncomment below for testing before authorization is fixed vvv
        // axios.get('http://localhost:5001/test-user')
        //     .then((response) => {setUser(response.data)})
        //     .then(() => console.log(user))
    }, [user]);

    const register = (tournament) => {
        if (!user) {
            alert(`You must be logged in to register`);
            return;
        }

        console.log(user);
        console.log(user.username);
        axios.post('http://localhost:5001/register-player', {user: user, tournament: tournament})
            .then(() => console.log(`${user.username} successfully registered`))
            .catch(error => alert(`${error}: You were not registered for this tournament.`));
    }

    return (
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
                            <button onClick={() => {register(tournament._id)}}
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
};

export default TournamentList;