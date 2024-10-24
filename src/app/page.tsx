"use client";

import { useEffect, useState } from "react";
import { ConnectButton, useActiveAccount } from "thirdweb/react";
import { client } from "./client";
import { ethers } from "ethers";
import { ExternalProvider } from "@ethersproject/providers";
import { generateMerkleProof } from "./utils/generateMerkleProof";
import { generateMerkleSignature } from "./utils/generateMerkleSignature";
import MerkleAirDrop from "../../artifacts/contracts/MerkleAirDrop.sol/MerkleAirDrop.json";

declare global {
  interface Window{
    ethereum?:ExternalProvider;
  }
}

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [merkleProof, setMerkleProof] = useState<string[]>([]);
  
  const account = useActiveAccount();

  useEffect(() => {
    if (account?.address) {
      const proof = generateMerkleProof(account.address);
      setMerkleProof(proof);
    }
  }, [account?.address]);
  
  const claimAirdrop = async () => {
    setLoading(true);
    setMessage("");

    try {
      if (!window.ethereum) {
        setMessage("Please install MetaMask!");
        return;
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      
      const contractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"; 
      const contract = new ethers.Contract(contractAddress, MerkleAirDrop.abi, signer);

      const { v, r, s } = await generateMerkleSignature(signer, account?.address!, ethers.utils.parseEther("25"));
      
      const tx = await contract.claim(account?.address, ethers.utils.parseEther("25"), merkleProof, v, r, s);
      const receipt = await tx.wait();
      console.log(receipt.status);
      
      setMessage("Airdrop claimed successfully!");
    } catch (error) {
      console.error("Error claiming airdrop:", error);
      setMessage("Failed to claim airdrop. Please connect to your wallet and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-4 pb-10 min-h-[100vh] flex items-center justify-center container max-w-screen-lg mx-auto">
      <div className="py-20">
        <ConnectButton client={client} />

        <div className="mt-8">
          <button 
            onClick={claimAirdrop} 
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300"
            disabled={loading}
          >
            {loading ? "Claiming..." : "Claim Airdrop"}
          </button>
        </div>

        {message && <p className="mt-4 text-center">{message}</p>}
      </div>
    </main>
  );
}
