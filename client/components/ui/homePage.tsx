"use client";
import React, { useCallback, useEffect, useState, useMemo } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "./sidebar";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  BadgePlus,
  CircleUserRound,
  LogOut,
  Bitcoin,
  Copy,
  Send,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Settings,
  Shield,
  HelpCircle,
  CircleUser,
} from "lucide-react";
import { useRecoilState } from "recoil";
import { userPassword } from "@/recoil/password";
import { useRouter } from "next/navigation";
import { deriveKey } from "./createPassword";
import * as bitcoin from "bitcoinjs-lib";
import * as bip39 from "bip39";
import BIP32Factory from "bip32";
import * as secp256k1 from "@bitcoinerlab/secp256k1";
import { ECPairFactory } from "ecpair";
import toast from "react-hot-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import dotenv from "dotenv";

dotenv.config();

const bip32 = BIP32Factory(secp256k1);
const ECPair = ECPairFactory(secp256k1);
const notifyClipboard = () => toast("Copied to clipboard!");
const notifyError = () => toast.error("No account selected!");

enum Status {
  spent = "spent",
  unspent = "unspent",
}

interface utxosType {
  id: string;
  amount: number;
  owner: string;
  status: Status;
}
[];

interface Transaction {
  id: string;
  message: string;
  from: string;
  to: string;
  UTXO: utxosType;
  amount: string;
  signature: string;
  status: "pending" | "completed" | "failed";
}

export function WalletPage() {
  const [password, setPassword] = useRecoilState(userPassword);
  const router = useRouter();

  const [accounts, setAccounts] = useState<
    { index: number; address?: string }[]
  >([]);
  const [mnemonic, setMnemonic] = useState<string[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<{
    index: number;
    address?: string;
  }>();
  const [isLoading, setIsLoading] = useState(true);

  const deriveAccount = useCallback((mnemonic: string[]) => {
    const mnemonicString = mnemonic.join(" ");
    const seed = bip39.mnemonicToSeedSync(mnemonicString);
    const root = bip32.fromSeed(seed);
    const accounts = [];
    const path = `m/44'/0'/0'/0/0`;
    const child = root.derivePath(path);
    const { address } = bitcoin.payments.p2pkh({ pubkey: child.publicKey });
    accounts.push({ index: 0, address });
    return accounts;
  }, []);

  const addAccount = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      if (mnemonic.length > 0) {
        const newIndex = accounts.length;
        const mnemonicString = mnemonic.join(" ");
        const seed = bip39.mnemonicToSeedSync(mnemonicString);
        const root = bip32.fromSeed(seed);
        const path = `m/44'/0'/${newIndex}'/0/0`;
        const child = root.derivePath(path);
        const { address } = bitcoin.payments.p2pkh({ pubkey: child.publicKey });

        const newAccount = { index: newIndex, address };
        setAccounts((prevAccounts) => {
          const updatedAccounts = [...prevAccounts, newAccount];
          localStorage.setItem("accounts", JSON.stringify(updatedAccounts));
          return updatedAccounts;
        });
        setSelectedAccount(newAccount);
      }
    },
    [mnemonic, accounts],
  );

  useEffect(() => {
    async function onLoad() {
      setIsLoading(true);
      try {
        const encryptedMnemonic = localStorage.getItem("encryptedMnemonic");
        const storedPassword = localStorage.getItem("password");
        if (!password && storedPassword) {
          setPassword(storedPassword);
        }

        if (encryptedMnemonic && password) {
          const { iv, encryptedData, salt } = JSON.parse(encryptedMnemonic);

          const key = await deriveKey(password, new Uint8Array(salt));
          const decryptedData = await window.crypto.subtle.decrypt(
            {
              name: "AES-GCM",
              iv: new Uint8Array(iv),
            },
            key,
            new Uint8Array(encryptedData),
          );
          const decryptedText = new TextDecoder().decode(decryptedData);
          const mnemonic = decryptedText.split(" ");
          setMnemonic(mnemonic);
          const derivedAccounts = deriveAccount(mnemonic);
          const prevAccounts = JSON.parse(
            localStorage.getItem("accounts") ?? "[]",
          );
          const currentAccounts =
            prevAccounts.length > 0 ? prevAccounts : derivedAccounts;
          setAccounts(currentAccounts);

          if (currentAccounts.length > 0) {
            setSelectedAccount(currentAccounts[0]);
          }
        }
      } catch (error) {
        console.error("Error loading wallet:", error);
        // Handle error appropriately, maybe set an error state
      } finally {
        setIsLoading(false);
      }
    }
    onLoad();
  }, [password, deriveAccount, setPassword]);

  const memoizedLinks = useMemo(() => {
    const accountLinks = accounts.map((account) => ({
      link: {
        label: `Account ${account.index + 1}`,
        href: "#",
        icon: <CircleUserRound size={20} strokeWidth={2} color="#0A5056" />,
      },
      onClick: (event: React.MouseEvent) => {
        event.preventDefault();
        setSelectedAccount(account);
      },
    }));

    return [
      {
        link: {
          label: "Add Account",
          href: "#",
          icon: <BadgePlus size={20} />,
        },
        onClick: addAccount,
      },
      ...accountLinks,
    ];
  }, [accounts, setSelectedAccount, addAccount]);

  const handleLogout = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
      setPassword("");
      router.push("/");
    },
    [setPassword, router],
  );

  const [open, setOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading wallet...
      </div>
    );
  }

  return (
    <div
      className={cn(
        "w-[60vw] h-[60vh] rounded-lg flex flex-col md:flex-row relative z-10  bg-gray-100 dark:bg-neutral-800 flex-1 mx-auto border border-neutral-200 dark:border-neutral-700 overflow-hidden",
      )}
    >
      <Sidebar open={open} setOpen={setOpen} animate={true}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            <Logo />
            <div className="mt-8 flex flex-col gap-2">
              {memoizedLinks.map((link, idx) => (
                <SidebarLink
                  key={idx}
                  link={link.link}
                  onClick={link.onClick}
                />
              ))}
            </div>
          </div>
          <div>
            <SidebarLink
              link={{
                label: "Logout",
                href: "#",
                icon: <LogOut size={20} />,
              }}
              onClick={handleLogout}
            />
          </div>
        </SidebarBody>
      </Sidebar>
      <Dashboard selectedAccount={selectedAccount} mnemonic={mnemonic} />
    </div>
  );
}

