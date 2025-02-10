'use client'
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CalendarPage() {
    const router = useRouter();
    const holidays = [
        { reason: "Weekend Off", date: "February 15, 2025", day: "Saturday" },
        { reason: "Maha Shiv Ratri", date: "February 26, 2025", day: "Wednesday" },
        { reason: "Weekend Off", date: "March 1, 2025", day: "Saturday" },
        { reason: "Weekend Off", date: "March 15, 2025", day: "Saturday" },
        { reason: "Holi", date: "March 13-16, 2025", day: "Thursday-Sunday" },
        { reason: "Weekend Off", date: "April 5, 2025", day: "Saturday" },
        { reason: "Tech Sangram", date: "April 10-11, 2025", day: "Thursday-Friday" },
        { reason: "Utkarsh", date: "April 12-13, 2025", day: "Saturday-Sunday" },
        { reason: "Weekend Off", date: "April 19, 2025", day: "Saturday" },
        { reason: "Weekend Off", date: "May 3, 2025", day: "Saturday" },
        { reason: "Weekend Off", date: "May 17, 2025", day: "Saturday" }
    ];
    
    return (
        <div>
            <div className="bg-[#1D4977] p-2 flex justify-between">
                <h1 className="text-2xl font-bold ml-4 md:text-left text-white">Upcoming Holidays</h1>
                <Image src='/images/closeicon.svg' alt="close" width={30} height={30} className="mr-4 cursor-pointer" onClick={() => router.push('/')} />
            </div>
            {holidays.map((holiday, index) => (
                <div key={index} className="bg-white p-4 shadow-lg rounded-lg m-4 flex items-center">
                    <div className="mr-4">
                        <Image src='/images/partyicon.svg' alt="party icon" width={40} height={40} />
                    </div>
                    <div className="flex-grow">
                        <div className="text-lg font-semibold text-gray-800">
                            {holiday.reason}
                        </div>
                        <div className="text-sm text-gray-600">
                            {holiday.date}
                        </div>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                        {holiday.day}
                    </div>
                </div>
            ))}
            <nav className="fixed bottom-0 w-full bg-[#1D4977] text-white p-2 flex justify-around items-center">
                <Link href={'/'} className="flex flex-col items-center">
                    <Image src="/images/homeicon.svg" alt='homeicon' width={20} height={20} />
                    <span className="text-xs">Home</span>
                </Link>
                <Link href={'/'} className="flex flex-col items-center">
                    <Image src="/images/passicon.svg" alt='passicon' width={25} height={25} />
                    <span className="text-xs mt-1">Passes</span>
                </Link>
                <Link href={'/calendar'} className="flex flex-col items-center">
                    <Image src="/images/calicon.svg" alt='calicon' width={20} height={20} />
                    <span className="text-xs mt-1">Calendar</span>
                </Link>
                <Link href={'/'} className="flex flex-col items-center">
                    <Image src="/images/profileicon.svg" alt='profileicon' width={20} height={20} />
                    <span className="text-xs mt-1">Profile</span>
                </Link>
            </nav>
        </div>
    );
};

