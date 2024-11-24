'use client'

import Image from "next/image";
import { useEffect, useState } from "react";

import ETH from "../public/ethereum-eth-logo.svg"


import { approve, balanceOf } from "thirdweb/extensions/erc20";
import { TransactionButton, useActiveAccount, useReadContract, useWalletBalance } from "thirdweb/react";
import { TOKEN_CONTRACT, STAKE_CONTRACT, DAI_CONTRACT, LENDING_POOL_CONTRACT, client, chain } from "../utils/constants";
import { prepareContractCall, readContract, toEther, toWei } from "thirdweb";
import { addEvent } from "thirdweb/extensions/farcaster/keyRegistry";
import Link from "next/link";
import { getEthBalance } from "thirdweb/extensions/multicall3";


const DaiBorrowCard: React.FC = () => {

    const account = useActiveAccount();
    const [healthFactor, setHealthFactor] = useState<string | null>(null);
    const liquidationThreshold = 80; // Example liquidation threshold in percentage

    const DAIContract = "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb";
    const [userCollateralBalance, setUserCollateralBalance] = useState<number | null>(null); // Collateral balance in the asset

    const [borrowableAmount, setBorrowableAmount] = useState<number | null>(null);
    const [borrowLimitInAsset, setBorrowLimitInAsset] = useState<string | null>(null);

    const decimals = 18;
    
    

    const [supplyAmount, setSupplyAmount] = useState(1);
    const [borrowAmount, setBorrowAmount] = useState(0);
    const [wrapAmount, setWrapAmount] = useState(1);
    const [depositingState, setDepositingState] = useState<"init" | "approved">("init");
    const [isDepositing, setIsDepositing] = useState(false);
    const [isWrapping, setIsWrapping] = useState(false);
    const [isBorrowing, setisBorrowing] = useState(false);

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
        data: colRiskParams, 
        isLoading: loadingColRiskParams,
        refetch: refetchColRiskParams,
    } = useReadContract (
        
        {
            contract: LENDING_POOL_CONTRACT,
            method: "collateralRiskParams",
            params: [DAIContract],
            queryOptions: {
                enabled: !!account
            }
       
    });
    

    const { 
        data: interestRate, 
        isLoading: loadingInterestRate,
        refetch: refetchInterestRate,
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
        data: totalDeposits, 
        isLoading: loadingTotalDeposits,
        refetch: refetchTotalDeposits,
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
        data: totalBorrows, 
        isLoading: loadingTotalBorrows,
        refetch: refetchTotalBorrows,
    } = useReadContract (
        
        {
            contract: LENDING_POOL_CONTRACT,
            method: "totalBorrows",
            params: [DAIContract],
            queryOptions: {
                enabled: !!account
            }
       
    });

    const { 
        data: collateralizationRatio, 
        isLoading: loadingCollateralizationRatio,
        refetch: refetchCollateralizationRatio,
    } = useReadContract (
        
        {
            contract: LENDING_POOL_CONTRACT,
            method: "collateralizationRatios",
            params: [DAIContract],
            queryOptions: {
                enabled: !!account
            }
       
    });

    const { 
        data: depositFee, 
        isLoading: loadingDepositFee,
        refetch: refetchDepositFee,
    } = useReadContract (
        
        {
            contract: LENDING_POOL_CONTRACT,
            method: "depositFeePercent",
            params: [DAIContract],
            queryOptions: {
                enabled: !!account
            }
       
    });

    const { 
        data: withdrawFee, 
        isLoading: loadingWithdrawFee,
        refetch: refetchWithdrawFee,
    } = useReadContract (
        
        {
            contract: LENDING_POOL_CONTRACT,
            method: "withdrawFeePercent",
            params: [DAIContract],
            queryOptions: {
                enabled: !!account
            }
       
    });

    
    const collateralRiskPercentage = colRiskParams ? (Number(colRiskParams[0]) / 1e16) + "%" : "Loading...";

    const secondsInYear = 365 * 24 * 60 * 60; // Number of seconds in a year
    const precisionFactor = 1e18; // Scaling factor
    
    const apr = interestRate 
    ? ((Number(interestRate) / precisionFactor) * secondsInYear * 100).toFixed(2)
    : "0.00";    
    
    const formattedCollateralDollarValue = (Number(CollateralDollarValue) / 1e18).toFixed(2);
    const currentTime = Math.floor(Date.now() / 1000);  // Current time in seconds
    
    const assetPrice = rawAssetPrice ? (Number(rawAssetPrice) / 1e8).toFixed(18) : null; // Divide by 1e8 and format to 2 decimals
    const localizedAssetPrice = assetPrice 
    ? Number(assetPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) 
    : null;

    const totalDepositsInUSD = totalDeposits && assetPrice 
    ? (truncate(toEther(totalDeposits), 4) * Number(assetPrice)).toFixed(2) 
    : "0.00";

    const totalBorrowsInUSD = totalBorrows && assetPrice 
    ? (truncate(toEther(totalBorrows), 4) * Number(assetPrice)).toFixed(2) 
    : "0.00";
    
    const [depositAPR, setDepositAPR] = useState<string>("0.00");

