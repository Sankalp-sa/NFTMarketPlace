require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24",
  defaultNetwork: "sepolia",
   networks: {
      hardhat: {},
      sepolia: {
         url: process.env.VITE_API_URL,
         accounts: [`0x${process.env.VITE_PRIVATE_KEY}`],
      }
  },
};
