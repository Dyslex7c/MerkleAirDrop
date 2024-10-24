const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MerkleAirDrop", function () {
  let airdrop, token, owner, gasPayer, user;
  const merkleRoot = '0x4ff362e98173b4ee8591ed5c63ef3a9949ed22e89ad01819cf2816447470b65f';
  const amountToCollect = ethers.utils.parseEther("25");
  const amountToSend = amountToCollect.mul(4);
  const proofOne = '0xc045d7f7afb71cb185fa454921f0b415f7212428f2b756084713abf4f7502d9c';
  const proofOneBytes32Hex = ethers.utils.hexZeroPad(proofOne, 32);
  const proofTwo = '0xc425ab69b1d4f1562b941890f212dc45f05008396cb8af71eb8168dd656ed530';
  const proofTwoBytes32Hex = ethers.utils.hexZeroPad(proofTwo, 32);
  const proof = [proofOneBytes32Hex, proofTwoBytes32Hex];

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
    const messageHashBytes32 = ethers.utils.arrayify(messageHash);

    const signature = await user.signMessage(messageHashBytes32);
    const sig = ethers.utils.splitSignature(signature);

    const { v, r, s } = sig;

    await airdrop.connect(gasPayer).claim(user.address, amountToCollect, proof, v, r, s);

    const endingBalance = await token.balanceOf(user.address);
    expect(endingBalance.sub(startingBalance)).to.equal(amountToCollect);
  });
});