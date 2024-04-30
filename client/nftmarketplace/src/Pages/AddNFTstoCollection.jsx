import React, { useState, useEffect } from 'react'
import { NFTMarketPlaceABI, NFTMarketPlaceAddress } from '../Context/constants'
import { config } from '../../config'
import { useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi'
import { useNFTMarketPlace } from '../Context/NFTMarketPlaceContext'
import Navbar from '../Components/Navbar'
import { ethers } from 'ethers'
import { readContract, writeContract } from '@wagmi/core'
import { useParams } from 'react-router-dom'
import Swal from 'sweetalert2'


function AddNFTstoCollection() {

    const { address } = useNFTMarketPlace()
    const { collectionId } = useParams()

    const [myNFTs, setMyNFTs] = useState([])
    const [resalePrice, setResalePrice] = useState()

    const listingData = useReadContract({
        address: NFTMarketPlaceAddress,
        abi: NFTMarketPlaceABI,
        functionName: 'getListingPrice',
        args: [],
    })

    const listingPrice = listingData.data

    const getMyNFT = async () => {

        try {
            // console.log(address)
            const data = await readContract(config, {
                abi: NFTMarketPlaceABI,
                address: NFTMarketPlaceAddress,
                functionName: 'fetchMyNFTs',
                args: [],
                account: address
            })

            console.log("Mynfts: ", data);
            // fetchTokenURIs(data);

            //get Collection
            const getCol = await readContract(config, {
                abi: NFTMarketPlaceABI,
                address: NFTMarketPlaceAddress,
                functionName: 'getNFTsInCollection',
                args: [collectionId],
                account: address
            });

            console.log("Collection with NFTS: ", getCol);

            //filter out data on the basis of collection
            const filteredData = data.filter(nft => !getCol.includes(nft.tokenId));

            console.log("Filtered NFTs: ", filteredData);

            fetchTokenURIs(filteredData);
        }
        catch (error) {
            console.log(error)
        }

    }

    const fetchTokenURIs = async (data) => {

        const updatedItems = await Promise.all(data.map(async (item) => {
            const price = ethers.formatEther(item?.price.toString())
            const seller = item?.seller
            const owner = item?.owner

            const tokenURI = await readContract(config, {
                abi: NFTMarketPlaceABI,
                address: NFTMarketPlaceAddress,
                functionName: 'tokenURI',
                args: [item?.tokenId],
            })

            // trim ipfs hash from the tokenURI

            const IpfsHash = tokenURI.split('/ipfs/')[1]

            // console.log(IpfsHash)

            const res = await fetch(
                "https://api.pinata.cloud/data/pinList?status=pinned",
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${import.meta.env.VITE_PINATA_JWT}`,
                    },
                }
            );
            // console.log(nftName, nftDescription)

            const resData = await res.json();
            // console.log(resData)

            // find th data from the resData array whose ipfs hash matches the IpfsHash

            const nftData = resData.rows.find((row) => row.ipfs_pin_hash === IpfsHash)
            // console.log(nftData)

            return {
                ...item,
                tokenURI,
                price,
                seller,
                owner,
                name: nftData?.metadata?.keyvalues?.nftName,
                description: nftData?.metadata?.keyvalues?.description
            }
        }))
        setMyNFTs(updatedItems)
    }

    useEffect(() => {
        getMyNFT();
    }, []);

    const handleAdd = async (tokenid) => {

        // console.log("Token id: ", tokenid);
        const data = await writeContract(config, {
            abi: NFTMarketPlaceABI,
            address: NFTMarketPlaceAddress,
            functionName: 'addToCollection',
            args: [collectionId, tokenid],
            account: address
        })


        console.log(data);

        Swal.fire({
            title: 'New NFTs are added in collection',
            icon: 'success',
            confirmButtonText: 'Ok'
        });

        getMyNFT();
    }

    return (
        <>
            <Navbar />
            <div className='row m-3'>
                {myNFTs?.map((item, index) => {
                    return (
                        <>
                            <div key={index} className="card col-md-3 mx-4" style={{ width: '18rem' }}>
                                <img src={item?.tokenURI} className="card-img-top" alt="..." />
                                <div className="card-body">
                                    <h5 className="card-title">{item?.name}</h5>
                                    <p className="card-text">{item?.description}</p>
                                    <p className="card-text">{item?.owner}</p>
                                    {/* Button trigger modal */}
                                    <div>
                                        <button type="button" className="btn btn-dark" onClick={() => { handleAdd(item?.tokenId) }}>
                                            Add
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
                    )
                })}
            </div>
        </>
    )
}

export default AddNFTstoCollection;