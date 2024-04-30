import React, { useState } from 'react'
import Navbar from '../Components/Navbar'
import { readContract, writeContract, watchContractEvent } from '@wagmi/core'
import { config } from '../../config';
import { NFTMarketPlaceABI, NFTMarketPlaceAddress } from '../Context/constants';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const AddCollections = () => {

    const [name, setName] = useState();
    const [description, setDiscription] = useState();

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        const res = await writeContract(config, {
            address: NFTMarketPlaceAddress,
            abi: NFTMarketPlaceABI,
            functionName: 'createCollection',
            args: [name, description]
        });

        // console.log(res);
        Swal.fire({
            title: 'New collection added',
            icon: 'success',
            confirmButtonText: 'Ok'
        });

        navigate("/viewCollection");
    }

    return (
        <>
            <Navbar />
            <div className="container-fluid" style={{ padding: "5% 12%" }}>
                <form className='border border-2 border-black rounded-3' style={{ padding: "5% 5%" }}>
                    <div>
                        <div className="mb-3">
                            <label className="form-label">Enter the name of Collections:</label>
                            <input type="text" className="form-control" placeholder='Enter name of Collections here' onChange={(e) => setName(e.target.value)} />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Enter the description of the Collections</label>
                            <textarea style={{ height: "100px" }} type="text" className="form-control" placeholder='Write your description here' onChange={(e) => setDiscription(e.target.value)} >
                            </textarea>
                        </div>
                        <button onClick={handleSubmit} className="btn btn-dark">Submit</button>
                    </div>
                </form>
            </div>
        </>
    )
}

export default AddCollections
