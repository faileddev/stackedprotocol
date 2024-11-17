'use client'

import Image from "next/image";
import { useEffect, useState } from "react";

import ETH from "../public/ethereum-eth-logo.svg"


import { approve, balanceOf } from "thirdweb/extensions/erc20";
import { TransactionButton, useActiveAccount, useReadContract, useWalletBalance } from "thirdweb/react";
import { STAKE_CONTRACT, WETH_CONTRACT, LENDING_POOL_CONTRACT, client, chain } from "../utils/constants";
import { prepareContractCall, readContract, toEther, toWei } from "thirdweb";
import { addEvent } from "thirdweb/extensions/farcaster/keyRegistry";
import Link from "next/link";
import { getEthBalance } from "thirdweb/extensions/multicall3";


const WethRepayCard: React.FC = () => {

    const account = useActiveAccount();
    const [healthFactor, setHealthFactor] = useState<string | null>(null);
    const liquidationThreshold = 80; // Example liquidation threshold in percentage

    const WETHContract = "0x4200000000000000000000000000000000000006";
    const [userCollateralBalance, setUserCollateralBalance] = useState<number | null>(null); // Collateral balance in the asset

    const [borrowableAmount, setBorrowableAmount] = useState<number | null>(null);
    const collateralizationRatio = 150; // Example ratio, can be adjusted

    const [borrowLimitInAsset, setBorrowLimitInAsset] = useState<string | null>(null);

    const decimals = 18;

    const { 
        data: collateralBalance, 
        isLoading: loadingcollateralBalance,
        refetch: refetchcollateralBalance,
    } = useReadContract (
        
        {
            contract: LENDING_POOL_CONTRACT,
            method: "getAccountBalances",
            params: [ account?.address || "" , WETHContract],
            queryOptions: {
                enabled: !!account
            }
       
    });

    const { 
        data: incurredInterest, 
        isLoading: loadingIncurredInterest,
        refetch: refetchIncurredInterest,
    } = useReadContract (
        
        {
            contract: LENDING_POOL_CONTRACT,
            method: "getInterestIncurred",
            params: [ account?.address || "" , WETHContract],
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
            params: [ account?.address || "" , WETHContract],
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
            params: [WETHContract],
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
            params: [WETHContract],
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
        data: WETHBalance, 
        isLoading: loadingWETHBalance,
        refetch: refetchWETHBalance
    } = useReadContract (
        balanceOf,
        {
            contract: WETH_CONTRACT,
            address: account?.address || "",
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
    

    const WETHBalanceInUSD = WETHBalance && assetPrice 
    ? (truncate(toEther(WETHBalance), 4) * Number(assetPrice)).toFixed(2) 
    : "0.00";

   


    const depositedBalanceInUSD = collateralBalance && assetPrice 
    ? (truncate(toEther(collateralBalance[0]), 4) * Number(assetPrice)).toFixed(2) 
    : "0.00";

    const totalLoanInUSD = collateralBalance && incurredInterest && assetPrice 
    ? (truncate(toEther((collateralBalance[1]+(incurredInterest))), 4) * Number(assetPrice)).toFixed(2) 
    : "0.00";

    const borrowedBalanceInUSD = collateralBalance && assetPrice 
    ? (truncate(toEther(collateralBalance[1]), 4) * Number(assetPrice)).toFixed(2) 
    : "0.00";

    const calculateHealthFactor = (
        collateralValueUSD: number,
        borrowedAmount: number,
        liquidationThreshold: number
    ): string => {
        if (borrowedAmount === 0) return "Safe - No Loans Yet"; // No borrowed amount, position is safe

    const liquidationThresholdDecimal = liquidationThreshold / 100; // Convert to decimal
    const healthFactor = (collateralValueUSD * liquidationThresholdDecimal) / borrowedAmount;

    if (healthFactor >= 1.5) {
        return `Healthy (${healthFactor.toFixed(2)})`; // Safe range
    } else if (healthFactor >= 1.0) {
        return `At Risk (${healthFactor.toFixed(2)})`; // Close to liquidation
    } else {
        return `Undercollateralized (${healthFactor.toFixed(2)})`; // Below liquidation threshold
    }};

    useEffect(() => {
        if (CollateralDollarValue && collateralBalance) {
            const collateralValueUSD = Number(CollateralDollarValue) / 1e18; // Convert from raw value
            const borrowedAmount = Number(toEther(collateralBalance[0])); // Borrowed balance in Ether
            const calculatedHealthFactor = calculateHealthFactor(
                collateralValueUSD,
                borrowedAmount,
                liquidationThreshold
            );
            setHealthFactor(calculatedHealthFactor);
        }
    }, [CollateralDollarValue, collateralBalance, liquidationThreshold]);

useEffect(() => {
    if (collateralBalance) {
        // Assuming collateralBalance[2] is the user's collateral balance in raw units
        const rawCollateral = Number(toEther(collateralBalance[2])); // Convert BigInt to number
        setUserCollateralBalance(rawCollateral); // Update userCollateralBalance state
    }
}, [collateralBalance]);

useEffect(() => {
    if (userCollateralBalance && collateralizationRatio > 0) {
        const limitInAsset = calculateBorrowLimitInAsset(userCollateralBalance, collateralizationRatio, decimals);
        console.log("Calculated Borrow Limit in Asset:", limitInAsset); // Debugging output
        setBorrowLimitInAsset(limitInAsset);
    }
}, [userCollateralBalance, collateralizationRatio]);

// Function to calculate borrow limit in the asset
function calculateBorrowLimitInAsset(
    userCollateralBalance: number,
    collateralizationRatio: number,
    decimals: number
): string {
    const ratioDecimal = collateralizationRatio / 100; // Convert percentage to decimal
    const borrowLimit = userCollateralBalance / ratioDecimal; // Apply formula
    return borrowLimit.toFixed(4); // Return result with 6 decimal places
}


    
    

    function truncate(vaule: string | number, decimalPlaces: number): number {
        const numericValue: number = Number(vaule);
        if (isNaN(numericValue)) {
            throw new Error('Invalid input: value must be convertible to a number');
        }
        const factor: number = Math.pow(10,decimalPlaces);
        return Math.trunc(numericValue*factor) / factor
    }
    
    useEffect(() => {
        if (CollateralDollarValue && collateralizationRatio > 0) {
          const dollarValue = parseFloat((Number(CollateralDollarValue) / 1e18).toFixed(2));
          const calculatedBorrowableAmount = (dollarValue / collateralizationRatio) * 100;
          setBorrowableAmount(parseFloat(calculatedBorrowableAmount.toFixed(2)));
        }
      }, [CollateralDollarValue, collateralizationRatio]);
    
    

    if (loadingEthBalance) {
        return <p>Loading balance...</p>;
    }

    if (!ethBalance) {
        return <p>Unable to fetch balance.</p>;
    }

    // Extract balance value (ensure the value exists)
    const balanceValue = ethBalance.displayValue
        ? parseFloat(ethBalance.displayValue).toLocaleString()
        : "0.00";

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
                                        padding: "10px",
                                        borderRadius: "5px",
                                        width: "100%",
                                        marginRight: "2px",
                                        
                                    }}>
                                        <p style={{fontSize: "10px"}}>
                                           Wallet Balance:
                                                                    </p>
                                              <h3>{truncate(toEther(WETHBalance!),4).toLocaleString() }<span style={{fontSize: "10px"}}> WETH</span>
                                            </h3>
                                            <p style={{
                                                            fontSize: "10px",
                                                            color: "GrayText",
                                                           }}>
                                                ~ ${WETHBalanceInUSD}
                                             </p>
                                    </div>
                                    
                                    <div style={{
                                        
                                        border: "solid",
                                        borderColor: "grey",
                                        padding: "10px",
                                        borderRadius: "5px",
                                        width: "100%",
                                        marginLeft: "2px",
                                    }}>
                                         <p style={{
                                        fontSize: "10px"
                                    }}>
                                        Borrowed Balance:
                                    </p>
                                    <h3>
                                            {collateralBalance ?
                                                truncate(toEther(collateralBalance[1] * BigInt(1)).toString(), 4).toLocaleString()
                                                :
                                                '...'
                                            }<span style={{fontSize: "10px"}}> WETH</span>
                                                       </h3>
                                                       <p style={{
                                                        fontSize: "10px",
                                                        color: "GrayText",
                                                       }}>
                                            ~ ${borrowedBalanceInUSD}
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
                                    padding: "10px",
                                    borderRadius: "5px",
                                    width: "100%",
                                    marginRight: "2px"
                                }}>
                            
                                <p style={{fontSize: "10px"}}>
                                    Collateral Balance:
                            </p>
                            
                            
                                      
                            <h3>
                                        {collateralBalance ? 
                                            truncate(toEther(collateralBalance[2] * BigInt(1)).toString(), 4).toLocaleString() 
                                            : 
                                            '...'
                                        }<span style={{fontSize: "10px"}}> WETH</span>
                                                   </h3>
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
                                    padding: "10px",
                                    borderRadius: "5px",
                                    width: "100%",
                                    marginLeft: "2px",
                                }}>

                                     <p style={{
                                    fontSize: "10px"
                                }}>
                                    Total Debt:
                                </p>
                                <h3>
                                        {collateralBalance ? 
                                            truncate(toEther((collateralBalance[1])+(incurredInterest!)), 4).toLocaleString() 
                                            : 
                                            '...'
                                        }<span style={{fontSize: "10px"}}> WETH</span>
                                                   </h3>
                                                   <p style={{
                                                    fontSize: "10px",
                                                    color: "GrayText",
                                                   }}>
                                        ~ ${totalLoanInUSD}
                                     </p>
                                     </div>
                                     </div>
                            </div>
                        </div>


)
};
export default WethRepayCard;