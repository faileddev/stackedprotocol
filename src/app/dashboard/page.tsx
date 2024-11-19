'use client'

import Logo from "../../../public/logo_Sos.svg"
import Image from "next/image";
import styles from "./page.module.css";
import Login from "../../../components/login"
import Userinfo from "../../../components/userInfo";
import Mint from "../../../components/mint";
import { ConnectButton, useActiveAccount, useReadContract } from "thirdweb/react";
import { chain, client, LENDING_POOL_CONTRACT } from "../../../utils/constants";
import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "../../../components/Header";
import BalanceCard from "../../../components/BalanceCard";
import MoneyMarketTable from "../../../components/MoneyMarketTable";
import TotalDepositsCard from "../../../components/TotalDepositsCard";
import TotalBorrowsCard from "../../../components/TotalBorrows";

const dashboardPage = () => {
  const account = useActiveAccount();

  const sUSDContract = "0x65F74FD58284dAEaFaC89d122Fb0566E0629C2a0";
const SosContract = "0xf63Fca327C555408819e26eDAc30F83E55a119f4";
const WETHContract = "0x4200000000000000000000000000000000000006";
const DAIContract = "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb";

  const { 
    data: susdInterestRate, 
    isLoading: loadingSusdInterestRate,
    refetch: refetchSusdInterestRate,
} = useReadContract (
    
    {
        contract: LENDING_POOL_CONTRACT,
        method: "calculateInterestRate",
        params: [sUSDContract],
        queryOptions: {
            enabled: !!account
        }
   
});

const { 
  data: sosInterestRate, 
  isLoading: loadingSosInterestRate,
  refetch: refetchSosInterestRate,
} = useReadContract (
  
  {
      contract: LENDING_POOL_CONTRACT,
      method: "calculateInterestRate",
      params: [SosContract],
      queryOptions: {
          enabled: !!account
      }
 
});

const { 
  data: wethInterestRate, 
  isLoading: loadingWethnterestRate,
  refetch: refetchWethInterestRate,
} = useReadContract (
  
  {
      contract: LENDING_POOL_CONTRACT,
      method: "calculateInterestRate",
      params: [WETHContract],
      queryOptions: {
          enabled: !!account
      }
 
});

const { 
  data: daiInterestRate, 
  isLoading: loadingDaiInterestRate,
  refetch: refetchDaiInterestRate,
} = useReadContract (
  
  {
      contract: LENDING_POOL_CONTRACT,
      method: "calculateInterestRate",
      params: [DAIContract],
      queryOptions: {
          enabled: !!account
      }
 
});

const { 
  data: totalSusdDeposits, 
  isLoading: loadingTotalSusdDeposits,
  refetch: refetchTotalSusdDeposits,
} = useReadContract (
  
  {
      contract: LENDING_POOL_CONTRACT,
      method: "totalDeposits",
      params: [sUSDContract],
      queryOptions: {
          enabled: !!account
      }
 
});

const { 
  data: totalSusdBorrows, 
  isLoading: loadingTotalSusdBorrows,
  refetch: refetchTotalSusdBorrows,
} = useReadContract (
  
  {
      contract: LENDING_POOL_CONTRACT,
      method: "totalBorrows",
      params: [sUSDContract],
      queryOptions: {
          enabled: !!account
      }
 
});

const { 
  data: totalSosDeposits, 
  isLoading: loadingTotalSosDeposits,
  refetch: refetchTotalSosDeposits,
} = useReadContract (
  
  {
      contract: LENDING_POOL_CONTRACT,
      method: "totalDeposits",
      params: [SosContract],
      queryOptions: {
          enabled: !!account
      }
 
});

const { 
  data: totalDaiDeposits, 
  isLoading: loadingTotalDaiDeposits,
  refetch: refetchTotalDaiDeposits,
} = useReadContract (
  
  {
      contract: LENDING_POOL_CONTRACT,
      method: "totalDeposits",
      params: [DAIContract],
      queryOptions: {
          enabled: !!account
      }
 
});

const { 
  data: totalWethDeposits, 
  isLoading: loadingTotalWethDeposits,
  refetch: refetchTotalWethDeposits,
} = useReadContract (
  
  {
      contract: LENDING_POOL_CONTRACT,
      method: "totalDeposits",
      params: [WETHContract],
      queryOptions: {
          enabled: !!account
      }
 
});

const { 
  data: totalSosBorrows, 
  isLoading: loadingTotalSosBorrows,
  refetch: refetchTotalSosBorrows,
} = useReadContract (
  
  {
      contract: LENDING_POOL_CONTRACT,
      method: "totalBorrows",
      params: [SosContract],
      queryOptions: {
          enabled: !!account
      }
 
});

const { 
  data: totalDaiBorrows, 
  isLoading: loadingTotalDaiBorrows,
  refetch: refetchTotalDaiBorrows,
} = useReadContract (
  
  {
      contract: LENDING_POOL_CONTRACT,
      method: "totalDeposits",
      params: [DAIContract],
      queryOptions: {
          enabled: !!account
      }
 
});

const { 
  data: totalWethBorrows, 
  isLoading: loadingTotalWethBorrows,
  refetch: refetchTotalWethBorrows,
} = useReadContract (
  
  {
      contract: LENDING_POOL_CONTRACT,
      method: "totalDeposits",
      params: [WETHContract],
      queryOptions: {
          enabled: !!account
      }
 
});



const secondsInYear = 365 * 24 * 60 * 60; // Number of seconds in a year
const precisionFactor = 1e18; // Scaling factor

const susdApr = susdInterestRate
? (Number(susdInterestRate) / precisionFactor) * secondsInYear * 100
: 0.0;   

const sosApr = sosInterestRate
? (Number(sosInterestRate) / precisionFactor) * secondsInYear * 100
: 0.0;   

const wethApr = wethInterestRate
? (Number(wethInterestRate) / precisionFactor) * secondsInYear * 100
: 0.0;   

const daiApr = daiInterestRate
? (Number(daiInterestRate) / precisionFactor) * secondsInYear * 100
: 0.0;   

const [susdDepositAPR, setSusdDepositAPR] = useState<number>(0.0);
const [sosDepositAPR, setSosDepositAPR] = useState<number>(0.0);
const [daiDepositAPR, setDaiDepositAPR] = useState<number>(0.0);
const [wethDepositAPR, setWethDepositAPR] = useState<number>(0.0);

useEffect(() => {
  if (totalSusdDeposits && totalSusdBorrows && susdApr) {
    const calculatedAPR = (Number(totalSusdBorrows) / Number(totalSusdDeposits)) * Number(susdApr);
    setSusdDepositAPR(Math.round(calculatedAPR * 100) / 100); // Rounded number with 2 decimal places
  }
}, [totalSusdDeposits, totalSusdBorrows, susdApr])

useEffect(() => {
  if (totalSosDeposits && totalSosBorrows && sosApr) {
    const sosCalculatedAPR = (Number(totalSosBorrows) / Number(totalSosDeposits)) * Number(sosApr);
    setSosDepositAPR(Math.round(sosCalculatedAPR * 100) / 100); // Rounded number with 2 decimal places
  }
}, [totalSosDeposits, totalSosBorrows, sosApr])

useEffect(() => {
  if (totalWethDeposits && totalWethBorrows && wethApr) {
    const wethCalculatedAPR = (Number(totalWethBorrows) / Number(totalWethDeposits)) * Number(wethApr);
    setWethDepositAPR(Math.round(wethCalculatedAPR * 100) / 100); // Rounded number with 2 decimal places
  }
}, [totalWethDeposits, totalWethBorrows, wethApr])

useEffect(() => {
  if (totalDaiDeposits && totalDaiBorrows && daiApr) {
    const daiCalculatedAPR = (Number(totalDaiBorrows) / Number(totalDaiDeposits)) * Number(daiApr);
    setDaiDepositAPR(Math.round(daiCalculatedAPR * 100) / 100); // Rounded number with 2 decimal places
  }
}, [totalSusdDeposits, totalSusdBorrows, susdApr])

  const assets = [
    { name: "ETH", image: "/ethereum-eth-logo.svg", supplyApy: wethDepositAPR, borrowApy: wethApr, isCollateral: true },
    { name: "WBTC", image: "/wrapped-bitcoin-wbtc-logo.svg", supplyApy: 0.0, borrowApy: 0.0, isCollateral: false },
    { name: "DAI", image: "/multi-collateral-dai-dai-logo.svg", supplyApy: daiDepositAPR, borrowApy: daiApr, isCollateral: true },
    { name: "USDC", image: "/usd-coin-usdc-logo.svg", supplyApy: 0.0, borrowApy: 0.0, isCollateral: false },
    { name: "SOS", image: "/red logo.svg", supplyApy: sosDepositAPR, borrowApy: sosApr, isCollateral: true },
    { name: "sUSD", image: "/susdcoin.svg", supplyApy: susdDepositAPR, borrowApy: susdApr, isCollateral: true },
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

                <TotalDepositsCard />

                <TotalBorrowsCard />

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