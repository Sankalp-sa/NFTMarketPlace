
import { localhost } from 'wagmi/chains'
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config'


// 1. Get projectId at https://cloud.walletconnect.com
const projectId = "6083a3130b777c8b1a007c01b8205a2d";

// 2. Create wagmiConfig
const metadata = {
  name: 'Web3Modal',
  description: 'Web3Modal Example',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

const chains = [localhost]
const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata
})

export default config