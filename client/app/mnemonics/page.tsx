"use client"
import { Button } from "@/components/ui/button";
import { SecretPhrase } from "@/components/ui/mnemonics";
import { Toaster } from "react-hot-toast";
import {useRouter} from 'next/navigation';

export default function Mnemonics() {

   const router = useRouter();

   return (
    <div className="flex min-h-screen flex-col items-center justify-start p-24 bg-[#0E0F14] gap-8">
        <div className="flex flex-col space-between h-min-screen gap-2 place-items-center">
            <div className="text-white text-4xl items-center">Secret Recovery Phrase</div>
            <div className="text-[#969FAF] text-lg">Save these words in a safe place.</div>
        </div>
        <SecretPhrase />
        <Button className="text-2xl px-8 h-12 text-slate-900 bg-white hover:bg-slate-400" onClick={() => {
            router.push('/createPassword');
        }}>Next</Button>
        <Toaster position="bottom-center" />
    </div>
   )
}


