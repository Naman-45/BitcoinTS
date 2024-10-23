"use client"
import { Cover } from "./cover"
import { Button } from "@/components/ui/button"
import { useRouter } from 'next/navigation'
import { generateMnemonic } from "bip39";
import { useRecoilValue, useSetRecoilState } from "recoil"
import { mnemonicsRC } from "@/recoil/mnemonics"

export const Welcome = () => { 
  const MN = useRecoilValue(mnemonicsRC);
  const setMN = useSetRecoilState(mnemonicsRC);
  const router = useRouter()

    return (
    <div className="flex flex-col items-center min-h-screen mt-20">
        <div>
          <h1 className="text-4xl md:text-4xl lg:text-9xl font-semibold max-w-7xl mx-auto text-center mt-6 relative z-20 py-6 bg-clip-text text-transparent bg-gradient-to-b from-neutral-800 via-neutral-700 to-neutral-700 dark:from-neutral-800 dark:via-white dark:to-white">
               <span>Welcome to</span><br /><p className="mt-4"><Cover>BitcoinTS</Cover></p>
          </h1>
        </div>
        <div className="mt-10">
           <Button className="text-3xl px-8 h-14" onClick={function(){
            const mn = generateMnemonic();
            setMN(() => [
              ...mn.split(' ')
            ]);
            console.log(MN);
            router.push('/mnemonics')
           }}>Create a new wallet</Button> 
        </div>
        <div className="mt-4">
           <Button className="text-3xl px-8 h-14">Import wallet</Button> 
        </div>
    </div>  
    )
    
}