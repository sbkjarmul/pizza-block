import React, { useEffect } from 'react'
import { useContext, useState, useCallback, useMemo } from 'react'
import { ethers } from 'ethers'
import Role from '@/enums/roles.enum'
import { content } from '@/assets/content'

interface MetaMaskProviderProps {
  children: React.ReactNode
}

export const MetaMaskContext = React.createContext(null)

export const MetaMaskProvider = ({ children }: MetaMaskProviderProps) => {
  const [isActive, setIsActive] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  return (
    <MetaMaskContext.Provider value={null}>{children}</MetaMaskContext.Provider>
  )
}

export default function useMetaMask() {
  const [isConnected, setIsConnected] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [provider, setProvider] = useState<any>()
  const [signer, setSigner] = useState<any>()
  const { ethereum } = window
  // const context = useContext(MetaMaskContext)

  useEffect(() => {
    if (ethereum) {
      setIsInstalled(true)
    } else {
      setIsInstalled(false)
    }
  }, [ethereum])

  async function connectToMetamask() {
    if (isInstalled) {
      try {
        console.log('connecting to metamask')
        await ethereum.request({ method: 'eth_requestAccounts' })
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        setIsConnected(true)
        setProvider(provider)
        setSigner(signer)
      } catch (error) {
        setIsConnected(false)
        console.error(error)
      }
    } else {
      console.error(content.pleaseInstallMetamask)
    }
  }

  // if (!context) {
  //   throw new Error('useMetaMask must be used within a MetaMaskProvider')
  // }

  return {
    isConnected,
    isInstalled,
    connectToMetamask,
  }
}
