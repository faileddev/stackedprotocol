'use client'

import Image from "next/image";
import { useEffect, useState } from "react";
import SOS from "../public/SOS.svg"

import sUSD from "../public/sUSD.svg"
import ETH from "../public/ethereum-eth-logo.svg"


import { approve, balanceOf } from "thirdweb/extensions/erc20";
import { TransactionButton, useActiveAccount, useReadContract, useWalletBalance } from "thirdweb/react";
import { STAKE_CONTRACT, TOKEN_CONTRACT, LENDING_POOL_CONTRACT, client, chain } from "../utils/constants";
import { prepareContractCall, readContract, toEther, toWei } from "thirdweb";
import { addEvent } from "thirdweb/extensions/farcaster/keyRegistry";
import Link from "next/link";
import { getEthBalance } from "thirdweb/extensions/multicall3";


const SOSLendInfo: React.FC = () => {

    const account = useActiveAccount();

    const SOSContract = "0xf63Fca327C555408819e26eDAc30F83E55a119f4";
    const [userCollateralBalance, setUserCollateralBalance] = useState<number | null>(null); // Collateral balance in the asset

    const [borrowableAmount, setBorrowableAmount] = useState<number | null>(null);
    const collateralizationRatio = 150; // Example ratio, can be adjusted

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
            params: [ account?.address || "" , SOSContract],
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
            params: [ account?.address || "" , SOSContract],
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
            params: [SOSContract],
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
            params: [SOSContract],
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
            params: [SOSContract],
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
            params: [SOSContract],
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
        data: SOSBalance, 
        isLoading: loadingSOSBalance,
        refetch: refetchSOSBalance
    } = useReadContract (
        balanceOf,
        {
            contract: TOKEN_CONTRACT,
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
            params: [SOSContract],
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
            params: [SOSContract],
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
    

    const SOSBalanceInUSD = SOSBalance && assetPrice 
    ? (truncate(toEther(SOSBalance), 4) * Number(assetPrice)).toFixed(2) 
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
            <p style={{marginTop: "10px"}}>Pool Balance:</p>
            
        </div>
        <div style={{
            display: "flex",
            flexDirection: "column",
            textAlign: "right"
            
        }} >
            <p style={{
                        marginTop: "10px"
                    }}>
                                {totalDeposits 
    ? `${formatNumber(truncate(toEther(totalDeposits), 2))}`
    : "0.0"} SOS
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
            <p style={{marginTop: "10px"}}>Total Borrows:</p>
            
        </div>
        <div style={{
            display: "flex",
            flexDirection: "column",
            textAlign: "right"
            
        }} >
            <p style={{
                        marginTop: "10px"
                    }}>
                                {totalBorrows 
    ? `${formatNumber(truncate(toEther(totalBorrows), 2))}`
    : "0.0"} SOS
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
            <p style={{marginTop: "10px"}}>Lending APR:</p>
            
        </div>
        <div style={{
            display: "flex",
            flexDirection: "column",
            textAlign: "right"
            
        }} >
            <p style={{
                        marginTop: "10px"
                    }}>
                                {depositAPR}%
                            </p>
            
        </div>

        
        
        
        </div>
        </div>
        
        
)
};
export default SOSLendInfo;