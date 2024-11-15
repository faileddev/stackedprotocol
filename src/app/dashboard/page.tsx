'use client'

import Logo from "../../../public/logo_Sos.svg"
import Image from "next/image";
import styles from "./page.module.css";
import Login from "../../../components/login"
import Userinfo from "../../../components/userInfo";
import Mint from "../../../components/mint";
import { ConnectButton, useActiveAccount } from "thirdweb/react";
import { chain, client } from "../../../utils/constants";
import { useState } from "react";
import Link from "next/link";
import Header from "../../../components/Header";
import BalanceCard from "../../../components/BalanceCard";
import MoneyMarketTable from "../../../components/MoneyMarketTable";

const dashboardPage = () => {
  const account = useActiveAccount();

  const assets = [
    { name: "ETH", image: "/ethereum-eth-logo.svg", supplyApy: 2.5, borrowApy: 4.5, isCollateral: true },
    { name: "WBTC", image: "/wrapped-bitcoin-wbtc-logo.svg", supplyApy: 2.5, borrowApy: 4.5, isCollateral: true },
    { name: "DAI", image: "/multi-collateral-dai-dai-logo.svg", supplyApy: 3.0, borrowApy: 5.0, isCollateral: false },
    { name: "USDC", image: "/usd-coin-usdc-logo.svg", supplyApy: 1.5, borrowApy: 3.5, isCollateral: true },
    { name: "SOS", image: "/red logo.svg", supplyApy: 1.5, borrowApy: 3.5, isCollateral: true },
    { name: "sUSD", image: "/susdcoin.svg", supplyApy: 1.5, borrowApy: 3.5, isCollateral: true },
];

  return (
    <div>
      
       
            
            
          

        <Header />
              
          
          
        
        <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          padding: "20px",
          height: "100%",
          marginBottom: "40px"
        }}>
      
      
      
      
      
          <div>
      
      
            
              <h1>
            Dashboard
          </h1>
                    
            

            
      
           
      
      <div>
          <div style={{
            display: "flex",
            flexDirection: "column",
            
            
            
            
        }}>
            {account ? (
                <div style={{ textAlign: "left"}}>
                <BalanceCard />

                <h1 style={{marginTop: "40px",}}>
            Money Market
          </h1>
              
                <div style={{marginTop: "20px"}}>
                    <MoneyMarketTable assets={assets} />
                </div>

            
            
           
    </div>
            ) : (
                <div style={{backgroundColor: "#151515", padding: "20px", textAlign: "center", borderRadius: "10px",
                  marginTop: "40px",}}>
                <h1 style={{marginBottom: "20px"}}> Connect A Wallet </h1>
                <ConnectButton 
                client={client}
                chain={chain}/>
            </div>
            )}
            
        </div>
            </div>
            <div style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-around",
              marginTop: "20px"
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
        </div>
      
    </div>
  );
}

export default dashboardPage;