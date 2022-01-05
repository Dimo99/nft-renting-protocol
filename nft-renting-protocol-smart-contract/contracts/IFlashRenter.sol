// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

interface IFlashRenter {
    function onFlashLoan(
        address nftAddress,
        uint256 nftId,
        uint256 fee,
        address initiator,
        bytes calldata data
    ) external returns (bool);
}
