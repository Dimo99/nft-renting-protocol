require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

task("deploy-testnets", "Deploys contract on a provided network").setAction(
  async (taskArguments, hre, runSuper) => {
    await hre.run("compile"); // We are compiling the contracts using subtask
    const [deployer] = await ethers.getSigners(); // We are getting the deployer

    console.log("Deploying contracts with the account:", deployer.address); // We are printing the address of the deployer
    console.log("Account balance:", (await deployer.getBalance()).toString()); // We are printing the account balance

    const RentableERC721 = await ethers.getContractFactory("RentableERC721");
    const rentableERC721Contract = await RentableERC721.deploy(
      "Ai siktir",
      "AS",
      ""
    );
    console.log("Waiting for RentableERC721 deployment...");
    await rentableERC721Contract.deployed();

    console.log(
      "RentableERC721 Contract address: ",
      rentableERC721Contract.address
    );

    const Renting = await ethers.getContractFactory("Renting");
    const rentingContract = await Renting.deploy();
    console.log("Waiting for Renting deployment...");
    await rentingContract.deployed();

    console.log("Renting Contract address: ", rentingContract.address);
    console.log("Done!");
  }
);

task("verify-rentable-ERC721", "Verify RentableERC721").setAction(
  async (taskArguments, hre, runSuper) => {
    await hre.run("verify:verify", {
      address: "0xD66C993d216714432e3C3274D2a7c78aDeC2d66e",
      constructorArguments: ["Ai siktir", "AS", ""],
    });
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
      url: "https://ropsten.infura.io/v3/40c2813049e44ec79cb4d7e0d18de173",
      // Definetly not recomended for real use cause this is the private key
      accounts: [
        "7be17a3ad85e054007d2ad61624017461389f4472259861e26bc37113f4c1f3c",
      ],
    },
  },
  etherscan: {
    apiKey: "UNXZEIA9SY7J5MXBSWF8W72V166PPE2E7X",
  },
};
