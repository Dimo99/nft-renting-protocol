import {
  Alert,
  AlertColor,
  Box,
  Button,
  CircularProgress,
  Container,
  Grid,
  Link,
  Snackbar,
  Stack,
  Tab,
  Typography,
} from "@mui/material";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import React, { createContext, useReducer, useState } from "react";
import { Contract } from "ethers";
import ConnectButton from "./components/ConnectButton";
import Rent from "./pages/Rent";
import Lend from "./pages/Lend";
import MyDashboard from "./pages/MyDashboard";

export interface Web3State {
  connected: boolean;
  address: string;
  fetching: boolean;
  nftPoolContract?: Contract;
  transactionHash?: string;
  message?: string;
  messageType?: AlertColor;
  provider?: any;
  web3Provider?: any;
}

export type Web3Action =
  | {
      type: "connected";
      address: string;
      nftPoolContract: Contract;
      provider: any;
      web3Provider: any;
    }
  | {
      type: "addressChange";
      address: string;
    }
  | { type: "fetching"; transactionHash?: string }
  | { type: "fetched"; messageType?: AlertColor; message?: string }
  | { type: "changeNetwork" }
  | { type: "resetState" }
  | { type: "removeMessage" };

const initialState: Web3State = {
  fetching: false,
  connected: false,
  address: "",
};

function web3Reducer(state: Web3State, action: Web3Action): Web3State {
  switch (action.type) {
    case "connected": {
      return {
        ...state,
        connected: true,
        address: action.address,
        nftPoolContract: action.nftPoolContract,
        provider: action.provider,
        web3Provider: action.web3Provider,
      };
    }
    case "fetching": {
      return {
        ...state,
        fetching: true,
        transactionHash: action.transactionHash,
      };
    }
    case "fetched": {
      return {
        ...state,
        fetching: false,
        message: action.message,
        messageType: action.messageType,
      };
    }
    case "changeNetwork": {
      return {
        ...state,
        messageType: "error",
        message: "Please change to rinkeby network",
      };
    }
    case "resetState": {
      return initialState;
    }
    case "addressChange": {
      return { ...state, address: action.address };
    }
    case "removeMessage": {
      return { ...state, messageType: undefined, message: undefined };
    }
  }

  return state;
}

export const Web3Context = createContext<{
  state: Web3State;
  dispatch: React.Dispatch<Web3Action>;
}>({ state: initialState, dispatch: () => {} });

const App = () => {
  // const [provider, setProvider] = useState<any>();
  // const [fetching, setFetching] = useState<boolean>(false);
  // const [address, setAddress] = useState<string>("");
  // const [library, setLibrary] = useState<any>(null);
  // const [chainId, setChainId] = useState<number>(1);
  // const [pendingRequest, setPedningRequest] = useState<boolean>(false);
  // const [result, setResult] = useState<any>();
  // const [libraryContract, setLibraryContract] = useState<any>(null);
  // const [info, setInfo] = useState<any>(null);

  const [state, dispatch] = useReducer(web3Reducer, initialState);

  const [activeTab, setActiveTab] = useState("1");

  return (
    <Web3Context.Provider value={{ state, dispatch }}>
      <TabContext value={activeTab}>
        <Grid container spacing={2}>
          <Grid item xs={8}>
            <TabList variant="fullWidth" onChange={(_, n) => setActiveTab(n)}>
              <Tab disabled={state.fetching} label="Rent" value="1" />
              <Tab disabled={state.fetching} label="Lend" value="2" />
              <Tab disabled={state.fetching} label="My dashboard" value="3" />
            </TabList>
          </Grid>
          <Grid
            container
            justifyContent="center"
            alignContent="center"
            item
            xs={4}
          >
            {!state.connected ? (
              <ConnectButton />
            ) : (
              <Link
                href={`https://rinkeby.etherscan.io/address/${state.address}`}
                target="_blank"
                color="inherit"
                noWrap
              >
                {state.address}
              </Link>
            )}
          </Grid>
        </Grid>
        {state.fetching && (
          <Box
            sx={{
              height: "calc(100vh - 64px)",
              display: "flex",
              zIndex: 100,
              justifyContent: "center",
              alignContent: "center",
              alignItems: "center",
            }}
          >
            <Stack
              spacing={5}
              justifyContent="center"
              alignContent="center"
              alignItems="center"
            >
              {state.transactionHash && (
                <Link
                  variant="h5"
                  href={`https://rinkeby.etherscan.io/tx/${state.transactionHash}`}
                  target="_blank"
                >
                  {state.transactionHash}
                </Link>
              )}
              <CircularProgress />
            </Stack>
          </Box>
        )}
        {state.connected ? (
          <>
            <TabPanel value="1">
              <Rent />
            </TabPanel>
            <TabPanel value="2">
              <Lend />
            </TabPanel>
            <TabPanel value="3">
              <MyDashboard />
            </TabPanel>
          </>
        ) : (
          <Box
            sx={{
              height: "calc(100vh - 64px)",
              display: "flex",
              justifyContent: "center",
              alignContent: "center",
              alignItems: "center",
            }}
          >
            <Typography variant="h2">Not connected</Typography>
          </Box>
        )}
      </TabContext>
      <Snackbar
        open={state.message !== undefined}
        autoHideDuration={5000}
        onClose={() => dispatch({ type: "removeMessage" })}
      >
        <Alert
          onClose={() => dispatch({ type: "removeMessage" })}
          severity={state.messageType}
          sx={{ width: "100%" }}
        >
          {state.message}
        </Alert>
      </Snackbar>
    </Web3Context.Provider>
    /* <Header
          connected={connected}
          address={address}
          chainId={chainId}
          killSession={resetApp}
        /> */

    /* {fetching ? (
          <Loader />
        ) : (
          !connected && <ConnectButton onClick={onConnect} />
        )} */
  );
};
export default App;
