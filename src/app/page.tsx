'use client'
import HomeLoadingPage from "@/components/HomeLoadingPage";
import SignInPage from "@/components/SignInPage";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
    const { data: session, status: sessionStatus } = useSession();
    const role = (session?.user as { role: string })?.role;
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (sessionStatus !== 'loading') {
            setIsLoading(false);
        }
    }, [sessionStatus]);

    useEffect(() => {
        if (!session) return;

        if (role === "warden" || role === "admin") {
            router.push('/faculty');
        } else if (!role) {
            router.push('/student');
        } else {
            router.push('/guard');
        }
    }, [role, session, router]);

    if (sessionStatus === 'loading' || isLoading) {
        return <HomeLoadingPage />;
    }

    if (!session) {
        return <SignInPage />;
    }

    return null;
}
