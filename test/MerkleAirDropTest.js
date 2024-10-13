const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MerkleAirDrop", function () {
  let airdrop, token, owner, gasPayer, user;
  const merkleRoot = '0xeb14ea9a4ee8b373a5029626d5f00f87d4e68d9dc148f50fc6f7677b20ee9a7c';
  const amountToCollect = ethers.utils.parseEther("25");
  const amountToSend = amountToCollect.mul(4);
  const proofOne = '0xa7d824b087318e0412a2b6153310b0b7460add52f332d024cbffb84e98ebab8b';
  const proofTwo = '0x7ad1a6bd3b6b7e1c61ed1582062fbc9f8da76cbb63017d2e2529632d31c77ec4';
  const proof = [proofOne, proofTwo];

  before(async function () {
    [owner, gasPayer, user] = await ethers.getSigners();
    console.log(user);
    console.log(gasPayer.address);
    console.log(owner.address);
    
    const OrionToken = await ethers.getContractFactory("OrionToken");
    token = await OrionToken.deploy();
    await token.deployed();

    const MerkleAirDrop = await ethers.getContractFactory("MerkleAirDrop");
    airdrop = await MerkleAirDrop.deploy(merkleRoot, token.address);
    await airdrop.deployed();

    await token.mint(owner.address, amountToSend);
    await token.transfer(airdrop.address, amountToSend);
  });

  it("Users can claim the correct amount of tokens", async function () {
    const startingBalance = await token.balanceOf(user.address);

    // Get the message hash using the getMessageHash function
    const messageHash = await airdrop.getMessageHash(user.address, amountToCollect);

    // Sign the message hash
    const signature = await user.signMessage(ethers.utils.arrayify(messageHash));
    const sig = ethers.utils.splitSignature(signature);
    const { v, r, s } = sig;

    // Claim the airdrop
    await airdrop.connect(gasPayer).claim(user.address, amountToCollect, proof, v, r, s);

    const endingBalance = await token.balanceOf(user.address);
    expect(endingBalance.sub(startingBalance)).to.equal(amountToCollect);
  });
});