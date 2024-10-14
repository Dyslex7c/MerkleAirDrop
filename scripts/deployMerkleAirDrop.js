const { ethers } = require("hardhat");

async function main() {
    const ROOT = "0xfb74e1a6f36e429e034de0ae290ff93edfa336d6e0d431cb241d4d98ceda2e6b";
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