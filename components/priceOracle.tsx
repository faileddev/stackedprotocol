'use client'

import React, { useEffect } from "react";
import { JsonRpcProvider, Contract, formatUnits } from "ethers";

// Your Oracle Contract Details
const ORACLE_CONTRACT_ADDRESS = "0xaCc98Eeaa31fF2bEE5D670Cd874E5e44Fa707eE4";
const ORACLE_CONTRACT_ABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "_pair", "type": "address" },
      { "internalType": "address", "name": "_ethUsdPriceFeed", "type": "address" },
      { "internalType": "address", "name": "_token", "type": "address" },
      { "internalType": "address", "name": "_weth", "type": "address" },
      { "internalType": "uint8", "name": "_tokenDecimals", "type": "uint8" }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  { "inputs": [], "name": "ethUsdPriceFeed", "outputs": [{ "internalType": "contract AggregatorV3Interface", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "getEthUsdPrice", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "getTokenEthPrice", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "getTokenUsdPrice", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "pair", "outputs": [{ "internalType": "contract IUniswapV2Pair", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "token", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "tokenDecimals", "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "weth", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }
];

type PriceDisplayProps = {
  onPriceFetched: (price: string) => void;
};

const PriceDisplay: React.FC<PriceDisplayProps> = ({ onPriceFetched }) => {
  useEffect(() => {
    const fetchTokenPrice = async () => {
      try {
        const provider = new JsonRpcProvider("https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID");
        const oracleContract = new Contract(ORACLE_CONTRACT_ADDRESS, ORACLE_CONTRACT_ABI, provider);

        // Fetch the token price in USD
        const priceData = await oracleContract.getTokenUsdPrice();
        
        // Format the price according to the contract’s decimals (adjust decimals as needed)
        const formattedPrice = formatUnits(priceData, 18);

        // Send the formatted price to the parent component
        onPriceFetched(formattedPrice);
      } catch (error) {
        console.error("Error fetching price:", error);
      }
    };

    fetchTokenPrice();
  }, [onPriceFetched]);

  return null; // This component doesn't render anything directly
};

export default PriceDisplay;
