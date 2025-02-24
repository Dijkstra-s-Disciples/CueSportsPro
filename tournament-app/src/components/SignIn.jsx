import React from 'react';

const SignIn = () => {
    return (
        <section className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
            <div className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-md text-center">
                <h1 className="text-2xl font-semibold mb-6">Sign in</h1>

                <a href="http://localhost:5001/login/federated/google"
                   className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 px-6 rounded-lg text-lg font-semibold">
                    Sign in with Google
                </a>
            </div>

        </section>
    );
};

export default SignIn;
