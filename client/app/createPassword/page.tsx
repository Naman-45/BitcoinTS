"use client"
import { Password } from "@/components/ui/createPassword";
import { Toaster } from "react-hot-toast";

export default function createPassword() {
    return (
         <div className="flex min-h-screen flex-col items-center justify-start p-36 bg-[#0E0F14] gap-8">
          <div className="flex flex-col space-between h-min-screen place-items-center">
            &nbsp;<div className="text-white text-5xl items-center">Create a Password</div><br />
            <div className="text-[#969FAF] text-lg">&nbsp; It should be at least 8 characters. <br />You&apos;ll need this to unlock BitcoinTS.</div>
          </div> 
            <Password />
            <Toaster />
        </div>
    )
}