useEffect(() => {
  if (totalDeposits && totalBorrows && apr) {
    const calculatedAPR = ((Number(totalBorrows) / Number(totalDeposits)) * Number(apr)).toFixed(2);
    setDepositAPR(calculatedAPR);
  }
    }, [totalDeposits, totalBorrows, apr]);


    const depositedBalanceInUSD = collateralBalance && assetPrice 
    ? (truncate(toEther(collateralBalance[0]), 4) * Number(assetPrice)).toFixed(2) 
    : "0.00";

    const borrowedBalanceInUSD = collateralBalance && assetPrice 
    ? (truncate(toEther(collateralBalance[1]), 4) * Number(assetPrice)).toFixed(2) 
    : "0.00";




// Function to calculate borrow limit in the asset


function formatNumber(value: number): string {
    if (value >= 1_000_000_000) {
        // Format as billions
        return `${(value / 1_000_000_000).toFixed(1)}B`;
    } else if (value >= 1_000_000) {
        // Format as millions
        return `${(value / 1_000_000).toFixed(1)}M`;
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

    
    

  

    return (


        <div style={{
            display:"flex",
            flexDirection: "column",
            justifyContent: "space-between",
            }}>


            <div style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "start",
                alignItems: "start",
                marginBottom: "2px"
            }}>
                <div style={{
                    border: "solid",
                    borderColor: "grey",
                    borderWidth: "1px",
                    padding: "10px",
                    borderRadius: "5px",
                    width: "100%",
                    marginRight: "4px"
                }}>
                    <p style={{fontSize: "10px"}}>
                       Total Deposits:
                                </p>
                                <h3>
  {totalDeposits 
    ? `${formatNumber(truncate(toEther(totalDeposits), 2))}`
    : "0.0"} 
  <span style={{fontSize: "10px"}}> DAI</span>
</h3>
                        <p style={{
                                        fontSize: "10px",
                                        color: "GrayText",
                                       }}>
                            ~ ${Number(totalDepositsInUSD).toLocaleString()}
                         </p>
                </div>
                     
                <div style={{
                    border: "solid",
                    borderColor: "grey",
                    borderWidth: "1px",
                    padding: "10px",
                    borderRadius: "5px",
                    width: "100%",
                    marginLeft: "4px"
                }}>   
                     

                                   <p style={{fontSize: "10px"}}>
                    Total Borrowed:
            </p>
            
            
                      
            <h3>
  {totalBorrows 
    ? `${formatNumber(truncate(toEther(totalBorrows), 4))}`
    : "0.0"} 
  <span style={{fontSize: "10px"}}> DAI</span>
</h3>
                                   
                                   <p style={{
                                    fontSize: "10px",
                                    color: "GrayText",
                                   }}>
                        ~ ${Number(totalBorrowsInUSD).toLocaleString()}
                     </p>

                                   </div> 
                                   
                                   
            </div>


            <div style={{
                display: "flex",
                flexDirection: "row",
                marginTop: "6px"
            }}>
                <div style={{
                        border: "solid",
                        borderColor: "grey",
                        borderWidth: "1px",
                        padding: "10px",
                        borderRadius: "5px",
                        width: "100%",
                        marginRight: "4px"
                    }}>
                
                <p style={{
                        fontSize: "10px"
                    }}>
                        Lending APR:
                    </p>
                    <h3>
                            {
                                depositAPR
                            }%
                                       </h3>
                    </div>
                
                    <div style={{
                        border: "solid",
                        borderColor: "grey",
                        borderWidth: "1px",
                        padding: "10px",
                        borderRadius: "5px",
                        width: "100%",
                        marginLeft: "4px",
                        marginRight: "4px"
                    }}>
                
                
                         <p style={{
                
                        fontSize: "10px"
                    }}>
                        Borrow APR:
                    </p>
                    <h3>
                    {apr}%
                                       </h3>
                                       </div>
                                       <div style={{
                        border: "solid",
                        borderColor: "grey",
                        borderWidth: "1px",
                        padding: "10px",
                        borderRadius: "5px",
                        width: "100%",
                        marginLeft: "4px",
                        
                    }}>
                
                
                         <p style={{
                
                        fontSize: "10px"
                    }}>
                        LTV Ratio:
                    </p>
                    <h3>
                    {collateralRiskPercentage ?
                                                    (collateralRiskPercentage)
                                                    :
                                                    '0.00'
                                                } 
                                       </h3>
                                       </div>
            
            </div>
            <div style={{
                display: "flex",
                flexDirection: "row",
                marginTop: "6px"
            }}>
               
                                       <div style={{
                        border: "solid",
                        borderColor: "grey",
                        borderWidth: "1px",
                        padding: "10px",
                        borderRadius: "5px",
                        width: "100%",
                        marginRight: "4px",
                        
                    }}>
                
                
                         <p style={{
                
                        fontSize: "10px"
                    }}>
                        Deposit Fee:
                    </p>
                    <h3>
                    {depositFee}%
                                       </h3>
                                       </div>
                                       <div style={{
                        border: "solid",
                        borderColor: "grey",
                        borderWidth: "1px",
                        padding: "10px",
                        borderRadius: "5px",
                        width: "100%",
                        marginLeft: "4px",
                        
                    }}>
                
                
                         <p style={{
                
                        fontSize: "10px"
                    }}>
                        Withdrawal Fee:
                    </p>
                    <h3>
                    {withdrawFee}%
                                       </h3>
                                       </div>
            
            </div>
            
                                   
                                   
            </div>
)
};
export default DaiBorrowCard;