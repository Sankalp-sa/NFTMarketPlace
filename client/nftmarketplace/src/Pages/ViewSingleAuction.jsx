import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { readContract, writeContract } from '@wagmi/core'
import { config } from '../../config'
import { AuctionContractABI, AuctionContractAddress, NFTMarketPlaceABI, NFTMarketPlaceAddress } from '../Context/constants'
import { calculateTimeLeft } from '../Utils/CalculateTime'
import Navbar from '../Components/Navbar'
import { useNFTMarketPlace } from '../Context/NFTMarketPlaceContext'
import { useBalance } from 'wagmi'
import { ethers } from 'ethers'
import Swal from 'sweetalert2'


export default function ViewSingleAuction() {

  const { auctionId } = useParams()
  const { address } = useNFTMarketPlace()
  const [loading, setLoading] = useState(true)
  const balance = useBalance({
    address: address,
    config
  })

  const [auction, setAuction] = useState(null)
  const [bidPrice, setBidPrice] = useState(0);

  const fetchAuction = async (nftAuctionId) => {

    let res = await readContract(config, {
      abi: AuctionContractABI,
      address: AuctionContractAddress,
      functionName: 'getAuction',
      args: [nftAuctionId],
    });

    const nft = await readContract(config, {
      abi: NFTMarketPlaceABI,
      address: NFTMarketPlaceAddress,
      functionName: 'getMarketItem',
      args: [res.tokenId],
    })

    const tokenURI = await readContract(config, {
      abi: NFTMarketPlaceABI,
      address: NFTMarketPlaceAddress,
      functionName: 'tokenURI',
      args: [res.tokenId],
    })


    const IpfsHash = tokenURI.split('/ipfs/')[1]

    // console.log(IpfsHash)

    const image = await fetch(
      `https://api.pinata.cloud/data/pinList?hashContains=${IpfsHash}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_PINATA_JWT}`,
        },
      }
    );
    // console.log(nftName, nftDescription)

    const nftData = await image.json();
    console.log("nftData")
    console.log(nftData)

    res = {
      ...res, tokenURI, price: nft.price, seller: nft.seller, name: nftData?.rows[0]?.metadata?.keyvalues?.nftName,
      description: nftData?.rows[0]?.metadata?.keyvalues?.description
    };

    console.log(res)
    setAuction(res);
    setLoading(false);
  }

  useEffect(() => {
    fetchAuction(auctionId)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      // Update time left for each auction
      setAuction({ ...auction, timeLeft: calculateTimeLeft(auction?.endTime) });
    }, 1000);

    return () => clearInterval(interval);
  }, [auction]);

  const handlePlaceBid = async () => {

    const bidAmountInEthers = ethers.parseUnits(bidPrice.toString(), "ether")

    let res = await writeContract(config, {
      abi: AuctionContractABI,
      address: AuctionContractAddress,
      functionName: 'placeBid',
      args: [auction.tokenId],
      account: address,
      value: bidAmountInEthers
    });

    console.log("BidPlace ", res)

    Swal.fire({
      title: 'Bid Placed',
      icon: 'success',
      confirmButtonText: 'Ok'
    }).then(() => {

    fetchAuction(auctionId)

    });

  }

  const handleBidInputChange = (e) => {
    setBidPrice(e.target.value);
  };

  const handleEndAuction = async () => {

    console.log(auction.tokenId)

    Swal.fire({
      title: 'Are you sure you want to end the auction?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No'
    }).then(async (result) => {

      if(result.isDismissed) return;

      const res = await writeContract(config, {
        abi: AuctionContractABI,
        address: AuctionContractAddress,
        functionName: 'endAuction',
        args: [auction.tokenId],
        account: address
      });
  
      console.log(res)
  
      Swal.fire({
        title: 'Auction Ended',
        icon: 'success',
        confirmButtonText: 'Ok'
      });


      fetchAuction(auctionId)

    });

  }

  return (
    <div>
      <Navbar />
      <div className="container mt-5">
        <h2>Auction Details</h2>
        {!loading ? (
          <>
            <div className="row mt-5">
              <div className="col-md-4">
                <img src={`${auction?.tokenURI}`} alt="Auction Image" className="img-fluid rounded rounded-3" />
              </div>
              <div className="col-md-8">
                <div className="card mb-3">
                  <div className="card-body">
                    <h2 className="card-title">{auction?.name}</h2>
                    <p className="card-text">{auction?.description}</p>
                    <h5 className="card-title">Auction ID: {Number(auction?.tokenId)}</h5>
                    <h5 className='card-text'> Time Left: {calculateTimeLeft(auction?.endTime).days} days {calculateTimeLeft(auction.endTime).hours} hours {calculateTimeLeft(auction.endTime).minutes} minutes {calculateTimeLeft(auction.endTime).seconds} seconds
                    </h5>
                    <p className="card-text">Highest Bid: {ethers.formatEther(auction?.highestBid)} ETH</p>
                    <p className="card-text">Minimum Bid Increment: {Number(auction?.minBidIncrement)}</p>
                    <p className="card-text">Base Bid: {Number(auction?.baseBid)}</p>
                    <p className="card-text">Highest Bidder: {auction?.highestBidder === "0x0000000000000000000000000000000000000000" ? "No Bids yet" : auction?.highestBidder}</p>
                    <p className="card-text">Ended: {auction?.ended ? 'Yes' : 'No'}</p>

                    {auction?.ended === true ? <p className='text-info'>Auction Ended</p> :
                      address === auction.seller ? <button className="btn btn-danger" onClick={handleEndAuction}>End Auction</button> :
                        <button className='btn btn-dark' data-bs-toggle="modal" data-bs-target="#bidModal">Place bid</button>
                    }

                  </div>
                </div>
                <div className="card">
                  <div className="card-body">
                    <h5 className="card-title">Bid History</h5>
                    <ul className="list-group">
                      {auction?.bids?.map((bid, index) => (
                        <li key={index} className="list-group-item">
                          <p>Bidder: {bid?.bidder}</p>
                          <p>Amount: {ethers.formatEther(bid?.amount)}</p>
                          <p>Timestamp: {new Date(Number(bid?.timestamp) * 1000).toLocaleString()}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            {/* Modal */}
            <div className="modal fade" id='bidModal' tabIndex="-1" role="dialog">
              <div className="modal-dialog modal-lg" role="document">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Place Bid</h5>
                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                  </div>
                  <div className="modal-body">
                    {/* Part 1 */}
                    <div className="row mb-3">
                      <div className="col-4">
                        <img src={`${auction?.tokenURI}`} alt="NFT Image" className="img-fluid" />
                      </div>
                      <div className="col-8">
                        <p>Name: {auction?.name}</p>
                        <p>Seller: {auction?.seller}</p>
                      </div>
                    </div>
                    {/* Part 2 */}
                    <div className="p-3 border mb-3 shadow rounded rounded-3">
                      <p>User Balance: {balance?.data?.formatted} ETH</p>
                      <p>Price of NFT: {ethers.formatEther(auction?.price)} ETH</p>
                    </div>
                    {/* Part 3 */}
                    <div className="mb-3">
                      <label htmlFor="bidPrice" className="form-label">Enter Bid Amount (ETH)</label>
                      <input type="number" className="form-control" id="bidPrice" value={bidPrice} onChange={handleBidInputChange} />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    <button type="button" className="btn btn-dark" onClick={handlePlaceBid} data-bs-dismiss="modal">Submit Bid</button>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </div>
  )
}
