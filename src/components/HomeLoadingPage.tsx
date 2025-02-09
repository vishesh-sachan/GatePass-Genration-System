"use client"

import Image from 'next/image';
import Loader from './Loader';

export default function HomeLoadingPage() {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-white px-6">
            <div className="absolute top-40 mb-6">
                <Image
                    src="/images/HUlogo.svg"
                    alt="Haridwar University Logo"
                    width={250}
                    height={80}
                    className="mx-auto"
                />
            </div>
            
            <h2 className="text-2xl font-bold text-center text-[#1D4977] mb-4">
                E-Gate Pass System
            </h2>
            <Loader />
            
            <div className="fixed bottom-0">
                <Image 
                    src="/images/home.svg"
                    alt="logo"
                    width={250}
                    height={80}
                    className="mx-auto"
                />
            </div>
        </div>
    );
}
