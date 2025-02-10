'use client'
import { useState, useEffect } from "react";
import QRCode, { QRCodeToDataURLOptions } from "qrcode";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import axios from "axios";

interface Pass {
    id: number;
    studentId: number;
    reason: string;
    status: "pending" | "approved" | "rejected" | "closed";
}

export default function(){
    const { data: session, status: sessionStatus } = useSession();
    const studentId = (session?.user as { id: number })?.id;
    const router = useRouter();
    const [pass, setPass] = useState<Pass | null>(null);
    const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
    const [haveApprovedPass , setHaveApprovedPass] = useState(0);
    const [loading, setLoading] = useState(true);

    // const qrCodeUrl = "/images/qr.png";

    const generateQrCode = async () => {
        if (!pass) return;
        const qrData = {
            id: pass.id.toString(),
            studentId: studentId.toString(),
            reason: pass.reason,
        };
        try {
            const options: QRCodeToDataURLOptions = {
                errorCorrectionLevel: "high",
            };
            const url = await QRCode.toDataURL(JSON.stringify(qrData), options);
            setQrCodeUrl(url);
        } catch (err) {
            console.error("Failed to generate QR code", err);
        }
    };

    useEffect(() => {
        const getActivePass = async () => {
            if (!studentId) return;

            setLoading(true);
            try {
                const res = await axios.get(`/api/pass?studentId=${studentId}`);
                const passes: Pass[] = Array.isArray(res.data) ? res.data : [];

                const activePass = passes.find(
                    (p) => p.status === "approved"
                );

                if (activePass) {
                    setPass(activePass);
                    setHaveApprovedPass(1)
                }
            } catch (err) {
                console.error("Error fetching active passes:", err);
            } finally {
                setLoading(false);
            }
        };

        getActivePass();
    }, [studentId]);

    useEffect(() => {
        if (pass?.status === "approved") {
            generateQrCode();
        }
    }, [pass]);


    return(
        <div className="h-screen bg-[#3180ED] overflow-hidden">
            <div className="bg-[#1D4977] p-2 flex justify-between">
                <h1 className="text-2xl font-bold ml-4 md:text-left text-white">E-Pass Details</h1>
                <Image src='/images/closeicon.svg' alt="close" width={30} height={30} className="mr-4 cursor-pointer" onClick={() => router.push('/student')} />
            </div>
            <div className="flex justify-center font-semibold tracking-wide text-white p-10 text-center  text-3xl md:text-4xl">
                My Checkout QR
            </div>
            {loading ? (
                <div className="flex justify-center mt-4">
                    <p className="text-white">Loading...</p>
                </div>
            ) : (haveApprovedPass && qrCodeUrl)?(
                <div>
                    <div className="flex justify-center mt-4">
                        <Image
                            src={qrCodeUrl}
                            alt="Generated QR Code"
                            width={200}
                            height={200}
                            className="border p-2 bg-white rounded-xl"
                        />
                    </div>

                    <div className="flex justify-center mt-4">
                        <div className="flex justify-center font-semibold text-white p-10 text-center text-xl md:text-2xl">
                            Use the QR code to have swifty checkout.
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
                            <Link href={'/calendar'} className="flex flex-col items-center">
                            <Image src="/images/calicon.svg" alt='homeicon' width={20} height={20} />
                            <span className="text-xs mt-1">Calendar</span>
                            </Link>
                            <Link href={'/student/profile'} className="flex flex-col items-center">
                            <Image src="/images/profileicon.svg" alt='homeicon' width={20} height={20} />
                            <span className="text-xs mt-1">Profile</span>
                            </Link>
                        </nav>
                    </div>
                </div>
            ):(
                <div className="flex flex-col items-center mt-4">
                    <p className="text-white text-center">You don't have an approved pass.</p>
                    <p className="text-white text-center mt-2">If you have already applied for a pass, please contact your warden to get it approved.</p>
                </div>
            )}
        </div>
    )
}