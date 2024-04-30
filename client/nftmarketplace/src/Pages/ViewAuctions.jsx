import React, { useEffect, useState } from 'react'
import Navbar from '../Components/Navbar'
import { readContract, writeContract } from '@wagmi/core'
import { config } from '../../config'
import { AuctionContractABI, AuctionContractAddress, NFTMarketPlaceABI, NFTMarketPlaceAddress } from '../Context/constants'

export default function ViewAuctions() {

    const [auctions, setAuctions] = useState([])

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

            console.log(nft)

            res[i] = {...res[i], nft}
        }

        console.log(res)

        setAuctions(res)
    }

    const calculateTimeLeft = (endTime) => {
        const difference = new Date(Number(endTime) * 1000) - new Date();
        let timeLeft = {};

        if (difference > 0) {
            const totalSeconds = Math.floor(difference / 1000);
            timeLeft = {
                days: Math.floor(totalSeconds / (3600 * 24)),
                hours: Math.floor((totalSeconds % (3600 * 24)) / 3600),
                minutes: Math.floor((totalSeconds % 3600) / 60),
                seconds: Math.floor(totalSeconds % 60),
            };
        }

        return timeLeft;
    };

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
                                <div className="card-body">s
                                    <h5 className="card-title">{auction.nft.seller}</h5>
                                    <p className="card-text">
                                        Time Left: {calculateTimeLeft(auction.endTime).days} days {calculateTimeLeft(auction.endTime).hours} hours {calculateTimeLeft(auction.endTime).minutes} minutes
                                    </p>
                                    <button className="btn btn-primary">Place Bid</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    )
}
