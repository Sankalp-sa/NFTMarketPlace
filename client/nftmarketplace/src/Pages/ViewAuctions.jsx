import React, { useEffect, useState } from 'react'
import Navbar from '../Components/Navbar'
import { readContract, writeContract } from '@wagmi/core'
import { config } from '../../config'
import { AuctionContractABI, AuctionContractAddress, NFTMarketPlaceABI, NFTMarketPlaceAddress } from '../Context/constants'
import { useNFTMarketPlace } from '../Context/NFTMarketPlaceContext'
import { useNavigate } from 'react-router-dom'
import { calculateTimeLeft } from '../Utils/CalculateTime'

export default function ViewAuctions() {

    const [auctions, setAuctions] = useState([])

    const { address } = useNFTMarketPlace()

    const navigate = useNavigate()

    const fetchAuctionNFTs = async () => {

        let res = await readContract(config, {
            abi: AuctionContractABI,
            address: AuctionContractAddress,
            functionName: 'getAllRunningAuctions',
            args: [],
        })

        console.log(res)

        for (let i = 0; i < res.length; i++) {

            const nft = await readContract(config, {
                abi: NFTMarketPlaceABI,
                address: NFTMarketPlaceAddress,
                functionName: 'getMarketItem',
                args: [res[i].tokenId],
            })

            const tokenURI = await readContract(config, {
                abi: NFTMarketPlaceABI,
                address: NFTMarketPlaceAddress,
                functionName: 'tokenURI',
                args: [res[i].tokenId],
            })

            console.log(nft)
            console.log(tokenURI)

            res[i] = { ...res[i], nft, tokenURI }
        }

        console.log(res)

        setAuctions(res)
    }

    useEffect(() => {
        const interval = setInterval(() => {
            // Update time left for each auction
            setAuctions(prevAuctions =>
                prevAuctions.map(auction => ({
                    ...auction,
                    timeLeft: calculateTimeLeft(auction.endTime)
                }))
            );
        }, 1000);

        return () => clearInterval(interval);
    }, []);


    useEffect(() => {
        fetchAuctionNFTs()
    }, [])

    return (
        <div>
            <Navbar />
            <h1>View Auction</h1>
            <div className="container mt-5">
                <h2>Currently Running Auctions</h2>
                <div className="row">
                    {auctions.map(auction => (
                        <div className="col-md-4 mb-4" key={auction.nft.tokenId}>
                            <div className="card">
                                <img src={auction.tokenURI} className="card-img-top" alt="..." />
                                <div className="card-body">
                                    <h5 className="card-title">{auction.nft.seller}</h5>
                                    <p className="card-text">
                                        Time Left: {calculateTimeLeft(auction.endTime).days} days {calculateTimeLeft(auction.endTime).hours} hours {calculateTimeLeft(auction.endTime).minutes} minutes {calculateTimeLeft(auction.endTime).seconds} seconds
                                    </p>
                                    { address == auction.nft.seller ? <button className="btn btn-dark" onClick={() => navigate(`/viewAuction/${auction.nft.tokenId}`)}>Edit Auction</button> : 
                                    <button className="btn btn-dark" onClick={() => navigate(`/viewAuction/${auction.nft.tokenId}`)} >Place Bid</button> }
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    )
}
