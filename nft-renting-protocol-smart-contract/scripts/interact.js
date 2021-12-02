const { ethers } = require("hardhat");
const RentableERC721 = require("../artifacts/contracts/rentable-ERC721.sol/RentableERC721.json");
const Renting = require("../artifacts/contracts/renting.sol/Renting.json");

const run = async function () {
  const provider = new ethers.providers.JsonRpcProvider(
    "http://localhost:8545"
  );

  const wallet = new ethers.Wallet(
    "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
    provider
  );

  const rentableERC721ContractAddress =
    "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  const rentableERC721Contract = new ethers.Contract(
    rentableERC721ContractAddress,
    RentableERC721.abi,
    wallet
  );

  const name = await rentableERC721Contract.name();
  console.log("Contract name", name);

  const symbol = await rentableERC721Contract.symbol();
  console.log("Contract symbol", symbol);

  rentableERC721Contract.on("Transfer", (from, to, tokenId) =>
    console.log(from, "=>", to, ":", tokenId.toString())
  );

  const mintTransaction = await rentableERC721Contract.mint(
    "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266"
  );

  const resultMintToken = await mintTransaction.wait();

  if (resultMintToken.status == 1) {
    console.log("success");
  }

  const rentingAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

  const rentingContract = new ethers.Contract(
    rentingAddress,
    Renting.abi,
    wallet
  );

  rentingContract.on("NewContract", (contractId, contractAddress) => {
    console.log(contractId.toString(), " => ", contractAddress);
  });

  // const transactionAddContract = await rentingContract.addContract(
  //   rentableERC721ContractAddress
  // );

  // const addContractResult = await transactionAddContract.wait();

  // if (addContractResult.status == 1) {
  //   console.log("Successfull transaction");
  // }

  // const approveSettingOperatorTransaction =
  //   await rentableERC721Contract.approveSettingOperator(rentingAddress, 0);

  // const approveSettingOperatorResult = approveSettingOperatorTransaction.wait();

  // if (approveSettingOperatorResult.status == 1) {
  //   console.log("approved for setting operator");
  // }

  // const transactionListTokenForRent = await rentingContract[
  //   "listTokenForRent(uint256,uint256,uint256)"
  // ](
  //   ethers.BigNumber.from(0),
  //   ethers.BigNumber.from(0),
  //   ethers.BigNumber.from(100)
  // );

  // const listTokenResult = await transactionListTokenForRent.wait();

  // if (listTokenResult.status == 1) {
  //   console.log("Successfull listed for rent transaction");
  // } else {
  //   console.log(listTokenResult);
  // }

  // const rentTokenTransaction = await rentingContract.rentToken(
  //   ethers.BigNumber.from("0"),
  //   ethers.BigNumber.from("0"),
  //   ethers.BigNumber.from("20000"),
  //   {
  //     value: ethers.BigNumber.from("20000"),
  //   }
  // );

  // const rentTokenResult = await rentTokenTransaction.wait();

  // if (rentTokenResult.status == 1) {
  //   console.log("Successfully rented token");
  // } else {
  //   console.log(rentTokenResult);
  // }

  const removeRenterFromBeingOperatorTransaction =
    await rentableERC721Contract.removeOperator(0);

  const removeRenterFromBeingOperatorResult =
    await removeRenterFromBeingOperatorTransaction.wait();

  if (removeRenterFromBeingOperatorResult.status == 1) {
    console.log("Successfully removed operator");
  } else {
    console.log(removeRenterFromBeingOperatorResult);
  }
};

run();
