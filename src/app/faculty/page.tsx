'use client'
import Image from 'next/image';
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import axios from 'axios';
import Loader from '@/components/Loader';
import Link from 'next/link';

interface FacultyInfo {
    name: string;
    personalPhoneNumber: string;
    allotedHostel: string;
}

interface Pass {
    id: number;
    reason: string;
}

export default function Faculty() {
    const router = useRouter();
    const { data: session, status: sessionStatus } = useSession();
    const role = (session?.user as { role: string })?.role;
    const facultyId = (session?.user as { id: number })?.id;

    const [facultyInfo, setFacultyInfo] = useState<FacultyInfo | null>(null);
    const [passes, setPasses] = useState<Pass[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isPassLoading, setIsPassLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch faculty details only for warden/admin
    useEffect(() => {
        if (!facultyId || !["warden", "admin"].includes(role)) return;

        async function getData() {
            try {
                setIsLoading(true);
                setError(null);
                const res = await axios.get(`/api/faculty?facultyId=${facultyId}`);
                setFacultyInfo(res.data);
            } catch (error) {
                console.error('Error fetching faculty data:', error);
                setError('Failed to load faculty details.');
            } finally {
                setIsLoading(false);
            }
        }

        getData();
    }, [facultyId, role]);  // 👈 Ensures stable dependencies

    // Fetch pending passes only for warden/admin
    useEffect(() => {
        if (!["warden", "admin"].includes(role)) return;

        async function getPasses() {
            try {
                setIsPassLoading(true);
                setError(null);
                const res = await axios.get('/api/pendingpass');
                setPasses(res.data);
            } catch (error) {
                console.error('Error fetching pending passes:', error);
                setError('Failed to load pending passes.');
            } finally {
                setIsPassLoading(false);
            }
        }

        getPasses();
    }, [role]);  // 👈 Ensures stable dependencies


    // Show loading while session is being checked
    if (sessionStatus === "loading") {
        return (
            <div className='flex justify-center items-center min-h-screen'>
                <Loader />
            </div>
        );
    }

    // Show login prompt if user is not authenticated
    if (!session) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
                <p className="text-xl md:text-2xl mb-8 text-red-500 text-center">
                    You are not signed in. Please sign in to access this page.
                </p>
                <div className="space-y-4 md:space-x-4 md:space-y-0">
                    <button
                        onClick={() => router.push('/')}
                        className="bg-[#1D4977] text-white px-6 py-2 rounded hover:bg-blue-600 transition w-full md:w-auto"
                    >
                        Sign In
                    </button>
                </div>
            </div>
        );
    }


    if (role !== "warden" && role !== "admin") {
        return (
            <div className="p-6 flex justify-center items-center min-h-screen">
                <div className="text-center">
                    <h2 className="text-2xl font-semibold mb-4">Access Denied</h2>
                    <p className="text-gray-600">You do not have the necessary permissions to view this page.</p>
                    <button
                        onClick={() => router.push('/')}
                        className="bg-blue-500 text-white px-6 py-2 my-6 rounded hover:bg-blue-600 transition w-full sm:w-auto"
                    >
                        Go Back to Home Page
                    </button>
                </div>
            </div>
        );
    }

    // Show faculty dashboard if the user is a warden or admin
    return (
        <div className="min-h-screen bg-gray-100">
            {facultyInfo && (
                <div
                    className="bg-gray-200 text-white p-6 relative mx-2 rounded-b-lg"
                    style={{
                        backgroundImage: `url('/images/bg.jpeg')`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                >
                    <div className="absolute inset-0 bg-black opacity-50 rounded-b-lg"></div>
                    <div className='relative flex space-x-4'>
                        <Image src='/favicon.svg' width={50} height={50} className="rounded-full" alt="Profile" />
                        <div>
                            <h1 className="text-2xl font-semibold">Welcome,</h1>
                            <h2 className="p-1 text-xl font-bold">{facultyInfo.name}</h2>
                        </div>
                    </div>
                    <div className='relative mt-4'>
                        <p className="text-sm">Hostel: {facultyInfo.allotedHostel}</p>
                        <p className="text-sm">Mobile No.: {facultyInfo.personalPhoneNumber}</p>
                    </div>
                </div>
            )}

            <div
                className="m-2 bg-[#E5C662] p-4 rounded-lg shadow-md flex justify-between cursor-pointer"
                onClick={() => router.push('/faculty/passrequests')}
            >
                <div>
                    <h2 className="font-semibold text-lg">
                        {isPassLoading ? '...' : passes.length}
                    </h2>
                    <p className="text-gray-700 text-sm ml-1">Today's Pending Passes</p>
                    <hr className="border-t-2 border-gray-300 my-2" />
                </div>
                <div className='m-4'>
                    <Image src='/images/pending.svg' alt='pending svg' width={50} height={50} />
                </div>
            </div>

            <div className='flex'>
                <div className='rounded-lg shadow-md p-4 m-2 w-1/2'>
                    <div className='flex justify-center'>
                        <Image src='/images/tick.svg' width={50} height={50} alt="tick" />
                    </div>
                    <div className='text-center'>Approved Passes</div>
                </div>
                <div className='rounded-lg shadow-md p-4 m-2 w-1/2'>
                    <div className='flex justify-center'>
                        <Image src='/images/cross.svg' width={50} height={50} alt="cross" />
                    </div>
                    <div className='text-center'>Denied Passes</div>
                </div>
            </div>
            <nav className="fixed bottom-0 w-full bg-[#1D4977] text-white p-2 flex justify-around items-center">

                <Link href={'/faculty'} className="flex flex-col items-center">
                    <Image src="/images/homeicon.svg" alt='homeicon' width={20} height={20} />
                    <span className="text-xs">Home</span>
                </Link>
                <Link href={'/faculty/passrequests'} className="flex flex-col items-center">
                    <Image src="/images/passicon.svg" alt='homeicon' width={25} height={25} />
                    <span className="text-xs mt-1">Passes</span>
                </Link>
                <Link href={'/faculty'} className="flex flex-col items-center">
                    <Image src="/images/calicon.svg" alt='homeicon' width={20} height={20} />
                    <span className="text-xs mt-1">Calendar</span>
                </Link>
                <Link href={'/faculty'} className="flex flex-col items-center">
                    <Image src="/images/profileicon.svg" alt='homeicon' width={20} height={20} />
                    <span className="text-xs mt-1">Profile</span>
                </Link>

            </nav>
        </div>
    );
}
