const { ethers } = require("hardhat");

async function main() {
    const ROOT = "0x4ff362e98173b4ee8591ed5c63ef3a9949ed22e89ad01819cf2816447470b65f";
    const AMOUNT_TO_TRANSFER = ethers.utils.parseEther("100");

    const OrionToken = await ethers.getContractFactory("OrionToken");
    const MerkleAirDrop = await ethers.getContractFactory("MerkleAirDrop");

    const orionToken = await OrionToken.deploy();
    await orionToken.deployed();
    console.log(`OrionToken deployed to: ${orionToken.address}`);

    const airdrop = await MerkleAirDrop.deploy(ROOT, orionToken.address);
    await airdrop.deployed();
    console.log(`MerkleAirDrop deployed to: ${airdrop.address}`);

    const [deployer] = await ethers.getSigners();
    await orionToken.mint(deployer.address, AMOUNT_TO_TRANSFER);
    console.log(`Minted ${AMOUNT_TO_TRANSFER.toString()} Orion tokens to owner`);

    await orionToken.transfer(airdrop.address, AMOUNT_TO_TRANSFER);
    console.log(`Transferred ${AMOUNT_TO_TRANSFER.toString()} Orion tokens to MerkleAirDrop`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });