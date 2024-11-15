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
import VaultOne from "../../../components/vaultOne";
import EthereumVault from "../../../components/Ethereum";
import DaiVault from "../../../components/Dai";

const borrowPage = () => {
  const account = useActiveAccount();

  

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
          marginBottom: "40px",
          
        }}>
      
      
      
      
      
          
      
      
            
             
                    
            

            
      
           
      
      <div style={{
            display: "flex",
            flexDirection: "column",
            width: "50vh"

            
            
            
            
        }}>
          <div style={{
            display: "flex",
            flexDirection: "column",
            width: "100%"

            
            
            
            
        }}>
            {account ? (
                <div style={{ textAlign: "left"}}>
                <BalanceCard />

                <h1 style={{marginTop: "40px",}}>
            Borrow 
          </h1>
              
                <EthereumVault />

                <DaiVault />

            
            
           
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

export default borrowPage;