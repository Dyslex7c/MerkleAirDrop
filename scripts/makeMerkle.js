const fs = require("fs");
const keccak256 = require("keccak256");
const { MerkleTree } = require("merkletreejs");
const { ethers } = require("ethers");

async function main() {
  const inputPath = "./scripts/target/input.json";
  const outputPath = "./scripts/target/output.json";

  const inputData = JSON.parse(fs.readFileSync(inputPath, "utf8"));
  const count = inputData.count;

  const leafs = [];
  const inputs = [];

  for (let i = 0; i < count; i++) {
    const account = inputData.values[i][0];
    const amount = inputData.values[i][1];

    const leaf = keccak256(
      ethers.utils.defaultAbiCoder.encode(
        ["address", "uint256"],
        [account, amount]
      )
    );

    leafs.push(leaf);

    inputs.push(inputData.values[i]);
  }

  const merkleTree = new MerkleTree(leafs, keccak256, { sortPairs: true });
  const root = merkleTree.getRoot().toString("hex");

  console.log(`Merkle Root: 0x${root}`);

  const output = inputs.map((input, i) => {
    const proof = merkleTree.getHexProof(leafs[i]);

    return {
      inputs: [input["0"], input["1"]],
      proof,
      root: `0x${root}`,
      leaf: `0x${leafs[i].toString("hex")}`,
    };
  });

  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log(`Merkle proof data written to: ${outputPath}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });