// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/presets/ERC721PresetMinterPauserAutoId.sol";

contract RentableERC721 is ERC721PresetMinterPauserAutoId {
    /**
     * @dev Emitted when `tokenId` is rented to `operator`.
     */
    event TokenRented(uint256 indexed tokenId, address indexed operator);

    /**
     * @dev Emitted when `operator` is removed as operator of `tokenId`.
     */
    event RenterRemoved(uint256 indexed tokenId, address indexed operator);

    // Mapping from tokenId to operatorAddress
    mapping(uint256 => address) operators;

    // Mapping from tokenId to block number the rent is over
    mapping(uint256 => uint256) rentedUntil;

    // Mapping from operator addres to number of tokens operating
    mapping(address => uint256) operatorsBalance;

    // Mapping from tokenId to approve setting operator address
    mapping(uint256 => address) tokenApproveSettingOperator;

    constructor(
        string memory name,
        string memory symbol,
        string memory baseTokenURI
    ) ERC721PresetMinterPauserAutoId(name, symbol, baseTokenURI) {}

    /**
     * @dev Gives permission to `to` to set operator `tokenId`.
     *
     * Only a single account can be approved at a time, so approving the zero address clears previous approvals.
     *
     * Requirements:
     *
     * - The caller must own the token or be an approved operator.
     * - `tokenId` must exist.
     */
    function approveSettingOperator(address to, uint256 tokenId) external {
        require(
            _isApprovedOrOwner(msg.sender, tokenId),
            "Rentable-ERC721: Setting operator can be approved only by owner or approved"
        );
        tokenApproveSettingOperator[tokenId] = to;
    }

    /**
     * @dev Returns if the `addr` is approved setting the operator of `tokenId`.
     */
    function isApprovedSettingOperator(address addr, uint256 tokenId)
        external
        view
        returns (bool)
    {
        return tokenApproveSettingOperator[tokenId] == addr;
    }

    /**
     * @dev Set operator of the current token
     * Requirements:
     *
     * - The `operatorAddress` cannot be the zero address (use removeOperator).
     * - The caller must be ownerOf token or approvedSettingOperator
     * Emits an {TokenRented} event.
     */
    function setOperator(
        address operatorAddress,
        uint256 tokenId,
        uint256 numberOfBlocks
    ) external {
        require(
            ownerOf(tokenId) == msg.sender ||
                tokenApproveSettingOperator[tokenId] == msg.sender,
            "Rentable-ERC721: set operator caller is not owner nor approved"
        );

        require(
            operators[tokenId] == address(0),
            "Rentable-ERC721: token is already rented"
        );

        operators[tokenId] = operatorAddress;
        rentedUntil[tokenId] = block.number + numberOfBlocks;
        operatorsBalance[operatorAddress]++;

        emit TokenRented(tokenId, operatorAddress);
    }

    /**
     * @dev Removes the operator of the current token
     * Requirements:
     *
     * - The caller must be ownerOf token or approvedSettingOperator
     * - The token must be rented
     * - Token rent period must be over
     * Emits an {RenterRemoved} event.
     */
    function removeOperator(uint256 tokenId) external {
        require(
            ownerOf(tokenId) == msg.sender ||
                tokenApproveSettingOperator[tokenId] == msg.sender,
            "Rentable-ERC721: remove operator caller is not owner nor approved"
        );

        require(
            operators[tokenId] != address(0),
            "Rentable-ERC721: token is not rented"
        );

        require(
            rentedUntil[tokenId] < block.number,
            "Rentable-ERC721: cannot remove operator before the rent agreement expires"
        );

        operatorsBalance[operators[tokenId]]--;
        address lastOperator = operators[tokenId];
        operators[tokenId] = address(0);

        emit RenterRemoved(tokenId, lastOperator);
    }

    /**
     * @dev Returns the number of tokens in `operator` operates.
     */
    function balanceOfOperator(address operator)
        external
        view
        returns (uint256)
    {
        return operatorsBalance[operator];
    }

    /**
     * @dev Returns the operator of the `tokenId` token.
     *
     * Requirements:
     *
     * - `tokenId` must exist.
     */
    function operatorOf(uint256 tokenId) external view returns (address) {
        address operator = operators[tokenId];

        require(
            operator != address(0),
            "ERC721: operator query for nonexistent token"
        );

        return operator;
    }
}
