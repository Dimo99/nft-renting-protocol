import { parseEther } from "@ethersproject/units";
import { Button, Grid, TextField } from "@mui/material";
import { BigNumber } from "ethers";
import { stat } from "fs";
import { useContext, useState } from "react";
import { Web3Context } from "src/App";
import { NFTPoolAddress } from "src/components/ConnectButton";
import { getContract } from "src/helpers/ethers";
import ApproveABI from "../abis/ERC721ApproveABI.json";

export default function Lend() {
  const { state, dispatch } = useContext(Web3Context);

  const [nftAddress, setNftAddress] = useState<string>("");
  const [nftId, setNftId] = useState<string>("");
  const [nftFlashFee, setNftFlashFee] = useState<string>("");
  const [nftPricePerBlock, setNftPricePerBlock] = useState<string>("");
  const [nftMaximumNumberOfBlocks, setNftMaximumNumberOfBlocks] =
    useState<string>("");

  return (
    <Grid container spacing={2} rowGap={4}>
      <Grid item xs={8}>
        <TextField
          fullWidth
          label="NFT Address"
          value={nftAddress}
          onChange={(e) => setNftAddress(e.currentTarget.value)}
          variant="outlined"
          InputLabelProps={{
            shrink: true,
          }}
        />
      </Grid>
      <Grid item xs={4}>
        <TextField
          fullWidth
          label="NFT ID"
          variant="outlined"
          value={nftId}
          onChange={(e) => setNftId(e.currentTarget.value)}
          InputLabelProps={{
            shrink: true,
          }}
        />
      </Grid>
      <Grid item xs={4}>
        <TextField
          fullWidth
          type="number"
          label="Flash fee"
          variant="outlined"
          value={nftFlashFee}
          onChange={(e) => setNftFlashFee(e.currentTarget.value)}
          InputLabelProps={{
            shrink: true,
          }}
        />
      </Grid>
      <Grid item xs={4}>
        <TextField
          fullWidth
          label="Price per block"
          variant="outlined"
          type="number"
          value={nftPricePerBlock}
          onChange={(e) => setNftPricePerBlock(e.currentTarget.value)}
          InputLabelProps={{
            shrink: true,
          }}
        />
      </Grid>
      <Grid item xs={4}>
        <TextField
          fullWidth
          label="Maximum number of blocks"
          variant="outlined"
          type="number"
          value={nftMaximumNumberOfBlocks}
          onChange={(e) => setNftMaximumNumberOfBlocks(e.currentTarget.value)}
          InputLabelProps={{
            shrink: true,
          }}
        />
      </Grid>
      <Grid item xs={4}></Grid>
      <Grid item xs={4}>
        <Button
          fullWidth
          variant="outlined"
          onClick={async () => {
            dispatch({ type: "fetching" });
            try {
              console.log("ok");

              const transaction = await getContract(
                nftAddress,
                ApproveABI,
                state.web3Provider,
                state.address
              ).approve(NFTPoolAddress, BigNumber.from(nftId));

              console.log("hmmmmm");

              dispatch({ type: "fetching", transactionHash: transaction.hash });

              const transactionReceipt = await transaction.wait();

              if (transactionReceipt.status === 1) {
                dispatch({
                  type: "fetched",
                  messageType: "success",
                  message: "Successfully approved nft",
                });
              } else {
                dispatch({
                  type: "fetched",
                  messageType: "error",
                  message: JSON.stringify(transactionReceipt),
                });
              }
            } catch (e) {
              dispatch({
                type: "fetched",
                messageType: "error",
                message: e.error.message,
              });
            }
          }}
          sx={{ borderRadius: 30, minHeight: "55px" }}
        >
          Approve token
        </Button>
      </Grid>
      <Grid item xs={4}>
        <Button
          fullWidth
          variant="outlined"
          onClick={async () => {
            dispatch({ type: "fetching" });
            try {
              const transaction = await state.nftPoolContract.addNft(
                nftAddress,
                BigNumber.from(nftId),
                parseEther(nftFlashFee),
                parseEther(nftPricePerBlock),
                BigNumber.from(nftMaximumNumberOfBlocks)
              );

              dispatch({ type: "fetching", transactionHash: transaction.hash });

              const transactionReceipt = await transaction.wait();

              if (transactionReceipt.status === 1) {
                dispatch({
                  type: "fetched",
                  messageType: "success",
                  message: "Successfully added NFT to the pool",
                });
              } else {
                dispatch({
                  type: "fetched",
                  messageType: "error",
                  message: JSON.stringify(transactionReceipt),
                });
              }
            } catch (e) {
              console.log(e);
              dispatch({
                type: "fetched",
                messageType: "error",
                message: e.error.message,
              });
            }
          }}
          sx={{ borderRadius: 30, minHeight: "55px" }}
        >
          Add to pool
        </Button>
      </Grid>
    </Grid>
  );
}
