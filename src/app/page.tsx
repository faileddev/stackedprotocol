'use client'


import Image from "next/image";
import styles from "./styles.module.css";

import { ConnectButton, useReadContract } from "thirdweb/react";
import { chain, client, LENDING_POOL_CONTRACT, SUSD_CONTRACT } from "../../utils/constants";
import Link from "next/link";
import MainHeader from "../../components/MainHeader";
import coin from "../../public/Stacks Of Sats 2.png"
import flipped from "../../public/Stacks Of Sats flipped.png"
import { Button } from "@mui/material";
import { balanceOf, totalSupply } from "thirdweb/extensions/erc20";
import { TOKEN_CONTRACT } from "../../utils/constants";
import { toEther } from "thirdweb";
import { useEffect, useState } from "react";
import { toNumber } from "ethers";





export default function Home() {

  const SOSContract = "0xf63Fca327C555408819e26eDAc30F83E55a119f4";
  const SUSDContract = "0x65F74FD58284dAEaFaC89d122Fb0566E0629C2a0";



  const [sosMarketCap, setSosMarketCap] = useState<string>("Calculating...");


  const { 
    data: sosTotalSupply, 
    isLoading: loadingSosTotalSupply,
    refetch: refetchSosTotalSupply
  } = useReadContract (
    totalSupply,
    {
        contract: TOKEN_CONTRACT,
   
  });

  

  const { 
    data: rawSosPrice, 
    isLoading: loadingSosPrice,
    refetch: refetchSosPrice,
} = useReadContract (
    
    {
        contract: LENDING_POOL_CONTRACT,
        method: "getPrice",
        params: [SOSContract],
        
   
});

const { 
  data: susdTotalSupply, 
  isLoading: loadingSusdTotalSupply,
  refetch: refetchSusdTotalSupply
} = useReadContract (
  totalSupply,
  {
      contract: SUSD_CONTRACT,
 
});



const { 
  data: rawSusdPrice, 
  isLoading: loadingSusdPrice,
  refetch: refetchSusdPrice,
} = useReadContract (
  
  {
      contract: LENDING_POOL_CONTRACT,
      method: "getPrice",
      params: [SUSDContract],
      
 
});




useEffect(() => {
  if (sosTotalSupply && sosPrice) {
    try {
      // Normalize the total supply (adjust for 18 decimals)
      const totalSupplyNormalized = Number(sosTotalSupply) / 1e18;

      // Use the raw price directly if it is not scaled
      const priceNormalized = Number(sosPrice);

      console.log("Normalized Total Supply:", totalSupplyNormalized);
      console.log("Raw Token Price (Unscaled):", priceNormalized);

      // Calculate the market cap
      const calculatedMarketCap = totalSupplyNormalized * priceNormalized;

      // Format the result
      setSosMarketCap(`$${calculatedMarketCap.toLocaleString("en-US", {
        maximumFractionDigits: 2,
      })}`);
    } catch (error) {
      console.error("Error calculating market cap:", error);
      setSosMarketCap("Error");
    }
  }
}, [sosTotalSupply, rawSosPrice]);


const [susdMarketCap, setSusdMarketCap] = useState<string>("Calculating...");


useEffect(() => {
  if (susdTotalSupply && rawSosPrice) {
    try {
      // Normalize the total supply (adjust for 18 decimals)
      const totalSupplyNormalized = Number(susdTotalSupply) / 1e18;

      // Use the raw price directly if it is not scaled
      const priceNormalized = Number(susdPrice);

      console.log("Normalized Total Supply:", totalSupplyNormalized);
      console.log("Raw Token Price (Unscaled):", priceNormalized);

      // Calculate the market cap
      const calculatedMarketCap = totalSupplyNormalized * priceNormalized;

      // Format the result
      setSusdMarketCap(`$${calculatedMarketCap.toLocaleString("en-US", {
        maximumFractionDigits: 2,
      })}`);
    } catch (error) {
      console.error("Error calculating market cap:", error);
      setSusdMarketCap("Error");
    }
  }
}, [susdTotalSupply, rawSusdPrice]);



  function formatNumber(value: number): string {
    if (value >= 1_000_000_000) {
        // Format as billions
        return `${(value / 1_000_000_000).toFixed(1)}Billion`;
    } else if (value >= 1_000_000) {
        // Format as millions
        return `${(value / 1_000_000).toFixed(1)}Million`;
    } else if (value >= 1_000) {
        // Format as thousands
        return `${(value / 1_000).toFixed(1)}K`;
    } else {
        // Keep as is for smaller numbers
        return value.toLocaleString();
    }
}

function truncate(vaule: string | number, decimalPlaces: number): number {
  const numericValue: number = Number(vaule);
  if (isNaN(numericValue)) {
      throw new Error('Invalid input: value must be convertible to a number');
  }
  const factor: number = Math.pow(10,decimalPlaces);
  return Math.trunc(numericValue*factor) / factor
}

const sosPrice = rawSosPrice ? (Number(rawSosPrice) / 1e8).toFixed(6) : null; // Divide by 1e8 and format to 2 decimals
    const localizedAssetPrice = sosPrice 
    ? Number(sosPrice).toLocaleString(undefined, { minimumFractionDigits: 18, maximumFractionDigits: 18 }) 
    : null;

    const susdPrice = rawSosPrice ? (Number(rawSusdPrice) / 1e8).toFixed(6) : null; // Divide by 1e8 and format to 2 decimals
    const localizedsusdPrice = susdPrice 
    ? Number(susdPrice).toLocaleString(undefined, { minimumFractionDigits: 18, maximumFractionDigits: 18 }) 
    : null;

  return (
    <div>
      <MainHeader />

      <div style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "20px",
          height: "100%",
          marginBottom: "40px",
          
          
        }} >
        <div className={styles.container}>
          <div style={{
            width: "100%",
            marginBottom: "40px",
        
        
          }}>
          <h1>
            Stacks Of Sats
          </h1>
          <p>
          The Stacks of Sats Protocol is a next-generation decentralized financial (DeFi) platform designed to empower users with seamless access to lending, borrowing, and collateralization of assets. Built with a focus on efficiency, transparency, and scalability, Stacks of Sats revolutionizes how users interact with digital assets by combining innovative features with a user-friendly experience.
          </p>
          <div 
          style={{
          display: "flex",
          flexDirection: "row",
          marginTop: "10px",
        gap: "10px"}}
          >
          <Link href="https://app.uniswap.org/swap?outputCurrency=0xf63fca327c555408819e26edac30f83e55a119f4&chain=base" style={{
        
                padding: "10px",
                backgroundColor: "#efefef",
                border: "none",
                borderRadius: "6px",
                color: "#333",
                fontSize: "1rem",
                cursor: "pointer",
                }}
                
                target="_blank" // Opens in a new tab
                rel="noopener noreferrer">
          Buy $SOS</Link>
          <Link href="/dashboard"  style={{
        
                padding: "10px",
                backgroundColor: "#efefef",
                border: "none",
                borderRadius: "6px",
                color: "#333",
                fontSize: "1rem",
                cursor: "pointer",
                }}>
          Launch App</Link>
          </div>
          </div>
          <div className={styles.imageContainer}>
          <Image src={coin} alt="header"  width={400}/>
          </div>
        
        </div>
        <div className={styles.container}>
          <div style={{
            justifyContent: "center",
            textAlign: "center",
            border: "solid",
            borderWidth: "1px",
            borderColor: "gray",
            borderRadius: "5px",
            padding: "10px",
            width: "100%"
          }}>
            <p>Total Supply</p>
            {loadingSosTotalSupply ? <h1>...</h1> : <h1>{formatNumber(Number(toEther(sosTotalSupply!)))}<span style={{ fontSize: "8px" }}> SOS</span></h1>}
          </div>
          <div style={{
            justifyContent: "center",
            textAlign: "center",
            border: "solid",
            borderWidth: "1px",
            borderColor: "gray",
            borderRadius: "5px",
            padding: "10px",
            width: "100%"
          }}>
            <p>Price</p>
            <h1>{sosPrice}</h1>
          </div>
          <div style={{
            justifyContent: "center",
            textAlign: "center",
            border: "solid",
            borderWidth: "1px",
            borderColor: "gray",
            borderRadius: "5px",
            padding: "10px",
            width: "100%"
          }}>
            <p>Marketcap</p>
            <h1>{sosMarketCap}</h1>
          </div>
        
        </div>
        <div className={styles.container}>
          <div>
          <Image src={flipped} alt="header"  width={400}/>
          </div>
          <div style={{
            width: "100%",
        
        
          }}>
          <h1>
            Stacked Doller
          </h1>
          <p>
          The Stacked Dollar (sUSD) is the stablecoin at the heart of the Stacks of Sats Protocol, designed to provide a secure and decentralized medium of exchange, store of value, and collateralization mechanism within the platform's ecosystem. Fully backed and transparently managed, sUSD offers unparalleled reliability and usability in the world of decentralized finance (DeFi).          </p>
          <div
          style={{
          display: "flex",
          flexDirection: "row",
          marginTop: "10px",
          marginBottom: "10px",
          
        gap: "10px"}}
          >
          <Link href="/sUSD"   style={{
        
                padding: "10px",
                backgroundColor: "#efefef",
                border: "none",
                borderRadius: "6px",
                color: "#333",
                fontSize: "1rem",
                cursor: "pointer",
                }}>
          Mint sUSD</Link>
          <Link href="/dashboard" style={{
        
                padding: "10px",
                backgroundColor: "#efefef",
                border: "none",
                borderRadius: "6px",
                color: "#333",
                fontSize: "1rem",
                cursor: "pointer",
                }}>
          Launch App</Link>
          </div>
          </div>
          
        
        </div>
        <div className={styles.container}>
          <div style={{
            justifyContent: "center",
            textAlign: "center",
            border: "solid",
            borderWidth: "1px",
            borderColor: "gray",
            borderRadius: "5px",
            padding: "10px",
            width: "100%"
          }}>
            <p>Total Supply</p>
            {loadingSusdTotalSupply ? <h1>...</h1> : <h1>{formatNumber(Number(toEther(susdTotalSupply!)))}<span style={{ fontSize: "8px" }}> sUSD</span></h1>}
          </div>
          <div style={{
            justifyContent: "center",
            textAlign: "center",
            border: "solid",
            borderWidth: "1px",
            borderColor: "gray",
            borderRadius: "5px",
            padding: "10px",
            width: "100%"
          }}>
            <p>Price</p>
            <h1>{susdPrice}</h1>
          </div>
          <div style={{
            justifyContent: "center",
            textAlign: "center",
            border: "solid",
            borderWidth: "1px",
            borderColor: "gray",
            borderRadius: "5px",
            padding: "10px",
            width: "100%"
          }}>
            <p>Marketcap</p>
            <h1>{susdMarketCap}</h1>
          </div>
        
        </div>
      </div>

      <div style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-around",
              marginTop: "20px",
              marginBottom: "40px"
            }}>

<Link style={{marginTop: "10px", }} href={"https://x.com/stacksofsat"}>
                                  Twitter
                              </Link>

                              <Link style={{marginTop: "10px", }} href={"https://basescan.org/token/0xf63fca327c555408819e26edac30f83e55a119f4"}>
                                  BaseScan
                              </Link>
                              <Link style={{marginTop: "10px", }} href={"https://app.uniswap.org/swap?outputCurrency=0xf63fca327c555408819e26edac30f83e55a119f4&chain=base"}>
                                  Uniswap
                              </Link>
                              <Link style={{marginTop: "10px", }} href={"https://www.dextools.io/app/en/base/pair-explorer/0x693c5205627c5c96f45b49139aea6ff60480ad4d?t=1728048886979"}>
                                  Dextools
                              </Link>
              
            </div>
      
    </div>
  );
}
