'use client'

import Image from "next/image";
import { useEffect, useState } from "react";
import DAI from "../public/multi-collateral-dai-dai-logo.svg"

import sUSD from "../public/sUSD.svg"
import ETH from "../public/ethereum-eth-logo.svg"


import { approve, balanceOf } from "thirdweb/extensions/erc20";
import { TransactionButton, useActiveAccount, useReadContract, useWalletBalance } from "thirdweb/react";
import { TOKEN_CONTRACT, STAKE_CONTRACT, WETH_CONTRACT, LENDING_POOL_CONTRACT, client, chain, DAI_CONTRACT } from "../utils/constants";
import { prepareContractCall, readContract, toEther, toWei } from "thirdweb";
import { addEvent } from "thirdweb/extensions/farcaster/keyRegistry";
import Link from "next/link";
import { getEthBalance } from "thirdweb/extensions/multicall3";
import DaiBorrowCard from "./DaiBorrowCard";
import DaiUserBorrowInfo from "./DaiUserBorrowInfo";
import DaiRepayCard from "./DaiRepayCard";


const DaiVault: React.FC = () => {

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
    const [repayAmount, setRepayAmount] = useState(1);
    const [depositingState, setDepositingState] = useState<"init" | "approved">("init");
    const [repayingState, setRepayingState] = useState<"init" | "approved">("init");
    const [isDepositing, setIsDepositing] = useState(false);
    const [isRepaying, setIsRepaying] = useState(false);
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
        data: incurredInterest, 
        isLoading: loadingIncurredInterest,
        refetch: refetchIncurredInterest,
    } = useReadContract (
        
        {
            contract: LENDING_POOL_CONTRACT,
            method: "getInterestIncurred",
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
        data: daiBalance, 
        isLoading: loadingDaiBalance,
        refetch: refetchDaiBalance
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
    
    const apr = interestRate 
    ? ((Number(interestRate) / precisionFactor) * secondsInYear * 100).toFixed(2)
    : "0.00";    
    
    const formattedCollateralDollarValue = (Number(CollateralDollarValue) / 1e18).toFixed(2);
    const currentTime = Math.floor(Date.now() / 1000);  // Current time in seconds
    const assetPrice = rawAssetPrice ? (Number(rawAssetPrice) / 1e8).toFixed(2) : null; // Divide by 1e8 and format to 2 decimals
    const daiBalanceInUSD = daiBalance && assetPrice 
    ? (truncate(toEther(daiBalance), 4) * Number(assetPrice)).toFixed(2) 
    : "0.00";

    const depositedBalanceInUSD = collateralBalance && assetPrice 
    ? (truncate(toEther(collateralBalance[0]), 4) * Number(assetPrice)).toFixed(2) 
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
<div>
            
                <div 
                style={{
                    backgroundColor: "#151515",
                    padding: "20px",
                    borderRadius: "10px",
                    textAlign: "left",
                    marginTop: "40px",
                    
                    
                }}>
                    <div style={{display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between"
                    }}>
                        <div style={{display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between"
                    }}
                        
                        >
                            
                            <Image style={{height: "36px", width: "36px", marginLeft: "5px"}}
                    src={DAI}
                    alt='logo'
                    />      
                        <div style={{ marginLeft: "5px"}}>
                            <p style={{
                                fontSize: "10px"
                            }}>
                                Price:
                            </p>
                            <h3>
                            {assetPrice}
                            </h3>
                        </div>
                            
                        </div>

                        <div style={{textAlign: "right"}}>
                            
                            
                            <h1>DAI</h1>
                            <p style={{ fontSize: "12px" }}>DAI Stablecoin</p>
                        </div>
                    </div>

                    <div style={{
                        marginTop: "20px",
                    }}>
                        <DaiBorrowCard />
                    </div>
                    
                    
                    <div style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        alignContent: "left",
                        alignItems: "left",
                        marginTop: "20px",
                    }}>
                        
                        <div style={{
                            display: "flex",
                            flexDirection: "column",
                        }}>
                            <div style={{
                                display: "flex",
                                flexDirection: "row",
                                justifyContent: "space-between",
                                marginBottom: "5px",
                            }}>
                                <button style={{
                                                    marginRight: "5px",
                                                    padding: "10px",
                                                    backgroundColor: "#efefef",
                                                    border: "none",
                                                    borderRadius: "6px",
                                                    color: "#333",
                                                    fontSize: "1rem",
                                                    cursor: "pointer",
                                                    width: "100%",}}
                                                    onClick={() => setIsDepositing(true)}
                                                    
                                                    >
                                    Deposit Collateral
                                </button>
                                <button style={{
                                                    marginLeft: "5px",
                                                    padding: "10px",
                                                    backgroundColor: "#efefef",
                                                    border: "none",
                                                    borderRadius: "6px",
                                                    color: "#333",
                                                    fontSize: "1rem",
                                                    cursor: "pointer",
                                                    width: "100%",}}
                                                    
                                                    onClick={() => setisBorrowing(true)}
                                                    >
                                    Borrow
                                </button>
                            </div>
                            <button style={{
                    marginTop: "5px",
                    marginBottom: "5px",
                    textAlign: "center",
                    padding: "10px",
                    backgroundColor: "#efefef",
                    border: "none",
                    borderRadius: "6px",
                    color: "#333",
                    fontSize: "1rem",
                    cursor: "pointer",}}

                    onClick={() => setIsRepaying(true)}                    
                    >
                                Repay Loan
                            </button>
                            
                        </div>
                        
                        
                        
                        
                        
                    
                        {isDepositing && (
                    <div 
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        margin: "10px"
                        
                    }}>
                        <div style={{
                            position: "relative",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "start",
                            textAlign: "left",
                            backgroundColor: "#151515",
                            margin: "20px",
                            padding: "40px",
                            borderRadius: "10px",
                            maxWidth: "500px",
                        }}>
                            
                            <h1>
                                Collaterize DAI
                            </h1>
                            <p style={{
                                marginTop: "10px"
                            }}>
                            By collateralizing your DAI, you can unlock its full potential on our platform. When you collateralize your DAI, it becomes a secure asset that allows you to borrow other tokens while keeping your funds working for you.
                            </p>
                            
                            

                            <div style={{
                                display: "flex",
                                flexDirection: "row",
                                justifyContent: "space-between",
                                width: "100%",
                                fontSize: "10px",
                                marginTop: "20px"

                            }}>
                                <div style={{
                                    display: "flex",
                                    flexDirection: "row",
                                    justifyContent: "left",
                                    
                                }}>
                                    <p >
                                        Wallet Balance:
                                    </p>
                                    <p style={{
                                        marginLeft: "5px"
                                    }}>
                                        {truncate(toEther(daiBalance!),4).toLocaleString() } DAI
                                    </p>
                                </div>
                                <div style={{
                                    display: "flex",
                                    flexDirection: "row",
                                    justifyContent: "right",
                                    
                                }}>
                                    <p >
                                        Deposited Balance:
                                    </p>
                                    <p style={{
                                        marginLeft: "5px"
                                    }}>
                                                {collateralBalance ?
                                                    truncate(toEther(collateralBalance[0] * BigInt(1)).toString(), 4).toLocaleString()
                                                    :
                                                    '0.00'
                                                } DAI
                                    
                                            </p>
                                </div>
                            </div>

        <div style={{ display: "flex", alignItems: "center", border: "1px solid #333", borderRadius: "5px", padding: "5px", marginTop: "5px", width: "100%"}}>


                            <Image
        src={DAI} // Logo source
        alt="logo"
        style={{ height: "24px", width: "24px", marginRight: "8px" }}
    />
                                <input
                                type="number"
                                placeholder="100"
                                value={supplyAmount}
                                onChange={(e) => setSupplyAmount(Number(e.target.value))}
                                style={{
                                    flex: 1,
            borderLeft: "solid",
            borderColor: "#333",
            borderTop: "none",
            borderBottom: "none",
            borderRight: "none",
            outline: "none",
            fontSize: "18px",
            padding: "5px"
                                }}

                                
                                
                                
                                />

                                </div>

        
                            
                            {depositingState === "init" ? (
                                <>
                                

<div style={{
                            display: "flex",
                            flexDirection: "row",
                            width: "100%",
                            marginTop: "10px",
                            justifyContent: "space-between",
                        }}>

                            
                        
                        <div style={{
                            display: "flex",
                            flexDirection: "column",
                            textAlign: "left"
                            
                        }} >
                            <p style={{marginTop: "10px"}}>Wallet Balance:</p>
                            
                        </div>
                        <div style={{
                            display: "flex",
                            flexDirection: "column",
                            textAlign: "right"
                            
                        }} >
                            <p style={{
                                        marginTop: "10px"
                                    }}>
                                        {truncate(toEther(daiBalance!),4).toLocaleString() } DAI
                                    
                                        <span style={{
                                    fontSize: "10px",
                                    color: "GrayText",
                                    marginLeft: "5px"}}
                                    >
                                        ~ ${daiBalanceInUSD}
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
                            <p style={{marginTop: "10px"}}>Deposited Balance:</p>
                            
                        </div>
                        <div style={{
                            display: "flex",
                            flexDirection: "column",
                            textAlign: "right"
                            
                        }} >
                            <p style={{
                                        marginTop: "10px"
                                    }}>
                                                {collateralBalance ?
                                                    truncate(toEther(collateralBalance[0] * BigInt(1)).toString(), 4).toLocaleString()
                                                    :
                                                    '0.00'
                                                } DAI
                                        <span style={{
                                    fontSize: "10px",
                                    color: "GrayText",
                                    marginLeft: "5px"}}
                                    >
                                        ~ ${depositedBalanceInUSD}
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
                            <p style={{marginTop: "10px"}}>Collaterized Balance:</p>
                            
                        </div>
                        <div style={{
                            display: "flex",
                            flexDirection: "column",
                            textAlign: "right"
                            
                        }} >
                            <p style={{
                                        marginTop: "10px"
                                    }}>
                                                {collateralBalance ?
                                                    truncate(toEther(collateralBalance[2] * BigInt(1)).toString(), 4).toLocaleString()
                                                    :
                                                    '0.00'
                                                } DAI
                                    <span style={{
                                    fontSize: "10px",
                                    color: "GrayText",
                                    marginLeft: "5px"}}
                                    >

                                       ~ ${formattedCollateralDollarValue}
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
                            <p style={{marginTop: "10px"}}>Collaterization Ratio:</p>
                            
                        </div>
                        <div style={{
                            display: "flex",
                            flexDirection: "column",
                            textAlign: "right"
                            
                        }} >
                            <p style={{
                                        marginTop: "10px"
                                    }}>
                                                {collateralizationRatio}%
                                            </p>
                            
                        </div>

                        
                        
                        
                        </div>

                                <TransactionButton
                                transaction={() => (
                                    approve ({
                                        contract: DAI_CONTRACT,
                                        spender: LENDING_POOL_CONTRACT.address,
                                        amount: supplyAmount,
                                    })
                                )}
                                onTransactionConfirmed={() => (
                                    setDepositingState("approved")
                                )}
                                style={{
                                    width: "100%",
                                    marginTop: "10px",
                                }}
                                >Set Approval</TransactionButton>


                                <TransactionButton style={{width:"100%", marginTop:"10px",}}
                                 transaction={() => (
                                    prepareContractCall({
                                        contract: LENDING_POOL_CONTRACT,
                                        method: "withdrawCollateral",
                                        params: [DAI_CONTRACT.address, (toWei(supplyAmount.toString()))],
                                    })
                                 )}
                                 onTransactionConfirmed={() => {
                                    setSupplyAmount(100);
                                    setDepositingState("init");
                                    refetchDaiBalance;
                                    refetchcollateralBalance;
                                    setIsDepositing(false);
                                 }}
                                 
                                >
                                    Withdraw Collateral
                                </TransactionButton>
                                
                                </>

                            ) : (
                                <>
                                <p style={{marginTop: "10px"}}>Collaterize</p>
                                <h1 style={{ marginTop: "5px"}}>{supplyAmount.toLocaleString()} DAI
                                                           
                                    </h1>
                                
         
         
                                <TransactionButton style={{width:"100%", marginTop:"10px",}}
                                 transaction={() => (
                                    prepareContractCall({
                                        contract: LENDING_POOL_CONTRACT,
                                        method: "depositCollateral",
                                        params: [DAI_CONTRACT.address, (toWei(supplyAmount.toString()))],
                                    })
                                 )}
                                 onTransactionConfirmed={() => {
                                    setSupplyAmount(100);
                                    setDepositingState("init");
                                    refetchDaiBalance;
                                    refetchcollateralBalance;
                                    setIsDepositing(false);
                                 }}
                                 
                                >
                                    Deposit Collateral
                                </TransactionButton>
                                

                                
                                </>
                                
                            ) } 
                            
                            
                            

                        
                            
                            <button style={{
                                marginTop: "10px",
                                marginBottom: "5px",
                                padding: "10px",
                                backgroundColor: "#efefef",
                                border: "none",
                                borderRadius: "6px",
                                color: "#333",
                                fontSize: "1rem",
                                cursor: "pointer",
                                width: "100%",
                                height: "42px"
                                }}
                                onClick={() => setIsDepositing(false)}
                    
                                    >

                                    Close
                                    </button>
                            
                        </div>
                        
                    </div>
                )}
                {isRepaying && (
                   <div 
                   style={{
                       position: "fixed",
                       top: 0,
                       left: 0,
                       width: "100%",
                       height: "100vh",
                       
                       backgroundColor: "rgba(0, 0, 0, 0.5)",
                       display: "flex",
                       justifyContent: "center",
                       alignItems: "center",
                       
                       
                   }}>
                       <div style={{
                           position: "relative",
                           display: "flex",
                           flexDirection: "column",
                           alignItems: "start",
                           textAlign: "left",
                           backgroundColor: "#151515",
                           margin: "20px",
                           padding: "20px",
                           borderRadius: "10px",
                           width: "100%",
                           maxWidth: "500px",
                           maxHeight: "80vh", // Limits height to 90% of the viewport
                           overflowY: "auto", // Enables vertical scrolling
                       }}>
                            
                            <h1>
                                Repay Loan
                            </h1>
                            
                            <div style={{
                                marginTop: "20px",
                                width: "100%"
                            }}>
                            <DaiRepayCard />
                            </div>
                            
                            

                            <div style={{
                                display: "flex",
                                flexDirection: "row",
                                justifyContent: "space-between",
                                width: "100%",
                                fontSize: "10px",
                                marginTop: "20px"

                            }}>
                                <div style={{
                                    display: "flex",
                                    flexDirection: "row",
                                    justifyContent: "left",
                                    
                                }}>
                                    <p >
                                        Wallet Balance:
                                    </p>
                                    <p style={{
                                        marginLeft: "5px"
                                    }}>
                                        {truncate(toEther(daiBalance!),4).toLocaleString() } DAI
                                    </p>
                                </div>
                                <div style={{
                                    display: "flex",
                                    flexDirection: "row",
                                    justifyContent: "right",
                                    
                                }}>
                                    <p >
                                        Loaned Balance:
                                    </p>
                                    <p style={{
                                        marginLeft: "5px"
                                    }}>
                                                {collateralBalance ?
                                                    truncate(toEther(collateralBalance[1] * BigInt(1)).toString(), 4).toLocaleString()
                                                    :
                                                    '0.00'
                                                } DAI
                                    
                                            </p>
                                </div>
                            </div>

        <div style={{ display: "flex", alignItems: "center", border: "1px solid #333", borderRadius: "5px", padding: "5px", marginTop: "5px", width: "100%"}}>


                            <Image
        src={DAI} // Logo source
        alt="logo"
        style={{ height: "24px", width: "24px", marginRight: "8px" }}
    />
                                <input
                                type="number"
                                placeholder="100"
                                value={repayAmount}
                                onChange={(e) => setRepayAmount(Number(e.target.value))}
                                style={{
                                    flex: 1,
            borderLeft: "solid",
            borderColor: "#333",
            borderTop: "none",
            borderBottom: "none",
            borderRight: "none",
            outline: "none",
            fontSize: "18px",
            padding: "5px"
                                }}

                                
                                
                                
                                />

                                </div>

        
                            
                            {repayingState === "init" ? (
                                <>
                                


                        


                            
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
                            <p style={{marginTop: "10px"}}>Borrow APR:</p>
                            
                        </div>
                        <div style={{
                            display: "flex",
                            flexDirection: "column",
                            textAlign: "right"
                            
                        }} >
                            <p style={{
                                        marginTop: "10px"
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
                            <p style={{marginTop: "10px"}}>Loan Interest:</p>
                            
                        </div>
                        <div style={{
                            display: "flex",
                            flexDirection: "column",
                            textAlign: "right"
                            
                        }} >
                            <p style={{
                                        marginTop: "10px"
                                    }}>
                                                {truncate(toEther(incurredInterest!),4) } DAI
                                            </p>
                            
                        </div>

                        
                        
                        
                        </div>

                        <div 
                style={{
                    display: "flex",
                    flexDirection: "row",
                    width: "100%",
                    gap: "6px"
                }}>
                    <div style={{
                        width: "100%"
                    }}>

                                <TransactionButton
                                transaction={() => (
                                    approve ({
                                        contract: DAI_CONTRACT,
                                        spender: LENDING_POOL_CONTRACT.address,
                                        amount: repayAmount,
                                    })
                                )}
                                onTransactionConfirmed={() => (
                                    setRepayingState("approved")
                                )}
                                style={{
                                    width: "100%",
                                    marginTop: "10px",
                                }}
                                >Confirm Repayment</TransactionButton>

                                </div>

                                <div style={{
                                        width: "100%"
                                    }}>

                                <TransactionButton style={{width:"100%", marginTop:"10px",}}
                                 transaction={() => (
                                    prepareContractCall({
                                        contract: LENDING_POOL_CONTRACT,
                                        method: "withdrawCollateral",
                                        params: [DAI_CONTRACT.address, (toWei(repayAmount.toString()))],
                                    })
                                 )}
                                 onTransactionConfirmed={() => {
                                    setRepayAmount(100);
                                    setRepayingState("init");
                                    refetchDaiBalance;
                                    refetchcollateralBalance;
                                    setIsRepaying(false);
                                 }}
                                 
                                >
                                    Withdraw Collateral
                                </TransactionButton>

                                </div>
                                </div>
                                
                                </>

                            ) : (
                                <>
                                <p style={{marginTop: "10px"}}>Repay</p>
                                <h1 style={{ marginTop: "5px"}}>{repayAmount.toLocaleString()} DAI
                                                           
                                    </h1>
                                
         
         
                                <TransactionButton style={{width:"100%", marginTop:"10px",}}
                                 transaction={() => (
                                    prepareContractCall({
                                        contract: LENDING_POOL_CONTRACT,
                                        method: "repay",
                                        params: [DAI_CONTRACT.address, (toWei(repayAmount.toString()))],
                                    })
                                 )}
                                 onTransactionConfirmed={() => {
                                    setRepayAmount(100);
                                    setRepayingState("init");
                                    refetchDaiBalance;
                                    refetchcollateralBalance;
                                    setIsRepaying(false);
                                 }}
                                 
                                >
                                    Repay Loan
                                </TransactionButton>
                                

                                
                                </>
                                
                            ) } 
                            
                            
                            

                        
                            
                            <button style={{
                                marginTop: "10px",
                                marginBottom: "5px",
                                padding: "10px",
                                backgroundColor: "#efefef",
                                border: "none",
                                borderRadius: "6px",
                                color: "#333",
                                fontSize: "1rem",
                                cursor: "pointer",
                                width: "100%",
                                height: "42px"
                                }}
                                onClick={() => setIsRepaying(false)}
                    
                                    >

                                    Close
                                    </button>
                            
                        </div>
                        
                    </div>
                )}

{isBorrowing && (
                    <div 
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        
                    }}>
                        <div style={{
                            position: "relative",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "start",
                            textAlign: "left",
                            backgroundColor: "#151515",
                            padding: "40px",
                            margin: "20px",
                            borderRadius: "10px",
                            maxWidth: "500px",
                        }}>
                            
                            <h1>
                                Borrow DAI
                            </h1>
                            
                            
                            <div style={{
                                marginTop: "20px",
                                width: "380px"
                            }}>
                            <DaiRepayCard />
                            </div>

                            <div style={{
                                display: "flex",
                                flexDirection: "row",
                                justifyContent: "space-between",
                                width: "100%",
                                fontSize: "10px",
                                marginTop: "20px"

                            }}>
                                <div style={{
                                    display: "flex",
                                    flexDirection: "row",
                                    justifyContent: "left",
                                    
                                }}>
                                    <p >
                                        Collateral Balance:
                                    </p>
                                    <p style={{
                                        marginLeft: "5px"
                                    }}>
                                        {collateralBalance ?
                                                    truncate(toEther(collateralBalance[2] * BigInt(1)).toString(), 4).toLocaleString()
                                                    :
                                                    '0.00'
                                                } DAI
                                    </p>
                                </div>
                                <div style={{
                                    display: "flex",
                                    flexDirection: "row",
                                    justifyContent: "right",
                                    
                                }}>
                                    <p >
                                        Borrowed Balance:
                                    </p>
                                    <p style={{
                                        marginLeft: "5px"
                                    }}>
                                                {collateralBalance ?
                                                    truncate(toEther(collateralBalance[1] * BigInt(1)).toString(), 4).toLocaleString()
                                                    :
                                                    '0.00'
                                                } DAI
                                    
                                            </p>
                                </div>
                            </div>

        <div style={{ display: "flex", alignItems: "center", border: "1px solid #333", borderRadius: "5px", padding: "5px", marginTop: "5px", width: "100%"}}>


                            <Image
        src={DAI} // Logo source
        alt="logo"
        style={{ height: "24px", width: "24px", marginRight: "8px" }}
    />
                                <input
                                type="number"
                                placeholder="100"
                                value={borrowAmount}
                                onChange={(e) => setBorrowAmount(Number(e.target.value))}
                                style={{
                                    flex: 1,
            borderLeft: "solid",
            borderColor: "#333",
            borderTop: "none",
            borderBottom: "none",
            borderRight: "none",
            outline: "none",
            fontSize: "18px",
            padding: "5px"
                                }}

                                
                                
                                
                                />

                                </div>

                                <div style={{
                            display: "flex",
                            flexDirection: "row",
                            width: "100%",
                            marginTop: "10px",
                            justifyContent: "space-between",
                        }}>

                            

                            
                        
                        <div style={{
                            display: "flex",
                            flexDirection: "column",
                            textAlign: "left"
                            
                        }} >
                            <p style={{marginTop: "10px"}}>Borrow APR:</p>
                            
                        </div>
                        <div style={{
                            display: "flex",
                            flexDirection: "column",
                            textAlign: "right"
                            
                        }} >
                            <p style={{marginTop: "10px"}}>
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
                            <p style={{marginTop: "5px"}}>Collaterization Ratio</p>
                            
                        </div>
                        <div style={{
                            display: "flex",
                            flexDirection: "column",
                            textAlign: "right"
                            
                        }} >
                            <p style={{marginTop: "5px"}}>
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
                            <p style={{marginTop: "5px"}}>Borrow Limit:</p>
                            
                        </div>
                        <div style={{
                            display: "flex",
                            flexDirection: "column",
                            textAlign: "right"
                            
                        }} >
                            <p style={{marginTop: "5px"}}>
                            
                           ~ ${borrowableAmount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}

                                <span style={{
                                    fontSize: "10px",
                                    color: "GrayText",
                                    marginLeft: "5px"}}
                                    >
                                        {borrowLimitInAsset ? `${borrowLimitInAsset} DAI` : "Calculating..."}
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
                            <p style={{marginTop: "5px"}}>Available Collateral:</p>
                            
                        </div>
                        <div style={{
                            display: "flex",
                            flexDirection: "column",
                            textAlign: "right"
                            
                        }} >
                            <p style={{marginTop: "5px"}}>
                                ~ ${formattedCollateralDollarValue} 
                                <span style={{
                                    fontSize: "10px",
                                    color: "GrayText",
                                    marginLeft: "5px"
                                }}>
                                    {collateralBalance ? 
                                            truncate(toEther(collateralBalance[2] * BigInt(1)).toString(), 4).toLocaleString() 
                                            : 
                                            '...'
                                        } DAI
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
                            <p style={{marginTop: "5px"}}>Health Factor:</p>
                            
                        </div>
                        <div style={{
                            display: "flex",
                            flexDirection: "column",
                            textAlign: "right"
                            
                        }} >
                            <p style={{
                                    fontSize: "10px",
                                    color: "GrayText",
                                    marginTop: "10px"}}>
                            
                            {healthFactor ? healthFactor : "Calculating..."}

 </p>
                            
                        </div>
                        
                        </div>



                        <TransactionButton style={{
                                        
                                        marginTop: "10px",
                                        width: "100%",
                                    }}
                                        transaction={() => (
                                            prepareContractCall({
                                                contract: LENDING_POOL_CONTRACT,
                                                method: "withdrawCollateral",
                                                params: [DAI_CONTRACT.address,toWei(borrowAmount.toString())]
                                            })
                                        )}
                                        onTransactionConfirmed={() => {
                                            refetchDaiBalance();
                                            refetchcollateralBalance();
                                    
                                        }}
                                    >
                                        Withdraw Collateral
                                    </TransactionButton>

                                    <TransactionButton style={{marginTop: "5px", width: "100%"}}
                            transaction={() => (
                                prepareContractCall({
                                    contract: LENDING_POOL_CONTRACT,
                                    method: "borrow",
                                    params: [DAI_CONTRACT.address,toWei(borrowAmount.toString())] 
                                })
                            )}
                            onTransactionConfirmed={() => {
                                setBorrowAmount(0);
                                refetchDaiBalance;
                                refetchcollateralBalance;
                                setisBorrowing(false);
                            }}
                            
                            >
                                Borrow
                            </TransactionButton>

                            



                            
                            


                            <button style={{
                                marginTop: "5px",
                                marginBottom: "5px",
                                padding: "10px",
                                backgroundColor: "#efefef",
                                border: "none",
                                borderRadius: "6px",
                                color: "#333",
                                fontSize: "1rem",
                                cursor: "pointer",
                                width: "100%",
                                height: "42px"
                                }}
                                onClick={() => setisBorrowing(false)}
                    
                                    >

                                    Close
                            </button>
                        </div>
                    </div>
                )}

                        
                    </div>
                    </div>
                    </div>
                    )
                    };
                    export default DaiVault;
                    
