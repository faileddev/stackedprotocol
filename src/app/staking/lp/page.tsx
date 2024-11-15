'use client'

import Image from "next/image";
import Logo from "../../components/SOS.png"
import Twitter from "../../components/twitter.png"
import styles from "./page.module.css";
import { chain, client } from "../../../../utils/constants";
import { ConnectButton, useActiveAccount } from "thirdweb/react";
import Link from "next/link";
import { useState } from "react";
import VaultData from "../../../../components/vaultData";
import VaultOne from "../../../../components/vaultOne";
import Footer from "../../../../components/Footer";
import Header from "../../../../components/Header";


const lpPage = () => {
  const account = useActiveAccount();


  const [openMenu, setOpenMenu] = useState(false);
  return (
    
      <div
      >
       
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
            LP Staking
          </h1>
                    <p style={{
                      marginTop: "10px"
                    }}>
              SOS is the governance token for the Stacks Of Sats protocol, staking your SOS tokens makes you eligible to earn a part of the protocol's revenue. The rewards are paid out in the protocol's stablecoin which can be redeemed at a 1:1 value.
                    </p>
            </div>

            
      
            <div style={{
              marginTop: "10px",
              marginBottom: "20px"
            }}>
              <VaultData />
              
            </div>
      
      <div>
          <div style={{
            display: "flex",
            flexDirection: "column",
            
            
            
            
        }}>
            {account ? (
                <div style={{ textAlign: "center"}}>
                

            <VaultOne />
            
            
           
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
export default lpPage;