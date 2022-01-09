import { Button, Grid, TextField, Typography } from "@mui/material";
import { BigNumber } from "ethers";
import { formatEther, parseEther } from "ethers/lib/utils";
import { useContext, useState, useEffect } from "react";
import { Web3Context } from "src/App";
import NftCardOwner from "src/components/NftCardOwner";
import { getContract } from "src/helpers/ethers";
import metaDataABI from "../abis/MetaDataABI.json";

export default function MyDashboard() {
  const { state, dispatch } = useContext(Web3Context);
  const [earnings, setEarnings] = useState("0");
  const [nfts, setnfts] = useState<any[]>();

  const [nftAddress, setNftAddress] = useState<string>("");
  const [nftId, setNftId] = useState<string>("");
  const [nftFlashFee, setNftFlashFee] = useState<string>("");
  const [nftPricePerBlock, setNftPricePerBlock] = useState<string>("");
  const [nftMaximumNumberOfBlocks, setNftMaximumNumberOfBlocks] =
    useState<string>("");

  useEffect(() => {
    async function myFetch() {
      dispatch({ type: "fetching" });
      // const ownedNFTs = await state.nftPoolContract.
      const result = await state.nftPoolContract.getEarnings(state.address);
      setEarnings(formatEther(result));
      const ownedNFTs = await state.nftPoolContract.ownerNFT(state.address);

      let nftsInMemory = [];

      for (let i = 0; i < ownedNFTs.length; i++) {
        const {
          flashFee,
          pricePerBlock,
          operator,
          rentedUntil,
          nftAddress,
          nftId,
        } = ownedNFTs[i];
        let name = "No openzeppelin compatible";
        let image =
          "https://www.generationsforpeace.org/wp-content/uploads/2018/03/empty.jpg";

        try {
          const uri = await getContract(
            nftAddress,
            metaDataABI,
            state.web3Provider,
            state.address
          ).tokenURI(nftId);

          const obj = await (await fetch(uri)).json();
          name = obj.name;
          image = obj.image;
        } catch (e) {}

        nftsInMemory.push({
          name,
          image,
          flashFee,
          pricePerBlock,
          operator,
          rentedUntil,
          nftAddress,
          nftId,
        });
      }

      setnfts(nftsInMemory);

      dispatch({ type: "fetched" });
    }
    myFetch();
  }, []);

  return (
    <>
      {nftAddress && nftId && (
        <Grid container spacing={2} rowGap={4}>
          <Grid item xs={8}>
            <TextField
              fullWidth
              disabled={true}
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
              disabled={true}
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
              onChange={(e) =>
                setNftMaximumNumberOfBlocks(e.currentTarget.value)
              }
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          <Grid item xs={8}></Grid>
          <Grid item xs={4}>
            <Button
              fullWidth
              variant="outlined"
              onClick={async () => {
                dispatch({ type: "fetching" });
                try {
                  const transaction = await state.nftPoolContract.editNft(
                    nftAddress,
                    BigNumber.from(nftId),
                    parseEther(nftFlashFee),
                    parseEther(nftPricePerBlock),
                    BigNumber.from(nftMaximumNumberOfBlocks)
                  );

                  dispatch({
                    type: "fetching",
                    transactionHash: transaction.hash,
                  });

                  const transactionReceipt = await transaction.wait();

                  if (transactionReceipt.status === 1) {
                    setNftAddress("");
                    setNftId("");
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
                  dispatch({
                    type: "fetched",
                    messageType: "error",
                    message: e.error.message,
                  });
                }
              }}
              sx={{ borderRadius: 30, minHeight: "55px" }}
            >
              Edit
            </Button>
          </Grid>
        </Grid>
      )}
      <Typography variant="h4">Your nfts</Typography>
      <Grid container spacing={2} rowGap={4}>
        {nfts &&
          nfts.map((x, i) => (
            <Grid key={i} item xs={3}>
              <NftCardOwner
                address={x.nftAddress}
                id={x.nftId}
                imageUrl={x.image}
                name={x.name}
                pricePerBlock={formatEther(x.pricePerBlock)}
                flashLoanPrice={formatEther(x.flashFee)}
                onEdit={(address, id) => {
                  setNftAddress(address);
                  setNftId(id);
                }}
                onRemove={async (address, id) => {
                  dispatch({ type: "fetching" });
                  try {
                    const transaction = await state.nftPoolContract.removeNft(
                      address,
                      id
                    );

                    dispatch({
                      type: "fetching",
                      transactionHash: transaction.hash,
                    });

                    const transactionReceipt = await transaction.wait();

                    if (transactionReceipt.status === 1) {
                      dispatch({
                        type: "fetched",
                        messageType: "success",
                        message: "Successfully removed NFT",
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
              />
            </Grid>
          ))}
      </Grid>
      <Typography variant="h4">Your balance: {earnings}</Typography>
      <Button
        fullWidth
        variant="outlined"
        disabled={earnings === "0"}
        onClick={async () => {
          dispatch({ type: "fetching" });
          try {
            const transaction = await state.nftPoolContract.withdrawEarnings();

            dispatch({ type: "fetching", transactionHash: transaction.hash });

            const transactionReceipt = await transaction.wait();

            if (transactionReceipt.status === 1) {
              dispatch({
                type: "fetched",
                messageType: "success",
                message: "Successfully withdrawed your funds from the contract",
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
        sx={{ borderRadius: 30, minHeight: "55px", marginTop: "100px" }}
      >
        Withdraw funds
      </Button>
    </>
  );
}
