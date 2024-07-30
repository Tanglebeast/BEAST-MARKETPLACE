import React from 'react';
import { useParams } from 'react-router-dom';
import { nftCollections } from '../NFTCollections';

const BlockExplorerLinks = () => {
  const { collectionaddress, tokenid } = useParams();

  const collection = nftCollections.find(col => col.address === collectionaddress);
  const network = collection ? collection.network : 'shimmerevm';

  const explorerUrl = network === 'iotaevm'
    ? `https://explorer.evm.testnet.iotaledger.net/token/${collectionaddress}/instance/${tokenid}`
    : `https://explorer.evm.testnet.shimmer.network/token/${collectionaddress}/instance/${tokenid}`;

  return (
    <div className='VisibleLink'>
      <a href={explorerUrl} target="_blank" rel="noopener noreferrer">
        VIEW IN EXPLORER
      </a>
    </div>
  );
};

export default BlockExplorerLinks;
