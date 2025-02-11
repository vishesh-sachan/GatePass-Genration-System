'use client'
import { signOut } from 'next-auth/react';

const LogoutPage = () => {
    return (
        <div>
            <button
            onClick={() => signOut()}
            className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600 transition w-full md:w-auto"
          >logout</button>
        </div>)
};

export default LogoutPage;