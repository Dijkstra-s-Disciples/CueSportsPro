import {useParams} from "react-router-dom";
import axios from "axios";
import {useEffect, useState} from "react";

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

    // Fetch the tournament data when the component mounts
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

    if (error || !user) {
        return <div className="text-center text-red-500">{error}</div>;
    }

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Player Stats</h2>
            <div>
                <div key={user._id} className="border p-4 mb-4">
                    <h3 className="font-semibold">{user.username}</h3>
                    <p>Wins: {user.wins}</p>
                    <p>Losses: {user.losses}</p>
                    <div className="flex items-center mt-2">
                        <p className="mr-2">🌍 Representing:</p>
                        {user.country && countryFlags[user.country] ? (
                            <>
                                <img
                                    src={countryFlags[user.country]}
                                    alt={`${user.country} flag`}
                                    className="w-6 h-4 rounded-sm"
                                />
                                <p className="ml-2">{user.country}</p>
                            </>
                        ) : (
                            <p>Unknown</p>
                        )}
                    </div>

                    <p>Bio: {user.bio}</p>
                </div>
            </div>
        </div>
    );
}
export default DisplayProfile;