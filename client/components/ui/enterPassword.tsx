import { Bitcoin } from "lucide-react"
import { Button } from "./button"
import { Input } from "./input"
import {  useRecoilState } from "recoil";
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { userPassword } from "@/recoil/password";
import { deriveKey } from "./createPassword";

const notify1 = () => toast('Login Successful!');
const notify2 = () => toast('Invalid Password, try again.');
const notify3 = () => toast('No account found, import or create a wallet!');

export const VerifyPassword = () => {

    const [password, setPassword] = useRecoilState(userPassword);
    const router = useRouter();

    const verifyPassword = async (inputPassword: string): Promise<boolean> => {
      const storedData = localStorage.getItem("encryptedPassword");
      if (storedData) {
        try {
          const { encryptedData, iv, salt } = JSON.parse(storedData);
          const key = await deriveKey(inputPassword, new Uint8Array(salt));
          const decryptedData = await window.crypto.subtle.decrypt(
            {
              name: "AES-GCM",
              iv: new Uint8Array(iv),
            },
            key,
            new Uint8Array(encryptedData)
          );
          
          const decryptedText = new TextDecoder().decode(decryptedData);
    
          return decryptedText === inputPassword;
        } catch (error) {
          console.error("Password verification failed:", error);
          return false;
        }
      } else {
        console.log("No stored password found");
        notify3();
        await new Promise((res) => setTimeout(res, 500));
        router.push('/');
        localStorage.setItem('hasAccount', JSON.stringify(false));
      }
      return false;
    };

    const retrievePassword = async () => {
      const isPasswordCorrect = await verifyPassword(password);
      if (isPasswordCorrect) {
        notify1();
        localStorage.setItem("password", password);
        await new Promise(res => setTimeout(res, 500));
        router.push('/wallet')
      } else {
        notify2();
      }
    };

    return (
        <div className="min-h-screen w-full flex flex-col justify-start items-center bg-[#0E0F14]">
            <h1 className="text-9xl text-red-500 flex font-nerko font-normal italic mb-20 mt-40"><Bitcoin size={110} strokeWidth={4} color="rgb(239, 68, 68)"/>BitcoinTS</h1>
            <div className="w-5/6 h-max flex flex-col items-center place-content-center justify-cnter gap-2">
            <Input placeholder="Enter Password" className="cursor-text bg-[#202127] text-lg font-medium h-14 w-3/6 border-0" 
             onChange={(e) => {
              setPassword(e.target.value)
              }}/>
            <p className="text-slate-500 text-base ">Enter password of your Wallet.</p>
            <Button className="text-2xl px-8 h-12 text-slate-900 bg-white hover:bg-slate-400 mt-4 w-1/5" onClick={retrievePassword}>Login</Button>
            </div>
        </div>
    )
}   