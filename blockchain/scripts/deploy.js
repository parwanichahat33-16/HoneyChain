const hre = require('hardhat');

async function main() {
  const HoneyChain = await hre.ethers.getContractFactory('HoneyChain');
  const contract = await HoneyChain.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log('✅ HoneyChain deployed to:', address);
  console.log('👉 Copy this address into CONTRACT_ADDRESS in your .env file');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
