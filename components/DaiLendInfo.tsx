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


const DaiLendInfo: React.FC = () => {

    const account = useActiveAccount();
    const [healthFactor, setHealthFactor] = useState<string | null>(null);
    const liquidationThreshold = 80; // Example liquidation threshold in percentage

    const daiContract = "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb";
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
            params: [ account?.address || "" , daiContract],
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
            params: [ account?.address || "" , daiContract],
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
            params: [daiContract],
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
            params: [daiContract],
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
            params: [daiContract],
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
            params: [daiContract],
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
            params: [daiContract],
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
            params: [daiContract],
            queryOptions: {
                enabled: !!account
            }
       
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

    

    const secondsInYear = 365 * 24 * 60 * 60; // Number of seconds in a year
    const precisionFactor = 1e18; // Scaling factor
    
    const apr = interestRate 
    ? ((Number(interestRate) / precisionFactor) * secondsInYear * 100).toFixed(2)
    : "0.00";    
    
    const formattedCollateralDollarValue = (Number(CollateralDollarValue) / 1e18).toFixed(2);
    const currentTime = Math.floor(Date.now() / 1000);  // Current time in seconds
    const assetPrice = rawAssetPrice ? (Number(rawAssetPrice) / 1e8).toFixed(2) : null; // Divide by 1e8 and format to 2 decimals
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
                                { 
                                    truncate(toEther(totalDeposits! * BigInt(1)).toString(), 4).toLocaleString()
                                    
                                } DAI
                    <span style={{
                    fontSize: "10px",
                    color: "GrayText",
                    marginLeft: "5px"}}
                    >

                       ~ ${totalDepositsInUSD}
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
                                { 
                                    truncate(toEther(totalBorrows! * BigInt(1)).toString(), 4).toLocaleString()
                                    
                                } DAI
                    <span style={{
                    fontSize: "10px",
                    color: "GrayText",
                    marginLeft: "5px"}}
                    >

                       ~ ${totalBorrowsInUSD}
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
            <p style={{marginTop: "10px"}}>Deposit Fee:</p>
            
        </div>
        <div style={{
            display: "flex",
            flexDirection: "column",
            textAlign: "right"
            
        }} >
            <p style={{
                        marginTop: "10px"
                    }}>
                                {depositFee}%
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
            <p style={{marginTop: "10px"}}>Withdrawal Fee:</p>
            
        </div>
        <div style={{
            display: "flex",
            flexDirection: "column",
            textAlign: "right"
            
        }} >
            <p style={{
                        marginTop: "10px"
                    }}>
                                {WithdrawFee}%
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
export default DaiLendInfo;