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
import NewMint from "../../../components/newMint";

const sUSDPage = () => {
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
          marginBottom: "40px"
        }}>
      
      
      
      
      
          <div>
      
      
            <div style={{
              padding: "10px",
              textAlign:"start",
              maxWidth: "50vh"
      
            }}>
              <h1>
            sUSD Vault
          </h1>
                    <p style={{
                      marginTop: "10px"
                    }}>
              sUSD is a fully decentralized and overcollateralized stablecoin, designed to maintain a 1:1 peg with the US Dollar (USD). Built with scalability and security at its core, sUSD empowers users to unlock financial opportunities in the decentralized finance (DeFi) ecosystem.
                    </p>
            </div>

            
      
            <div style={{
              marginTop: "10px",
              marginBottom: "20px"
            }}>
              <Userinfo />
              
            </div>
      
      <div>
          <div style={{
            display: "flex",
            flexDirection: "column",
            
            
            
            
        }}>
            {account ? (
                <div style={{ textAlign: "center"}}>
                <Mint />
              

            
            
           
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

export default sUSDPage;