export const Logo = () => {
  return (
    <Link
      href="#"
      className="font-normal flex space-x-2 items-center text-xl text-black py-1 relative z-20"
    >
      <LogoIcon />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium text-black dark:text-white whitespace-pre"
      >
        <h3 className="scroll-m-20 tracking-wide text-2xl font-semibold text-[#0A5056]">
          BitcoinTS
        </h3>
      </motion.span>
    </Link>
  );
};

export const LogoIcon = () => {
  return (
    <Link
      href="#"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <Bitcoin size={30} strokeWidth={3} color="#4D4712" />
    </Link>
  );
};

export default function Dashboard({ selectedAccount, mnemonic }: any) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [keyPair, setKeyPair] = useState<any>(null);

  const copyToClipboard = () => {
    if (selectedAccount?.address) {
      navigator.clipboard.writeText(selectedAccount.address);
      notifyClipboard();
    }
  };

  useEffect(() => {
    if (selectedAccount && mnemonic) {
      const mnemonicString = mnemonic.join(" ");
      const seed = bip39.mnemonicToSeedSync(mnemonicString);
      const root = bip32.fromSeed(seed);
      const path = `m/44'/0'/${selectedAccount.index}'/0/0`;
      const child = root.derivePath(path);
      const newKeyPair = ECPair.fromPrivateKey(
        child.privateKey ?? new Uint8Array(),
      );
      setKeyPair(newKeyPair);
    }
  }, [selectedAccount, mnemonic]);

  const handleSendTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccount?.address) {
      notifyError();
      return;
    }

    const utxoRoute = process.env.utxoRoute ?? "";
    const txRoute = process.env.txRoute ?? "";

    const utxosResponse = await axios.post(utxoRoute, {
      data: {
        from: selectedAccount.address,
      },
    });

    const utxos: utxosType = utxosResponse.data as utxosType;

    const tx = Buffer.from(
      JSON.stringify({
        id: Date.now().toString(),
        from: selectedAccount.address,
        to: toAddress,
        amount,
        utxos,
      }),
    );
    const signature = keyPair.sign(bitcoin.crypto.hash256(tx));
    const signatureString = signature.toString("base64");

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      message: tx.toString("base64"),
      from: selectedAccount.address,
      to: toAddress,
      amount,
      UTXO: utxos,
      signature: signatureString,
      status: "pending",
    };

    const acknowledgement = new Promise(async (resolve) => {
      await axios.post(txRoute, {
        data: {
          newTransaction,
        },
      });
      setTransactions([newTransaction, ...transactions]);
    });

    setToAddress("");
    setAmount("");

    // Simulate API call
    setTimeout(() => {
      setTransactions((prevTransactions) =>
        prevTransactions.map((t) =>
          t.id === newTransaction.id ? { ...t, status: "completed" } : t,
        ),
      );
    }, 2000);
  };

  if (!selectedAccount) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-lg">
          Please select an account to view the dashboard.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-1">
      <div className="p-4 md:p-6 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex flex-col gap-6 flex-1 w-full h-full">
        <header className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src="/placeholder.svg" alt="User" />
              <AvatarFallback>
                <CircleUser strokeWidth={1.8} size={32} />
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">Welcome back!</h1>
              <p className="text-sm text-muted-foreground">
                Manage your crypto assets
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <HelpCircle className="h-4 w-4" />
            </Button>
          </div>
        </header>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Balance
              </CardTitle>
              <Bitcoin size={23} strokeWidth={2.2} />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">
                {selectedAccount.balance ?? `0 BTC`}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Address</CardTitle>
              <Copy
                className="h-4 w-4 text-muted-foreground cursor-pointer"
                onClick={copyToClipboard}
              />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-semibold truncate">
                {selectedAccount.address}
              </div>
              <p className="text-xs text-muted-foreground">
                Click the icon to copy
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Recent Transactions
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{transactions.length}</div>
              <p className="text-xs text-muted-foreground">
                In the last 30 days
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Security Status
              </CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Secure</div>
              <p className="text-xs text-muted-foreground">2FA Enabled</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Send Transaction</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSendTransaction} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="from" className="text-sm font-medium">
                    From
                  </label>
                  <Input
                    id="from"
                    type="text"
                    placeholder="Your Address"
                    value={selectedAccount.address}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="to" className="text-sm font-medium">
                    To
                  </label>
                  <Input
                    id="to"
                    type="text"
                    placeholder="Recipient Address"
                    value={toAddress}
                    onChange={(e) => setToAddress(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="amount" className="text-sm font-medium">
                    Amount
                  </label>
                  <Input
                    id="amount"
                    type="number"
                    className="[&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [appearance:textfield] border p-4 outline-none"
                    placeholder="Amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  <Send className="mr-2 h-4 w-4" /> Send Transaction
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all" className="w-full">
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="sent">Sent</TabsTrigger>
                  <TabsTrigger value="received">Received</TabsTrigger>
                </TabsList>
                <TabsContent value="all" className="space-y-4">
                  {transactions.length === 0 ? (
                    <p className="text-center text-muted-foreground">
                      No transactions yet.
                    </p>
                  ) : (
                    <ul className="space-y-4">
                      {transactions.map((tx) => (
                        <li
                          key={tx.id}
                          className="flex items-center justify-between p-4 bg-muted rounded-lg"
                        >
                          <div className="flex items-center space-x-4">
                            {tx.from === selectedAccount.address ? (
                              <ArrowUpRight className="text-red-500" />
                            ) : (
                              <ArrowDownRight className="text-green-500" />
                            )}
                            <div>
                              <p className="font-medium">{tx.to}</p>
                              <p className="text-sm text-muted-foreground">
                                {Date.now().toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{tx.amount} BTC</p>
                            <p
                              className={`text-sm ${
                                tx.status === "pending"
                                  ? "text-yellow-500"
                                  : tx.status === "completed"
                                    ? "text-green-500"
                                    : "text-red-500"
                              }`}
                            >
                              {tx.status.charAt(0).toUpperCase() +
                                tx.status.slice(1)}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </TabsContent>
                <TabsContent value="sent">
                  {/* Similar structure as "all" but filtered for sent transactions */}
                </TabsContent>
                <TabsContent value="received">
                  {/* Similar structure as "all" but filtered for received transactions */}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                variant="outline"
                className="h-20 flex flex-col items-center justify-center"
              >
                <ArrowUpRight className="h-6 w-6 mb-2" />
                Send
              </Button>
              <Button
                variant="outline"
                className="h-20 flex flex-col items-center justify-center"
              >
                <ArrowDownRight className="h-6 w-6 mb-2" />
                Receive
              </Button>
              <Button
                variant="outline"
                className="h-20 flex flex-col items-center justify-center"
              >
                <Bitcoin className="h-6 w-6 mb-2" />
                Buy
              </Button>
              <Button
                variant="outline"
                className="h-20 flex flex-col items-center justify-center"
              >
                <Settings className="h-6 w-6 mb-2" />
                Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
