require('@nomicfoundation/hardhat-toolbox');
require('dotenv').config({ path: '../.env' });

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: '0.8.20',
  networks: {
    hardhat: {}, // local in-memory network for development/demo
    localhost: {
      url: 'http://127.0.0.1:8545',
    },
    amoy: {
      // Optional: Polygon Amoy testnet deployment
      url: process.env.BLOCKCHAIN_RPC_URL || 'https://rpc-amoy.polygon.technology',
      accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [],
    },
  },
};
