// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/introspection/IERC165.sol";

interface IOperable is IERC165 {
    event OperatorChanged(uint256 indexed tokenId, address indexed operator);

    /**
     * @dev Returns the operator of the `tokenId` token.
     *
     * Requirements:
     *
     * - `tokenId` must exist.
     */
    function operatorOf(uint256 tokenId)
        external
        view
        returns (address operator);

    /**
     * @dev Returns the number of tokens `operator` operates.
     */
    function operatingBalance(address operator)
        external
        view
        returns (uint256 balance);

    /**
     * @dev Sets operator to `tokenId`
     *
     * The operator is automatically set to owner when token is transfered
     *
     * Requirements:
     *
     * - The caller must own the token or be an approved operator.
     * - `tokenId` must exist.
     *
     * Emits an {OperatorChanged} event.
     */
    function setOperator(uint256 tokenId, address operator) external;
}
