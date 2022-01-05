import React, { useContext, useEffect, useState } from "react";
import { Button } from "@mui/material";

import Web3Modal from "web3modal";
// @ts-ignore
import WalletConnectProvider from "@walletconnect/web3-provider";

import { Web3Provider } from "@ethersproject/providers";
import { getChainData } from "../helpers/utilities";
import { getContract } from "../helpers/ethers";
import { Web3Context } from "../App";

import NFTPool from "../abis/NFTPool.json";

const NFTPoolAddress = "0xb88908a0E4184C8725C262A7d0f4c5c19D3A45d2";

let web3Modal: Web3Modal;
export default function ConnectButton() {
  const { state, dispatch } = useContext(Web3Context);

  useEffect(() => {
    createWeb3Modal();
    if (web3Modal.cachedProvider) {
      onConnect();
    }
  }, []);

  function createWeb3Modal() {
    web3Modal = new Web3Modal({
      network: getNetwork(),
      cacheProvider: true,
      providerOptions: getProviderOptions(),
    });
  }

  const subscribeToProviderEvents = async (provider: any) => {
    if (!provider.on) {
      return;
    }

    provider.on("accountsChanged", changedAccount);
    provider.on("networkChanged", networkChanged);
    provider.on("close", resetApp);

    await web3Modal.off("accountsChanged");
  };

  const unSubscribe = async (provider: any) => {
    // Workaround for metamask widget > 9.0.3 (provider.off is undefined);
    window.location.reload();
    if (!provider.off) {
      return;
    }

    provider.off("accountsChanged", changedAccount);
    provider.off("networkChanged", networkChanged);
    provider.off("close", resetApp);
  };

  const changedAccount = async (accounts: string[]) => {
    if (!accounts.length) {
      // Metamask Lock fire an empty accounts array
      await resetApp();
    } else {
      dispatch({ type: "addressChange", address: accounts[0] });
    }
  };

  const networkChanged = async (networkId: number) => {
    resetApp();
  };

  function getNetwork() {
    return getChainData(4).network;
  }

  function getProviderOptions() {
    const providerOptions = {
      walletconnect: {
        package: WalletConnectProvider,
        options: {
          infuraId: "f2613b094c124b7aaf56e1d7a9a8e1b9",
        },
      },
    };
    return providerOptions;
  }

  const resetApp = async () => {
    await web3Modal.clearCachedProvider();
    localStorage.removeItem("WEB3_CONNECT_CACHED_PROVIDER");
    localStorage.removeItem("walletconnect");
    await unSubscribe(state.provider);
  };

  const resetState = () => {
    dispatch({ type: "resetState" });
  };

  const onConnect = async () => {
    const provider = await web3Modal.connect();

    const library = new Web3Provider(provider);

    const network = await library.getNetwork();

    if (network.chainId !== 4) {
      dispatch({ type: "changeNetwork" });
      return;
    }

    const address = provider.selectedAddress
      ? provider.selectedAddress
      : provider?.accounts[0];

    const web3Provider = new Web3Provider(provider);

    const nftPoolContract = getContract(
      NFTPoolAddress,
      NFTPool.abi,
      web3Provider,
      address
    );

    dispatch({
      type: "connected",
      address,
      provider,
      web3Provider,
      nftPoolContract,
    });

    await subscribeToProviderEvents(provider);
  };

  const context = useContext(Web3Context);

  return (
    <Button sx={{ borderRadius: 30 }} variant="outlined" onClick={onConnect}>
      Connect
    </Button>
  );
}
