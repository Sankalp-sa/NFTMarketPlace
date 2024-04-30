// SPDX-License-Identifier: MIT
pragma solidity >=0.6.12 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

import "hardhat/console.sol";

contract NFTMarketPlace is ERC721URIStorage {
    uint256 private _tokenIds;
    uint256 private _itemsSold;
    // uint256 private _auctionCnt;

    uint256 listingPrice = 0.025 ether;
    address payable owner;

    mapping(uint256 => MarketItem) public idToMarketItem;
    mapping(uint256 => string[]) public tokenTraits;

    event MarketItemCreated(
        uint256 indexed tokenId,
        address seller,
        address owner,
        uint256 price,
        bool sold
    );

    //create mapping to store the collection, with other more details like nftIds array, name, and other values
    mapping(uint256 => Collection) public collections;

    uint256 private totCollections;

    //structure of collection of all NFTs
    struct Collection {
        string name;
        string description;
        address creator;
        uint256[] nftIds;
        uint256 collectionId;
    }

    struct MarketItem {
        uint256 tokenId;
        address payable seller;
        address payable owner;
        uint256 price;
        bool sold;
    }

    constructor() ERC721("Metaverse Tokens", "METT") {
        owner = payable(msg.sender);
    }

    /* Updates the listing price of the contract */
    // function updateListingPrice(uint256 _listingPrice) public payable {
    //     require(
    //         owner == msg.sender,
    //         "Only marketplace owner can update listing price."
    //     );
    //     listingPrice = _listingPrice;
    // }

    /* Returns the listing price of the contract */
    function getListingPrice() public view returns (uint256) {
        return listingPrice;
    }

    /* Mints a token and lists it in the marketplace */
    function createToken(
        string memory tokenURI,
        uint256 price,
        string[] memory traits
    ) public payable returns (uint256) {
        _tokenIds++;
        uint256 newTokenId = _tokenIds;

        _mint(msg.sender, newTokenId);
        tokenTraits[newTokenId] = traits;
        _setTokenURI(newTokenId, tokenURI);
        createMarketItem(newTokenId, price);
        return newTokenId;
    }

    function getTraits(uint256 tokenId) public view returns (string[] memory) {
        string[] memory traits = tokenTraits[tokenId];
        string[] memory traitStrings = new string[](traits.length);

        for (uint256 i = 0; i < traits.length; i++) {
            traitStrings[i] = string(abi.encodePacked(traits[i]));
            console.log(traitStrings[i]);
        }

        return traitStrings;
    }

    function createMarketItem(uint256 tokenId, uint256 price) private {
        console.log(msg.value);
        console.log(msg.sender);
        console.log(listingPrice);
        console.log(address(this));

        require(price > 0, "Price must be at least 1 wei");
        require(
            msg.value == listingPrice,
            "Price must be equal to listing price"
        );

        idToMarketItem[tokenId] = MarketItem(
            tokenId,
            payable(msg.sender),
            payable(address(this)),
            price,
            false
        );

        _transfer(msg.sender, address(this), tokenId);
        emit MarketItemCreated(
            tokenId,
            msg.sender,
            address(this),
            price,
            false
        );
    }

    /* allows someone to resell a token they have purchased */
    function resellToken(uint256 tokenId, uint256 price) public payable {
        require(
            idToMarketItem[tokenId].owner == msg.sender,
            "Only item owner can perform this operation"
        );
        require(
            msg.value == listingPrice,
            "Price must be equal to listing price"
        );
        idToMarketItem[tokenId].sold = false;
        idToMarketItem[tokenId].price = price;
        idToMarketItem[tokenId].seller = payable(msg.sender);
        idToMarketItem[tokenId].owner = payable(address(this));
        _itemsSold--;

        _transfer(msg.sender, address(this), tokenId);
    }

    /* Creates the sale of a marketplace item */
    /* Transfers ownership of the item, as well as funds between parties */
    function createMarketSale(uint256 tokenId) public payable {
        console.log(msg.sender);
        console.log(msg.value);

        uint256 price = idToMarketItem[tokenId].price;

        address payable seller = payable(idToMarketItem[tokenId].seller);

        console.log(price);

        require(
            msg.value == price,
            "Please submit the asking price in order to complete the purchase"
        );
        idToMarketItem[tokenId].owner = payable(msg.sender);
        idToMarketItem[tokenId].sold = true;
        idToMarketItem[tokenId].seller = payable(address(0));
        _itemsSold++;
        _transfer(address(this), msg.sender, tokenId);
        (bool sent1, ) = owner.call{value: listingPrice}("");
        console.log("seller", seller);
        console.log("msg.value", msg.value);
        (bool sent, ) = seller.call{value: msg.value}("");
    }

    /* Returns all unsold market items */
    function fetchMarketItems() public view returns (MarketItem[] memory) {
        uint256 itemCount = _tokenIds;
        uint256 unsoldItemCount = _tokenIds - _itemsSold;
        uint256 currentIndex = 0;

        MarketItem[] memory items = new MarketItem[](unsoldItemCount);
        for (uint256 i = 0; i < itemCount; i++) {
            if (idToMarketItem[i + 1].owner == address(this)) {
                uint256 currentId = i + 1;
                MarketItem storage currentItem = idToMarketItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }

    /* Returns only items that a user has purchased */
    function fetchMyNFTs() public view returns (MarketItem[] memory) {
        uint256 totalItemCount = _tokenIds;
        uint256 itemCount = 0;
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].owner == msg.sender) {
                itemCount += 1;
            }
        }

        MarketItem[] memory items = new MarketItem[](itemCount);
        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].owner == msg.sender) {
                uint256 currentId = i + 1;
                MarketItem storage currentItem = idToMarketItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }

    /* Returns only items a user has listed */
    function fetchItemsListed() public view returns (MarketItem[] memory) {
        uint256 totalItemCount = _tokenIds;
        uint256 itemCount = 0;
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].seller == msg.sender) {
                itemCount += 1;
            }
        }

        MarketItem[] memory items = new MarketItem[](itemCount);
        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].seller == msg.sender) {
                uint256 currentId = i + 1;
                MarketItem storage currentItem = idToMarketItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }

    // get a specific NFT
    // function getNFT(
    //     uint256 tokenId
    // )
    //     public
    //     view
    //     returns (uint256 _tokenId, address _owner, uint256 price, bool sold)
    // {
    //     MarketItem storage item = idToMarketItem[tokenId];
    //     require(
    //         item.owner != address(0),
    //         "NFT with the given tokenId does not exist"
    //     );

    //     return (item.tokenId, item.owner, item.price, item.sold);
    // }

    function getMarketItem(uint256 tokenId) public view returns (MarketItem memory) {
        return idToMarketItem[tokenId];
    }

    //parv code
    function createCollection(
        string memory name,
        string memory description
    ) public {
        uint256 collectionId = totCollections + 1;
        Collection memory newCollection = Collection(
            name,
            description,
            msg.sender,
            new uint256[](0),
            collectionId
        );
        collections[collectionId] = newCollection;
        emit CollectionCreated(collectionId, name, description, msg.sender);
        totCollections++;
    }

    function addToCollection(uint256 collectionId, uint256 nftId) public {
        require(collectionId <= totCollections, "Collection does not exist");
        collections[collectionId].nftIds.push(nftId);
        emit NFTAddedToCollection(collectionId, nftId);
    }

    function getCollection(
        uint256 collectionId
    ) public view returns (Collection memory) {
        require(collectionId <= totCollections, "Collection does not exist");
        return collections[collectionId];
    }

    function getNFTsInCollection(
        uint256 collectionId
    ) public view returns (uint256[] memory) {
        require(collectionId <= totCollections, "Collection does not exist");
        return collections[collectionId].nftIds;
    }

    function getAllCollections() public view returns (Collection[] memory) {
        Collection[] memory allCollections = new Collection[](totCollections);
        for (uint256 i = 1; i <= totCollections; i++) {
            allCollections[i - 1] = collections[i];
        }
        return allCollections;
    }

    function getMyCollections() public view returns (Collection[] memory) {
        uint256 total = 0;

        // First, determine how many collections were created by the sender
        for (uint256 i = 1; i <= totCollections; i++) {
            if (collections[i].creator == msg.sender) {
                total++;
            }
        }
        // Initialize an array of collections of the determined size
        Collection[] memory myCollections = new Collection[](total);
        uint256 currentIndex = 0;

        // Populate the array with the sender's collections
        for (uint256 i = 1; i <= totCollections; i++) {
            if (collections[i].creator == msg.sender) {
                myCollections[currentIndex] = collections[i];
                currentIndex++;
            }
        }
        return myCollections;
    }

    event CollectionCreated(
        uint256 indexed collectionId,
        string name,
        string description,
        address creator
    );
    event NFTAddedToCollection(uint256 indexed collectionId, uint256 nftId);
}

