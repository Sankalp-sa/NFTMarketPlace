import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { readContract, writeContract } from '@wagmi/core'
import { config } from '../../config';
import { NFTMarketPlaceABI, NFTMarketPlaceAddress } from '../Context/constants';
import Navbar from '../Components/Navbar';


const ShowNFTsinOneCollection = () => {

    const { collectionId } = useParams();
    const [CollectionNFTs, setCollectionNFTs] = useState([]);
    const [collectionDetail, setcollectionDetail] = useState();

    const handleBuyNFT = async (tokenId, price) => {
        try {
            console.log(price)
            const res = await writeContract(config , {
                address: NFTMarketPlaceAddress,
                abi: NFTMarketPlaceABI,
                functionName: 'createMarketSale',
                args: [tokenId],
                value: price
            });
            // console.log(res);
            fetchCollectionNFTs();
        } catch (error) {
            console.log(error)
        }
    }


    const fetchcollectionDetails = async () => {
        //fetching collection details from contract
        const detail = await readContract(config, {
            abi: NFTMarketPlaceABI,
            address: NFTMarketPlaceAddress,
            functionName: 'getCollection',
            args: [collectionId]
        });
        // console.log("Details of collection : ");
        // console.log(detail);
        setcollectionDetail(detail);
    }

    useEffect(() => {
        fetchcollectionDetails();
    }, []);


    const fetchCollectionNFTs = async () => {
        //get Collection
        const getCol = await readContract(config, {
            abi: NFTMarketPlaceABI,
            address: NFTMarketPlaceAddress,
            functionName: 'getNFTsInCollection',
            args: [collectionId]
        });

        // console.log("Collection with NFTS: ", getCol);
        let arr = [];
        for (let index = 0; index < getCol.length; index++) {
            const element = getCol[index];
            let nftMarketData = await readContract(config, {
                abi: NFTMarketPlaceABI,
                address: NFTMarketPlaceAddress,
                functionName: 'getMarketItem',
                args: [element]
            });
            // console.log("NFTs Data: ");
            // console.log(nftMarketData);

            const tokenURI = await readContract(config, {
                abi: NFTMarketPlaceABI,
                address: NFTMarketPlaceAddress,
                functionName: 'tokenURI',
                args: [element],
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

            arr.push(nftMarketData);
        }
        // console.log("Array : ");
        // console.log(arr);

        setCollectionNFTs(arr);

        // console.log("All nfts inside one collection: ");
        // console.log(CollectionNFTs);
    }

    useEffect(async () => {
        fetchCollectionNFTs();
    }, []);

    return (
        <>
            <Navbar />
            <h2> Collection name: {collectionDetail?.name}</h2>
            <div className='row'>
                {CollectionNFTs?.map((item, index) => {
                    return (
                        <>
                            <div key={index} className="card col-md-3 m-3" style={{ width: '18rem' }}>
                                <img src={item?.tokenURI} className="card-img-top" alt="..." />
                                <div className="card-body">
                                    <h5 className="card-title">{item?.name}</h5>
                                    <p className="card-text">{item?.description}</p>
                                    <p className="card-text">{item?.owner}</p>
                                    {
                                        !item.sold ?
                                            <>
                                                <button onClick={() => { handleBuyNFT(item?.tokenId, item?.price) }} type="button" class="btn btn-primary">Buy NFT</button>
                                            </> :
                                            <>
                                                <button type="button" class="btn btn-primary" disabled> Sold </button>
                                            </>
                                    }
                                </div>
                            </div>
                        </>
                    )
                })}
            </div>
        </>
    )
}

export default ShowNFTsinOneCollection
