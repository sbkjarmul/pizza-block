import React from 'react'
import './App.css'
import { Button } from './components/Button'
import { DisconnectIcon, MetamaskIcon } from './components/Icon'
import { content } from './assets/content'

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1 className="text-3xl font-bold mb-5">{content.pizzaBlock}</h1>
        <Button text={content.connectToMetamask} icon={MetamaskIcon()} />
        <div className="mt-5 mb-5">
          <p className="text-lg font-bold">{content.connectedAccount}:</p>
        </div>
        <Button text={content.disconnectMetamask} icon={DisconnectIcon()} />
      </header>
    </div>
  )
}

export default App
