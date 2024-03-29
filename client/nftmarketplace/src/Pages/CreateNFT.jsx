import React, { useEffect, useState } from 'react'
import { useNFTMarketPlace } from '../Context/NFTMarketPlaceContext';
import { NFTMarketPlaceABI, NFTMarketPlaceAddress } from '../Context/constants';
import { ethers } from 'ethers';
import { useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi'
import Navbar from '../Components/Navbar';

export default function CreateNFT() {

    const [selectedFile, setSelectedFile] = useState();
    const [nftName, setNftName] = useState();
    const [nftDescription, setNftDescription] = useState();
    const [nftPrice, setNftPrice] = useState();
    const [fileName, setFileName] = useState();

    // const [marketItems, setMarketItems] = useState([]);

    const { data: hash, error, isPending, writeContract } = useWriteContract();

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

    const { isLoading: isConfirming, isSuccess: isConfirmed } =
        useWaitForTransactionReceipt({
            hash,
        })

    useEffect(() => {
        console.log(listingPrice)
    }, [])

    const changeHandler = (event) => {
        setSelectedFile(event.target.files[0]);
        setFileName(event.target.files[0].name);
    };


    const handleSubmission = async (e) => {

        e.preventDefault();

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

    const createNFT = async (formData) => {

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
            console.log(url)

            await createSale(url, nftPrice.toString())

        } catch (error) {

            console.log("Error while creating NFT", error);

        }

    }

    const createSale = async (url, formInputprice, isReselling, id) => {

        try {

            console.log(formInputprice)
            console.log(typeof formInputprice)

            const price = ethers.parseUnits(formInputprice, 'ether');
            // console.log(price)

            if (!isReselling) {

                writeContract({
                    address: NFTMarketPlaceAddress,
                    abi: NFTMarketPlaceABI,
                    functionName: 'createToken',
                    args: [url, price],
                    value: listingPrice.toString()
                })

            }
            else {

                writeContract({
                    address: NFTMarketPlaceAddress,
                    abi: NFTMarketPlaceABI,
                    functionName: 'reSellToken',
                    args: [url, price],
                    value: listingPrice.toString()
                })

            }


        } catch (error) {

            console.log("Error while creating sale", error)

        }

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
                            <textarea style={{height: "100px"}} type="text" className="form-control" placeholder='Write your nft description here' onChange={(e) => setNftDescription(e.target.value)} >
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
                        <button className="btn btn-dark" onClick={handleSubmission}>Submit</button>
                    </div>
                </form>
            </div>

            {/* <label className="form-label"> Choose File</label>
            <input type="text" className="form-control" placeholder="NFT Name" onChange={(e) => setNftName(e.target.value)} />
            <input type="text" className="form-control" placeholder="NFT Description" onChange={(e) => setNftDescription(e.target.value)} />
            <input type="text" className="form-control" placeholder="NFT Price" onChange={(e) => setNftPrice(e.target.value)} />
            <input type="file" onChange={changeHandler} />
            <button onClick={handleSubmission}>Submit</button> */}
            {hash && <div>Transaction Hash: {hash}</div>}
            {isConfirming && <div>Waiting for confirmation...</div>}
            {isConfirmed && <div>Transaction confirmed.</div>}
            {error && (
                <div>Error: {(error).shortMessage || error.message}</div>
            )} 
        </>
    )
}

