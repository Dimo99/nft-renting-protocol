// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import "./IOperable.sol";
import "./IFlashRenter.sol";

contract RentingPool is ERC721Holder {
    event AddNft(
        address indexed nftAddress,
        uint256 indexed nftId,
        uint256 flashFee,
        uint256 pricePerBlock,
        uint256 maxLongTermBlocks
    );

    event EditNft(
        address indexed nftAddress,
        uint256 indexed nftId,
        uint256 flashFee,
        uint256 pricePerBlock,
        uint256 maxLongTermBlocks
    );

    event RemoveNft(address indexed nftAddress, uint256 indexed nftId);

    event WithdrawEarnings(address indexed initiator, uint256 earnings);

    event FlashLoan(
        address indexed nftAddress,
        uint256 indexed nftId,
        address indexed initiator
    );

    event LongTermRent(
        address indexed nftAddress,
        uint256 indexed nftId,
        uint256 blocks,
        address indexed retner
    );

    event TokenOperatorSet(
        address indexed nftAddress,
        uint256 indexed nftId,
        address indexed operator
    );

    struct Key {
        address nftAddress;
        uint256 nftId;
    }

    struct PoolNFT {
        address originalOwner;
        address operator;
        uint256 flashFee;
        uint256 pricePerBlock;
        uint256 maxLongTermBlocks;
        uint256 rentedUntil;
        bool isRentable;
        uint256 index;
    }

    // Mapping from NFT to details
    mapping(address => mapping(uint256 => PoolNFT)) private poolNft;

    // Array for enumarating the NFT collection
    Key[] private poolIndex;

    // Mapping of earnings of each user of the pool
    mapping(address => uint256) private earnings;

    mapping(address => uint256) private ownerNFTCount;

    /**
     * @dev Add your NFT to the pool
     * @param nftAddress - The address of NFT contract
     * @param nftId - Id of the NFT token you want to add
     * @param flashFee - The fee user has to pay for a single flash loan
     * @param pricePerBlock - The price per block for long term renting
     * @param maxLongTermBlocks - Maximum amount of blocks for longterm rent
     * Requirements:
     *
     * - Caller should be owner of the nft
     * Emits an {AddNft} event.
     */
    function addNft(
        address nftAddress,
        uint256 nftId,
        uint256 flashFee,
        uint256 pricePerBlock,
        uint256 maxLongTermBlocks
    ) external {
        IERC721(nftAddress).safeTransferFrom(msg.sender, address(this), nftId);

        bool isRentable = IERC165(nftAddress).supportsInterface(
            type(IOperable).interfaceId
        );

        uint256 index = poolIndex.length;

        poolNft[nftAddress][nftId] = PoolNFT(
            msg.sender,
            msg.sender,
            flashFee,
            pricePerBlock,
            maxLongTermBlocks,
            0,
            isRentable,
            index
        );

        poolIndex.push(Key(nftAddress, nftId));

        ownerNFTCount[msg.sender]++;

        // When the token is transfered the protocol becomes the operator
        if (isRentable) {
            IOperable(nftAddress).setOperator(nftId, msg.sender);
        }

        emit AddNft(
            nftAddress,
            nftId,
            flashFee,
            pricePerBlock,
            maxLongTermBlocks
        );
    }

    /**
     * @dev Edit your NFT prices
     *
     * @param nftAddress - The address of NFT contract
     * @param nftId - Id of the NFT token you have in the pool
     * @param flashFee - The fee user has to pay for a flash loan
     * @param pricePerBlock - The price per block for long term renting
     * @param maxLongTermBlocks - Maximum amount of blocks for longterm rent
     * Requirements:
     *
     * - Caller should be originalOwner of the nft
     * Emits an {EditNft} event.
     */
    function editNft(
        address nftAddress,
        uint256 nftId,
        uint256 flashFee,
        uint256 pricePerBlock,
        uint256 maxLongTermBlocks
    ) external {
        PoolNFT storage nft = poolNft[nftAddress][nftId];

        require(
            nft.originalOwner == msg.sender,
            "Caller should be original owner of the nft"
        );

        nft.flashFee = flashFee;
        nft.pricePerBlock = pricePerBlock;
        nft.maxLongTermBlocks = maxLongTermBlocks;

        emit EditNft(
            nftAddress,
            nftId,
            flashFee,
            pricePerBlock,
            maxLongTermBlocks
        );
    }

    /**
     * @dev Remove your NFT from the pool
     *
     * @param nftAddress - The address of NFT contract
     * @param nftId - Id of the NFT token you have in the pool
     * Requirements:
     *
     * - Caller should be originalOwner of the nft
     * Emits an {RemoveNft} event.
     */
    function removeNft(address nftAddress, uint256 nftId) external {
        PoolNFT storage nft = poolNft[nftAddress][nftId];

        require(
            nft.originalOwner == msg.sender,
            "Caller should be original owner of the nft"
        );

        require(
            nft.rentedUntil < block.number,
            "Can't remove nft from the pool while it is rented"
        );

        uint256 nftToDelete = poolNft[nftAddress][nftId].index;
        Key storage keyToMove = poolIndex[poolIndex.length - 1];
        poolIndex[nftToDelete] = keyToMove;
        poolNft[keyToMove.nftAddress][keyToMove.nftId].index = nftToDelete;
        poolIndex.pop();
        delete poolNft[nftAddress][nftId];

        ownerNFTCount[msg.sender]--;

        IERC721(nftAddress).safeTransferFrom(address(this), msg.sender, nftId);

        emit RemoveNft(nftAddress, nftId);
    }

    /**
     * @dev Withdraw earnings of your NFT
     *
     * Emits an {EditNft} event.
     */
    function withdrawEarnings() external {
        uint256 transferAmount = earnings[msg.sender];
        earnings[msg.sender] = 0;

        (bool success, ) = msg.sender.call{value: transferAmount}("");
        require(success, "Transfer failed");

        emit WithdrawEarnings(msg.sender, transferAmount);
    }

    /**
     * @dev Execute a Flashloan of NFT
     * @param nftAddress - The address of NFT contract
     * @param nftId - Id of the NFT token you want to flashloan
     * @param receiverAddress - the contract that will receive the NFT (has to implement IFlashRenter interface)
     * @param data - calldata that will be passed to the receiver contract (optional)
     * Requirments:
     *
     * - you are operator or flashFee is sent
     * Emits a {FlashLoan} event
     */
    function flashLoan(
        address nftAddress,
        uint256 nftId,
        address receiverAddress,
        bytes calldata data
    ) external payable {
        PoolNFT storage nft = poolNft[nftAddress][nftId];

        bool isRented = nft.rentedUntil >= block.number;

        if (isRented) {
            require(
                nft.operator == msg.sender,
                "This NFT is rented and only the operator can flash loan it"
            );
        }

        uint256 flashFee = nft.operator == msg.sender ? 0 : nft.flashFee;

        require(
            msg.value >= flashFee,
            "You can't take the flashloan for the indicated price"
        );

        IERC721(nftAddress).safeTransferFrom(
            address(this),
            receiverAddress,
            nftId
        );

        if (!isRented && nft.isRentable) {
            IOperable(nftAddress).setOperator(nftId, receiverAddress);
        }

        require(
            IFlashRenter(receiverAddress).onFlashLoan(
                nftAddress,
                nftId,
                flashFee,
                msg.sender,
                data
            ),
            "Error during FlashRenter execution"
        );

        if (!isRented && nft.isRentable) {
            IOperable(nftAddress).setOperator(nftId, nft.operator);
        }

        IERC721(nftAddress).safeTransferFrom(
            receiverAddress,
            address(this),
            nftId
        );

        earnings[nft.originalOwner] += msg.value;

        emit FlashLoan(nftAddress, nftId, msg.sender);
    }

    /**
     * @dev Rent nft for number of blocks
     * @param nftAddress - The address of NFT contract
     * @param nftId - Id of the NFT token you want to rent
     * @param receiverAddress - who is renting the NFT
     * Requirments:
     *
     * - the NFT is not currently rented
     * - you pay the price
     * Emits a {LongTermRent} event
     */
    function rentLong(
        address nftAddress,
        uint256 nftId,
        address receiverAddress,
        uint256 blocks
    ) external payable {
        PoolNFT storage nft = poolNft[nftAddress][nftId];

        require(nft.pricePerBlock > 0, "The nft is not available");

        require(nft.rentedUntil < block.number, "The nft is currently rented");

        require(
            nft.maxLongTermBlocks <= blocks,
            "You can't rent this nft for so long"
        );

        require(
            nft.pricePerBlock * blocks <= msg.value,
            "Payment is not enough"
        );

        nft.operator = receiverAddress;
        nft.rentedUntil = block.number + blocks;

        earnings[nft.originalOwner] += msg.value;

        if (nft.isRentable) {
            IOperable(nftAddress).setOperator(nftId, receiverAddress);
        }

        emit LongTermRent(nftAddress, nftId, blocks, receiverAddress);
    }

    /**
     * @dev Get current nft operator
     * @param nftAddress - The address of NFT contract
     * @param nftId - Id of the NFT token
     */
    function operatorOf(address nftAddress, uint256 nftId)
        external
        view
        returns (address operator)
    {
        return poolNft[nftAddress][nftId].operator;
    }

    /**
     * @dev Set token operator
     * @param nftAddress - The address of NFT contract
     * @param nftId - Id of the NFT token
     * @param operator - who becomes the next operator
     * Requirments:
     *
     * - msg.sender is the original token owner
     * - the nft is not currently rented
     * Emits {TokenOperatorSet} event
     */
    function setTokenOperator(
        address nftAddress,
        uint256 nftId,
        address operator
    ) external {
        PoolNFT storage nft = poolNft[nftAddress][nftId];

        require(
            msg.sender == nft.originalOwner,
            "Caller should be original owner of the nft"
        );

        require(
            nft.rentedUntil < block.number,
            "Can't set operator while token is rented"
        );

        nft.operator = operator;

        if (nft.isRentable) {
            IOperable(nftAddress).setOperator(nftId, operator);
        }

        emit TokenOperatorSet(nftAddress, nftId, operator);
    }

    function ownerNFT(address owner)
        external
        view
        returns (PoolNFT[] memory ids)
    {
        PoolNFT[] memory result = new PoolNFT[](ownerNFTCount[owner]);
        uint256 counter = 0;

        for (uint256 i = 0; i < poolIndex.length; i++) {
            if (
                poolNft[poolIndex[i].nftAddress][poolIndex[i].nftId]
                    .originalOwner == owner
            ) {
                result[counter] = poolNft[poolIndex[i].nftAddress][
                    poolIndex[i].nftId
                ];
                counter++;
            }
        }

        return result;
    }

    function getEarnings(address owner) external view returns (uint256) {
        return earnings[owner];
    }

    function allNFT() external view returns (PoolNFT[] memory ids) {
        PoolNFT[] memory result = new PoolNFT[](poolIndex.length);

        for (uint256 i = 0; i < poolIndex.length; i++) {
            result[i] = poolNft[poolIndex[i].nftAddress][poolIndex[i].nftId];
        }

        return result;
    }
}
