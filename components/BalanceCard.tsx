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










const balanceCard: React.FC = () => {

    const account = useActiveAccount();
    

    

    

   

  

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
                               Net worth:
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
                            <h2>
  {Networth && !isNaN(Number(toEther(Networth)))
    ? truncate(Number(toEther(Networth)), 2).toLocaleString()
    : "0.00"}
</h2>
                        </div>
                        <p>
  {Networth && !isNaN(Number(toEther(Networth)))
    ? truncate(Number(toEther(Networth)), 2).toLocaleString()
    : "0.00"}
</p>
                        </div>
                        
                        
                    
                       
                



                        
                    </div>
                    </div>
                    </div>
                    )
                    };
                    export default balanceCard;
                    
