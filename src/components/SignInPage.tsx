import { signIn } from "next-auth/react";
import Image from "next/image";
export default function SignInPage(){
    return(
        <div className="flex flex-col items-center justify-center h-screen bg-white px-6">
        <div className="mb-20">
            <Image
            src="/images/HUlogo.svg"
            alt="Haridwar University Logo"
            width={250}
            height={80}
            className="mx-auto"
            />
        </div>
        
        <h2 className="text-2xl font-bold text-center text-[#1D4977] mb-5">
            E-Gate Pass System
        </h2>

        <div className="flex items-center justify-center py-2 px-5 mt-4 border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100" onClick={() => signIn("google")}>
            <Image
                src="/images/google-icon.svg"
                alt="Google Logo"
                width={40}
                height={40}
                className="mr-2"
            />
            <span className="text-2xl text-gray-700">Sign in with Google</span>
        </div>

        <div className="text-xl m-5 p-5 text-[#1D4977] text-center">
            <span className="font-bold">Note:</span> You Can only Login with Google account provided by the University
        </div>
        
    
        <div className="mt-10 bottom-0">
            <Image 
                src="/images/second.svg"
                alt="logo"
                width={250}
                height={80}
                className="mx-auto"
            />
        </div>
    </div>
    )
}