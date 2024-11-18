'use client'

import Image from "next/image";
import { useEffect, useState } from "react";
import DAI from "../public/DAI.svg"

import ETH from "../public/ethereum-eth-logo.svg"


import { approve, balanceOf } from "thirdweb/extensions/erc20";
import { TransactionButton, useActiveAccount, useReadContract, useWalletBalance } from "thirdweb/react";
import { STAKE_CONTRACT, DAI_CONTRACT, LENDING_POOL_CONTRACT, client, chain } from "../utils/constants";
import { prepareContractCall, readContract, toEther, toWei } from "thirdweb";
import { addEvent } from "thirdweb/extensions/farcaster/keyRegistry";
import Link from "next/link";
import { getEthBalance } from "thirdweb/extensions/multicall3";


const DaiColInfo: React.FC = () => {

    const account = useActiveAccount();

    const DAIContract = "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb";
    const [userCollateralBalance, setUserCollateralBalance] = useState<number | null>(null); // Collateral balance in the asset

    const [borrowableAmount, setBorrowableAmount] = useState<number | null>(null);
    const collateralizationRatio = 120; // Example ratio, can be adjusted

    const [borrowLimitInAsset, setBorrowLimitInAsset] = useState<string | null>(null);
    const liquidationThreshold = 80; // Example liquidation threshold in percentage

    const decimals = 18;

    const [healthFactor, setHealthFactor] = useState<string | null>(null);

    
    

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
        data: totalCollateralUSD, 
        isLoading: loadingTotalCollateralUSD,
        refetch: refetchTotalCollateralUSD,
    } = useReadContract (
        
        {
            contract: LENDING_POOL_CONTRACT,
            method: "getTotalCollateralInUSD",
            params: [ account?.address || "" , ],
            queryOptions: {
                enabled: !!account
            }
       
    });

    const { 
        data: totalDebtUSD, 
        isLoading: loadingTotalDebtUSD,
        refetch: refetchTotalDebtUSD,
    } = useReadContract (
        
        {
            contract: LENDING_POOL_CONTRACT,
            method: "getTotalDebtInUSD",
            params: [ account?.address || "" , ],
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
        data: WithdrawFee, 
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

    

    const secondsInYear = 365 * 24 * 60 * 60; // Number of seconds in a year
    const precisionFactor = 1e18; // Scaling factor
    
    const apr = interestRate 
    ? ((Number(interestRate) / precisionFactor) * secondsInYear * 100).toFixed(2)
    : "0.00";    
    
    const formattedCollateralDollarValue = (Number(CollateralDollarValue) / 1e18).toFixed(2);
    const currentTime = Math.floor(Date.now() / 1000);  // Current time in seconds
    const assetPrice = rawAssetPrice ? (Number(rawAssetPrice) / 1e8).toFixed(6) : null; // Divide by 1e8 and format to 2 decimals
    const localizedAssetPrice = assetPrice 
    ? Number(assetPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) 
    : null;
    

    const DAIBalanceInUSD = DAIBalance && assetPrice 
    ? (truncate(toEther(DAIBalance), 4) * Number(assetPrice)).toFixed(2) 
    : "0.00";

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


    const calculateHealthFactor = (
        totalCollateralUSD: number,
        totalDebtUSD: number,
        liquidationThreshold: number
    ): string => {
        // No debt, user is safe
        if (totalDebtUSD === 0) return "Safe - No Loans Yet";
    
        const liquidationThresholdDecimal = liquidationThreshold / 100; // Convert to decimal
        const healthFactor = (totalCollateralUSD * liquidationThresholdDecimal) / totalDebtUSD;
    
        if (healthFactor >= 1.5) {
            return `Healthy (${healthFactor.toFixed(2)})`; // Safe range
        } else if (healthFactor >= 1.0) {
            return `At Risk (${healthFactor.toFixed(2)})`; // Close to liquidation
        } else {
            return `Undercollateralized (${healthFactor.toFixed(2)})`; // Below liquidation threshold
        }
    };
    
    useEffect(() => {
        if (totalCollateralUSD && totalDebtUSD) {
            const collateralValueUSD = Number(toEther(totalCollateralUSD)); // Convert BigInt to number
            const debtValueUSD = Number(toEther(totalDebtUSD)); // Convert BigInt to number
            const calculatedHealthFactor = calculateHealthFactor(
                collateralValueUSD,
                debtValueUSD,
                liquidationThreshold || 80 // Default liquidation threshold to 80%
            );
            console.log("Updated Health Factor:", calculatedHealthFactor);
            setHealthFactor(calculatedHealthFactor); // Update state
        }
    }, [totalCollateralUSD, totalDebtUSD, liquidationThreshold]);

    const [borrowLimitUSD, setBorrowLimitUSD] = useState<string>("0.00");
const [borrowLimitAsset, setBorrowLimitAsset] = useState<string>("0.00");


useEffect(() => {
    if (totalCollateralUSD && collateralizationRatio && assetPrice && totalDebtUSD !== undefined) {
        const scaledCollateralUSD = Number(toEther(totalCollateralUSD)); // Convert from wei to human-readable
        const borrowLimitUSD = (scaledCollateralUSD * collateralizationRatio) / 100; // Borrow limit in USD
        const availableBorrowLimitUSD = Math.max(borrowLimitUSD - Number(toEther(totalDebtUSD)), 0); // Subtract debt and ensure non-negative
        const availableBorrowLimitAsset = availableBorrowLimitUSD / Number(assetPrice); // Borrow limit in the asset

        console.log('Total Collateral USD:', scaledCollateralUSD);
        console.log('Borrow Limit USD:', borrowLimitUSD);
        console.log('Total Debt USD:', Number(toEther(totalDebtUSD)));
        console.log('Available Borrow Limit USD:', availableBorrowLimitUSD);
        console.log('Available Borrow Limit in Asset:', availableBorrowLimitAsset);

        setBorrowLimitUSD(availableBorrowLimitUSD.toFixed(2)); // Update available borrow limit in USD
        setBorrowLimitAsset(availableBorrowLimitAsset.toFixed(4)); // Update available borrow limit in asset
    }
}, [totalCollateralUSD, collateralizationRatio, assetPrice, totalDebtUSD]);


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
        <div>
        <div style={{
            display: "flex",
            flexDirection: "row",
            width: "100%",
            justifyContent: "space-between",
        }}>

            
        
        <div style={{
            display: "flex",
            flexDirection: "column",
            textAlign: "left"
            
        }} >
            <p style={{marginTop: "10px", fontSize: "12px"}}>Pool Balance:</p>
            
        </div>
        <div style={{
            display: "flex",
            flexDirection: "column",
            textAlign: "right"
            
        }} >
            <p style={{
                        marginTop: "10px",
                        fontSize: "12px"
                    }}>
                                {totalDeposits 
    ? `${formatNumber(truncate(toEther(totalDeposits), 2))}`
    : "0.0"} DAI
                    <span style={{
                    fontSize: "10px",
                    color: "GrayText",
                    marginLeft: "5px"}}
                    >

                       ~ ${Number(totalDepositsInUSD).toLocaleString()}
                    </span>
                            </p>
            
        </div>

        
        
        
        </div>

        <div style={{
            display: "flex",
            flexDirection: "row",
            width: "100%",
            justifyContent: "space-between",
        }}>

            
        
        <div style={{
            display: "flex",
            flexDirection: "column",
            textAlign: "left"
            
        }} >
            <p style={{marginTop: "5px", fontSize: "12px"}}>Total Borrows:</p>
            
        </div>
        <div style={{
            display: "flex",
            flexDirection: "column",
            textAlign: "right"
            
        }} >
            <p style={{
                        marginTop: "5px",
                        fontSize: "12px"
                    }}>
                                {totalBorrows 
    ? `${formatNumber(truncate(toEther(totalBorrows), 2))}`
    : "0.0"} DAI
                    <span style={{
                    fontSize: "10px",
                    color: "GrayText",
                    marginLeft: "5px"}}
                    >

                       ~ ${Number(totalBorrowsInUSD).toLocaleString()}
                    </span>
                            </p>
            
        </div>

        
        
        
        </div>

       


        <div style={{
            display: "flex",
            flexDirection: "row",
            width: "100%",
            justifyContent: "space-between",
        }}>

            
        
        <div style={{
            display: "flex",
            flexDirection: "column",
            textAlign: "left"
            
        }} >
            <p style={{marginTop: "5px", fontSize: "12px"}}>Borrow APR:</p>
            
        </div>
        <div style={{
            display: "flex",
            flexDirection: "column",
            textAlign: "right"
            
        }} >
            <p style={{
                        marginTop: "5px",
                        fontSize: "12px"
                    }}>
                                {apr}%
                            </p>
            
        </div>

                            

        
        
        
        </div>
        <div style={{
            display: "flex",
            flexDirection: "row",
            width: "100%",
            justifyContent: "space-between",
        }}>

            
        
        <div style={{
            display: "flex",
            flexDirection: "column",
            textAlign: "left"
            
        }} >
            <p style={{marginTop: "5px", fontSize: "12px"}}>LTV Ratio:</p>
            
        </div>
        <div style={{
            display: "flex",
            flexDirection: "column",
            textAlign: "right"
            
        }} >
            <p style={{
                        marginTop: "5px",
                        fontSize: "12px"
                    }}>
                                {collateralizationRatio}%
                            </p>
            
        </div>

                            

        
        
        
        </div>

        <div style={{
                            display: "flex",
                            flexDirection: "row",
                            width: "100%",
                            justifyContent: "space-between",
                        }}>

                            
                        
                        <div style={{
                            display: "flex",
                            flexDirection: "column",
                            textAlign: "left"
                            
                        }} >
                            <p style={{marginTop: "5px", fontSize: "12px"}}>Borrow Limit:</p>
                            
                        </div>
                        <div style={{
                            display: "flex",
                            flexDirection: "column",
                            textAlign: "right"
                            
                        }} >
                            <p style={{marginTop: "5px", fontSize: "12px"}}>
                            
                            ~ ${Number(borrowLimitUSD).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}

                                <span style={{
                                    fontSize: "8px",
                                    color: "GrayText",
                                    marginLeft: "5px"}}
                                    >
                                        {borrowLimitAsset ? `${borrowLimitAsset} DAI` : "N/A"}
                                </span>
                             </p>
                            
                        </div>
                        
                        </div>


                        
                        

                        


                            
                         


                        <div style={{
                            display: "flex",
                            flexDirection: "row",
                            width: "100%",
                            justifyContent: "space-between",
                        }}>

                            
                        
                        <div style={{
                            display: "flex",
                            flexDirection: "column",
                            textAlign: "left"
                            
                        }} >
                            <p style={{marginTop: "5px", fontSize: "12px"}}>Health Factor:</p>
                            
                        </div>
                        <div style={{
                            display: "flex",
                            flexDirection: "column",
                            textAlign: "right"
                            
                        }} >
                            <p style={{
                                    fontSize: "10px",
                                    color: "GrayText",
                                    marginTop: "12px"}}>
                            
                            {healthFactor ? healthFactor : "N/A"}

 </p>
                            
                        </div>
                        
                        </div>

        </div>
        
        
)
};
export default DaiColInfo;