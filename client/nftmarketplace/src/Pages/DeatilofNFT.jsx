import React, { useEffect, useState } from 'react'
import { readContract, writeContract } from '@wagmi/core';
import { config } from '../../config';
import { NFTMarketPlaceABI, NFTMarketPlaceAddress } from '../Context/constants';
import { useNavigate, useParams } from 'react-router-dom';
import { ethers } from 'ethers';
import Navbar from '../Components/Navbar';

const DeatilofNFT = () => {

    const { nftId } = useParams();
    const [nft, setnft] = useState();

    const navigate = useNavigate();

    const fetchABCNFT = async () => {

        let nftMarketData = await readContract(config, {
            abi: NFTMarketPlaceABI,
            address: NFTMarketPlaceAddress,
            functionName: 'getMarketItem',
            args: [nftId]
        });
        // console.log("NFTs Data: ");
        // console.log(nftMarketData);

        const tokenURI = await readContract(config, {
            abi: NFTMarketPlaceABI,
            address: NFTMarketPlaceAddress,
            functionName: 'tokenURI',
            args: [nftId],
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
        // console.log("nftData")
        // console.log(nftData)

        nftMarketData = {
            ...nftMarketData, tokenURI, name: nftData?.rows[0]?.metadata?.keyvalues?.nftName,
            description: nftData?.rows[0]?.metadata?.keyvalues?.description
        };

        // console.log(nftMarketData);
        setnft(nftMarketData);
    }

    useEffect(() => {
        fetchABCNFT();
    }, []);

    const handleBuyNFT = async (tokenId, price) => {

        try {
            const res = await writeContract(config, {
                address: NFTMarketPlaceAddress,
                abi: NFTMarketPlaceABI,
                functionName: 'createMarketSale',
                args: [tokenId],
                value: price
            });

            navigate('/myNFT');
        }
        catch (error) {
            console.log(error)
        }
    }


    if (!nft) {
        return <div className="container mt-5">Loading...</div>;
    }

    return (
        <>
            <Navbar />
            <div className="container mt-5">
                <div className="row">
                    <div className="col-md-6">
                        <img src={nft?.tokenURI} alt="NFT" className="img-fluid" />
                    </div>
                    <div className="col-md-6">
                        <h3>{nft?.name}</h3>
                        <p className="text-muted">{nft?.description}</p>
                        <h5>Price: {ethers.formatEther(nft?.price)} ETH</h5>
                        <button className="btn btn-primary"
                        onClick={() => {handleBuyNFT(nft?.tokenId,nft?.price)}}>
                            Buy NFT
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default DeatilofNFT
