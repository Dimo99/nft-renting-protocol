import { Box, Button, Grid, Modal, TextField, Typography } from "@mui/material";
import { BigNumber } from "ethers";
import { formatEther } from "ethers/lib/utils";
import { parseEther } from "@ethersproject/units";
import { useContext, useEffect, useState } from "react";
import { Web3Context } from "src/App";
import NftCard from "src/components/NftCard";
import { getContract } from "src/helpers/ethers";
import metaDataABI from "../abis/MetaDataABI.json";

export default function Rent() {
  const { state, dispatch } = useContext(Web3Context);
  const [rentLong, setRentLong] = useState<{
    name: string;
    address: string;
    id: string;
    pricePerBlock: string;
  }>();
  const [numberOfBlocks, setNumberOfBlocks] = useState("0");

  const [nftPool, setNftPool] = useState<any[]>();

  useEffect(() => {
    async function myFetch() {
      try {
        dispatch({ type: "fetching" });
        const allNFTs = await state.nftPoolContract.allNFT();
        let nftPoolArray: any[] = [];

        for (let i = 0; i < allNFTs.length; i++) {
          const { flashFee, pricePerBlock, nftAddress, nftId } = allNFTs[i];

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
          } catch (e) {
            // In case the NFT is not ERC721Enumerable or does not return JSON including {name, image}
          }

          nftPoolArray.push({
            nftAddress,
            nftId: nftId.toString(),
            name,
            image,
            flashFee,
            pricePerBlock,
          });
        }

        setNftPool(nftPoolArray);
        dispatch({ type: "fetched" });
      } catch (e) {
        dispatch({
          type: "fetched",
          message: e.toString(),
          messageType: "error",
        });
      }
    }
    myFetch();
  }, []);

  return (
    <Grid container spacing={2} rowGap={4}>
      {nftPool &&
        nftPool.map((x, i) => (
          <Grid key={i} item xs={3}>
            <NftCard
              address={x.nftAddress}
              id={x.nftId}
              imageUrl={x.image}
              name={x.name}
              pricePerBlock={formatEther(x.pricePerBlock)}
              flashLoanPrice={formatEther(x.flashFee)}
              onLendLong={(name, address, id, pricePerBlock) => {
                setRentLong({ name, address, id, pricePerBlock });
              }}
            />
          </Grid>
        ))}
      {rentLong && (
        <Modal
          open={rentLong !== undefined}
          onClose={() => {
            setRentLong(undefined);
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 1000,
              height: 500,
              bgcolor: "background.paper",
              border: "2px solid #000",
              boxShadow: 24,
              p: 4,
            }}
          >
            <Box
              sx={{
                top: "40%",
                position: "absolute",
                height: "100%",
                width: "95%",
                textAlign: "center",
              }}
            >
              <Typography id="modal-modal-title" sx={{ marginBottom: "10px" }}>
                Rent long {rentLong.name} with address: {rentLong.address} and
                nftId: {rentLong.id}
              </Typography>
              <TextField
                fullWidth
                type="number"
                label="Number of blocks"
                variant="outlined"
                value={numberOfBlocks}
                onChange={(e) => setNumberOfBlocks(e.currentTarget.value)}
                InputLabelProps={{
                  shrink: true,
                }}
              />
              <Typography variant="body2" color="text.secondary">
                It is gonna cost you{" "}
                {formatEther(
                  BigNumber.from(numberOfBlocks).mul(
                    parseEther(rentLong.pricePerBlock)
                  )
                )}{" "}
                ETH.
              </Typography>
              <Button
                size="small"
                onClick={async () => {
                  setRentLong(undefined);
                  dispatch({ type: "fetching" });
                  try {
                    const transaction = await state.nftPoolContract.rentLong(
                      rentLong.address,
                      BigNumber.from(rentLong.id),
                      BigNumber.from(numberOfBlocks),
                      {
                        value: BigNumber.from(numberOfBlocks).mul(
                          parseEther(rentLong.pricePerBlock)
                        ),
                      }
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
                        message: "Successfully rented NFT",
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
              >
                Confirm
              </Button>
            </Box>
          </Box>
        </Modal>
      )}
    </Grid>
  );
}
