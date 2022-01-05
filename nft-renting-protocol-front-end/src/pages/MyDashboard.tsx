import { Button, Typography } from "@mui/material";
import { formatEther } from "ethers/lib/utils";
import { useContext, useState, useEffect } from "react";
import { Web3Context } from "src/App";

export default function MyDashboard() {
  const { state, dispatch } = useContext(Web3Context);
  const [earnings, setEarnings] = useState("0");

  useEffect(() => {
    async function myFetch() {
      dispatch({ type: "fetching" });
      // const ownedNFTs = await state.nftPoolContract.
      const result = await state.nftPoolContract.getEarnings(state.address);
      setEarnings(formatEther(result));
      dispatch({ type: "fetched" });
    }
    myFetch();
  }, []);
  return (
    <>
      <Typography variant="h4">Your balance: {earnings}</Typography>
      <Button
        fullWidth
        variant="outlined"
        disabled={earnings === "0"}
        sx={{ borderRadius: 30, minHeight: "55px", marginTop: "100px" }}
      >
        Withdraw funds
      </Button>
    </>
  );
}
