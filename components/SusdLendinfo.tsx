'use client'

import Image from "next/image";
import { useEffect, useState } from "react";
import Susd from "../public/Susd.svg"

import sUSD from "../public/sUSD.svg"
import ETH from "../public/ethereum-eth-logo.svg"


import { approve, balanceOf } from "thirdweb/extensions/erc20";
import { TransactionButton, useActiveAccount, useReadContract, useWalletBalance } from "thirdweb/react";
import { STAKE_CONTRACT, SUSD_CONTRACT, LENDING_POOL_CONTRACT, client, chain } from "../utils/constants";
import { prepareContractCall, readContract, toEther, toWei } from "thirdweb";
import { addEvent } from "thirdweb/extensions/farcaster/keyRegistry";
import Link from "next/link";
import { getEthBalance } from "thirdweb/extensions/multicall3";


const SusdLendInfo: React.FC = () => {

    const account = useActiveAccount();

    const SusdContract = "0x65F74FD58284dAEaFaC89d122Fb0566E0629C2a0";
    const [userCollateralBalance, setUserCollateralBalance] = useState<number | null>(null); // Collateral balance in the asset

    const [borrowableAmount, setBorrowableAmount] = useState<number | null>(null);
    const collateralizationRatio = 105; // Example ratio, can be adjusted

    const [borrowLimitInAsset, setBorrowLimitInAsset] = useState<string | null>(null);
    const liquidationThreshold = 90; // Example liquidation threshold in percentage

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
            params: [ account?.address || "" , SusdContract],
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
            method: "getTotalCollateralValue",
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
            params: [ account?.address || "" , SusdContract],
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
            params: [SusdContract],
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
            params: [SusdContract],
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
            params: [SusdContract],
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
            params: [SusdContract],
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
        data: borrowingPower, 
        isLoading: loadingBorrowingPower,
        refetch: refetchBorrowingPower,
    } = useReadContract (
        
        {
            contract: LENDING_POOL_CONTRACT,
            method: "getBorrowingPower",
            params: [ account?.address || "" , ],
            queryOptions: {
                enabled: !!account
            }
       
    });


    const { 
        data: SusdBalance, 
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

    const { 
        data: depositFee, 
        isLoading: loadingDepositFee,
        refetch: refetchDepositFee,
    } = useReadContract (
        
        {
            contract: LENDING_POOL_CONTRACT,
            method: "depositFeePercent",
            params: [SusdContract],
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
            params: [SusdContract],
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
    

    const SusdBalanceInUSD = SusdBalance && assetPrice 
    ? (truncate(toEther(SusdBalance), 4) * Number(assetPrice)).toFixed(2) 
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


    const calculateBorrowLimitInAsset = (borrowingPower: number, assetPrice: number): number => {
        if (assetPrice === 0) {
            throw new Error("Asset price cannot be zero");
        }
    
        return borrowingPower / assetPrice;
    };


    useEffect(() => {
        try {
            if (borrowingPower && assetPrice) {
                // Convert BigInt values to number
                const borrowPowerNum = Number(borrowingPower);
                const assetPriceNum = Number(assetPrice);
    
                const borrowLimit = calculateBorrowLimitInAsset(borrowPowerNum, assetPriceNum);
                setBorrowLimitInAsset(borrowLimit.toFixed(6)); // Display up to 6 decimal places
            }
        } catch (error) {
            console.error("Error calculating borrow limit:", error);
            setBorrowLimitInAsset("Error");
        }
    }, [borrowingPower, assetPrice]);


    const calculateHealthFactor = (
        borrowingPower: number,
        totalDebtUSD: number,
        
    ): string => {
        // No debt, user is safe
        if (totalDebtUSD === 0) return "Safe - No Loans Yet";
    
        
        const healthFactor = borrowingPower / totalDebtUSD;
    
        if (healthFactor >= 1.5) {
            return `Healthy (${healthFactor.toFixed(2)})`; // Safe range
        } else if (healthFactor >= 1.0) {
            return `At Risk (${healthFactor.toFixed(2)})`; // Close to liquidation
        } else {
            return `Undercollateralized (${healthFactor.toFixed(2)})`; // Below liquidation threshold
        }
    };
    
    useEffect(() => {
        if (borrowingPower && totalDebtUSD) {
            const borrowPowerUSD = Number(toEther(borrowingPower)); // Convert BigInt to number
            const debtValueUSD = Number(toEther(totalDebtUSD)); // Convert BigInt to number
    
            // Calculate health factor using the new function
            const calculatedHealthFactor = calculateHealthFactor(
                borrowPowerUSD,
                debtValueUSD
            );
    
            console.log("Updated Health Factor:", calculatedHealthFactor);
    
            // Update state with the calculated health factor
            setHealthFactor(calculatedHealthFactor);
        }
    }, [borrowingPower, totalDebtUSD]);


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
    : "0.0"} sUSD
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
    : "0.0"} sUSD
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
            <p style={{marginTop: "5px", fontSize: "12px"}}>Lending APR:</p>
            
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
                                {depositAPR}%
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
                            <p style={{marginTop: "5px", fontSize: "12px"}}>Borrowing Power:</p>
                            
                        </div>
                        <div style={{
                            display: "flex",
                            flexDirection: "column",
                            textAlign: "right"
                            
                        }} >
                            <p style={{marginTop: "5px", fontSize: "12px"}}>
                            
                            ~ ${borrowingPower 
                                ? `${truncate(toEther(borrowingPower), 2)}`
                                : "0.0"}

                                <span style={{
                                    fontSize: "8px",
                                    color: "GrayText",
                                    marginLeft: "5px"}}
                                    >
                                        {borrowLimitInAsset ? `${truncate(toEther(BigInt(Number(borrowLimitInAsset)) * BigInt(1)),2)} sUSD` : "N/A"}
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
export default SusdLendInfo;