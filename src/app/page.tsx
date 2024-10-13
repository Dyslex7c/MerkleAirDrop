"use client";

import Image from "next/image";
import { ConnectButton, ThirdwebProvider } from "thirdweb/react";
import { createThirdwebClient } from "thirdweb";
import { client } from "./client";
import { useState } from "react";

export default function Home() {

  const allowList = [
    {
      "address": "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
      "maxClaimable": "100"
    },
    {
      "address": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      "maxClaimable": "100"
    },
  ];

  const [merkleRoot, setMerkleRoot] = useState<string | null>(null);

  const generateMerkleTree = async () => {
    //const merkleTree = await createMerkle(allowList)
  }

  return (
      <main className="p-4 pb-10 min-h-[100vh] flex items-center justify-center container max-w-screen-lg mx-auto">
        <div className="py-20">
          <ConnectButton client={client} />
        </div>
      </main>
  );
}
