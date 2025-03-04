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
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-4">
            <div className="card p-8 w-full max-w-2xl fade-in">
                <div className="text-center mb-8">
                    <h1 className="text-5xl font-bold text-emerald-400 mb-4">404</h1>
                    <h2 className="text-2xl font-semibold mb-2">Page Not Found</h2>
                    <p className="text-gray-300 mb-6">Oops! Looks like this page is scratched!</p>
                </div>
                
                <div className="mb-8 text-center">
                    <h2 className="text-2xl font-bold mb-3 text-emerald-400">Cue Ball Chase</h2>
                    <p className="mb-4 text-gray-300">Click the cue ball as many times as you can in 30 seconds!</p>
                    
                    {!gameActive && (
                        <button 
                            onClick={startGame}
                            className="btn-primary mt-2 mb-6"
                        >
                            {score > 0 ? 'Play Again' : 'Start Game'}
                        </button>
                    )}
                    
                    {gameActive && (
                        <div className="flex justify-between w-full max-w-md mx-auto mb-3 p-4 bg-gray-800 rounded-lg border border-gray-700">
                            <div className="text-lg">Score: <span className="text-emerald-400 font-bold">{score}</span></div>
                            <div className="text-lg">Time: <span className="text-amber-400 font-bold">{timeLeft}s</span></div>
                        </div>
                    )}
                    
                    {!gameActive && score > 0 && (
                        <div className="mb-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
                            <p className="text-lg">Your Score: <span className="text-emerald-400 font-bold">{score}</span></p>
                            <p className="text-lg">High Score: <span className="text-amber-400 font-bold">{highScore}</span></p>
                        </div>
                    )}
                </div>
                
                <div 
                    ref={gameAreaRef}
                    className="relative border-2 border-gray-700 bg-gray-800 bg-opacity-70 rounded-lg w-full h-64 mb-8 overflow-hidden"
                    style={{
                        boxShadow: '0 0 20px rgba(16, 185, 129, 0.1) inset',
                    }}
                >
                    {gameActive && (
                        <div 
                            className="absolute w-12 h-12 bg-white rounded-full shadow-lg cursor-pointer transform hover:scale-110 transition-all duration-200"
                            style={{ 
                                left: `${position.x}px`, 
                                top: `${position.y}px`,
                                boxShadow: '0 0 15px rgba(255, 255, 255, 0.8)',
                                background: 'radial-gradient(circle at 35% 35%, white 0%, #f0f0f0 60%, #e0e0e0 100%)'
                            }}
                            onClick={handleBallClick}
                        />
                    )}
                    
                    {!gameActive && !score && (
                        <div className="flex items-center justify-center h-full text-gray-400">
                            <p>Click Start Game to play!</p>
                        </div>
                    )}
                    
                    {!gameActive && score > 0 && (
                        <div className="flex items-center justify-center h-full text-gray-300">
                            <div className="text-center">
                                <p className="text-xl mb-2">Game Over!</p>
                                <p className="text-3xl text-emerald-400">You scored {score} points.</p>
                            </div>
                        </div>
                    )}
                </div>
                
                <div className="text-center">
                    <Link to="/" className="btn-primary inline-block">
                        Go Home
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default NotFound; 