import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import profile1 from "../assets/ProfilePictures/CueSportsProfile1.jpg";
import profile2 from "../assets/ProfilePictures/CueSportsProfile2.jpg";
import profile3 from "../assets/ProfilePictures/CueSportsProfile3.jpg";
import profile4 from "../assets/ProfilePictures/CueSportsProfile4.jpg";
import profile5 from "../assets/ProfilePictures/CueSportsProfile5.jpg";

const profilePictures = [profile1, profile2, profile3, profile4, profile5];


const countries = [
    { name: "United States", code: "US", flag: "https://flagcdn.com/w40/us.png" },
    { name: "Canada", code: "CA", flag: "https://flagcdn.com/w40/ca.png" },
    { name: "United Kingdom", code: "GB", flag: "https://flagcdn.com/w40/gb.png" },
    { name: "Germany", code: "DE", flag: "https://flagcdn.com/w40/de.png" },
    { name: "France", code: "FR", flag: "https://flagcdn.com/w40/fr.png" }
];

const EditProfile = () => {
    const { userID } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState({ username: '', bio: '', country: '', profilePicture: '' });
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        axios.get(`http://localhost:5001/user`, { withCredentials: true })
            .then((response) => {
                setUser(response.data);
            })
            .catch((error) => {
                setError('Error fetching user details');
                console.error(error);
            });
    }, [userID]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const updatedUser = {
            username: formData.get("username"),
            bio: formData.get("bio"),
            country: user.country,
            profilePicture: user.profilePicture
        };

        axios.put(`http://localhost:5001/member/${user._id}`, updatedUser)
            .then(() => {
                setMessage('Profile updated successfully!');
                setTimeout(() => navigate(`/profile/${user._id}`), 1500);
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
                <div>
                    <label className="block font-semibold">Username:</label>
                    <input type="text" name="username" defaultValue={user.username} className="w-full p-2 border border-gray-600 bg-gray-900 text-white rounded-md" />
                </div>

                <div>
                    <label className="block font-semibold">Bio:</label>
                    <textarea name="bio" defaultValue={user.bio} className="w-full p-2 border border-gray-600 bg-gray-900 text-white rounded-md" />
                </div>

                <div>
                    <label className="block font-semibold mb-2">Select Country:</label>
                    <div className="grid grid-cols-2 gap-3">
                        {countries.map((country) => (
                            <label key={country.code} className={`flex items-center p-2 rounded-md cursor-pointer border-2 ${user.country === country.name ? "border-gold-500" : "border-gray-600"}`}
                                   onClick={() => setUser(prev => ({ ...prev, country: country.name }))}>
                                <input type="radio" name="country" value={country.name} checked={user.country === country.name} onChange={() => setUser(prev => ({ ...prev, country: country.name }))} className="hidden" />
                                <img src={country.flag} alt={country.name} className="w-6 h-4 rounded-sm mr-2" />
                                <span>{country.name}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block font-semibold mb-2">Choose Profile Picture:</label>
                    <div className="flex space-x-3">
                        {profilePictures.map((pic, index) => (
                            <img key={index} src={pic} alt={`Profile ${index + 1}`}
                                 className={`w-16 h-16 rounded-full cursor-pointer border-2 ${user.profilePicture === pic ? "border-blue-500" : "border-gray-600"}`}
                                 onClick={() => setUser(prev => ({ ...prev, profilePicture: pic }))} />
                        ))}
                    </div>
                </div>

                <button type="submit" className="w-full bg-gold-500 text-black py-2 px-4 rounded-lg hover:bg-gold-400 transition">
                    💾 Save Changes
                </button>
            </form>
        </div>
    );
};

export default EditProfile;
