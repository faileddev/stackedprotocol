'use client'


import { useEffect, useState } from "react";
import Image from "next/image";
import { approve, balanceOf } from "thirdweb/extensions/erc20";
import { TransactionButton, useActiveAccount, useReadContract } from "thirdweb/react";
import { DAI_CONTRACT, LENDING_POOL_CONTRACT, SUSD_CONTRACT, TOKEN_CONTRACT, USDC_CONTRACT } from "../utils/constants";
import { prepareContractCall, toEther, toWei } from "thirdweb";
import { Box, Tab, Tabs, Typography } from "@mui/material";
import sUSD from "../public/susdcoin.svg"
import USDC from "../public/usd-coin-usdc-logo.svg"
import DAI from "../public/multi-collateral-dai-dai-logo.svg"
import SOS from "../public/red logo.svg"


import { Contract, ethers, formatUnits, JsonRpcProvider, parseUnits } from "ethers";




const sUSDContract = "0x65F74FD58284dAEaFaC89d122Fb0566E0629C2a0";
const SosContract = "0xf63Fca327C555408819e26eDAc30F83E55a119f4";
const WETHContract = "0x4200000000000000000000000000000000000006";
const DAIContract = "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb";






const TotalDepositsCard: React.FC = () => {

    const account = useActiveAccount();
    

    

    
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
        data: Networth, 
        isLoading: loadingNetworth,
        refetch: refetchNetworth,
    } = useReadContract (
        
        {
            contract: LENDING_POOL_CONTRACT,
            method: "getNetWorthInUSD",
            params: [account?.address || "" ,],
            queryOptions: {
                enabled: !!account
            }
       
    });

    const { 
        data: usdcBalance, 
        isLoading: loadingUsdcBalance,
        refetch: refetchUsdcBalance,
    } = useReadContract (
        balanceOf,
        {
            contract: USDC_CONTRACT,
            address: account?.address || "",
            queryOptions: {
                enabled: !!account
            }
       
    });

    const { 
        data: daiBalance, 
        isLoading: loadingDaiBalance,
        refetch: refetchDaiBalance,
    } = useReadContract (
        balanceOf,
        {
            contract: DAI_CONTRACT,
            address: account?.address || "",
            queryOptions: {
                enabled: !!account
            }
       
    });

    const { 
        data: rawAssetPrice, 
        isLoading: loadingAssetPrice,
        refetch: refetchAssetPrice,
    } = useReadContract (
        
        {
            contract: LENDING_POOL_CONTRACT,
            method: "getPrice",
            params: [DAIContract],
            queryOptions: {
                enabled: !!account
            }
       
    });

    const { 
        data: rawSusdAssetPrice, 
        isLoading: loadingSusdAssetPrice,
        refetch: refetchSusdAssetPrice,
    } = useReadContract (
        
        {
            contract: LENDING_POOL_CONTRACT,
            method: "getPrice",
            params: [sUSDContract],
            queryOptions: {
                enabled: !!account
            }
       
    });

    const { 
        data: rawWethAssetPrice, 
        isLoading: loadingWethAssetPrice,
        refetch: refetchWethAssetPrice,
    } = useReadContract (
        
        {
            contract: LENDING_POOL_CONTRACT,
            method: "getPrice",
            params: [WETHContract],
            queryOptions: {
                enabled: !!account
            }
       
    });

    const { 
        data: rawSosAssetPrice, 
        isLoading: loadingSosAssetPrice,
        refetch: refetchSosAssetPrice,
    } = useReadContract (
        
        {
            contract: LENDING_POOL_CONTRACT,
            method: "getPrice",
            params: [SosContract],
            queryOptions: {
                enabled: !!account
            }
       
    });

    const { 
        data: rawDaiAssetPrice, 
        isLoading: loadingDaiAssetPrice,
        refetch: refetchDaiAssetPrice,
    } = useReadContract (
        
        {
            contract: LENDING_POOL_CONTRACT,
            method: "getPrice",
            params: [DAIContract],
            queryOptions: {
                enabled: !!account
            }
       
    });
    

    const { 
        data: susdBalance, 
        isLoading: loadingSusdBalance,
        refetch: refetchSusdBalance
    } = useReadContract (
        balanceOf,
        {
            contract: SUSD_CONTRACT,
            address: account?.address || "",
            queryOptions: {
                enabled: !!account
            }
       
    });

    
    
    function toUSDC(amount: string) {
        return parseUnits(amount.toString(), 6); // 6 decimals for USDC
    }
    

    function formatUSDCBalance(balance: any) {
        return (Number(balance) / 1e6).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    
    
    

    function truncate(vaule: string | number, decimalPlaces: number): number {
        const numericValue: number = Number(vaule);
        if (isNaN(numericValue)) {
            throw new Error('Invalid input: value must be convertible to a number');
        }
        const factor: number = Math.pow(10,decimalPlaces);
        return Math.trunc(numericValue*factor) / factor
    }

    const [price, setPrice] = useState<string | null>(null);
    
    
    const daiAssetPrice = rawDaiAssetPrice ? (Number(rawDaiAssetPrice) / 1e8).toFixed(6) : null; // Divide by 1e8 and format to 2 decimals
    const localizedDaiAssetPrice = daiAssetPrice 
    ? Number(daiAssetPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) 
    : null;

    const wethAssetPrice = rawWethAssetPrice ? (Number(rawWethAssetPrice) / 1e8).toFixed(6) : null; // Divide by 1e8 and format to 2 decimals
    const localizedWethAssetPrice = wethAssetPrice 
    ? Number(wethAssetPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) 
    : null;

    const susdAssetPrice = rawSusdAssetPrice ? (Number(rawSusdAssetPrice) / 1e8).toFixed(6) : null; // Divide by 1e8 and format to 2 decimals
    const localizedSusdAssetPrice = susdAssetPrice 
    ? Number(susdAssetPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) 
    : null;

    const sosAssetPrice = rawSosAssetPrice ? (Number(rawSosAssetPrice) / 1e8).toFixed(18) : null; // Divide by 1e8 and format to 2 decimals
    const localizedSosAssetPrice = sosAssetPrice 
    ? Number(sosAssetPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) 
    : null;

    const totalSosDepositsInUSD = totalSosDeposits && sosAssetPrice 
    ? (truncate(toEther(totalSosDeposits), 4) * Number(sosAssetPrice))
    : "0.00";
   
    const totalSusdDepositsInUSD = totalSusdDeposits && susdAssetPrice 
    ? truncate(toEther(totalSusdDeposits), 4) * Number(susdAssetPrice)
    : 0;

    const totalDaiDepositsInUSD = totalDaiDeposits && daiAssetPrice 
    ? truncate(toEther(totalDaiDeposits), 4) * Number(daiAssetPrice)
    : 0;

    const totalWethDepositsInUSD = totalWethDeposits && wethAssetPrice 
    ? truncate(toEther(totalWethDeposits), 4) * Number(wethAssetPrice)
    : "0.00";
    
    const totalDepositsInUSD: number = 
    Number(totalDaiDepositsInUSD) + 
    Number(totalSosDepositsInUSD) + 
    Number(totalWethDepositsInUSD) + 
    Number(totalSusdDepositsInUSD);

  
    const formattedTotalDepositsInUSD = totalDepositsInUSD.toFixed(2);


    

    return (
<div>
            
                <div 
                style={{
                    
                    border: "solid",
                    borderColor: "GrayText",
                    borderWidth: "1px",
                    padding: "20px",
                    borderRadius: "10px",
                    marginTop: "40px",
                    
                }}>
                    
                    <div style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "flex-start",
                        alignContent: "flex-start",
                        alignItems: "flex-start"
                    }}>
                        <div style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "start"
                        }}>
                            <p>
                               Total Deposits:
                            </p>
                        
                        <div style={{
                            display: "flex",
                            flexDirection: "row",
                            alignContent: "center",
                            alignItems: "center",
                        }}>
                            <Image style={{height: "24px", width: "24px", marginRight: "5px"}}
                                                src={sUSD}
                                                alt='logo'
                                                />

                                                
                            
                                      <h2>{Number(formattedTotalDepositsInUSD!).toLocaleString()}</h2>
                                      
                        </div>
                        
                                      <p 
                                      style={{
                                        fontSize: "10px",
                                        color: "GrayText",
                                      }}>~ {Number(formattedTotalDepositsInUSD).toLocaleString()} USD</p>
                                    
                        </div>
                        
                        
                    
                       
                



                        
                    </div>
                    </div>
                    </div>
                    )
                    };
                    export default TotalDepositsCard;
                    
