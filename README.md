# nft-renting-protocol
The goal of this project is to create an NFT Renting protocol. In order to create the NFT renting protocol, you'd need to extend the ERC721 standard with functionality to enable the owner to specify renter. When you rent an NFT you become the "operator" of the NFT and other contracts can base their logic on whether or not you are the operator of the NFT.
The protocol should enable a user to input this extended kind of ERC721 into the contracts of the protocol and specify the price per block that they want to accept for this NFT to be rented.
Renters should be able to pay the price of being the operator for certain time (X blocks). Once their rent is over it is the owner's duty to trigger a function that removes the renter from being an operator.
