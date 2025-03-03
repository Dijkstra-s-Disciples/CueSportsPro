import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
    const [gameActive, setGameActive] = useState(false);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(30);
    const [position, setPosition] = useState({ x: 50, y: 50 });
    const [highScore, setHighScore] = useState(0);
    const gameAreaRef = useRef(null);

    // Start/restart the game
    const startGame = () => {
        setGameActive(true);
        setScore(0);
        setTimeLeft(30);
        moveRandomly();
    };

    // Move the cue ball to a random position
    const moveRandomly = () => {
        if (gameAreaRef.current) {
            const gameArea = gameAreaRef.current.getBoundingClientRect();
            const ballSize = 50; // Ball width/height in pixels
            
            // Generate random position within the game area
            const newX = Math.floor(Math.random() * (gameArea.width - ballSize));
            const newY = Math.floor(Math.random() * (gameArea.height - ballSize));
            
            setPosition({ x: newX, y: newY });
        }
    };

    // Handle clicking the cue ball
    const handleBallClick = () => {
        if (gameActive) {
            setScore(prevScore => prevScore + 1);
            moveRandomly();
        }
    };

    // Timer effect for countdown
    useEffect(() => {
        let timer;
        if (gameActive && timeLeft > 0) {
            timer = setTimeout(() => {
                setTimeLeft(time => time - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setGameActive(false);
            if (score > highScore) {
                setHighScore(score);
            }
        }
        
        return () => clearTimeout(timer);
    }, [gameActive, timeLeft, score, highScore]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
            <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
            <p className="text-xl mb-8">Oops! Looks like this page is scratched!</p>
            
            <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold mb-2">Cue Ball Chase</h2>
                <p className="mb-4">Click the cue ball as many times as you can in 30 seconds!</p>
                
                {!gameActive && (
                    <button 
                        onClick={startGame}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition mb-4"
                    >
                        {score > 0 ? 'Play Again' : 'Start Game'}
                    </button>
                )}
                
                {gameActive && (
                    <div className="flex justify-between w-full max-w-md mb-2">
                        <div>Score: {score}</div>
                        <div>Time: {timeLeft}s</div>
                    </div>
                )}
                
                {!gameActive && score > 0 && (
                    <div className="mb-4">
                        <p>Your Score: {score}</p>
                        <p>High Score: {highScore}</p>
                    </div>
                )}
            </div>
            
            <div 
                ref={gameAreaRef}
                className="relative border-2 border-gray-700 bg-gray-800 rounded-lg w-full max-w-lg h-64 mb-8"
            >
                {gameActive && (
                    <div 
                        className="absolute w-12 h-12 bg-white rounded-full shadow-lg cursor-pointer transform hover:scale-110 transition"
                        style={{ 
                            left: `${position.x}px`, 
                            top: `${position.y}px`,
                            boxShadow: '0 0 10px rgba(255, 255, 255, 0.7)'
                        }}
                        onClick={handleBallClick}
                    />
                )}
                
                {!gameActive && !score && (
                    <div className="flex items-center justify-center h-full">
                        <p>Click Start Game to play!</p>
                    </div>
                )}
                
                {!gameActive && score > 0 && (
                    <div className="flex items-center justify-center h-full">
                        <p>Game Over! You scored {score} points.</p>
                    </div>
                )}
            </div>
            
            <div className="flex space-x-4">
                <Link to="/" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    Go Home
                </Link>
            </div>
        </div>
    );
};

export default NotFound; 