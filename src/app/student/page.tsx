'use client'
import Image from 'next/image';
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import axios from 'axios';

import Link from 'next/link';
import Loader from '@/components/Loader';

interface StudentInfo {
  name: string;
  email: string;
  personalPhoneNumber: string;
  allotedRoomNo: string;
  hostel: string;
  dateOfJoining: string;
}

interface Pass {
  id: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'closed';
  createdAt: string;
}

export default function Student() {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const studentId = session?.user ? (session.user as { id: number }).id : null;
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);
  const [passes, setPasses] = useState<Pass[]>([]);
  const [isLoadingMain, setIsLoadingMain] = useState(false);
  const [activePass, setActivePass] = useState(0);
  const socketUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL || '';

  useEffect(() => {
    async function getData() {
      if (!studentId) return;

      setIsLoadingMain(true);
      try {
        const res = await axios.get(`/api/student?studentId=${studentId}`);
        setStudentInfo(res.data);
      } catch (error) {
        console.error('Error fetching student data:', error);
      } finally {
        setIsLoadingMain(false);
      }
    }

    getData();
  }, [studentId]);

  useEffect(() => {
    async function fetchPasses() {
      if (!studentId) return;

      try {
        const response = await fetch(`/api/pass?studentId=${studentId}`);
        const data: Pass[] = await response.json();
        const sortedPasses = data.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        if (sortedPasses.length > 0) {
          if (sortedPasses[0].status === 'approved') {
            setActivePass(1);
          } else if (sortedPasses[0].status === 'pending') {
            setActivePass(2);
            setPasses(sortedPasses);
            const socket = new WebSocket(socketUrl);

            socket.onmessage = (event) => {
              const data = JSON.parse(event.data);
              if (!data.isStudent &&
                data.studentId === studentId &&
                data.passId === sortedPasses[0].id) {
                alert(`Your pass has been ${data.status}`);
                window.location.reload();
              }
            };

            socket.onerror = (error) => {
              console.log("WebSocket connection error:", error);
            };

            return () => {
              socket.close();
            };
          }
        }

        setPasses(sortedPasses);
        
      } catch (error) {
        console.error('Failed to fetch passes:', error);
      }
    }

    fetchPasses();
  }, [studentId]);


  if (sessionStatus === "loading") {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <Loader />
      </div>
    );
  }


  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
        <p className="text-xl md:text-2xl mb-8 text-red-500 text-center">
          You are not signed in. Please sign in to access this page.
        </p>
        <button
          onClick={() => router.push('/')}
          className="bg-[#1D4977] text-white px-6 py-2 rounded hover:bg-blue-600 transition"
        >
          Sign In
        </button>
      </div>
    );
  }


  if (isLoadingMain) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {studentInfo && (
        <div
          className="bg-[#1D4977] text-white p-6 relative mx-2 rounded-b-lg"
          style={{
            backgroundImage: `url('/images/bg.jpeg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-black opacity-50 rounded-b-lg"></div>
          <div className='relative flex space-x-4'>
            <div>
              <Image src="/favicon.svg" width={50} height={50} className="rounded-full" alt="Profile" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">Welcome,</h1>
              <h2 className="p-1 text-lg font-bold">{studentInfo.name}</h2>
            </div>
          </div>
          <div className='relative mt-4'>
            <p className="text-sm">Email: {studentInfo.email}</p>
            <p className="text-sm">Room No.: {studentInfo.allotedRoomNo}</p>
            <p className="text-sm">Mobile No.: {studentInfo.personalPhoneNumber}</p>
          </div>
        </div>
      )}


{passes.length > 0 && (
        <>
          {activePass === 0 && (
            <div className="m-2 bg-[#5BBC7A] p-4 rounded-lg shadow-md" onClick={() => router.push('/student/genratepass')}>
              <div className='m-5 flex justify-center'>
                <Image src='/images/genrateicon.svg' alt='genrate svg' width={60} height={60} />
              </div>
              <div>
                <p className="text-white tracking-widest font-semibold mt-4 flex justify-center text-center">Generate your outpass</p>
              </div>
            </div>
          )}
          {activePass === 1 && (
            <div className="m-2 bg-[#3180ED] p-4 rounded-lg shadow-md flex" onClick={() => router.push('/student/epass')}>
              <div>
                <div className='m-2 flex'>
                  <Image src='/images/approvedicon.svg' alt='approved svg' width={40} height={40} />
                </div>
                <div>
                  <p className="text-white tracking-widest font-semibold mt-4">{passes[0].reason}</p>
                  <p className="text-white tracking-widest font-semibold mt-1"><strong>Checkout: </strong>{new Date(passes[0].createdAt).toLocaleString()}</p>
                </div>
              </div>
              <div className='m-6'>
                <Image src='/images/QRicon.svg' alt='QR svg' width={60} height={60} />
              </div>
            </div>
          )}
          {activePass === 2 && (
            <div className="m-2 bg-[#E5C662] p-4 rounded-lg shadow-md flex justify-between">
              <div>
                <h2 className="font-semibold text-lg">{passes[0].reason}</h2>
                <p className="text-gray-700 text-sm ml-1">{new Date(passes[0].createdAt).toLocaleString()}</p>
                <p className="text-gray-900 font-semibold mt-4">Status: {passes[0].status}</p>
              </div>
              <div className='m-5'>
                <Image src='/images/pending.svg' alt='pending svg' width={60} height={60} />
              </div>
            </div>
          )}
        </>
      )}

      <div className='m-2'>
        <h3 className="mt-6 text-lg font-bold">Recent Passes</h3>
        <div className="mt-2 space-y-3">
          {passes && passes.map((pass) => (
            <div key={pass.id} className="bg-white p-3 shadow-md rounded-md">
              <p className="font-medium text-lg">{pass.reason}</p>
              <p className="text-gray-600 text-sm m-1">{new Date(pass.createdAt).toLocaleString()}</p>
              <p className="font-medium">Status: {pass.status}</p>
            </div>
          ))}
        </div>
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
}
