// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
import hre from "hardhat";

import pkg from 'hardhat';
const { ethers } = pkg;

const NFTMarketPlace = await ethers.deployContract("NFTMarketPlace");

await NFTMarketPlace.waitForDeployment();

const AuctionContract = await ethers.deployContract("AuctionContract",[NFTMarketPlace.target]);

await AuctionContract.waitForDeployment();

console.log(
  "NFTMarketPlace smart contract deployed to:",
  NFTMarketPlace.target
);

console.log(
  "Auction smart contract deployed to:",
  AuctionContract.target
);
