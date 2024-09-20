// import React, { useEffect, useState } from 'react';
// import { getNFTHistory } from '../components/utils'; // Eine Hilfsfunktion, um die Historie abzurufen.

// const NFTHistory = ({ collectionAddress, tokenId, marketplace }) => {
//   const [history, setHistory] = useState([]);

//   useEffect(() => {
//     const fetchHistory = async () => {
//       if (marketplace) {
//         const nftHistory = await getNFTHistory(collectionAddress, tokenId);
//         setHistory(nftHistory);
//       }
//     };
//     fetchHistory();
//   }, [collectionAddress, tokenId, marketplace]);

//   return (
//     <div className="nft-history">
//       <h3>NFT History</h3>
//       {history.length > 0 ? (
//         <ul>
//           {history.map((event, index) => (
//             <li key={index}>
//               <p><strong>From:</strong> {event.from}</p>
//               <p><strong>To:</strong> {event.to || 'N/A'}</p>
//               <p><strong>Date:</strong> {event.date}</p>
//               <p><strong>Price:</strong> {event.price ? `${event.price} ETH` : 'N/A'}</p>
//               <p><strong>Transaction Hash:</strong> <a href={`https://etherscan.io/tx/${event.transactionHash}`} target="_blank" rel="noopener noreferrer">{event.transactionHash}</a></p>
//             </li>
//           ))}
//         </ul>
//       ) : (
//         <p>No history available for this NFT.</p>
//       )}
//     </div>
//   );
// };

// export default NFTHistory;
