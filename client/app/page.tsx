'use client'
import { Welcome } from "../components/ui/welcome";
import { VerifyPassword } from "@/components/ui/enterPassword";
import { Bitcoin } from "lucide-react";
import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";

export default function Home() {
  const [account, setHasAccount] = useState<boolean | null>(null);

  useEffect(() => {
    const storedHasAccount = localStorage.getItem('hasAccount');
    setHasAccount(storedHasAccount === 'true');
  }, []);

  if (account === null) {
    return <div>Loading...</div>; // Or any loading indicator
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <Toaster />
      {account ? <VerifyPassword /> : <Welcome />}
    </main>
  );
}
