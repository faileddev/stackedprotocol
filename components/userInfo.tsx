'use client'

import { useActiveAccount, useReadContract } from "thirdweb/react";
import { SUSD_CONTRACT, TOKEN_CONTRACT } from "../utils/constants";
import { balanceOf } from "thirdweb/extensions/erc20";
import { toEther } from "thirdweb";
import { useEffect, useState } from "react";
import { JsonRpcProvider, Contract, formatUnits } from "ethers";

// Set the Oracle contract address and ABI
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
  { "inputs": [], "name": "getTokenUsdPrice", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
];

const Userinfo: React.FC = () => {
  const account = useActiveAccount();
  const treasuryAddress = "0xaCe09eC29819533D23199F72Cea5fE6A2C8F13C2";
  const sUSDContract = "0x65F74FD58284dAEaFaC89d122Fb0566E0629C2a0";

  // Fetch Contract Data
  const { data: vaultTotalSupply, isLoading: loadingVaultTotalSupply } = useReadContract({
    contract: SUSD_CONTRACT,
    method: "totalSupply"
  });
  const { data: spUsdtBalance, isLoading: loadingSpUsdtBalance } = useReadContract(balanceOf, {
    contract: TOKEN_CONTRACT,
    address: account?.address || "",
    queryOptions: { enabled: !!account }
  });
  const { data: vaultReserve, isLoading: loadingVaultReserve } = useReadContract(balanceOf, {
    contract: TOKEN_CONTRACT,
    address: treasuryAddress,
  });
  const { data: totalDeposit, isLoading: loadingTotalDeposit } = useReadContract(balanceOf, {
    contract: TOKEN_CONTRACT,
    address: sUSDContract,
  });

  // Format and Truncate Function
  function truncate(value: string | number, decimalPlaces: number): string {
    const numericValue: number = Number(value);
    return isNaN(numericValue) ? "N/A" : (Math.trunc(numericValue * Math.pow(10, decimalPlaces)) / Math.pow(10, decimalPlaces)).toFixed(decimalPlaces);
  }

  // Fetch Token Price from Oracle
  const [price, setPrice] = useState<string | null>(null);

  useEffect(() => {
    const fetchTokenPriceFromOracle = async () => {
      try {
        // Initialize provider and contract
        const provider = new JsonRpcProvider("https://base-mainnet.infura.io/v3/65ff1bcf95cc4a6a9cf9c0c81fb9896a");
        const oracleContract = new Contract(ORACLE_CONTRACT_ADDRESS, ORACLE_CONTRACT_ABI, provider);

        console.log("Oracle Contract Initialized");

        // Call the `getTokenUsdPrice` function
        const priceData = await oracleContract.getTokenUsdPrice();
        console.log("Raw Price Data from Oracle:", priceData);

        // Format price to 18 decimals (or adjust based on your contract’s decimal setup)
        const formattedPrice = parseFloat(formatUnits(priceData, 18)).toFixed(4);
        console.log("Formatted Price:", formattedPrice);

        setPrice(formattedPrice);
      } catch (error) {
        console.error("Error fetching price from Oracle:", error);
        setPrice("N/A");
      }
    };

    fetchTokenPriceFromOracle();
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", padding: "20px", textAlign: "center", borderRadius: "10px", border: "solid", borderColor: "GrayText", borderWidth: "1px", marginTop: "20px" }}>
          <p>sUSD Price</p>
          <h3>$1.07</h3>
        </div>
        
        <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", padding: "20px", textAlign: "center", borderRadius: "10px", border: "solid", borderColor: "GrayText", borderWidth: "1px", marginTop: "20px" }}>
          <p>Total Supply</p>
          {loadingVaultTotalSupply ? <h3>...</h3> : <h3>{Number(truncate(toEther(vaultTotalSupply!), 2)).toLocaleString()}<span style={{ fontSize: "8px" }}> sUSD</span></h3>}
        </div>

        <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", padding: "20px", textAlign: "center", borderRadius: "10px", border: "solid", borderColor: "GrayText", borderWidth: "1px", marginTop: "20px" }}>
          <p>Vault Reserve</p>
          {loadingVaultReserve ? <p>...</p> : 
          
          <h3>
      {price && totalDeposit ? (
        `$${(parseFloat(price) * parseFloat(toEther(totalDeposit!))).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      ) : (
        "Loading..."
      )}
      
    </h3>}
        </div>

        <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", padding: "20px", textAlign: "center", borderRadius: "10px", border: "solid", borderColor: "GrayText", borderWidth: "1px", marginTop: "20px" }}>
          <p>SOS Price</p>
          <h3>{price ? `$${price}` : "Loading..."}</h3>
        </div>
      </div>
    </div>
  );
};

export default Userinfo;
