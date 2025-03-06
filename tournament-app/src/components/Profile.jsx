import { useParams } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";
import { Pie, Line } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, TimeScale } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, TimeScale);


const DisplayProfile = () => {
    const { userID } = useParams();
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);
    const [opponentNames, setOpponentNames] = useState({});
    const [tournamentDetails, setTournamentDetails] = useState({});
    const [filteredMatches, setFilteredMatches] = useState([]);
    const [filters, setFilters] = useState({
        ruleset: "",
        opponent: "",
        format: "",
        dateFrom: "",
        dateTo: "",
        result: "",
        tournament: ""
    });
    const [opponentList, setOpponentList] = useState([]);
    const [tournamentList, setTournamentList] = useState([]);
    const [rulesetList, setRulesetList] = useState([]);
    const [formatList, setFormatList] = useState([]); // New list for formats
    const winRateData = filteredMatches.reduce((acc, match) => {
        const matchDate = new Date(match.date).toLocaleDateString();

        if (!acc.dates.includes(matchDate)) {
            acc.dates.push(matchDate);
            acc.matches.push(0);
            acc.wins.push(0);
        }

        const index = acc.dates.indexOf(matchDate);
        acc.matches[index] += 1;
        if (match.result === "win") {
            acc.wins[index] += 1;
        }

        acc.winRates[index] = ((acc.wins[index] / acc.matches[index]) * 100).toFixed(2);

        return acc;
    }, { dates: [], matches: [], wins: [], winRates: [] });


