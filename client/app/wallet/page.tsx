import { WalletPage } from "@/components/ui/homePage";
import { Spotlight } from "@/components/ui/spotlight";
import { Toaster } from "react-hot-toast";

export default function Home() {

    return (
        <div className="flex min-h-screen flex-col items-center justify-start p-32 bg-gray-900 antialiased bg-grid-white/[0.02] relative">
            <Spotlight
             className="-top-40 left-0 md:left-60 md:-top-20"
             fill="white"
            />
            <div className="flex-grow">
                <WalletPage />
            </div>
            <Toaster />
        </div>
    );
}