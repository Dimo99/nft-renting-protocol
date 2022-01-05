import { Button, Typography } from "@mui/material";
import { useContext, useState, useEffect } from "react";
import { Web3Context } from "src/App";

export default function MyDashboard() {
  const { state } = useContext(Web3Context);
  const [earnings, setEarnings] = useState(0);

  useEffect(() => {
    async function myFetch() {
      const result = state.nftPoolContract.earnings(state.address);
      setEarnings(result);
    }
  }, []);

  return (
    <>
      <Typography variant="h4">Your balance: {earnings}</Typography>
      <Button
        fullWidth
        variant="outlined"
        sx={{ borderRadius: 30, minHeight: "55px", marginTop: "100px" }}
      >
        Withdraw funds
      </Button>
    </>
  );
}
