"use client"
import { mnemonicsRC } from "@/recoil/mnemonics"
import { useRecoilValue } from "recoil"
import toast from 'react-hot-toast';

const notify = () => toast('Copied to clipboard!');

export const SecretPhrase = () => {

    const mn = useRecoilValue(mnemonicsRC);

    const handleCopy = () => {
        const mnemonicString = mn.join(' ');
        navigator.clipboard.writeText(mnemonicString)
            .then(() => {
                console.log('Mnemonic copied to clipboard:', mnemonicString);
                notify();
            })
            .catch(err => {
                console.error('Failed to copy: ', err);
            });
    };

    return (
        <div className="grid grid-cols-4 rounded-lg w-5/12 bg-[rgba(32,33,39,1)] text-white text-lg p-8 gap-4 h-4/5 mb-2 cursor-pointer transition-transform transform active:scale-95 " onClick={handleCopy} >
            {mn.map((value, id) => (
                <div key={id}><span className="text-[#969FAF]">{id+1}.</span> &nbsp; {value}</div>
            ))}
            <hr className="border-t col-span-4 border-[#969FAF] mt-2"/>
            <span className="col-span-4 text-center text-[#969FAF]">Click anywhere on this card to copy</span>
        </div>
    )
}