'use client'
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import Image from "next/image";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle } from 'lucide-react';
import Loader from '@/components/Loader';
import Link from 'next/link';

interface Pass {
    id: number
    studentId: number
    reason: string
    status: 'pending' | 'approved' | 'rejected' | 'closed'
    startTime: string
    endTime: string
    actualstartTime: string | null
    actualendTime: string | null
    createdAt: string
}

const dummyData = [
    { id: 1, name: 'Vishesh Sachan', roomNo: '210' },
    { id: 2, name: 'Rahul Bora', roomNo: '102' },
    { id: 3, name: 'Ayush Kr Sharma', roomNo: '103' },
    { id: 4, name: 'Saket Kesar', roomNo: '210' },
];

async function updateStatus(passId: number, status: string) {
    // console.log(`pass id ${passId} , status ${status}`)
    try {
        const res = await axios.put('/api/pass', {
            passId,
            status
        })
        // console.log(res);
        return res;

    } catch (error) {
        console.log(error);
    }
}

export default function Passrequests() {
    const { data: session, status: sessionStatus } = useSession()
    const role = (session?.user as { role: string })?.role;
    const router = useRouter();
    const [passes, setPasses] = useState<Pass[]>([]);
    const [isLoading, setIsLoading] = useState(true)
    const socketUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL || '';

    useEffect(() => {
        if (sessionStatus !== 'loading') {
            setIsLoading(false);
        }
    }, [sessionStatus]);

    async function handleAction(id: number, studentId: number, action: string) {
        const status = action.toString()
        updateStatus(id, status).then(res => {
            if (res && res.status === 200) {
                try {
                    const socket = new WebSocket(socketUrl);
                    socket.onopen = () => {
                        socket.send(JSON.stringify({ isStudent: false, passId: id, studentId, status: action }));
                    };
                    socket.onerror = (error) => {
                        console.log("Error in WebSocket connection:", error);
                    };
                    updatePasses(id, "remove");
                    console.log(`pass with if ${id} is ${action}`)
                } catch (error) {
                    console.error('Error processing pass:', error);
                }
            }
        }).catch(error => {
            console.log('Failed to update status:', error)
        });
    }

    function updatePasses(passId: number, action: 'add' | 'remove', newPass?: Pass) {
        if (action === 'add' && newPass) {
            setPasses(prevPasses => [...prevPasses, newPass]);
        } else if (action === 'remove' && passId) {
            setPasses(prevPasses => prevPasses.filter(pass => pass.id !== passId));
        }
    }

    async function getPassById(passId: number) {
        try {
            const res = await axios.get(`/api/passwithid?id=${passId}`)
            // console.log(res)
            updatePasses(passId, "add", res.data)
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        if (session) {
            async function getPasses() {
                const res = await axios.get('/api/pendingpass')
                setPasses(res.data);
            }
            getPasses();
        }
    }, [])

    useEffect(() => {
        try {
            const socket = new WebSocket(socketUrl);

            socket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.isStudent) {
                    getPassById(data.passId);
                }
            };

            socket.onerror = (error) => {
                console.log("WebSocket connection error:", error);
            };

            return () => {
                socket.close();
            };
        } catch (error) {
            console.log("Error setting up WebSocket:", error);
        }

    }, []);

    if (sessionStatus === 'loading' || isLoading) {
        return (
            <div className='flex justify-center items-center min-h-screen'>
                <Loader />
            </div>
        )
    }

    if (!session) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
                <p className="text-xl md:text-2xl mb-8 text-red-500 text-center">You are not signed in. Please sign in to access this page.</p>
                <div className="space-y-4 md:space-x-4 md:space-y-0">
                    <button
                        onClick={() => router.push('/')}
                        className="bg-[#1D4977] text-white px-6 py-2 rounded hover:bg-blue-600 transition w-full md:w-auto"
                    >
                        SignIn
                    </button>
                </div>
            </div>
        );
    }
    if (role && (role === "warden" || role === "admin")) {
        return (
            <div>
                <div className="bg-[#1D4977] p-2 flex justify-between items-center sticky top-0 z-10">
                    <Image src='/images/backicon.svg' alt="close" width={30} height={30} className="ml-4 cursor-pointer" onClick={() => { router.push('/faculty') }} />
                    <h1 className="text-2xl font-bold text-white">Pass Requests</h1>
                    <Image src='/images/searchicon.svg' alt="search" width={30} height={30} className="mr-4 cursor-pointer" />
                </div>

                {passes.length === 0 ? (
                    <div className="flex justify-center items-center min-h-screen">
                        <p className="text-xl text-gray-500">No pending passes</p>
                    </div>
                ) : (
                    passes.map((pass, index) => (
                        <div key={index} className="bg-white shadow-md rounded-2xl p-5 mt-4">
                            <div className="flex items-center justify-between w-full max-w-lg">
                                <div className="flex items-center gap-4 w-full">
                                    <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0">
                                        <Image
                                            src="/images/profileiconblack.svg"
                                            alt="User Profile"
                                            width={50}
                                            height={50}
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        {pass && (
                                            <>
                                                <h2 className="font-semibold">{dummyData[index].name}</h2>
                                                <p className="text-gray-500">{pass.reason}</p>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="text-right w-full">
                                    {pass && (
                                        <>
                                            <p className="text-sm font-medium">{new Date(pass.createdAt).toLocaleString()}</p>
                                            <p className="text-gray-600">{dummyData[index].roomNo}</p>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="w-full border-t border-gray-300 my-4"></div>

                            <div className="flex gap-4 w-full justify-center">
                                <button className="flex items-center gap-2 px-5 py-2 bg-red-500 text-white rounded-full shadow-md hover:bg-red-600 w-1/2 justify-center" onClick={() => handleAction(pass.id, pass.studentId, 'rejected')}>
                                    <XCircle size={18} /> Deny
                                </button>
                                <button className="flex items-center gap-2 px-5 py-2 bg-green-500 text-white rounded-full shadow-md hover:bg-green-600 w-1/2 justify-center" onClick={() => handleAction(pass.id, pass.studentId, "approved")}>
                                    <CheckCircle size={18} /> Approve
                                </button>
                            </div>
                        </div>
                    ))
                )}
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
        )
    }
    return (
        <div className="p-6 flex justify-center items-center min-h-screen">
            <div className="text-center">
                <h2 className="text-2xl font-semibold mb-4">Access Denied</h2>
                <p className="text-gray-600">You do not have the necessary permissions to view this page.</p>
                <button
                    onClick={() => router.push('/')}
                    className="bg-blue-500 text-white px-6 py-2 my-6 rounded hover:bg-blue-600 transition w-full sm:w-auto"
                >
                    Go Back Home Page
                </button>
            </div>
        </div>
    )
}