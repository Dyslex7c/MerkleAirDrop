"use client";

import { useState } from "react";
import { ConnectButton, useActiveAccount } from "thirdweb/react";
import { client } from "./client";
import { ethers } from "ethers";
import { ExternalProvider } from "@ethersproject/providers";
import MerkleAirDrop from "../../artifacts/contracts/MerkleAirDrop.sol/MerkleAirDrop.json";

declare global {
  interface Window{
    ethereum?:ExternalProvider;
  }
}

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const account = useActiveAccount();  
  console.log(account?.address);
  
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

      const merkleProofArray = [
        '0xf884e61898c71567fd4f44aa020453ed544cb775949e2087043630858aa9e609', 
        '0xf19a9e842b5a96e6e829203e375dfae8688610006eff2ecee5b1d5171631c970'
      ];

      const v = 28;
      const r = "0x490b3359e431e917d758ec466c5b4c86427b986f5385e89cbfc4a5ac41eec265";
      const s = "0x1fe2b4f121f1effc116d99685c940c3e00855fd93b00c768ee844b45a57aa0d2";
      
      const tx = await contract.claim(account?.address, ethers.utils.parseEther("25"), merkleProofArray, v, r, s);
      await tx.wait();

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
