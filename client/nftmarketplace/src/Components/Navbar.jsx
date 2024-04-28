import React from 'react'

import { Link, NavLink } from 'react-router-dom'
import ConnectButton from './ConnectButton'

import { useNavigate } from 'react-router-dom'

export default function Navbar() {

    
    const navigate = useNavigate()

    return (
        <div>
            <nav className="navbar navbar-expand-lg bg-dark border-bottom border-body" data-bs-theme="dark">
                <div className="container-fluid">
                    <a className="navbar-brand" href="#">Navbar</a>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon" />
                    </button>
                    <div className="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                            <li className="nav-item">
                                <NavLink className="nav-link" aria-current="page" to="/">Home</NavLink>
                            </li>
                            <li className="nav-item">
                                <NavLink className="nav-link" to="/createNFT">Create NFT</NavLink>
                            </li>
                            <li className="nav-item">
                                <NavLink className="nav-link" to="/viewNFTs">View NFTs</NavLink>
                            </li>  
                            <li className="nav-item">
                                <NavLink className='nav-link' to="/myNFT">My NFTs</NavLink>
                            </li>  
                            <li className="nav-item">
                                <NavLink className='nav-link' to="/addCollections">Create Collections</NavLink>
                            </li>  
                            <li className="nav-item">
                                <NavLink className='nav-link' to="/addNFTsinCollections">Add NFTs in Collections</NavLink>
                            </li>
                        </ul>
                        <ConnectButton />
                    </div>
                </div>
            </nav>
        </div>

    )
}
