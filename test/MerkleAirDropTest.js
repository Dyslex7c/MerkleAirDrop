const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MerkleAirDrop", function () {
  let airdrop, token, owner, gasPayer, user;
  const merkleRoot = '0xfb74e1a6f36e429e034de0ae290ff93edfa336d6e0d431cb241d4d98ceda2e6b';
  const amountToCollect = ethers.utils.parseEther("25");
  const amountToSend = amountToCollect.mul(4);
  const proofOne = '0xf884e61898c71567fd4f44aa020453ed544cb775949e2087043630858aa9e609';
  const proofTwo = '0xf19a9e842b5a96e6e829203e375dfae8688610006eff2ecee5b1d5171631c970';
  const proof = [proofOne, proofTwo];

  before(async function () {
    [owner, gasPayer, user] = await ethers.getSigners();
    
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

    const messageHash = await airdrop.getMessageHash(user.address, amountToCollect);

    const signature = await user.signMessage(ethers.utils.arrayify(messageHash));
    const sig = ethers.utils.splitSignature(signature);
    console.log(sig);
    
    const { v, r, s } = sig;

    await airdrop.connect(gasPayer).claim(user.address, amountToCollect, proof, v, r, s);

    const endingBalance = await token.balanceOf(user.address);
    expect(endingBalance.sub(startingBalance)).to.equal(amountToCollect);
  });
});