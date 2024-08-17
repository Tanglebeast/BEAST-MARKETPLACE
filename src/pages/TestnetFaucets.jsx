import React from 'react';
import '../styles/TestnetFaucets.css';

const TestnetFaucets = () => {
  return (
    <div className="faucet-container VisibleLink flex centered column">
      <h1>Testnet Faucets</h1>
      <p className='text-align-center mb60'>Grab your Free Testtokens now and be a part in Testing Fractalz on all the available Testchains!</p>
      <ul className='mediacolumn2 w100 gap15media'>
        <li>
          <h2>
            <img src="/currency-iota.png" alt="IOTA" className="icon" /> IOTA
          </h2>
          <p className='grey s14 mt0'>IOTA EVM Testnet</p>
          <a href="https://evm-toolkit.evm.testnet.iotaledger.net/" target="_blank" rel="noopener noreferrer">
            IOTA Faucet
          </a>
        </li>
        <li>
          <h2>
            <img src="/currency-bnb.png" alt="BNB" className="icon" /> BNB
          </h2>
          <p className='grey s14 mt0'>BSC Testnet</p>
          <a href="https://www.bnbchain.org/en/testnet-faucet" target="_blank" rel="noopener noreferrer">
            BNB Faucet
          </a>
        </li>
        <li>
          <h2>
            <img src="/currency-matic.png" alt="Polygon" className="icon" /> Polygon
          </h2>
          <p className='grey s14 mt0'>Polygon PoS (Amoy) Testnet</p>
          <a href="https://faucet.polygon.technology/" target="_blank" rel="noopener noreferrer">
            Polygon Faucet
          </a>
          <br />
          <a href="https://www.alchemy.com/faucets/polygon-amoy" target="_blank" rel="noopener noreferrer">
            Polygon Faucet 2
          </a>
        </li>
        <li>
          <h2>
            <img src="/currency-eth.png" alt="Ethereum" className="icon" /> Ethereum Sepolia
          </h2>
          <p className='grey s14 mt0'>Ethereum Sepolia Testnet</p>
          <a href="https://cloud.google.com/application/web3/faucet/ethereum/sepolia" target="_blank" rel="noopener noreferrer">
            Ethereum Faucet
          </a>
          <br />
          <a href="https://www.alchemy.com/faucets/ethereum-sepolia" target="_blank" rel="noopener noreferrer">
            Ethereum Faucet 2
          </a>
        </li>
      </ul>
    </div>
  );
};

export default TestnetFaucets;
