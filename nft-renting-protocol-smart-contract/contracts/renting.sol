// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./rentable-ERC721.sol";

contract Renting {
    /**
     * @dev Emitted when new contract is added to the protocol.
     */
    event NewContract(uint256 contractId, address indexed contractAddress);

    /**
     * @dev Emitted when token is listed for rent.
     */
    event TokenListedForRent(
        uint256 indexed contractId,
        uint256 indexed tokenId,
        uint256 pricePerBlock
    );

    // Mapping from contractAddress to contractId
    mapping(address => uint256) addressIds;

    // Array of contracts
    RentableERC721[] contracts;

    // Mapping from contractId,tokenId to rent price per block
    mapping(uint256 => mapping(uint256 => uint256)) nftRentPrice;

    // Mapping from contractId, tokenId to maximum number of blocks token can be rented
    mapping(uint256 => mapping(uint256 => uint256)) nftMaximumNumberOfBlocksPerRent;

    // Mapping from address to balance accumulated
    mapping(address => uint256) balance;

    constructor() {}

    /**
     * @dev Adds contract to the protocol
     * Requirements:
     *
     * - The contract address is not added to the protocol
     * Emits an {NewContract} event.
     */
    function addContract(address contractAddress) external {
        require(
            addressIds[contractAddress] == 0,
            string(
                abi.encodePacked(
                    "Renting: Contract already added with Id",
                    addressIds[contractAddress]
                )
            )
        );

        contracts.push(RentableERC721(contractAddress));

        uint256 contractId = contracts.length - 1;

        addressIds[contractAddress] = contractId;
        emit NewContract(contractId, contractAddress);
    }

    /**
     * @dev List `contractId` contract `tokenId` token for rent for `pricePerBlcok` wei price
     * Requirements:
     *
     * - The price per block should be > 0
     * - Contract should be approved setting operator for `tokenId`
     * - Caller should be ownerOf `tokenId`
     * Emits an {TokenListedForRent} event.
     */
    function listTokenForRent(
        uint256 contractId,
        uint256 tokenId,
        uint256 pricePerBlock
    ) public {
        require(pricePerBlock > 0, "Renting: Rent cannot be free");

        require(
            contracts[contractId].isApprovedSettingOperator(
                address(this),
                tokenId
            ),
            "Renting: Contract is not approved for setting operator for given token"
        );

        require(
            contracts[contractId].ownerOf(tokenId) == msg.sender,
            "Renting: Only owner can list token for rent"
        );

        nftRentPrice[contractId][tokenId] = pricePerBlock;

        emit TokenListedForRent(contractId, tokenId, pricePerBlock);
    }

    /**
     * @dev List `contractId` contract `tokenId` token for rent for `pricePerBlcok` wei price with restrinction of maximum `maximumNumberOfBlocks` token can be rented
     * Requirements:
     *
     * - `maximumNumberOfBlocks` must be positive number
     * - The price per block must be positive number
     * - Contract must be approved setting operator for `tokenId`
     * - Caller must be ownerOf `tokenId`
     * Emits an {TokenListedForRent} event.
     */
    function listTokenForRent(
        uint256 contractId,
        uint256 tokenId,
        uint256 pricePerBlock,
        uint256 maximumNumberOfBlocks
    ) external {
        require(
            maximumNumberOfBlocks > 0,
            "Renting: maximumNumberOfBlocks must be positive number"
        );

        listTokenForRent(contractId, tokenId, pricePerBlock);

        nftMaximumNumberOfBlocksPerRent[contractId][
            tokenId
        ] = maximumNumberOfBlocks;
    }

    /**
     * @dev Rent `contractId` contract `tokenId` for `numberOfBlocks`
     * Requirements:
     *
     * - Token must be listed for rent
     * - You must not rent the token for more than `maximumNumberOfBlocks`
     * - You should pay the price for every block you want to rent
     */
    function rentToken(
        uint256 contractId,
        uint256 tokenId,
        uint256 numberOfBlocks
    ) external payable {
        require(
            nftRentPrice[contractId][tokenId] > 0,
            "Renting: Token is not listed for rent"
        );

        require(
            nftMaximumNumberOfBlocksPerRent[contractId][tokenId] == 0 ||
                nftMaximumNumberOfBlocksPerRent[contractId][tokenId] >=
                numberOfBlocks,
            string(
                abi.encodePacked(
                    "Renting: You can rent the nft for maximum",
                    numberOfBlocks
                )
            )
        );

        require(
            msg.value >= nftRentPrice[contractId][tokenId] * numberOfBlocks,
            string(
                abi.encodePacked(
                    "Renting: You should pay at least ",
                    nftRentPrice[contractId][tokenId],
                    " per block"
                )
            )
        );

        require(
            contracts[contractId].isApprovedSettingOperator(
                address(this),
                tokenId
            ),
            "Renting: Contract is not approved for setting operator for given token"
        );

        contracts[contractId].setOperator(msg.sender, tokenId, numberOfBlocks);
        balance[contracts[contractId].ownerOf(tokenId)] += msg.value;
    }

    /**
     * @dev Removes the operator of the `contractId`, `tokenId`
     */
    function removeRenterFromBeingOperator(uint256 contractId, uint256 tokenId)
        external
    {
        contracts[contractId].removeOperator(tokenId);
    }

    /**
     * @dev Returns the wei balance of addr in contract
     */
    function rentBalance(address addr) external view returns (uint256) {
        return balance[addr];
    }

    /**
     * @dev Collects owner rent from contract
     */
    function collectRent() external {
        uint256 sum = balance[msg.sender];
        balance[msg.sender] = 0;
        (bool success, ) = msg.sender.call{value: sum}("");
        require(success, "Renting: Transfer failed");
    }
}
