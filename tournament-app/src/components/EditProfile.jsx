import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

// ✅ Country List with Flags (Ensure it's at the top!)
const countries = [
    { name: "United States", code: "US", flag: "https://flagcdn.com/w40/us.png" },
    { name: "Canada", code: "CA", flag: "https://flagcdn.com/w40/ca.png" },
    { name: "United Kingdom", code: "GB", flag: "https://flagcdn.com/w40/gb.png" },
    { name: "Germany", code: "DE", flag: "https://flagcdn.com/w40/de.png" },
    { name: "France", code: "FR", flag: "https://flagcdn.com/w40/fr.png" },
    { name: "Australia", code: "AU", flag: "https://flagcdn.com/w40/au.png" },
    { name: "Japan", code: "JP", flag: "https://flagcdn.com/w40/jp.png" },
    { name: "India", code: "IN", flag: "https://flagcdn.com/w40/in.png" },
    { name: "Brazil", code: "BR", flag: "https://flagcdn.com/w40/br.png" },
    { name: "Mexico", code: "MX", flag: "https://flagcdn.com/w40/mx.png" },
    { name: "South Korea", code: "KR", flag: "https://flagcdn.com/w40/kr.png" },
    { name: "Italy", code: "IT", flag: "https://flagcdn.com/w40/it.png" },
    { name: "Spain", code: "ES", flag: "https://flagcdn.com/w40/es.png" },
    { name: "China", code: "CN", flag: "https://flagcdn.com/w40/cn.png" },
    { name: "Russia", code: "RU", flag: "https://flagcdn.com/w40/ru.png" },
];


const EditProfile = () => {
    const { userID } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState({ username: '', bio: '', country: '' });
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);

    // ✅ Fetch user data on mount
    useEffect(() => {
        axios.get(`http://localhost:5001/member/${userID}`)
            .then((response) => {
                setUser(response.data);
            })
            .catch((error) => {
                setError('Error fetching user details');
                console.error(error);
            });
    }, [userID]);

    // ✅ Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();

        // Collect form values dynamically
        const formData = new FormData(e.target);
        const updatedUser = {
            username: formData.get("username"),
            bio: formData.get("bio"),
            country: formData.get("country"),
        };

        // Send updated user object to backend
        axios.put(`http://localhost:5001/member/${userID}`, updatedUser)
            .then(() => {
                setMessage('Profile updated successfully!');
                setTimeout(() => navigate(`/profile/${userID}`), 1500);
            })
            .catch((error) => {
                setError('Failed to update profile');
                console.error(error);
            });
    };

    if (error) {
        return <div className="text-center text-red-500">{error}</div>;
    }

    return (
        <div className="max-w-lg mx-auto p-6 bg-gray-800 text-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4 text-center">✏️ Edit Profile</h2>

            {message && <p className="text-green-500 text-center">{message}</p>}

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Username */}
                <div>
                    <label className="block font-semibold">Username:</label>
                    <input
                        type="text"
                        name="username"
                        defaultValue={user.username}
                        className="w-full p-2 border border-gray-600 bg-gray-900 text-white rounded-md"
                    />
                </div>

                {/* Bio */}
                <div>
                    <label className="block font-semibold">Bio:</label>
                    <textarea
                        name="bio"
                        defaultValue={user.bio}
                        className="w-full p-2 border border-gray-600 bg-gray-900 text-white rounded-md"
                    />
                </div>

                {/* Country Selection */}
                <div>
                    <label className="block font-semibold mb-2">Select Country:</label>
                    <div className="grid grid-cols-2 gap-3">
                        {countries.map((country) => (
                            <label
                                key={country.code}
                                className={`flex items-center p-2 rounded-md cursor-pointer border-2 ${
                                    user.country === country.name ? "border-gold-500" : "border-gray-600"
                                }`}
                                onClick={() => setUser((prev) => ({ ...prev, country: country.name }))} // ✅ Ensure selection updates
                            >
                                <input
                                    type="radio"
                                    name="country"
                                    value={country.name}
                                    checked={user.country === country.name}
                                    onChange={() => setUser((prev) => ({ ...prev, country: country.name }))} // ✅ Allow interaction
                                    className="hidden"
                                />
                                <img src={country.flag} alt={country.name} className="w-6 h-4 rounded-sm mr-2" />
                                <span>{country.name}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Save Button */}
                <button
                    type="submit"
                    className="w-full bg-gold-500 text-black py-2 px-4 rounded-lg hover:bg-gold-400 transition"
                >
                    💾 Save Changes
                </button>
            </form>
        </div>
    );
};

export default EditProfile;
