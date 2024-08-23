import React from 'react';
import { useParams } from 'react-router-dom';
import { nftCollections } from '../NFTCollections';

const BlockExplorerLinks = () => {
  const { collectionaddress, tokenid } = useParams();

  const collection = nftCollections.find(col => col.address === collectionaddress);
  const network = collection ? collection.network : 'shimmerevm';

  let explorerUrl;
  if (network === 'iotaevm') {
    explorerUrl = `https://explorer.evm.testnet.iotaledger.net/token/${collectionaddress}/instance/${tokenid}`;
  } else if (network === 'bnbchain') {
    explorerUrl = `https://testnet.bscscan.com/token/${collectionaddress}?a=${tokenid}`;
  } else if (network === 'polygon') {
    explorerUrl = `https://amoy.polygonscan.com/token/${collectionaddress}?a=${tokenid}`;
  } else if (network === 'ethereum') {
    explorerUrl = `https://sepolia.etherscan.io/token/${collectionaddress}?a=${tokenid}`;
  } else {
    explorerUrl = `https://explorer.evm.testnet.shimmer.network/token/${collectionaddress}/instance/${tokenid}`;
  }

  return (
    <div className='VisibleLink'>
      <a href={explorerUrl} target="_blank" rel="noopener noreferrer">
        VIEW IN EXPLORER
      </a>
    </div>
  );
};

export default BlockExplorerLinks;
