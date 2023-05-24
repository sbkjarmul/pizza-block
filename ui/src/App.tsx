import React, { useEffect } from 'react'
import './App.css'
import { Button } from './components/Button'
import { DisconnectIcon, MetamaskIcon } from './components/Icon'
import { content } from '@/assets/content'
import useMetaMask from './hooks/useMetaMask'
import { ethers } from 'ethers'
import SupplyChainAbi from '@/assets/abi/SupplyChain'
import Role from '@/enums/roles.enum'

const SUPPLYCHAIN_CONTRACT_ADDRESS = String(
  process.env.REACT_APP_SUPPLYCHAIN_CONTRACT_ADDRESS_HARDHAT_LOCALHOST,
)

const SUPPLYCHAIN_CONTRACT_ABI = SupplyChainAbi

function App() {
  const { connectToMetamask, isConnected, isInstalled } = useMetaMask()

  function handleConnect() {
    connectToMetamask()
  }

  async function addEmployee() {
    if (window.ethereum !== undefined) {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      const contract = new ethers.Contract(
        SUPPLYCHAIN_CONTRACT_ADDRESS,
        SUPPLYCHAIN_CONTRACT_ABI,
        signer,
      )
      const employeeAddress = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'
      const employeeRole = Role.COOK
      const receipt = await contract.addEmployee(employeeAddress, employeeRole)
      console.log(receipt)
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1 className="text-3xl font-bold mb-5">{content.pizzaBlock}</h1>

        {isInstalled && (
          <>
            {!isConnected && (
              <Button
                text={content.connectToMetamask}
                icon={MetamaskIcon()}
                onClick={handleConnect}
              />
            )}
            {isConnected && (
              <>
                <Button
                  text={content.disconnectMetamask}
                  icon={DisconnectIcon()}
                />
                <div className="mt-5 mb-5">
                  <p className="text-lg font-bold">
                    {content.connectedAccount}:
                  </p>
                </div>
                <Button text={'Add employee'} onClick={addEmployee} />
              </>
            )}
          </>
        )}

        {!isInstalled && (
          <>
            <div className="mt-5 mb-5">
              <p className="text-lg font-bold">
                {content.pleaseInstallMetamask}
              </p>
            </div>
          </>
        )}
      </header>
    </div>
  )
}

export default App
