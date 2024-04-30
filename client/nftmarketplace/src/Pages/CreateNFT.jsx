import React, { useEffect, useState } from 'react';
import { useNFTMarketPlace } from '../Context/NFTMarketPlaceContext';
import { AuctionContractABI, AuctionContractAddress, NFTMarketPlaceABI, NFTMarketPlaceAddress } from '../Context/constants';
import { ethers } from 'ethers';
import { useReadContract, useWaitForTransactionReceipt, useTransactionReceipt } from 'wagmi';
import { readContract, writeContract, watchContractEvent } from '@wagmi/core'
import MultipleValueTextInput from 'react-multivalue-text-input';
import Swal from 'sweetalert2'


import Navbar from '../Components/Navbar';
import { config } from '../../config';

export default function CreateNFT() {

    const [selectedFile, setSelectedFile] = useState();
    const [nftName, setNftName] = useState();
    const [nftDescription, setNftDescription] = useState();
    const [nftPrice, setNftPrice] = useState();
    const [fileName, setFileName] = useState();
    const [traits, setTraits] = useState([]);

    const [tokenId, setTokenId] = useState('');
    const [days, setDays] = useState('');
    const [hours, setHours] = useState('');
    const [minutes, setMinutes] = useState('');
    const [minBidIncrement, setMinBidIncrement] = useState('');
    const [baseBid, setBaseBid] = useState('');

    const [eventLogs, setEventLogs] = useState("");

    // const [marketItems, setMarketItems] = useState([]);
    // const { data: hash, error, isPending, writeContract } = useWriteContract();

    const listingData = useReadContract({
        address: NFTMarketPlaceAddress,
        abi: NFTMarketPlaceABI,
        functionName: 'getListingPrice',
        args: [],
    })

    const listingPrice = listingData.data

    useEffect(() => {
        console.log(listingPrice)
    }, [])

    useEffect(() => {
        setTokenId(eventLogs[0]?.args?.tokenId)
    }, [eventLogs])

    const changeHandler = (event) => {
        setSelectedFile(event.target.files[0]);
        setFileName(event.target.files[0].name);
    };

    const callAuction = async (logs) => {
        console.log("hello")
        const durationInSeconds = (parseInt(days) * 24 * 60 * 60) + (parseInt(hours) * 60 * 60) + (parseInt(minutes) * 60);

        console.log(logs[0]?.args?.tokenId, durationInSeconds, minBidIncrement, baseBid)

        const res = await writeContract(config, {
            address: AuctionContractAddress,
            abi: AuctionContractABI,
            functionName: 'startAuction',
            args: [logs[0]?.args?.tokenId, durationInSeconds, minBidIncrement, baseBid],
        })
        console.log("Auction Hash ", res)

    }

    const unwatch = async (isAuction) => {

        if (isAuction) {
            watchContractEvent(config, {
                address: NFTMarketPlaceAddress,
                abi: NFTMarketPlaceABI,
                eventName: 'MarketItemCreated',
                onLogs(logs) {
                    callAuction(logs);
                },
            })
        }
        else{
            console.log("Not auction")
        }
    }

    const handleSubmission = async (choice) => {

        const formData = new FormData();

        formData.append("file", selectedFile);

        const metadata = JSON.stringify({
            name: fileName,
            keyvalues: {
                nftName: nftName,
                description: nftDescription,
                price: nftPrice
            }
        });
        formData.append("pinataMetadata", metadata);

        const options = JSON.stringify({
            cidVersion: 0,
        });
        formData.append("pinataOptions", options);

        createNFT(formData);

    }

    // create nft

    const createNFT = async (formData, choice) => {

        try {

            const res = await fetch(
                "https://api.pinata.cloud/pinning/pinFileToIPFS",
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${import.meta.env.VITE_PINATA_JWT}`,
                    },
                    body: formData,
                }
            );
            const resData = await res.json();
            const cid = resData.IpfsHash;

            const url = `${import.meta.env.VITE_GATEWAY_URL}/ipfs/${cid}`
            console.log(url);

            await createSale(url, nftPrice.toString(), choice)

        } catch (error) {

            console.log("Error while creating NFT", error);

        }

    }

    const createSale = async (url, formInputprice, choice) => {

        try {

            console.log(formInputprice)
            console.log(typeof formInputprice)

            const price = ethers.parseUnits(formInputprice, 'ether');
            // console.log(price)

            const res = await writeContract(config, {
                address: NFTMarketPlaceAddress,
                abi: NFTMarketPlaceABI,
                functionName: 'createToken',
                args: [url, price, traits],
                value: listingPrice.toString()
            })

            console.log("res ", res)

            if (choice == "Auction") {
                unwatch(true)
            }


        } catch (error) {

            console.log("Error while creating sale", error)

        }

    }

    const startAuction = async () => {


    }

    return (
        <>
            <Navbar />
            <div className="container-fluid" style={{ padding: "5% 12%" }}>
                <form className='border border-2 border-black rounded-3' style={{ padding: "5% 5%" }}>
                    <div>
                        <div className="mb-3">
                            <label className="form-label">NFT name</label>
                            <input type="text" className="form-control" placeholder='Write your nft name here' onChange={(e) => setNftName(e.target.value)} />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">NFT Description</label>
                            <textarea style={{ height: "100px" }} type="text" className="form-control" placeholder='Write your nft description here' onChange={(e) => setNftDescription(e.target.value)} >
                            </textarea>
                        </div>
                        <div className="mb-3">
                            <label className="form-label">NFT Price</label>
                            <input type="text" className="form-control" placeholder='Write your nft price here' onChange={(e) => setNftPrice(e.target.value)} />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="formFile" className="form-label">Upload NFT image</label>
                            <input className="form-control" type="file" id="formFile" onChange={changeHandler} />
                        </div>
                        <MultipleValueTextInput
                            onItemAdded={(item, allItems) => setTraits(allItems)}
                            onItemDeleted={(item, allItems) => setTraits(allItems)}
                            label="Items"
                            name="item-input"
                            placeholder="Enter whatever items you want; separate them with COMMA or ENTER."
                            className="form-control mb-3"
                        />
                        <button className="btn btn-dark" data-bs-toggle="modal" data-bs-target="#choiceModal" onClick={(e) => e.preventDefault()}>Submit</button>
                    </div>
                </form>
            </div>

            {/* const [selectedFile, setSelectedFile] = useState();
    const [nftName, setNftName] = useState();
    const [nftDescription, setNftDescription] = useState();
    const [nftPrice, setNftPrice] = useState();
    const [fileName, setFileName] = useState(); */}

            {/* Modal */}
            <div className="modal fade" id="choiceModal" tabIndex={-1} aria-labelledby="choiceModal" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h1 className="modal-title fs-5" id="exampleModalLabel">Choose the below</h1>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
                        </div>
                        <div className="modal-body">
                            <button className='btn btn-dark' data-bs-dismiss="modal" onClick={(e) => {
                                e.preventDefault()
                                handleSubmission("list")
                            }}>List NFT</button>
                            <p>Note: If you click on list NFT it will list the NFT to market as first come first serve</p>
                            <button className='btn btn-dark' data-bs-target="#auctionForm" data-bs-toggle="modal">Start an Auction</button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="modal fade" id="auctionForm" tabIndex={-1} aria-labelledby="auctionForm" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h1 className="modal-title fs-5" id="exampleModalLabel">Fill the below auction details</h1>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
                        </div>
                        <div className="modal-body">
                            <form className="mt-4">
                                <div className="mb-3">
                                    <label className="form-label">Duration:</label>
                                    <div className="d-flex">
                                        <input
                                            type="number"
                                            className="form-control me-2"
                                            value={days}
                                            onChange={(e) => setDays(e.target.value)}
                                            placeholder="Days"
                                        />
                                        <input
                                            type="number"
                                            className="form-control me-2"
                                            value={hours}
                                            onChange={(e) => setHours(e.target.value)}
                                            placeholder="Hours"
                                        />
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={minutes}
                                            onChange={(e) => setMinutes(e.target.value)}
                                            placeholder="Minutes"
                                        />
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Minimum Bid Increment:</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={minBidIncrement}
                                        onChange={(e) => setMinBidIncrement(e.target.value)}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Base Bid:</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={baseBid}
                                        onChange={(e) => setBaseBid(e.target.value)}
                                    />
                                </div>
                                <button type="submit" className="btn btn-dark" data-bs-dismiss="modal" aria-label="Close" onClick={async (e) => {
                                    e.preventDefault()
                                    await handleSubmission("Auction")
                                }}>Start Auction</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>


            {/* <label className="form-label"> Choose File</label>
            <input type="text" className="form-control" placeholder="NFT Name" onChange={(e) => setNftName(e.target.value)} />
            <input type="text" className="form-control" placeholder="NFT Description" onChange={(e) => setNftDescription(e.target.value)} />
            <input type="text" className="form-control" placeholder="NFT Price" onChange={(e) => setNftPrice(e.target.value)} />
            <input type="file" onChange={changeHandler} />
            <button onClick={handleSubmission}>Submit</button> */}
            {/* {hash && <div>Transaction Hash: {hash}</div>}
            {isConfirming && <div>Waiting for confirmation...</div>}
            {isConfirmed && <div>Transaction confirmed.</div>}
            {error && (
                <div>Error: {(error).shortMessage || error.message}</div>
            )} */}
        </>
    )
}

