// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

import {IERC20, SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

contract MerkleAirDrop is EIP712 {
    using ECDSA for bytes32;
    using SafeERC20 for IERC20;

    error MerkleAirDrop__InvalidProof(bytes32 leaf);
    error MerkleAirDrop__AlreadyClaimed();
    error MerkleAirDrop__InvalidSignature();

    address[] claimers;
    
    bytes32 private immutable i_merkleRoot;
    IERC20 private immutable i_airdropToken;
    mapping (address claimer => bool claimed) private s_hasclaimed;

    bytes32 private constant MESSAGE_TYPEHASH = keccak256("AirDropClaim(address account,uint256 amount)");

    struct AirDropClaim {
        address account;
        uint256 amount;
    }

    event Claimed(address account, uint256 amount);

    constructor(bytes32 merkleRoot, IERC20 airdropToken) EIP712("MerkleAirDrop", "1") {
        i_merkleRoot = merkleRoot;
        i_airdropToken = airdropToken;
    }

    function claim(address account, uint256 amount, bytes32[] calldata merkleProof, uint8 v, bytes32 r, bytes32 s) external {
        if (s_hasclaimed[account]) {
            revert MerkleAirDrop__AlreadyClaimed();
        }

        bytes32 hash2 = MessageHashUtils.toEthSignedMessageHash(getMessageHash(account, amount));
        if (!_isValidSignature(account, hash2, v, r, s)) {
            revert MerkleAirDrop__InvalidSignature();
        }

        bytes32 leaf = keccak256(abi.encode(account, amount));
        if (!MerkleProof.verify(merkleProof, i_merkleRoot, leaf)) {
            revert MerkleAirDrop__InvalidProof(leaf);
        }
        s_hasclaimed[account] = true;
        emit Claimed(account, amount);
        i_airdropToken.safeTransfer(account, amount);
    }

    function getMessageHash(address account, uint256 amount) public view returns(bytes32){
        return _hashTypedDataV4(
            keccak256(abi.encode(MESSAGE_TYPEHASH, AirDropClaim({account: account, amount: amount})))
        );
    } 

    function getMerkleRoot() external view returns (bytes32) {
        return i_merkleRoot;
    }

    function getAirDropToken() external view returns (IERC20) {
        return i_airdropToken;
    }

    function _isValidSignature(address account, bytes32 digest, uint8 v, bytes32 r, bytes32 s) internal pure returns(bool) {
        (address actualSigner, , ) = ECDSA.tryRecover(digest, v, r, s);
        return (actualSigner == account);
    }
}