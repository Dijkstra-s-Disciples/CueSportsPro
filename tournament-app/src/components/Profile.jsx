import { useParams } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";

const DisplayProfile = () => {
    const countryFlags = {
        "United States": "https://flagcdn.com/w40/us.png",
        "Canada": "https://flagcdn.com/w40/ca.png",
        "United Kingdom": "https://flagcdn.com/w40/gb.png",
        "Germany": "https://flagcdn.com/w40/de.png",
        "France": "https://flagcdn.com/w40/fr.png",
        "Australia": "https://flagcdn.com/w40/au.png",
        "Japan": "https://flagcdn.com/w40/jp.png",
        "India": "https://flagcdn.com/w40/in.png",
        "Brazil": "https://flagcdn.com/w40/br.png",
        "Mexico": "https://flagcdn.com/w40/mx.png",
        "South Korea": "https://flagcdn.com/w40/kr.png",
        "Italy": "https://flagcdn.com/w40/it.png",
        "Spain": "https://flagcdn.com/w40/es.png",
        "China": "https://flagcdn.com/w40/cn.png",
        "Russia": "https://flagcdn.com/w40/ru.png",
    };

    const { userID } = useParams();
    console.log(userID);
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);
    const [opponentNames, setOpponentNames] = useState({});
    const [tournamentNames, setTournamentNames] = useState({});

    useEffect(() => {
        if (!userID) {
            setError('User ID is missing');
            return;
        }

        axios.get(`http://localhost:5001/member/${userID}`)
            .then((response) => {
                setUser(response.data);
            })
            .catch((error) => {
                setError('Error fetching user details');
                console.error(error);
            });
    }, [userID]);

    useEffect(() => {
        if (user && user.matchHistory) {
            user.matchHistory.forEach((match) => {
                if (match.opponent && !opponentNames[match.opponent]) {
                    axios.get(`http://localhost:5001/member/${match.opponent}`)
                        .then((response) => {
                            setOpponentNames(prev => ({ ...prev, [match.opponent]: response.data.username }));
                        })
                        .catch((error) => {
                            console.error('Error fetching opponent name:', error);
                        });
                }
                if (match.tournament && !tournamentNames[match.tournament]) {
                    axios.get(`http://localhost:5001/tournament/${match.tournament}/name`)
                        .then((response) => {
                            setTournamentNames(prev => ({ ...prev, [match.tournament]: response.data.name }));
                        })
                        .catch((error) => {
                            console.error('Error fetching tournament name:', error);
                        });
                }
            });
        }
    }, [user]);

    if (error || !user) {
        return <div className="text-center text-red-500">{error}</div>;
    }

    return (
        <div className="max-w-4xl mx-auto p-8 bg-gray-800 text-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4 text-center">Player Stats</h2>
            <div className="text-center">
                <img src={user.profilePicture} alt="Profile" className="w-24 h-24 rounded-full mx-auto mb-4 border-2 border-gray-500" />
                <h3 className="font-semibold text-lg">{user.username}</h3>
                <p className="text-gray-400">{user.bio}</p>
            </div>

            <h3 className="text-xl font-bold mt-6">Match History</h3>
            <div className="overflow-x-auto">
                <table className="w-full min-w-[800px] mt-4 border-collapse border border-gray-600">
                    <thead>
                    <tr className="bg-gray-700 text-center">
                        <th className="border border-gray-500 px-4 py-2">Opponent</th>
                        <th className="border border-gray-500 px-4 py-2">Tournament</th>
                        <th className="border border-gray-500 px-4 py-2">Result</th>
                        <th className="border border-gray-500 px-4 py-2">Score</th>
                        <th className="border border-gray-500 px-4 py-2">Date</th>
                    </tr>
                    </thead>
                    <tbody>
                    {user.matchHistory.map((match, index) => (
                        <tr key={index} className="bg-gray-100 text-center text-black">
                            <td className="border border-gray-500 px-4 py-2">
                                <a href={`/profile/${match.opponent}`} className="text-blue-500 hover:underline">
                                    {opponentNames[match.opponent] || "Loading..."}
                                </a>
                            </td>
                            <td className="border border-gray-500 px-4 py-2">
                                <a href={`/tournament/${match.tournament}`} className="text-blue-500 hover:underline">
                                    {tournamentNames[match.tournament] || "Loading..."}
                                </a>
                            </td>
                            <td className={`border border-gray-500 px-4 py-2 ${match.result === 'win' ? 'text-green-500' : 'text-red-500'}`}>
                                {match.result.toUpperCase()}
                            </td>
                            <td className="border border-gray-500 px-4 py-2">{match.score}</td>
                            <td className="border border-gray-500 px-4 py-2">{new Date(match.date).toLocaleDateString()}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
export default DisplayProfile;