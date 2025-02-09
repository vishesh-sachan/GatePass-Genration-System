'use client'
import Image from 'next/image';
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import axios from 'axios';
import Loader from '@/components/Loader';
import { Html5QrcodeScanner } from 'html5-qrcode'
import bcrypt from 'bcryptjs';



interface FacultyInfo {
    name: string;
    personalPhoneNumber: string;
}

type ScanResult = {
    decodedText: {
        id: string,
        studentId: string,
        reason: string
    }
    result: any
}

interface Pass {
    id: number
    studentId: number
    reason: string
    encryptionKey: string
    status: 'pending' | 'approved' | 'rejected' | 'closed'
    startTime: string
    endTime: string
    actualstartTime: string | null
    actualendTime: string | null
    createdAt: string
}

export default function Guard() {
    const router = useRouter();
    const [scanning, setScanning] = useState(false)
    const [mode, setMode] = useState<'entry' | 'exit' | null>(null)
    const [scannedData, setScannedData] = useState<ScanResult | null>(null)
    const [updating, setUpdating] = useState(false)
    const { data: session, status } = useSession();
    const role = (session?.user as { role: string })?.role;
    const facultyId = (session?.user as { id: number })?.id;
    const [facultyInfo, setFacultyInfo] = useState<FacultyInfo | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const startScanning = (scanMode: 'entry' | 'exit') => {
        setMode(scanMode)
        setScanning(true)
    }

    useEffect(() => {
        async function getData() {
            if (!facultyId) return;

            try {
                setIsLoading(true);
                setError(null); // Reset error state

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
    }, [facultyId]);

    useEffect(() => {
        let scanner: Html5QrcodeScanner | null = null;

        if (scanning) {
            scanner = new Html5QrcodeScanner(
                'reader',
                {
                    qrbox: {
                        width: 450,
                        height: 450,
                    },
                    fps: 5,
                },
                false
            );

            scanner.render(
                (decodedText: string, result: any) => {
                    const parsedText = JSON.parse(decodedText);
                    setScannedData({ decodedText: parsedText, result });
                    setScanning(false);
                    scanner?.clear(); // Ensure scanner is cleared
                },
                (errorMessage) => {
                    // console.warn("Scan error", errorMessage);
                }
            );
        }

        return () => {
            scanner?.clear(); // Cleanup the scanner when scanning stops
        };
    }, [scanning]);

    useEffect(() => {
        const processScan = async () => {
            if (scannedData) {
                try {
                    setUpdating(true)
                    const passResponse = await axios.get(`/api/passwithid?id=${scannedData.decodedText.id}`)

                    if (passResponse.data === null) {
                        alert('No pass exists. This is a fake pass.')
                        setMode(null)
                        setUpdating(false)
                        return
                    }

                    const pass: Pass = passResponse.data
                    // console.log(pass)
                    const saltRounds = 10;
                    const value = `${scannedData.decodedText.studentId}${scannedData.decodedText.reason}`;
                    // const encryptionKey = await bcrypt.hash(value, saltRounds);
                    const isLegit = await bcrypt.compare(value, pass.encryptionKey)

                    if (pass.status != "approved") {
                        alert('Pass is Not Approved. Fake Pass')
                        setMode(null)
                        setUpdating(false)
                        return

                    }

                    if (!isLegit) {
                        alert('Fake Pass !!')
                        setMode(null)
                        setUpdating(false)
                        return

                    }

                    if (mode === 'exit') {
                        if (pass.actualstartTime != null) {
                            alert('Student is already out with this pass.')
                            setMode(null)
                            setUpdating(false)
                            return
                        }
                    } else if (mode === 'entry') {
                        if (pass.actualendTime != null) {
                            alert('Student has already returned with this pass.')
                            setMode(null)
                            setUpdating(false)
                            return
                        }
                    }

                    const endpoint = '/api/entryexit'

                    const response = await axios.put(endpoint, {
                        passId: scannedData.decodedText.id,
                        mode
                    })
                    // console.log(response)
                    if (response.status === 200) {
                        if (mode === "exit") {
                            const { actualstartTime } = response.data.data;
                            alert(`Student Exited college campus at ${new Date(actualstartTime).toLocaleString()}`)
                        } else {
                            const { actualendTime } = response.data.data;
                            alert(`Student Entered college campus at ${new Date(actualendTime).toLocaleString()}`)
                        }

                    } else if (response.status === 500) {
                        alert('Entry failed! Try Again')
                    }

                    // alert('Success!')
                    setMode(null)
                } catch (error) {
                    alert('Error processing scan')
                    console.error(error)
                } finally {
                    setUpdating(false)
                }
            }
        }

        processScan()
    }, [scannedData])


    if (status === "loading" || isLoading) {
        return (
            <div className='flex justify-center items-center min-h-screen'>
                <Loader />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col justify-center items-center min-h-screen text-red-600">
                <p>{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-4 px-4 py-2 bg-red-500 text-white rounded-md"
                >
                    Retry
                </button>
            </div>
        );
    }

    if (!session) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
                <p className="text-xl md:text-2xl mb-8 text-red-500 text-center">You are not signed in. Please sign in to access this page.</p>
                <div className="space-y-4 md:space-x-4">
                    <button
                        onClick={() => router.push('/api/auth/signin')}
                        className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition w-full md:w-auto"
                    >
                        SignIn
                    </button>
                </div>
            </div>
        );
    }

    if (!role || (role && role == "warden")) {
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

    if (scanning) {
        return (
            <div className="container mx-auto p-4">
                <div id="reader"></div>
                <button
                    onClick={() => {
                        setScanning(false); 
                        const readerElement = document.getElementById("reader");
                        if (readerElement) {
                            readerElement.innerHTML = "";
                        }
                    }}
                    className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
                >
                    Cancel
                </button>


            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-100">

            {facultyInfo && (<div key={facultyInfo.name} className="bg-gray-200 text-white p-6 relative mx-2 rounded-b-lg" style={{ backgroundImage: `url('/images/bg.jpeg')`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                <div className="absolute inset-0 bg-black opacity-50 rounded-b-lg"></div>
                <div className='relative flex space-x-4'>
                    <div>
                        <Image src='/favicon.svg' width={50} height={50} className="rounded-full" alt="Profile" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-semibold">Welcome,</h1>
                        <h2 className="p-1 text-lg font-bold">{facultyInfo.name}</h2>
                    </div>
                </div>
                <div className='relative mt-4'>
                    <p className="text-sm">Gate No.: 01</p>
                    <p className="text-sm">Mobile No.: {facultyInfo.personalPhoneNumber}</p>
                </div>
            </div>)}
            {updating ? (
                
                <div className="flex flex-col items-center justify-center min-h-screen">
                    <div className="loader mb-2"></div>
                    <div>Updating...</div>
                    <Loader />
                </div>

                
            ) : (
                <div>

                    <div className='flex'>
                        <div className='rounded-lg bg-[#2EC4B6] shadow-md p-4 m-2 w-1/2' onClick={() => startScanning('exit')}>
                            <div className='flex justify-center'>
                                <Image src='/images/scan.svg' width={50} height={50} alt="tick" />
                            </div>
                            <div className='text-center'>
                                Scan Checkout
                            </div>
                        </div>
                        <div className='rounded-lg bg-[#F3C98B] shadow-md p-4 m-2 w-1/2' onClick={() => startScanning('entry')}>
                            <div className='flex justify-center'>
                                <Image src='/images/scan.svg' width={50} height={50} alt="cross" />
                            </div>
                            <div className='text-center'>
                                Scan Check-In
                            </div>
                        </div>
                    </div>

                    <div className='flex'>
                        <div className='rounded-lg shadow-md p-4 m-2 w-1/2'>
                            <div className='flex justify-center'>
                                <Image src='/images/checkout.svg' width={50} height={50} alt="tick" />
                            </div>
                            <div className='text-center'>
                                Today's Checkout
                            </div>
                        </div>
                        <div className='rounded-lg shadow-md p-4 m-2 w-1/2'>
                            <div className='flex justify-center'>
                                <Image src='/images/checkin.svg' width={50} height={50} alt="cross" />
                            </div>
                            <div className='text-center'>
                                Today's Check-In
                            </div>
                        </div>
                    </div>
                </div>)}
        </div>
    )

}