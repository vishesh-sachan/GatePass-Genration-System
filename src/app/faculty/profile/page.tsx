'use client'
import Loader from "@/components/Loader";
import axios from "axios";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

interface FacultyInfoCard {
    id: number;
    name: string;
    email: string;
    fathersName: string;
    mothersName: string;
    permanentAddress: string;
    personalPhoneNumber: string;
    fathersPhoneNumber: string;
    mothersPhoneNumber: string;
    allotedRoomNo: string;
    allotedHostel: string;
    dateOfJoining: string;
    role: string;
}

export default function ProfilePage() {
    const { data: session, status } = useSession()
    const facultyId = (session?.user as { id: number })?.id;
    const [faculty, setFaculty] = useState<FacultyInfoCard | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        async function getData() {
            if (facultyId) {
                try {
                    setIsLoading(true)
                    const res = await axios.get(`/api/faculty?facultyId=${facultyId}`)
                    setFaculty(res.data)
                } catch (error) {
                    console.error('Error fetching faculty data:', error)
                } finally {
                    setIsLoading(false)
                }
            }
        }

        getData()
    }, [facultyId])

    if (status === "loading" || isLoading) {
        return <div className='flex justify-center items-center min-h-screen'>
            <Loader />
        </div>
    }
    return (
        <div>
            <div className="bg-[#1D4977] p-2 flex justify-between">
                <h1 className="text-2xl font-bold ml-4 md:text-left text-white">Profile</h1>
                <Image src='/images/closeicon.svg' alt="close" width={30} height={30} className="mr-4 cursor-pointer" onClick={() => router.push('/')} />
            </div>
            <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-lg">
                {faculty && (
                    <>
                        <div className="flex items-center space-x-6">
                            <Image
                                src="/favicon.svg"
                                alt="Profile Picture"
                                className="w-32 h-32 rounded-full border"
                                width={150}
                                height={150}
                            />
                            <div>
                                <h2 className="text-2xl font-bold">{faculty.name}</h2>
                                <p className="text-gray-600">{faculty.email}</p>
                            </div>
                        </div>
                        <div className="mt-6">
                            <h3 className="text-xl font-semibold">Faculty Information</h3>
                            <div className="grid grid-cols-2 gap-4 mt-3">
                                <p><strong>Father's Name:</strong> {faculty.fathersName}</p>
                                <p><strong>Mother's Name:</strong> {faculty.mothersName}</p>
                                <p><strong>Permanent Address:</strong> {faculty.permanentAddress}</p>
                                <p><strong>Phone (Personal):</strong> {faculty.personalPhoneNumber}</p>
                                <p><strong>Phone (Father):</strong> {faculty.fathersPhoneNumber}</p>
                                <p><strong>Phone (Mother):</strong> {faculty.mothersPhoneNumber}</p>
                                <p><strong>Allotted Room No:</strong> {faculty.allotedRoomNo}</p>
                                <p><strong>Hostel:</strong> {faculty.allotedHostel}</p>
                                <p><strong>Date of Joining:</strong> {faculty.dateOfJoining}</p>
                                <p><strong>Role:</strong> {faculty.role}</p>
                            </div>
                        </div>
                    </>
                )}
            </div>
            <nav className="fixed bottom-0 w-full bg-[#1D4977] text-white p-2 flex justify-around items-center">
                <Link href={'/faculty'} className="flex flex-col items-center">
                    <Image src="/images/homeicon.svg" alt='homeicon' width={20} height={20} />
                    <span className="text-xs">Home</span>
                </Link>
                <Link href={'/faculty/passrequests'} className="flex flex-col items-center">
                    <Image src="/images/passicon.svg" alt='passicon' width={25} height={25} />
                    <span className="text-xs mt-1">Passes</span>
                </Link>
                <Link href={'/calendar'} className="flex flex-col items-center">
                    <Image src="/images/calicon.svg" alt='calicon' width={20} height={20} />
                    <span className="text-xs mt-1">Calendar</span>
                </Link>
                <Link href={'/faculty/profile'} className="flex flex-col items-center">
                    <Image src="/images/profileicon.svg" alt='profileicon' width={20} height={20} />
                    <span className="text-xs mt-1">Profile</span>
                </Link>
            </nav>
        </div>
    );
};
