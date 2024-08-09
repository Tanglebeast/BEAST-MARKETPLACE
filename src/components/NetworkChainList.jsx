// Funktion, die alle Netzwerke erstellt und zurückgibt
export function allNetworks() {
    const createNetwork = (chainId, chainName, rpcUrl, currencyName, currencySymbol, currencyDecimals, explorerUrl) => ({
      chainId,
      chainName,
      rpcUrls: [rpcUrl],
      nativeCurrency: {
        name: currencyName,
        symbol: currencySymbol,
        decimals: currencyDecimals,
      },
      blockExplorerUrls: [explorerUrl],
    });
  
    return {
      shimmerTestnet: createNetwork(
        '0x431',
        'Shimmer EVM Testnet',
        'https://json-rpc.evm.testnet.shimmer.network',
        'Shimmer',
        'SMR',
        18,
        'https://explorer.evm.shimmer.network'
      ),
      iotaTestnet: createNetwork(
        '0x433',
        'IOTA EVM Testnet',
        'https://json-rpc.evm.testnet.iotaledger.net',
        'IOTA',
        'IOTA',
        18,
        'https://explorer.evm.testnet.iotaledger.net'
      ),
      // Füge hier weitere Netzwerke hinzu
    };
  }
  