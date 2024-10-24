import { ethers } from "ethers";

export async function generateMerkleSignature(
  signer: ethers.Signer,
  address: string,
  amount: ethers.BigNumber
): Promise<{ v: number; r: string; s: string }> {
  try {
    const messageHash = ethers.utils.solidityKeccak256(
      ["address", "uint256"],
      [address, amount]
    );
    const messageHashBytes = ethers.utils.arrayify(messageHash);

    const signature = await signer.signMessage(messageHashBytes);
    const { v, r, s } = ethers.utils.splitSignature(signature);

    return { v, r, s };
  } catch (err) {
    console.error("Error generating signature:", err);
    throw new Error("Failed to generate signature.");
  }
}
