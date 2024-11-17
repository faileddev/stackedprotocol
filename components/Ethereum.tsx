'use client'

import Image from "next/image";
import { useEffect, useState } from "react";
import WETH from "../public/weth.svg"

import sUSD from "../public/sUSD.svg"
import ETH from "../public/ethereum-eth-logo.svg"


import { approve, balanceOf } from "thirdweb/extensions/erc20";
import { TransactionButton, useActiveAccount, useReadContract, useWalletBalance } from "thirdweb/react";
import { TOKEN_CONTRACT, STAKE_CONTRACT, WETH_CONTRACT, LENDING_POOL_CONTRACT, client, chain } from "../utils/constants";
import { prepareContractCall, readContract, toEther, toWei } from "thirdweb";
import { addEvent } from "thirdweb/extensions/farcaster/keyRegistry";
import Link from "next/link";
import { getEthBalance } from "thirdweb/extensions/multicall3";
import AssetCard from "./AssetCard";
import AssetInfo from "./AssetInfo";
import EthBottomBorrowCard from "./EthBottomBorrowCard";


const EthereumVault: React.FC = () => {

    const account = useActiveAccount();
    const [healthFactor, setHealthFactor] = useState<string | null>(null);
    const liquidationThreshold = 80; // Example liquidation threshold in percentage

    const wethContract = "0x4200000000000000000000000000000000000006";
    const DAIContract = "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb";
    const sUSDContract = "0x65F74FD58284dAEaFaC89d122Fb0566E0629C2a0";


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
            params: [ account?.address || "" , wethContract],
            queryOptions: {
                enabled: !!account
            }
       
    });

    const { 
        data: daiCollateralBalance, 
        isLoading: loadingDaicollateralBalance,
        refetch: refetchDaicollateralBalance,
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
        data: susdCollateralBalance, 
        isLoading: loadingSusdcollateralBalance,
        refetch: refetchSusdcollateralBalance,
    } = useReadContract (
        
        {
            contract: LENDING_POOL_CONTRACT,
            method: "getAccountBalances",
            params: [ account?.address || "" , sUSDContract],
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
            params: [ account?.address || "" , wethContract],
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
            params: [wethContract],
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
            params: [wethContract],
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
            params: [wethContract],
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
            params: [wethContract],
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
        data: wethBalance, 
        isLoading: loadingWethBalance,
        refetch: refetchWethBalance
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
    

    const wethBalanceInUSD = wethBalance && assetPrice 
    ? (truncate(toEther(wethBalance), 4) * Number(assetPrice)).toFixed(2) 
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
                    src={WETH}
                    alt='logo'
                    />      
                        <div style={{ marginLeft: "5px"}}>
                            <p style={{
                                fontSize: "10px"
                            }}>
                                Price:
                            </p>
                            <h3>
                            {localizedAssetPrice}
                            </h3>
                        </div>
                            
                        </div>

                        <div style={{textAlign: "right"}}>
                            
                            
                            <h1>WETH</h1>
                            <p style={{ fontSize: "12px" }}>Wrapped Ethereum</p>
                        </div>
                    </div>
                    
                    
                    <div style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        alignContent: "left",
                        alignItems: "left",
                        marginTop: "20px",
                    }}>
                        <AssetInfo />

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

                    onClick={() => setIsWrapping(true)}                    
                    >
                                Wrap ETH
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
                                Collaterize WETH
                            </h1>
                            
                            
                            
                            <div style={{
                                marginTop: "20px",
                                width: "380px"
                            }}>
                                <AssetCard />
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
                                        {truncate(toEther(wethBalance!),4).toLocaleString() } WETH
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
                                                } WETH
                                    
                                            </p>
                                </div>
                            </div>

        <div style={{ display: "flex", alignItems: "center", border: "1px solid #333", borderRadius: "5px", padding: "5px", marginTop: "5px", width: "100%"}}>


                            <Image
        src={WETH} // Logo source
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
                                        contract: WETH_CONTRACT,
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
                                        params: [WETH_CONTRACT.address, (toWei(supplyAmount.toString()))],
                                    })
                                 )}
                                 onTransactionConfirmed={() => {
                                    setSupplyAmount(100);
                                    setDepositingState("init");
                                    refetchWethBalance;
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
                                <h1 style={{ marginTop: "5px"}}>{supplyAmount.toLocaleString()} WETH
                                                           
                                    </h1>
                                
         
         
                                <TransactionButton style={{width:"100%", marginTop:"10px",}}
                                 transaction={() => (
                                    prepareContractCall({
                                        contract: LENDING_POOL_CONTRACT,
                                        method: "depositCollateral",
                                        params: [WETH_CONTRACT.address, (toWei(supplyAmount.toString()))],
                                    })
                                 )}
                                 onTransactionConfirmed={() => {
                                    setSupplyAmount(100);
                                    setDepositingState("init");
                                    refetchWethBalance;
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
                {isWrapping && (
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
                            borderRadius: "10px",
                            maxWidth: "500px",
                        }}>
                            <div style={{
                                display: "flex",
                                flexDirection: "row",
                                justifyContent: "center",
                                alignItems: "center",

                            }}>
                            <h1>
                                Wrap ETH
                            </h1>
                            <Image
        src={ETH} // Logo source
        alt="logo"
        style={{ height: "26px", width: "26px", marginLeft: "8px" }}
    />
                            </div>
                            <p style={{marginTop: "10px", fontSize: "14px"}}>
                            Deposit ETH into the wrapper vault to wrap your ETH. WETH can be used as collateral on the protocol.
                            </p>

    
                            
                                
                            

                            <div style={{width: "100%"}}>
    
        <div
            style={{
                display: "flex",
                flexDirection: "row",
                marginTop: "20px",
                justifyContent: "space-between",
                fontSize: "10px",
            }}
        >
            <p>Deposit:</p>
            <p>
                Balance: {balanceValue}
                <span style={{ fontSize: "10px" }}> ETH</span>
            </p>
        </div>
    


                            <div style={{ display: "flex", alignItems: "center", border: "1px solid #333", borderRadius: "5px", padding: "5px", marginTop: "5px" }}>


                            <Image
        src={ETH} // Logo source
        alt="logo"
        style={{ height: "24px", width: "24px", marginRight: "8px" }}
    />
                                <input
                                type="number"
                                placeholder="100"
                                value={wrapAmount}
                                onChange={(e) => setWrapAmount(Number(e.target.value))}
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

                               


                                </div>
                                <div style={{width: "100%"}}>
                            <div style={{display:"flex",
                                    flexDirection: "row",
                                    marginTop: "20px",
                                justifyContent: "space-between",
                            fontSize: "10px"}}
                                    >
                                <p>Receive:</p>
                               
                                    <p>
                                        Balance: {truncate(toEther(wethBalance!),4).toLocaleString()}<span style={{
                                            fontSize: "10px"
                                        }}> WETH</span>
                                    </p>
                                
                            </div>
                            <div style={{ display: "flex", alignItems: "center", border: "1px solid #333", borderRadius: "5px", padding: "5px", marginTop: "5px" }}>
                            <Image
        src={WETH} // Logo source
        alt="logo"
        style={{ height: "24px", width: "24px", marginRight: "8px" }}
    />
                            <input
    type="number"
    placeholder="0"
    value={wrapAmount.toFixed(2)} // Ensures two decimal places
    readOnly
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

                                </div>
                                

                            

                            
                            
                            
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
                            <p style={{marginTop: "10px"}}>Wrap Fee:</p>
                            
                        </div>
                        <div style={{
                            display: "flex",
                            flexDirection: "column",
                            textAlign: "right"
                            
                        }} >
                            <p style={{marginTop: "10px"}}>1.5%</p>
                            
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
                            <p style={{marginTop: "5px"}}>You receive</p>
                            
                        </div>
                        <p>
                                         {truncate((wrapAmount)-(wrapAmount*0.015),4).toLocaleString()}<span style={{
                                            fontSize: "10px"
                                        }}> WETH</span>
                                    </p>
                        
                        
                        
                        
                        </div>


                                
                                
                                </>

                            
                                <>
                                
         
         
                                <TransactionButton style={{width:"100%", marginTop:"10px",}}
                                 transaction={() => (
                                    prepareContractCall({
                                        contract: WETH_CONTRACT,
                                        method: "deposit",
                                        value: BigInt(wrapAmount * 1e18)
                                    })
                                 )}
                                 onTransactionConfirmed={() => {
                                    setWrapAmount(100);
                                    
                                    refetchWethBalance;
                                    setIsWrapping(false);
                                 }}
                                >
                                    Wrap ETH
                                </TransactionButton>
                                

                                
                                </>
                                
                            


                        


                            
                            
                            
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
                                onClick={() => setIsWrapping(false)}
                    
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
                                Borrow WETH
                            </h1>
                            
                            
                            <div style={{
                                marginTop: "20px",
                                width: "380px"
                            }}>
                                <AssetCard />
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
                                                } WETH
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
                                                } WETH
                                    
                                            </p>
                                </div>
                            </div>

        <div style={{ display: "flex", alignItems: "center", border: "1px solid #333", borderRadius: "5px", padding: "5px", marginTop: "5px", width: "100%"}}>


                            <Image
        src={WETH} // Logo source
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
                                    width: "100%"
                                }}>
                                <EthBottomBorrowCard />
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
                            
                            ~ ${Number(borrowLimitUSD).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}

                                <span style={{
                                    fontSize: "10px",
                                    color: "GrayText",
                                    marginLeft: "5px"}}
                                    >
                                        {borrowLimitAsset ? `${borrowLimitAsset} WETH` : "Calculating..."}
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
                                                params: [WETH_CONTRACT.address,toWei(borrowAmount.toString())]
                                            })
                                        )}
                                        onTransactionConfirmed={() => {
                                            refetchWethBalance();
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
                                    params: [WETH_CONTRACT.address,toWei(borrowAmount.toString())] 
                                })
                            )}
                            onTransactionConfirmed={() => {
                                setBorrowAmount(0);
                                refetchWethBalance;
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
                    export default EthereumVault;
                    
