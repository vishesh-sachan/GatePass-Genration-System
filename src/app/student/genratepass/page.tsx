"use client";

import axios from "axios";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default function GenratePass() {
    const { data: session } = useSession();
    const studentId = (session?.user as { id: number })?.id;
    const [reason, setReason] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [date, setDate] = useState("");
    const [dateError, setDateError] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();
    const socketUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL || '';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const currentDate = new Date();
        const selectedDate = new Date(date);
        const startDateTime = `${date} ${startTime}:00`;
        const endDateTime = `${date} ${endTime}:00`;

        if (
            selectedDate.toDateString() === currentDate.toDateString() ||
            selectedDate.toDateString() ===
            new Date(currentDate.setDate(currentDate.getDate() + 1)).toDateString()
        ) {
            setDateError("");
        } else {
            setDateError("Date must be today or the next day");
            setLoading(false);
            return;
        }

        try {
            const res = await axios.post("/api/pass", {
                studentId,
                reason,
                startTime: startDateTime,
                endTime: endDateTime,
            });

            if (res.status === 201) {
                const newPass = res.data;
                const socket = new WebSocket(socketUrl);

                socket.onopen = () => {
                    socket.send(
                        JSON.stringify({
                            isStudent: true,
                            passId: newPass.id,
                            studentId,
                        })
                    );
                };
                socket.onerror = (error) => {
                    console.error("WebSocket connection error:", error);
                    setError("Error in WebSocket connection");
                };
                alert("Pass applied successfully.");
                router.push('/student');
            }
        } catch (err) {
            console.error("Error creating pass request:", err);
            setError("An error occurred while creating the pass request. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="bg-[#1D4977] p-2 flex justify-between">
                <h1 className="text-2xl font-bold ml-4 md:text-left text-white">Apply for Pass</h1>
                <Image src='/images/closeicon.svg' alt="close" width={30} height={30} className="mr-4 cursor-pointer" onClick={() => router.push('/student')} />
            </div>
            <div className="p-4 md:p-8">
                <div className="max-w-4xl mx-auto bg-white rounded-lg overflow-hidden">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-gray-700">Reason:</label>
                            <input
                                type="text"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                maxLength={100}
                                required
                                className="mt-1 p-2 w-full border rounded"
                            />
                            <p className="text-gray-500 text-sm mt-1">{reason.length}/100</p>
                        </div>
                        <div>
                            <label className="block text-gray-700">Start Time:</label>
                            <input
                                type="time"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                required
                                className="mt-1 p-2 w-full border rounded"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700">End Time:</label>
                            <input
                                type="time"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                required
                                className="mt-1 p-2 w-full border rounded"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700">Date:</label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                required
                                className="mt-1 p-2 w-full border rounded"
                            />
                            {dateError && <p className="text-red-500 mt-1">{dateError}</p>}
                        </div>
                        <div className="bg-[#1D4977] text-white flex justify-center">
                            <button
                                type="submit"
                                disabled={loading}
                                className="p-2 rounded w-full font-bold tracking-widest"
                            >
                                {loading ? "Submitting..." : "Apply Now"}
                            </button>
                        <div>
                        <Image  src='/images/nexticon.svg' alt="close" width={25} height={25} className="m-2" />
                        </div>


                        </div>
                    </form>
                </div>
            </div>
            <nav className="fixed bottom-0 w-full bg-[#1D4977] text-white p-2 flex justify-around items-center">
            
                <Link href={'/student'} className="flex flex-col items-center">
                <Image src="/images/homeicon.svg" alt='homeicon' width={20} height={20} />
                <span className="text-xs">Home</span>
                </Link>
                <Link href={'/student/genratepass'} className="flex flex-col items-center">
                <Image src="/images/passicon.svg" alt='homeicon' width={25} height={25} />
                <span className="text-xs mt-1">Passes</span>
                </Link>
                <Link href={'/student'} className="flex flex-col items-center">
                <Image src="/images/calicon.svg" alt='homeicon' width={20} height={20} />
                <span className="text-xs mt-1">Calendar</span>
                </Link>
                <Link href={'/student'} className="flex flex-col items-center">
                <Image src="/images/profileicon.svg" alt='homeicon' width={20} height={20} />
                <span className="text-xs mt-1">Profile</span>
                </Link>
          </nav>
        </div>
    );
}