contract AuctionContract is ERC721URIStorage {
    NFTMarketPlace nftContract;

    constructor(
        address _nftContractAddress
    ) ERC721("Metaverse Tokens", "METT") {
        nftContract = NFTMarketPlace(_nftContractAddress);
    }

    struct MarketItem {
        uint256 tokenId;
        address payable seller;
        address payable owner;
        uint256 price;
        bool sold;
    }

    uint256 private _auctionCnt;

    mapping(uint256 => Auction) private auctions;

    event BidPlaced(uint256 indexed tokenId, address bidder, uint256 amount);
    event AuctionEnded(uint256 indexed tokenId, address winner, uint256 amount);

    struct Auction {
        uint256 tokenId;
        uint256 startTime;
        uint256 endTime;
        uint256 highestBid;
        uint256 minBidIncrement;
        uint256 baseBid;
        address payable highestBidder;
        bool ended; // Array to store bid history containing bidder address, bid amount, and time
        // Bid history array to store bidder address, bid amount, and timestamp
        Bid[] bids;
    }

    struct Bid {
        address payable bidder;
        uint256 amount;
        uint256 timestamp;
    }

    function startAuction(
        uint256 _tokenId,
        uint256 _duration,
        uint256 _minBidIncrement,
        uint256 _baseBid
    ) public {
        require(
            nftContract.getMarketItem(_tokenId).seller == msg.sender,
            "Only the owner can start an auction"
        );
        uint256 startTime = block.timestamp;
        uint256 endTime = startTime + _duration;
        // Bid[] memory bidArray;

        Auction storage auc = auctions[_tokenId];

        auc.tokenId = _tokenId;
        auc.startTime = startTime;
        auc.endTime = endTime;
        auc.minBidIncrement = _minBidIncrement;
        auc.baseBid = _baseBid;
        auc.ended = false;
        auc.highestBidder = payable(address(0));

        _auctionCnt++;

        // return auctions[_auctionCnt];
        // emit AuctionStarted(tokenId, msg.sender, startTime, endTime, minBidIncrement);
    }

    function getAuction(
        uint256 auctionId
    )
        public
        view
        returns (
            uint256 tokenId,
            uint256 startTime,
            uint256 endTime,
            uint256 highestBid,
            address payable highestBidder,
            uint256 minBidIncrement,
            bool ended
        )
    {
        Auction memory auction = auctions[auctionId];
        // require(auction.endTime != 0, "Auction with the given ID does not exist");
        return (
            auction.tokenId,
            auction.startTime,
            auction.endTime,
            auction.highestBid,
            auction.highestBidder,
            auction.minBidIncrement,
            auction.ended
        );
    }

    function getAllRunningAuctions() public view returns (Auction[] memory) {
        Auction[] memory runningAuctions = new Auction[](_auctionCnt);
        uint256 count = 0;

        for (uint256 i = 1; i <= _auctionCnt; i++) {
            // if (!auctions[i].ended && auctions[i].endTime > block.timestamp) {
            runningAuctions[count] = auctions[i];
            count++;
            // }
        }

        Auction[] memory result = new Auction[](count);
        for (uint256 j = 0; j < count; j++) {
            result[j] = runningAuctions[j];
            //console.log(result[j]);
        }

        return result;
    }

    function placeBid(uint256 tokenId) public payable {
        // console.log(block.timestamp);
        // console.log(auctions[tokenId].startTime);
        Auction storage auction = auctions[tokenId];

        require(
            auction.startTime < block.timestamp,
            "Auction has not started yet"
        );
        require(!auction.ended, "Auction has ended");
        require(
            msg.value >= auctions[tokenId].baseBid,
            "Bid must be greater than or equal to the base bid"
        );
        require(
            msg.value >=
                auctions[tokenId].highestBid +
                    auctions[tokenId].minBidIncrement,
            "Bid must be higher than current highest bid plus minimum bid increment"
        );

        // Refund previous bidder
        if (auction.highestBidder != address(0)) {
            auction.highestBidder.transfer(auction.highestBid);
        }

        auction.highestBid = msg.value;
        auction.highestBidder = payable(msg.sender);
        auction.bids.push(Bid(payable(msg.sender), msg.value, block.timestamp));

        emit BidPlaced(tokenId, msg.sender, msg.value);
    }

    function getBidHistory(
        uint256 auctionId
    ) public view returns (Bid[] memory) {
        return auctions[auctionId].bids;
    }

    function endAuction(uint256 tokenId) public {
        // require(auctions[tokenId].endTime < block.timestamp, "Auction has not ended yet");
        require(!auctions[tokenId].ended, "Auction has already ended");
        require(
            msg.sender == nftContract.getMarketItem(tokenId).seller,
            "Only the seller can end the auction"
        );

        Auction storage auction = auctions[tokenId];
        auction.ended = true;

        // Transfer the token to the highest bidder
        _transfer(
            nftContract.getMarketItem(tokenId).owner,
            auction.highestBidder,
            tokenId
        );

        // Transfer the bid amount to the seller
        uint256 bidAmount = auction.highestBid;
        // idToMarketItem[tokenId].owner.transfer(bidAmount);
        (bool sent1, ) = nftContract.getMarketItem(tokenId).owner.call{
            value: bidAmount
        }("");

        // Emit the AuctionEnded event
        emit AuctionEnded(tokenId, auction.highestBidder, bidAmount);
    }
}
