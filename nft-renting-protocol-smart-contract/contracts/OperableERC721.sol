// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "./IOperable.sol";

contract OperableERC721 is ERC721, IOperable {
    // Mapping from token ID to operator address
    mapping(uint256 => address) private operators;

    // Mapping operator address to token count
    mapping(address => uint256) private operatorBalance;

    constructor(string memory name, string memory symbol)
        ERC721(name, symbol)
    {}

    /**
     * @dev See {IOperable-operatorOf}
     */
    function operatorOf(uint256 tokenId)
        public
        view
        virtual
        override
        returns (address operator)
    {
        address _operator = operators[tokenId];

        require(
            _operator != address(0),
            "OperableERC721: operator query for nonexistent token"
        );

        return _operator;
    }

    /**
     * @dev See {IOperable-operatingBalance}
     */
    function operatingBalance(address operator)
        public
        view
        virtual
        override
        returns (uint256 balance)
    {
        return operatorBalance[operator];
    }

    /**
     * @dev See {IOperable-setOperator}
     */
    function setOperator(uint256 tokenId, address operator)
        public
        virtual
        override
    {
        require(
            _isApprovedOrOwner(_msgSender(), tokenId),
            "OperableERC721: setOperator caller is not owner nor approved"
        );

        _setOperator(tokenId, operator);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override(ERC721) {
        super._beforeTokenTransfer(from, to, tokenId);

        _setOperator(tokenId, to);
    }

    /**
     * @dev Set`tokenId` operator to `to`
     *
     * Emits a {OperatorChanged} event.
     */
    function _setOperator(uint256 tokenId, address operator) internal virtual {
        operators[tokenId] = operator;
        emit OperatorChanged(tokenId, operator);
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC721, IERC165)
        returns (bool)
    {
        return
            interfaceId == type(IOperable).interfaceId ||
            super.supportsInterface(interfaceId);
    }
}
