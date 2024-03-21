import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { NFTMarketPlaceProvider } from './Context/NFTMarketPlaceContext.jsx'
import { BrowserRouter } from 'react-router-dom'
import { Web3ModalProvider } from './Context/Web3ModalContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(

  <BrowserRouter>
    <Web3ModalProvider>
      <NFTMarketPlaceProvider>
        <App />
      </NFTMarketPlaceProvider>
    </Web3ModalProvider>
  </BrowserRouter>
)

