'use client'

import Image from "next/image";
import { useEffect, useState } from "react";
import SOS from "../public/red logo.svg"


import ETH from "../public/ethereum-eth-logo.svg"


import { approve, balanceOf } from "thirdweb/extensions/erc20";
import { TransactionButton, useActiveAccount, useReadContract, useWalletBalance } from "thirdweb/react";
import { STAKE_CONTRACT, TOKEN_CONTRACT, LENDING_POOL_CONTRACT, client, chain } from "../utils/constants";
import { prepareContractCall, readContract, toEther, toWei } from "thirdweb";
import { addEvent } from "thirdweb/extensions/farcaster/keyRegistry";
import Link from "next/link";
import { getEthBalance } from "thirdweb/extensions/multicall3";
import SOSLendCard from "./SOSLendCard";
import SOSLendInfo from "./SOSLendInfo";
import SOSColCard from "./SOSColCard";


const SosLend: React.FC = () => {

    const account = useActiveAccount();
    const [healthFactor, setHealthFactor] = useState<string | null>(null);
    const liquidationThreshold = 80; // Example liquidation threshold in percentage

    const SOSContract = "0xf63Fca327C555408819e26eDAc30F83E55a119f4";
    const [userCollateralBalance, setUserCollateralBalance] = useState<number | null>(null); // Collateral balance in the asset

    const [borrowableAmount, setBorrowableAmount] = useState<number | null>(null);
    const collateralizationRatio = 150; // Example ratio, can be adjusted

    const [borrowLimitInAsset, setBorrowLimitInAsset] = useState<string | null>(null);

    const decimals = 18;
    
    

    const [depositAmount, setDepositAmount] = useState(1);
    const [lendAmount, setLendAmount] = useState(0);
    const [repayAmount, setRepayAmount] = useState(1);
    const [depositingState, setDepositingState] = useState<"init" | "approved">("init");
    const [lendingState, setLendingState] = useState<"init" | "approved">("init");
    const [repayingState, setRepayingState] = useState<"init" | "approved">("init");
    const [isDepositing, setIsDepositing] = useState(false);
    const [isRepaying, setIsRepaying] = useState(false);
    const [isLending, setIsLending] = useState(false);
    
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
        data: incurredInterest, 
        isLoading: loadingIncurredInterest,
        refetch: refetchIncurredInterest,
    } = useReadContract (
        
        {
            contract: LENDING_POOL_CONTRACT,
            method: "getInterestIncurred",
            params: [ account?.address || "" , SOSContract],
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

    const secondsInYear = 365 * 24 * 60 * 60; // Number of seconds in a year
    const precisionFactor = 1e18; // Scaling factor
    
    const apr = interestRate 
    ? ((Number(interestRate) / precisionFactor) * secondsInYear * 100).toFixed(2)
    : "0.00";    
    
    const formattedCollateralDollarValue = (Number(CollateralDollarValue) / 1e18).toFixed(2);
    const currentTime = Math.floor(Date.now() / 1000);  // Current time in seconds
    const assetPrice = rawAssetPrice ? (Number(rawAssetPrice) / 1e8).toFixed(6) : null; // Divide by 1e8 and format to 2 decimals
    const localizedAssetPrice = assetPrice 
    ? Number(assetPrice).toLocaleString(undefined, { minimumFractionDigits: 18, maximumFractionDigits: 18 }) 
    : null;
    

    const SOSBalanceInUSD = SOSBalance && assetPrice 
    ? (truncate(toEther(SOSBalance), 4) * Number(assetPrice)).toFixed(2) 
    : "0.00";

   


    const depositedBalanceInUSD = collateralBalance && assetPrice 
    ? (truncate(toEther(collateralBalance[0]), 4) * Number(assetPrice)).toFixed(2) 
    : "0.00";

    const borrowedBalanceInUSD = collateralBalance && assetPrice 
    ? (truncate(toEther(collateralBalance[1]), 4) * Number(assetPrice)).toFixed(2) 
    : "0.00";

    const totalDepositsInUSD = totalDeposits && assetPrice 
    ? (truncate(toEther(totalDeposits), 4) * Number(assetPrice)).toFixed(2) 
    : "0.00";
    
    const [depositAPR, setDepositAPR] = useState<string>("0.00");

useEffect(() => {
  if (totalDeposits && totalBorrows && apr) {
    const calculatedAPR = ((Number(totalBorrows) / Number(totalDeposits)) * Number(apr)).toFixed(2);
    setDepositAPR(calculatedAPR);
  }
}, [totalDeposits, totalBorrows, apr]);


    
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
                    src={SOS}
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
                            
                            
                            <h1>SOS</h1>
                            <p style={{ fontSize: "12px" }}>Stacks Of Sats</p>
                        </div>
                    </div>
                    
                    
                    <div style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        alignContent: "left",
                        alignItems: "left",
                        marginTop: "40px",
                    }}>
                        <SOSLendCard />
                         
                        <div style={{
                            display: "flex",
                            flexDirection: "column",
                        }}>
                            <div style={{
                                display: "flex",
                                flexDirection: "row",
                                justifyContent: "space-between",
                                marginTop: "20px",
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
                                                    
                                                    onClick={() => setIsLending(true)}
                                                    >
                                    Deposit
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
                                                    onClick={() => setIsDepositing(true)}
                                                    
                                                    >
                                    Deposit Collateral
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
                                Repay
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
                                Collaterize SOS
                            </h1>
                            <p style={{
                                marginTop: "10px"
                            }}>
                            By collateralizing your SOS, you can unlock its full potential on our platform. When you collateralize your SOS, it becomes a secure asset that allows you to borrow other tokens while keeping your funds working for you.
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
                                        {truncate(toEther(SOSBalance!),4).toLocaleString() } SOS
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
                                                } SOS
                                    
                                            </p>
                                </div>
                            </div>

        <div style={{ display: "flex", alignItems: "center", border: "1px solid #333", borderRadius: "5px", padding: "5px", marginTop: "5px", width: "100%"}}>


                            <Image
        src={SOS} // Logo source
        alt="logo"
        style={{ height: "24px", width: "24px", marginRight: "8px" }}
    />
                                <input
                                type="number"
                                placeholder="100"
                                value={depositAmount}
                                onChange={(e) => setDepositAmount(Number(e.target.value))}
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
                                        {truncate(toEther(SOSBalance!),4).toLocaleString() } SOS
                                    
                                        <span style={{
                                    fontSize: "10px",
                                    color: "GrayText",
                                    marginLeft: "5px"}}
                                    >
                                        ~ ${SOSBalanceInUSD}
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
                                                } SOS
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
                                                } SOS
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
                                        contract: TOKEN_CONTRACT,
                                        spender: LENDING_POOL_CONTRACT.address,
                                        amount: depositAmount,
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
                                        params: [TOKEN_CONTRACT.address, (toWei(depositAmount.toString()))],
                                    })
                                 )}
                                 onTransactionConfirmed={() => {
                                    setDepositAmount(100);
                                    setDepositingState("init");
                                    refetchSOSBalance;
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
                                <h1 style={{ marginTop: "5px"}}>{depositAmount.toLocaleString()} SOS
                                                           
                                    </h1>
                                
         
         
                                <TransactionButton style={{width:"100%", marginTop:"10px",}}
                                 transaction={() => (
                                    prepareContractCall({
                                        contract: LENDING_POOL_CONTRACT,
                                        method: "depositCollateral",
                                        params: [TOKEN_CONTRACT.address, (toWei(depositAmount.toString()))],
                                    })
                                 )}
                                 onTransactionConfirmed={() => {
                                    setDepositAmount(100);
                                    setDepositingState("init");
                                    refetchSOSBalance;
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
                                Repay Loan
                            </h1>
                            <p style={{
                                marginTop: "10px"
                            }}>
                            By collateralizing your SOS, you can unlock its full potential on our platform. When you collateralize your SOS, it becomes a secure asset that allows you to borrow other tokens while keeping your funds working for you.
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
                                        {truncate(toEther(SOSBalance!),4).toLocaleString() } SOS
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
                                                } SOS
                                    
                                            </p>
                                </div>
                            </div>

        <div style={{ display: "flex", alignItems: "center", border: "1px solid #333", borderRadius: "5px", padding: "5px", marginTop: "5px", width: "100%"}}>


                            <Image
        src={SOS} // Logo source
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
                                        {truncate(toEther(SOSBalance!),4).toLocaleString() } SOS
                                    
                                        <span style={{
                                    fontSize: "10px",
                                    color: "GrayText",
                                    marginLeft: "5px"}}
                                    >
                                        ~ ${SOSBalanceInUSD}
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
                                                } SOS
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
                                                } SOS
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
                                                {truncate(toEther(incurredInterest!),4) } SOS
                                            </p>
                            
                        </div>

                        
                        
                        
                        </div>

                                <TransactionButton
                                transaction={() => (
                                    approve ({
                                        contract: TOKEN_CONTRACT,
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
                                >Set Approval</TransactionButton>
                                <TransactionButton style={{width:"100%", marginTop:"10px",}}
                                 transaction={() => (
                                    prepareContractCall({
                                        contract: LENDING_POOL_CONTRACT,
                                        method: "withdrawCollateral",
                                        params: [TOKEN_CONTRACT.address, (toWei(repayAmount.toString()))],
                                    })
                                 )}
                                 onTransactionConfirmed={() => {
                                    setDepositAmount(100);
                                    setDepositingState("init");
                                    refetchSOSBalance;
                                    refetchcollateralBalance;
                                    setIsDepositing(false);
                                 }}
                                 
                                >
                                    Withdraw Collateral
                                </TransactionButton>
                                
                                </>

                            ) : (
                                <>
                                <p style={{marginTop: "10px"}}>Repay</p>
                                <h1 style={{ marginTop: "5px"}}>{repayAmount.toLocaleString()} SOS
                                                           
                                    </h1>
                                
         
         
                                <TransactionButton style={{width:"100%", marginTop:"10px",}}
                                 transaction={() => (
                                    prepareContractCall({
                                        contract: LENDING_POOL_CONTRACT,
                                        method: "repay",
                                        params: [TOKEN_CONTRACT.address, (toWei(repayAmount.toString()))],
                                    })
                                 )}
                                 onTransactionConfirmed={() => {
                                    setDepositAmount(100);
                                    setDepositingState("init");
                                    refetchSOSBalance;
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
                

{isLending && (

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
                Lend SOS
            </h1>
            
            <div style={{
                width: "380px",
                marginTop: "20px"
            }}>
            <SOSColCard />
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
                        {truncate(toEther(SOSBalance!),4).toLocaleString() } SOS
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
                                } SOS
                    
                            </p>
                </div>
            </div>

<div style={{ display: "flex", alignItems: "center", border: "1px solid #333", borderRadius: "5px", padding: "5px", marginTop: "5px", width: "100%"}}>


            <Image
src={SOS} // Logo source
alt="logo"
style={{ height: "24px", width: "24px", marginRight: "8px" }}
/>
                <input
                type="number"
                placeholder="100"
                value={lendAmount}
                onChange={(e) => setLendAmount(Number(e.target.value))}
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


            
            {lendingState === "init" ? (
                <>
                <div style={{
                    width: "100%"
                }}>
                <SOSLendInfo />
                </div>



        
        
        
        

                <TransactionButton
                transaction={() => (
                    approve ({
                        contract: TOKEN_CONTRACT,
                        spender: LENDING_POOL_CONTRACT.address,
                        amount: lendAmount,
                    })
                )}
                onTransactionConfirmed={() => (
                    setLendingState("approved")
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
                                        method: "withdraw",
                                        params: [TOKEN_CONTRACT.address, (toWei(lendAmount.toString()))],
                                    })
                                 )}
                                 onTransactionConfirmed={() => {
                                    setLendAmount(100);
                                    setLendingState("init");
                                    refetchSOSBalance;
                                    refetchcollateralBalance;
                                    setIsLending(false);
                                 }}
                                 
                                >
                                    Withdraw
                                </TransactionButton>
                
                </>

            ) : (
                <>
                <p style={{marginTop: "10px"}}>Lend</p>
                <h1 style={{ marginTop: "5px"}}>{lendAmount.toLocaleString()} SOS
                                           
                    </h1>
                


                <TransactionButton style={{width:"100%", marginTop:"10px",}}
                 transaction={() => (
                    prepareContractCall({
                        contract: LENDING_POOL_CONTRACT,
                        method: "deposit",
                        params: [TOKEN_CONTRACT.address, (toWei(lendAmount.toString()))],
                    })
                 )}
                 onTransactionConfirmed={() => {
                    setDepositAmount(100);
                    setLendingState("init");
                    refetchSOSBalance;
                    refetchcollateralBalance;
                    setIsLending(false);
                 }}
                 
                >
                    Lend
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
                onClick={() => setIsLending(false)}
    
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
                    export default SosLend;
                    
