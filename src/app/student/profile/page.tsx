'use client'
import Loader from "@/components/Loader";
import axios from "axios";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

interface StudentInfo {
    name: string;
    email: string;
    fathersName: string;
    mothersName: string;
    course: string;
    branch: string;
    year: string;
    permanentAddress: string;
    localGaurdiansName: string;
    localGaurdiansAddress: string;
    personalPhoneNumber: string;
    fathersPhoneNumber: string;
    mothersPhoneNumber: string;
    localGaurdianPhoneNumber: string;
    allotedRoomNo: string;
    hostel: string;
    dateOfJoining: string;
}

export default function ProfilePage() {
    const { data: session, status } = useSession()
    const studentId = (session?.user as { id: number })?.id;
    const [student, setStudent] = useState<StudentInfo | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        async function getData() {
            if (studentId) {
                try {
                    setIsLoading(true)
                    const res = await axios.get(`/api/student?studentId=${studentId}`)
                    setStudent(res.data)
                } catch (error) {
                    console.error('Error fetching student data:', error)
                } finally {
                    setIsLoading(false)
                }
            }
        }

        getData()
    }, [studentId])

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
                {student && (
                    <>
                        <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
                            <Image
                                src="/favicon.svg"
                                alt="Profile Picture"
                                className="w-32 h-32 rounded-full border"
                                width={150}
                                height={150}
                            />
                            <div className="text-center md:text-left">
                                <h2 className="text-2xl font-bold">{student.name}</h2>
                                <p className="text-gray-600">{student.email}</p>
                            </div>
                        </div>
                        <div className="mt-6">
                            <h3 className="text-xl font-semibold">Student Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                                <p><strong>Father's Name:</strong> {student.fathersName}</p>
                                <p><strong>Mother's Name:</strong> {student.mothersName}</p>
                                <p><strong>Course:</strong> {student.course}</p>
                                <p><strong>Branch:</strong> {student.branch}</p>
                                <p><strong>Year:</strong> {student.year}</p>
                                <p><strong>Permanent Address:</strong> {student.permanentAddress}</p>
                                <p><strong>Local Guardian's Name:</strong> {student.localGaurdiansName}</p>
                                <p><strong>Local Guardian's Address:</strong> {student.localGaurdiansAddress}</p>
                                <p><strong>Phone (Personal):</strong> {student.personalPhoneNumber}</p>
                                <p><strong>Phone (Father):</strong> {student.fathersPhoneNumber}</p>
                                <p><strong>Phone (Mother):</strong> {student.mothersPhoneNumber}</p>
                                <p><strong>Phone (Local Guardian):</strong> {student.localGaurdianPhoneNumber}</p>
                                <p><strong>Allotted Room No:</strong> {student.allotedRoomNo}</p>
                                <p><strong>Hostel:</strong> {student.hostel}</p>
                                <p><strong>Date of Joining:</strong> {student.dateOfJoining}</p>
                            </div>
                        </div>
                    </>
                )}
            </div>
            <nav className="fixed bottom-0 w-full bg-[#1D4977] text-white p-2 flex justify-around items-center">
                <Link href={'/student'} className="flex flex-col items-center">
                    <Image src="/images/homeicon.svg" alt='homeicon' width={20} height={20} />
                    <span className="text-xs">Home</span>
                </Link>
                <Link href={'/student/genratepass'} className="flex flex-col items-center">
                    <Image src="/images/passicon.svg" alt='passicon' width={25} height={25} />
                    <span className="text-xs mt-1">Passes</span>
                </Link>
                <Link href={'/calendar'} className="flex flex-col items-center">
                    <Image src="/images/calicon.svg" alt='calicon' width={20} height={20} />
                    <span className="text-xs mt-1">Calendar</span>
                </Link>
                <Link href={'/student/profile'} className="flex flex-col items-center">
                    <Image src="/images/profileicon.svg" alt='profileicon' width={20} height={20} />
                    <span className="text-xs mt-1">Profile</span>
                </Link>
            </nav>
        </div>
    );
};


