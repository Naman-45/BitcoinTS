"use client"
import { Input } from "./input"
import { Button } from "./button"
import {useRouter} from 'next/navigation';
import React from "react"
import toast from "react-hot-toast";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { userPassword } from "@/recoil/password";
import { mnemonicsRC } from "@/recoil/mnemonics";

const notify1 = () => toast('Password Created succcessfully!');
const notify2 = () => toast('Password does not match, try again!');
const notify3 = () => toast('Password saved successfully');
const notify4 = () => toast('Mnemonics saved successfully!');

// Helper function to convert string to Uint8Array
export const stringToUint8Array = (str: string): Uint8Array => {
  return new TextEncoder().encode(str);
};

// Helper function to convert Uint8Array to string
export const uint8ArrayToString = (array: Uint8Array): string => {
  return new TextDecoder().decode(array);
};


// Function to derive a key from a password using PBKDF2
export const deriveKey = async (password: string, salt: Uint8Array): Promise<CryptoKey> => {
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    stringToUint8Array(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits", "deriveKey"]
  );

  return await window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
};

export const encryptPassword = async (password: string): Promise<{ encryptedData: Uint8Array; iv: Uint8Array; salt: Uint8Array }> => {
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const key = await deriveKey(password, salt);
  const iv = window.crypto.getRandomValues(new Uint8Array(12)); // Initialization vector
  const encoder = new TextEncoder();
  const data = stringToUint8Array(password);

  const encryptedData = new Uint8Array(await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    data
  ));

  // Store IV and encrypted data
  return { iv , encryptedData, salt };
};


// Encrypt the mnemonic array
export const encryptMnemonic = async (mnemonic: string[], password: string ): Promise<{ iv: Uint8Array; encryptedData: Uint8Array; salt: Uint8Array }> => {
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const key = await deriveKey(password, salt);
  const iv = window.crypto.getRandomValues(new Uint8Array(12)); // Initialization vector
  const encoder = new TextEncoder();
  const data = encoder.encode(mnemonic.join(' ')); // Join the mnemonic array into a single string

  const encryptedData = new Uint8Array(await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    data
  ));

  // Store IV and encrypted data
  return { iv , encryptedData , salt };
};


// Helper function to generate a random salt
export const generateSalt = (): string => {
  const array = new Uint8Array(16);
  window.crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

export const Password = () => {

    const password = useRecoilValue(userPassword);
    const setPassword = useSetRecoilState(userPassword);
    const mnemonic = useRecoilValue(mnemonicsRC);
    const router = useRouter();
    const input1 = React.useRef<HTMLInputElement>(null);
    const input2 = React.useRef<HTMLInputElement>(null);

     const savePassword = async (password: string): Promise<void> => {
      const salt = window.crypto.getRandomValues(new Uint8Array(16));
      const key = await deriveKey(password, salt);
      const iv = window.crypto.getRandomValues(new Uint8Array(12));
      const data = new TextEncoder().encode(password);
    
      const encryptedData = await window.crypto.subtle.encrypt(
        {
          name: "AES-GCM",
          iv: iv,
        },
        key,
        data
      );
    
      const encryptedPassword = {
        encryptedData: Array.from(new Uint8Array(encryptedData)),
        iv: Array.from(iv),
        salt: Array.from(salt)
      };
      localStorage.setItem("encryptedPassword", JSON.stringify(encryptedPassword));
      console.log("Password saved:", encryptedPassword);
    };


    const saveMnemonic = async (password: string): Promise<void> => {
      const { encryptedData, iv, salt } = await encryptMnemonic(mnemonic, password);
      const encryptedMnemonic = {
          encryptedData: Array.from(encryptedData),
          iv: Array.from(iv),
          salt: Array.from(salt)
      };
      localStorage.setItem("encryptedMnemonic", JSON.stringify(encryptedMnemonic));
      console.log("Mnemonic saved:", encryptedMnemonic);
      notify4();
  };


    async function handlePassword() {
        const Password = input1.current?.value;
        const confirmPassword = input2.current?.value;

        if(Password===confirmPassword){            
            localStorage.setItem('hasAccount', JSON.stringify(true));
            if(Password){
            setPassword(Password); }
            savePassword(Password ?? '');
            saveMnemonic(Password ?? '');
            notify1();
            await new Promise((res) => setTimeout(res, 500));
            router.push('/wallet');
        } else {
            notify2();
        }
    }

    return (
        <div className="w-6/12 h-6/12 flex flex-col justify-start items-center place-content-center gap-2">
            <Input ref={input1} placeholder="Password" className="cursor-text bg-[#202127] font-medium h-12 w-5/6 border-0"/>
            <Input ref={input2} placeholder="Confirm Password"className="cursor-text bg-[#202127]  h-12 w-5/6 border-0"/>
            <Button className="text-2xl px-8 h-12 text-slate-900 bg-white hover:bg-slate-400 mt-8 w-2/6" onClick={handlePassword}>Next</Button>
        </div>
    )
}