// Prepare chart data
    const winRateChartData = {
        labels: winRateData.dates,
        datasets: [
            {
                label: 'Win Rate (%)',
                data: winRateData.winRates,
                borderColor: '#22c55e',
                backgroundColor: 'rgba(34, 197, 94, 0.2)',
                fill: true,
                tension: 0.3,
                pointRadius: 3,
            }
        ],
    };

    const winRateChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: { title: { display: true, text: 'Date' } },
            y: { title: { display: true, text: 'Win Rate (%)' }, min: 0, max: 100 }
        },
        plugins: {
            legend: { display: true },
            tooltip: { enabled: true }
        }
    };


    useEffect(() => {
        if (!userID) {
            setError('User ID is missing');
            return;
        }

        axios.get(`http://localhost:5001/member/${userID}`)
            .then((response) => {
                setUser(response.data);
                setFilteredMatches(response.data.matchHistory);
                setOpponentList([...new Set(response.data.matchHistory.map(m => m.opponent).filter(op => op !== userID))]);
                setTournamentList([...new Set(response.data.matchHistory.map(m => m.tournament))]);
            })
            .catch((error) => {
                setError('Error fetching user details');
                console.error(error);
            });
    }, [userID]);

    useEffect(() => {
        if (user && user.matchHistory) {
            user.matchHistory.forEach((match) => {
                if (match.opponent && match.opponent !== userID && !opponentNames[match.opponent]) {
                    axios.get(`http://localhost:5001/member/${match.opponent}`)
                        .then((response) => {
                            setOpponentNames(prev => ({ ...prev, [match.opponent]: response.data.username }));
                        })
                        .catch((error) => {
                            console.error('Error fetching opponent name:', error);
                        });
                }
                if (match.tournament && !tournamentDetails[match.tournament]) {
                    axios.get(`http://localhost:5001/tournament/${match.tournament}/details`)
                        .then((response) => {
                            setTournamentDetails(prev => ({ ...prev, [match.tournament]: response.data }));
                            setRulesetList(prev => [...new Set([...prev, response.data.ruleset])]);
                            setFormatList(prev => [...new Set([...prev, response.data.format])]); // Collecting formats
                        })
                        .catch((error) => {
                            console.error('Error fetching tournament details:', error);
                        });
                }
            });
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            setFilteredMatches(user.matchHistory.filter(match => {
                const matchDate = new Date(match.date);
                return (
                    (!filters.ruleset || tournamentDetails[match.tournament]?.ruleset === filters.ruleset) &&
                    (!filters.opponent || opponentNames[match.opponent] === filters.opponent) &&
                    (!filters.format || tournamentDetails[match.tournament]?.format === filters.format) &&
                    (!filters.dateFrom || matchDate >= new Date(filters.dateFrom)) &&
                    (!filters.dateTo || matchDate <= new Date(filters.dateTo)) &&
                    (!filters.result || match.result === filters.result) &&
                    (!filters.tournament || tournamentDetails[match.tournament]?.name === filters.tournament)
                );
            }));
        }
    }, [filters, user]);

    const totalWins = filteredMatches.filter(match => match.result === "win").length;
    const totalMatches = filteredMatches.length;
    const winPercentage = totalMatches ? ((totalWins / totalMatches) * 100).toFixed(2) : 0;
    const totalScore = filteredMatches.reduce((acc, match) => acc + (parseInt(match.score?.split('-')[0]) || 0), 0);
    const opponentTotalScore = filteredMatches.reduce((acc, match) => acc + (parseInt(match.score?.split('-')[1]) || 0), 0);

    const resetFilters = () => {
        setFilters({
            ruleset: "",
            opponent: "",
            format: "",
            dateFrom: "",
            dateTo: "",
            result: "",
            tournament: ""
        });
    };

    return (
        <div className="max-w-5xl mx-auto p-10 bg-gray-900 text-white rounded-lg shadow-lg">
            <h2 className="text-3xl font-extrabold mb-6 text-center">Player Profile</h2>
            <div className="text-center flex flex-col items-center">
                <img src={user?.profilePicture} alt="Profile"
                     className="w-28 h-28 rounded-full border-4 border-blue-500 shadow-lg mb-4"/>
                <h3 className="font-bold text-2xl">{user?.username}</h3>
                <p className="text-gray-400 text-lg">{user?.bio}</p>
                <p className="text-yellow-400">Total Score: {totalScore}-{opponentTotalScore}</p>
                <div className="w-64 mx-auto mt-4">
                    <Pie
                        data={{
                            labels: ['Wins', 'Losses'],
                            datasets: [
                                {
                                    data: [totalWins, totalMatches - totalWins],
                                    backgroundColor: ['#22c55e', '#ef4444'],
                                    hoverBackgroundColor: ['#16a34a', '#dc2626'],
                                },
                            ],
                        }}
                        options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: {position: 'bottom'},
                                tooltip: {enabled: true},
                            },
                        }}
                    />

                </div>
                <div className="w-full h-64 mt-8">
                    <h3 className="text-xl font-bold text-center mb-4">Daily Win Rate Over Time</h3>
                    <Line data={winRateChartData} options={winRateChartOptions}/>
                </div>

            </div>

            <h3 className="text-2xl font-bold mt-8 mb-4 text-center">Filters</h3>
            <div className="flex flex-wrap gap-4 mb-6">
                <select className="p-2 rounded bg-gray-700 text-white border border-gray-500"
                        onChange={(e) => setFilters({...filters, opponent: e.target.value})}>
                    <option value="">All Opponents</option>
                    {opponentList.map(op => <option key={op} value={opponentNames[op]}>{opponentNames[op]}</option>)}
                </select>
                <select className="p-2 rounded bg-gray-700 text-white border border-gray-500"
                        onChange={(e) => setFilters({...filters, tournament: e.target.value})}>
                    <option value="">All Tournaments</option>
                    {tournamentList.map(tour => <option key={tour}
                                                        value={tournamentDetails[tour]?.name}>{tournamentDetails[tour]?.name}</option>)}
                </select>
                <select className="p-2 rounded bg-gray-700 text-white border border-gray-500"
                        onChange={(e) => setFilters({...filters, format: e.target.value})}>
                    <option value="">All Formats</option>
                    {formatList.map(fmt => <option key={fmt} value={fmt}>{fmt}</option>)}
                </select>
                <select className="p-2 rounded bg-gray-700 text-white border border-gray-500"
                        onChange={(e) => setFilters({...filters, ruleset: e.target.value})}>
                    <option value="">All Rulesets</option>
                    {formatList.map(fmt => <option key={fmt} value={fmt}>{fmt}</option>)}
                </select>
                <button onClick={resetFilters}
                        className="p-2 rounded bg-red-500 text-white border border-gray-500">Clear Filters
                </button>
            </div>

            <h3 className="text-2xl font-bold mt-8 mb-4 text-center">Match History</h3>
            <table className="w-full min-w-[900px] border-collapse bg-gray-800 text-white rounded-lg">
                <thead>
                <tr className="bg-blue-600 text-center">
                    <th>Opponent</th>
                    <th>Tournament</th>
                    <th>Ruleset</th>
                    <th>Format</th>
                    <th>Result</th>
                    <th>Score</th>
                    <th>Date</th>
                </tr>
                </thead>
                <tbody>
                {filteredMatches.map((match, index) => {
                    const formattedScore = match.score
                        ? match.score.split('-').map(s => (s === undefined || s.trim() === "") ? "0" : s).join('-')
                        : "0-0";

                    return (
                        <tr key={index} className="text-center bg-gray-700 hover:bg-gray-600">
                            <td>{opponentNames[match.opponent] || "Loading..."}</td>
                            <td>{tournamentDetails[match.tournament]?.name || "Loading..."}</td>
                            <td>{tournamentDetails[match.tournament]?.ruleset || "Loading..."}</td>
                            <td>{tournamentDetails[match.tournament]?.format || "Loading..."}</td>
                            <td>{match.result.toUpperCase()}</td>
                            <td>{formattedScore}</td>
                            <td>{new Date(match.date).toLocaleDateString()}</td>
                        </tr>
                    );
                })}
                </tbody>

            </table>

        </div>
    );
}
export default DisplayProfile;
