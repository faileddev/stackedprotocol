'use client'

import Image from "next/image";
import { useEffect, useState } from "react";
import DAI from "../public/DAI.svg"

import sUSD from "../public/sUSD.svg"
import ETH from "../public/ethereum-eth-logo.svg"


import { approve, balanceOf } from "thirdweb/extensions/erc20";
import { TransactionButton, useActiveAccount, useReadContract, useWalletBalance } from "thirdweb/react";
import { TOKEN_CONTRACT, STAKE_CONTRACT, DAI_CONTRACT, LENDING_POOL_CONTRACT, client, chain } from "../utils/constants";
import { prepareContractCall, readContract, toEther, toWei } from "thirdweb";
import { addEvent } from "thirdweb/extensions/farcaster/keyRegistry";
import Link from "next/link";
import { getEthBalance } from "thirdweb/extensions/multicall3";


const DaiUserBorrowInfo: React.FC = () => {

    const account = useActiveAccount();

    const DAIContract = "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb";



    const decimals = 18;

    const { 
        data: collateralBalance, 
        isLoading: loadingcollateralBalance,
        refetch: refetchcollateralBalance,
    } = useReadContract (
        
        {
            contract: LENDING_POOL_CONTRACT,
            method: "getAccountBalances",
            params: [ account?.address || "" , DAIContract],
            queryOptions: {
                enabled: !!account
            }
       
    });

    const { 
        data: CollateralDollarValue, 
        isLoading: loadingCollateralDollarValue,
        refetch: refetchCollateralDollarValue,
    } = useReadContract (
        
        {
            contract: LENDING_POOL_CONTRACT,
            method: "getCollateralValueInUSD",
            params: [ account?.address || "" , DAIContract],
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
        data: ethBalance, 
        isLoading: loadingEthBalance,
        refetch: refetchEethBalance
    } = useWalletBalance (
        
        {
            client: client,
            tokenAddress: "",
            chain: chain,
            address: account?.address || "",
            
       
    });


    const { 
        data: DAIBalance, 
        isLoading: loadingDAIBalance,
        refetch: refetchDAIBalance
    } = useReadContract (
        balanceOf,
        {
            contract: DAI_CONTRACT,
            address: account?.address || "",
            queryOptions: {
                enabled: !!account
            }
       
    });

    const secondsInYear = 365 * 24 * 60 * 60; // Number of seconds in a year
    const precisionFactor = 1e18; // Scaling factor
    
       
    
    const formattedCollateralDollarValue = (Number(CollateralDollarValue) / 1e18).toFixed(2);
    const currentTime = Math.floor(Date.now() / 1000);  // Current time in seconds
    const assetPrice = rawAssetPrice ? (Number(rawAssetPrice) / 1e8).toFixed(2) : null; // Divide by 1e8 and format to 2 decimals
    const localizedAssetPrice = assetPrice 
    ? Number(assetPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) 
    : null;
    

    const DAIBalanceInUSD = DAIBalance && assetPrice 
    ? (truncate(toEther(DAIBalance), 4) * Number(assetPrice)).toFixed(2) 
    : "0.00";

   


    const depositedBalanceInUSD = collateralBalance && assetPrice 
    ? (truncate(toEther(collateralBalance[0]), 4) * Number(assetPrice)).toFixed(2) 
    : "0.00";

    const borrowedBalanceInUSD = collateralBalance && assetPrice 
    ? (truncate(toEther(collateralBalance[1]), 4) * Number(assetPrice)).toFixed(2) 
    : "0.00";

   

    
    

    function truncate(vaule: string | number, decimalPlaces: number): number {
        const numericValue: number = Number(vaule);
        if (isNaN(numericValue)) {
            throw new Error('Invalid input: value must be convertible to a number');
        }
        const factor: number = Math.pow(10,decimalPlaces);
        return Math.trunc(numericValue*factor) / factor
    }
    

    
    

   

    return (


                        <div style={{
                            display:"flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            }}>
                            <div style={{
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "end",
                                alignItems: "start",
                                
                            }}>

                                <div style={{
                                    display: "flex",
                                    flexDirection: "row",
                                    width: "100%"

                                }}>
                                    <div style={{
                                        border: "solid",
                                        borderColor: "grey",
                                        padding: "20px",
                                        borderRadius: "5px",
                                        width: "100%",
                                        marginRight: "2px",
                                        
                                    }}>
                                        <p style={{fontSize: "10px"}}>
                                           Wallet Balance:
                                                                    </p>
                                              <h2>{truncate(toEther(DAIBalance!),4).toLocaleString() }<span style={{fontSize: "10px"}}> DAI</span>
                                            </h2>
                                            <p style={{
                                                            fontSize: "10px",
                                                            color: "GrayText",
                                                           }}>
                                                ~ ${DAIBalanceInUSD}
                                             </p>
                                    </div>
                                    
                                    <div style={{
                                        
                                        border: "solid",
                                        borderColor: "grey",
                                        padding: "20px",
                                        borderRadius: "5px",
                                        width: "100%",
                                        marginLeft: "2px",
                                    }}>
                                         <p style={{
                                        fontSize: "10px"
                                    }}>
                                        Deposited Balance:
                                    </p>
                                    <h2>
                                            {collateralBalance ?
                                                truncate(toEther(collateralBalance[0] * BigInt(1)).toString(), 4).toLocaleString()
                                                :
                                                '...'
                                            }<span style={{fontSize: "10px"}}> DAI</span>
                                                       </h2>
                                                       <p style={{
                                                        fontSize: "10px",
                                                        color: "GrayText",
                                                       }}>
                                            ~ ${depositedBalanceInUSD}
                                         </p>
                                         </div>
                                </div>


                                <div style={{
                                    display: "flex",
                                    flexDirection: "row",
                                    width: "100%"

                                }}>
                                                   
                            
                                     <div style={{
                                    marginTop: "10px",
                                    border: "solid",
                                    borderColor: "grey",
                                    padding: "20px",
                                    borderRadius: "5px",
                                    width: "100%",
                                    marginRight: "2px"
                                }}>
                            
                                <p style={{fontSize: "10px"}}>
                                    Collateral Balance:
                            </p>
                            
                            
                                      
                            <h2>
                                        {collateralBalance ? 
                                            truncate(toEther(collateralBalance[2] * BigInt(1)).toString(), 4).toLocaleString() 
                                            : 
                                            '...'
                                        }<span style={{fontSize: "10px"}}> DAI</span>
                                                   </h2>
                                                   <p style={{
                                                    fontSize: "10px",
                                                    color: "GrayText",
                                                   }}>
                                        ~ ${(formattedCollateralDollarValue)}
                                     </p>

                                     </div>
                                   
                                
                                     <div style={{
                                    marginTop: "10px",
                                    border: "solid",
                                    borderColor: "grey",
                                    padding: "20px",
                                    borderRadius: "5px",
                                    width: "100%",
                                    marginLeft: "2px",
                                }}>

                                     <p style={{
                                    fontSize: "10px"
                                }}>
                                    Borrowed Balance:
                                </p>
                                <h2>
                                        {collateralBalance ? 
                                            truncate(toEther(collateralBalance[1] * BigInt(1)).toString(), 2).toLocaleString() 
                                            : 
                                            '...'
                                        }<span style={{fontSize: "10px"}}> DAI</span>
                                                   </h2>
                                                   <p style={{
                                                    fontSize: "10px",
                                                    color: "GrayText",
                                                   }}>
                                        ~ ${borrowedBalanceInUSD}
                                     </p>
                                     </div>
                                     </div>
                            </div>
                        </div>


)
};
export default DaiUserBorrowInfo;