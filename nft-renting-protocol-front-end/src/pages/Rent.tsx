import { Grid } from "@mui/material";
import { formatEther } from "ethers/lib/utils";
import { useContext, useEffect, useState } from "react";
import { Web3Context } from "src/App";
import NftCard from "src/components/NftCard";
import { getContract } from "src/helpers/ethers";

const metaDataABI = [
  {
    constant: true,
    inputs: [
      {
        name: "_tokenId",
        type: "uint256",
      },
    ],
    name: "tokenURI",
    outputs: [
      {
        name: "",
        type: "string",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
];

export default function Rent() {
  const { state, dispatch } = useContext(Web3Context);
  const [nftPool, setNftPool] = useState<any[]>();

  useEffect(() => {
    async function myFetch() {
      dispatch({ type: "fetching" });
      const numberOfNFTs = await state.nftPoolContract.numberOfNFTsInPool();

      let nftPoolArray = [];

      for (let i = 0; i < numberOfNFTs; i++) {
        const [nftAddress, nftId] = await state.nftPoolContract.poolIndex(i);
        const [_, _1, flashFee, pricePerBlock] =
          await state.nftPoolContract.poolNft(nftAddress, nftId);

        const uri = await getContract(
          nftAddress,
          metaDataABI,
          state.web3Provider,
          state.address
        ).tokenURI(nftId);

        const { name, image } = await (await fetch(uri)).json();

        nftPoolArray.push({ name, image, flashFee, pricePerBlock });
      }

      setNftPool(nftPoolArray);

      dispatch({ type: "fetched" });
    }
    myFetch();
  }, []);

  return (
    <Grid container spacing={2} rowGap={4}>
      {nftPool &&
        nftPool.map((x, i) => (
          <Grid item xs={3}>
            <NftCard
              key={i}
              imageUrl={x.image}
              name={x.name}
              pricePerBlock={formatEther(x.pricePerBlock)}
              flashLoanPrice={formatEther(x.flashFee)}
            />
          </Grid>
        ))}
    </Grid>
  );
}
