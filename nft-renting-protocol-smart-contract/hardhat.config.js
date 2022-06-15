require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require("dotenv").config();

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

task("deploy-testnet", "Deploys contract on a provided network").setAction(
  async (taskArguments, hre, runSuper) => {
    await hre.run("compile"); // We are compiling the contracts using subtask
    const [deployer] = await ethers.getSigners(); // We are getting the deployer

    console.log("Deploying contracts with the account:", deployer.address); // We are printing the address of the deployer
    console.log("Account balance:", (await deployer.getBalance()).toString()); // We are printing the account balance

    const RentingPool = await ethers.getContractFactory("RentingPool");
    const rentingPoolContract = await RentingPool.deploy();
    console.log("Waiting for renting pool deployment...");
    await rentingPoolContract.deployed();

    console.log("Renting pool Contract address: ", rentingPoolContract.address);

    console.log("Done!");
  }
);

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.4",
  networks: {
    ropsten: {
      url: process.env.URL,
      accounts: [process.env.PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: "UNXZEIA9SY7J5MXBSWF8W72V166PPE2E7X",
  },
};
