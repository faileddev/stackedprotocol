'use client'


import { useEffect, useState } from "react";
import Image from "next/image";
import { approve, balanceOf } from "thirdweb/extensions/erc20";
import { TransactionButton, useActiveAccount, useReadContract } from "thirdweb/react";
import { DAI_CONTRACT, SUSD_CONTRACT, TOKEN_CONTRACT, USDC_CONTRACT } from "../utils/constants";
import { prepareContractCall, toEther, toWei } from "thirdweb";
import { Box, Tab, Tabs, Typography } from "@mui/material";
import sUSD from "../public/susdcoin.svg"
import USDC from "../public/usd-coin-usdc-logo.svg"
import DAI from "../public/multi-collateral-dai-dai-logo.svg"
import SOS from "../public/red logo.svg"


import { Contract, ethers, formatUnits, JsonRpcProvider, parseUnits } from "ethers";




const ORACLE_CONTRACT_ADDRESS = "0xaCc98Eeaa31fF2bEE5D670Cd874E5e44Fa707eE4";
const ORACLE_CONTRACT_ABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "_pair", "type": "address" },
      { "internalType": "address", "name": "_ethUsdPriceFeed", "type": "address" },
      { "internalType": "address", "name": "_token", "type": "address" },
      { "internalType": "address", "name": "_weth", "type": "address" },
      { "internalType": "uint8", "name": "_tokenDecimals", "type": "uint8" }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  { "inputs": [], "name": "getTokenUsdPrice", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
];





const Mint: React.FC = () => {

    const account = useActiveAccount();
    

    const [sosDepositAmount, setSosDepositAmount] = useState(100000);
    const [sosReceiveAmount, setSosReceiveAmount] = useState(0);

    const [usdcDepositAmount, setUsdcDepositAmount] = useState(100);
    const [daiDepositAmount, setDaiDepositAmount] = useState(100);
    const [redeemAmount, setRedeemAmount] = useState(0);
    const [sosDepositState, setSosDepositState] = useState<"init" | "approved">("init");
    const [usdcDepositState, setUsdcDepositState] = useState<"init" | "approved">("init");
    const [daiDepositState, setDaiDepositState] = useState<"init" | "approved">("init");
    const [isDepositingSos, setIsDepositingSos] = useState(false);
    const [isDepositingUsdc, setIsDepositingUsdc] = useState(false);
    const [isDepositingDai, setIsDepositingDai] = useState(false);
    const [isRedeeming, setIsRedeeming] = useState(false);
    const [tokenPrice, setTokenPrice] = useState<number | null>(null); // Renamed from `price` to `tokenPrice`
    const [receiveAmount, setReceiveAmount] = useState<string>("Loading...");
    

    

   

  

    const { 
        data: sosBalance, 
        isLoading: loadingsosBalance,
        refetch: refetchsosBalance,
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
        data: usdcBalance, 
        isLoading: loadingUsdcBalance,
        refetch: refetchUsdcBalance,
    } = useReadContract (
        balanceOf,
        {
            contract: USDC_CONTRACT,
            address: account?.address || "",
            queryOptions: {
                enabled: !!account
            }
       
    });

    const { 
        data: daiBalance, 
        isLoading: loadingDaiBalance,
        refetch: refetchDaiBalance,
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
        data: susdBalance, 
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

    
    function toUSDC(amount: string) {
        return parseUnits(amount.toString(), 6); // 6 decimals for USDC
    }
    

    function formatUSDCBalance(balance: any) {
        return (Number(balance) / 1e6).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    
    
    

    function truncate(vaule: string | number, decimalPlaces: number): number {
        const numericValue: number = Number(vaule);
        if (isNaN(numericValue)) {
            throw new Error('Invalid input: value must be convertible to a number');
        }
        const factor: number = Math.pow(10,decimalPlaces);
        return Math.trunc(numericValue*factor) / factor
    }

    const [price, setPrice] = useState<string | null>(null);
    
    useEffect(() => {
        const fetchTokenPriceFromOracle = async () => {
            try {
                const provider = new JsonRpcProvider("https://base-mainnet.infura.io/v3/65ff1bcf95cc4a6a9cf9c0c81fb9896a");
                const oracleContract = new Contract(ORACLE_CONTRACT_ADDRESS, ORACLE_CONTRACT_ABI, provider);
                const priceData = await oracleContract.getTokenUsdPrice();
                const formattedPrice = parseFloat(formatUnits(priceData, 18));
                setTokenPrice(formattedPrice);
            } catch (error) {
                console.error("Error fetching price from Oracle:", error);
                setTokenPrice(null);
            }
        };

        fetchTokenPriceFromOracle();
    }, []);

    // Calculate receiveAmount in USD
    useEffect(() => {
        if (tokenPrice !== null) {
            const calculatedAmount = (sosDepositAmount * tokenPrice).toFixed(2);
            setReceiveAmount(calculatedAmount);
        } else {
            setReceiveAmount("Loading...");
        }
    }, [tokenPrice, sosDepositAmount]);

    useEffect(() => {
        if (tokenPrice !== null) {
            setSosReceiveAmount(sosDepositAmount * tokenPrice);
        }
    }, [sosDepositAmount, tokenPrice]);

  
    

    

    return (
<div>
            
                <div 
                style={{
                    
                    border: "solid",
                    borderColor: "GrayText",
                    borderWidth: "1px",
                    padding: "20px",
                    borderRadius: "10px",
                    marginTop: "40px",
                    
                }}>
                    
                    <div style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "flex-start",
                        alignContent: "flex-start",
                        alignItems: "flex-start"
                    }}>
                        <div style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "start"
                        }}>
                            <p>
                               Balance:
                        </p>
                        
                        <div style={{
                            display: "flex",
                            flexDirection: "row",
                            alignContent: "center",
                            alignItems: "center",
                        }}>
                            <Image style={{height: "24px", width: "24px", marginRight: "5px"}}
                                                src={sUSD}
                                                alt='logo'
                                                />
                            {loadingSusdBalance ? (
                                      <h1>...<span style={{
                                        fontSize: "12px"
                                    }}>sUSD</span></h1>
                                     ) : (
                                      <h1>{truncate(toEther(susdBalance!),2).toLocaleString()}<span style={{
                                        fontSize: "12px"
                                    }}>sUSD</span></h1>
                                     )}
                        </div>
                        {loadingSusdBalance ? (
                                      <p style={{
                                        fontSize: "8px",

                                      }}>...</p>
                                     ) : (
                                      <p style={{
                                        fontSize: "8px",

                                      }}>~ ${truncate(toEther(susdBalance!),2).toLocaleString()}</p>
                                     )}
                        </div>
                        <div style={{
                            width: "100%"
                        }}>
                            <button style={{
                                                marginTop: "20px",
                                                marginBottom: "5px",
                                                padding: "10px",
                                                backgroundColor: "black",
                                                border: "solid",
                                                borderColor: "red",
                                                borderRadius: "6px",
                                                color: "white",
                                                fontSize: "14px",
                                                cursor: "pointer",
                                                width: "100%",
                                                height: "40px"
                                                
                                            }}
                                                onClick={() => setIsDepositingSos(true)}
                                                
                                                >

                                                <Image style={{height: "12px", width: "12px", marginRight: "5px"}}
                                                src={SOS}
                                                alt='logo'
                                                />                

                                    Deposit SOS
                                </button>
                        </div>
                        <div style={{
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "space-between",
                            width: "100%",
                            
                        }}>
                            
                            <button style={{
                    marginTop: "5px",
                    padding: "10px",
                    backgroundColor: "black",
                    border: "solid",
                    borderColor: "GrayText",
                  borderWidth: "1px",
                    borderRadius: "6px",
                    fontSize: "14px",
                    cursor: "pointer",
                    width: "49%",
                    height: "40px"
                    
                }}
                    
                    onClick={() => setIsDepositingUsdc(true)}
                    >
                    <Image style={{height: "12px", width: "12px", marginRight: "5px"}}
                                                src={USDC}
                                                alt='logo'
                                                />
                                Deposit USDC
                            </button>
                            <button style={{
                    marginTop: "5px",
                    padding: "10px",
                    backgroundColor: "black",
                    border: "solid",
                    borderColor: "GrayText",
                  borderWidth: "1px",
                    borderRadius: "6px",
                    color: "white",
                    fontSize: "14px",
                    cursor: "pointer",
                    width: "49%",
                    height: "40px"
                }}
                    
                    onClick={() => setIsDepositingDai(true)}
                    >
                        <Image style={{height: "12px", width: "12px", marginRight: "5px"}}
                                                src={DAI}
                                                alt='logo'
                                                />
                                Deposit DAI
                            </button>
                        </div>
                    
                        {isDepositingSos && (
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
                                Deposit SOS
                            </h1>
                            <Image
        src={SOS} // Logo source
        alt="logo"
        style={{ height: "26px", width: "26px", marginLeft: "8px" }}
    />
                            </div>
                            <p style={{marginTop: "10px", fontSize: "14px"}}>
                            Mint sUSD by using your SOS tokens as collateral. Deposit SOS into the vault and
                            sUSD is instantly credited to your wallet.
                            </p>

    
                            
                                
                            

                            <div style={{width: "100%"}}>
                            <div style={{display:"flex",
                                    flexDirection: "row",
                                    marginTop: "20px",
                                justifyContent: "space-between",
                            fontSize: "10px"}}
                                    >
                                <p>Deposit:</p>
                               
                                    <p>
                                        Balance: {truncate(toEther(sosBalance!),2).toLocaleString()}<span style={{
                                            fontSize: "10px"
                                        }}> SOS</span>
                                    </p>
                                
                            </div>

                            <div style={{ display: "flex", alignItems: "center", border: "1px solid #333", borderRadius: "5px", padding: "5px", marginTop: "5px" }}>


                            <Image
        src={SOS} // Logo source
        alt="logo"
        style={{ height: "24px", width: "24px", marginRight: "8px" }}
    />
                                <input
                                type="number"
                                placeholder="100"
                                value={sosDepositAmount}
                                onChange={(e) => setSosDepositAmount(Number(e.target.value))}
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

                                <p style={{ fontSize: "10px",
                                    marginTop: "5px"
                                }}>
                            {tokenPrice ? (
                                <>
                                   ~ ${Number(receiveAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} 
                                </>
                            ) : (
                                "Loading..."
                            )}
                        </p>


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
                                        Balance: {truncate(toEther(susdBalance!),2).toLocaleString()}<span style={{
                                            fontSize: "10px"
                                        }}> sUSD</span>
                                    </p>
                                
                            </div>
                            <div style={{ display: "flex", alignItems: "center", border: "1px solid #333", borderRadius: "5px", padding: "5px", marginTop: "5px" }}>
                            <Image
        src={sUSD} // Logo source
        alt="logo"
        style={{ height: "24px", width: "24px", marginRight: "8px" }}
    />
                            <input
    type="number"
    placeholder="0"
    value={sosReceiveAmount.toFixed(2)} // Ensures two decimal places
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
<p style={{ fontSize: "10px",
                                    marginTop: "5px"
                                }}>
                            {tokenPrice ? (
                                <>
                                   ~ ${Number(receiveAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} 
                                </>
                            ) : (
                                "Loading..."
                            )}
                        </p>
                                </div>
                                

                            

                            
                            
                            {sosDepositState === "init" ? (
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
                            <p style={{marginTop: "10px"}}>Mint Fee:</p>
                            
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
                            {tokenPrice ? (
                                <>
                                   {Number(receiveAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    <span style={{ fontSize: "12px" }}> sUSD</span>
                                </>
                            ) : (
                                "Loading..."
                            )}
                        </p>
                        
                        
                        
                        
                        </div>


                                <TransactionButton
                                transaction={() => (
                                    approve ({
                                        contract: TOKEN_CONTRACT,
                                        spender: SUSD_CONTRACT.address,
                                        amount: sosDepositAmount,
                                    })
                                )}
                                onTransactionConfirmed={() => (
                                    setSosDepositState("approved")
                                )}
                                style={{
                                    width: "100%",
                                    marginTop: "10px",
                                }}
                                >Set Approval</TransactionButton>
                                
                                </>

                            ) : (
                                <>
                                <p style={{marginTop: "10px"}}>When you deposit</p>
                                <h1 style={{ marginTop: "5px"}}>{sosDepositAmount.toLocaleString()}<span style={{fontSize: "12px"}}> SOS</span></h1>
                                <p style={{marginTop: "10px"}}>You will receive</p>
                                
          <h1>{truncate((sosReceiveAmount!)-(sosReceiveAmount*0.015),2).toLocaleString()}<span style={{
            fontSize: "12px"
        }}> sUSD</span></h1>
         
         
                                <TransactionButton style={{width:"100%", marginTop:"10px",}}
                                 transaction={() => (
                                    prepareContractCall({
                                        contract: SUSD_CONTRACT,
                                        method: "mintWithVolatileToken",
                                        params: [toWei(sosDepositAmount.toString())]
                                    })
                                 )}
                                 onTransactionConfirmed={() => {
                                    setSosDepositAmount(100);
                                    setSosDepositState("init");
                                    refetchsosBalance;
                                    setIsDepositingSos(false);
                                 }}
                                >
                                    Mint sUSD
                                </TransactionButton>
                                

                                
                                </>
                                
                            ) } 


                        


                            
                            
                            
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
                                onClick={() => setIsDepositingSos(false)}
                    
                                    >

                                    Close
                                    </button>
                            
                            
                        </div>
                    </div>
                )}
                {isDepositingUsdc && (
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
                                    Deposit USDC
                                </h1>
                                <Image style={{height: "26px", width: "26px", marginLeft: "15px"}}
                                                    src={USDC}
                                                    alt='logo'
                                                    />
                            </div>
                            <p style={{marginTop: "10px", fontSize: "14px"}}>
                            Mint sUSD by using your USDC as collateral. Deposit USDC into the vault and
                            sUSD is instantly credited to your wallet.
                            </p>

    
                            
                                
                            

                            <div style={{width: "100%"}}>
                            <div style={{display:"flex",
                                    flexDirection: "row",
                                    marginTop: "20px",
                                justifyContent: "space-between",
                            fontSize: "10px"}}
                                    >
                                <p>Deposit:</p>
                               
                                <p>
    Balance: { formatUSDCBalance(usdcBalance) }
    <span style={{ fontSize: "12px" }}> USDC</span>
</p>
                                
                            </div>
                                <div>

                                </div>
                                <div style={{ display: "flex", alignItems: "center", border: "1px solid #333", borderRadius: "5px", padding: "5px", marginTop: "5px" }}>
    <Image
        src={USDC} // Logo source
        alt="logo"
        style={{ height: "24px", width: "24px", marginRight: "8px" }}
    />
    <input
        type="number"
        placeholder="Enter amount"
        value={usdcDepositAmount}
        onChange={(e) => setUsdcDepositAmount(Number(e.target.value))}
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

                                <p style={{ fontSize: "10px",
                                    marginTop: "5px"
                                }}>
                            {tokenPrice ? (
                                <>
                                   ~ ${Number(usdcDepositAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} 
                                </>
                            ) : (
                                "Loading..."
                            )}
                        </p>


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
                                        Balance: {truncate(toEther(susdBalance!),2).toLocaleString()}<span style={{
                                            fontSize: "10px"
                                        }}>sUSD</span>
                                    </p>
                                
                            </div>
                            <div style={{ display: "flex", alignItems: "center", border: "1px solid #333", borderRadius: "5px", padding: "5px", marginTop: "5px" }}>
                            <Image
        src={sUSD} // Logo source
        alt="logo"
        style={{ height: "24px", width: "24px", marginRight: "8px" }}
    />
                            <input
    type="number"
    placeholder="0"
    value={usdcDepositAmount} // Ensures two decimal places
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
<p style={{ fontSize: "10px",
                                    marginTop: "5px"
                                }}>
                            {tokenPrice ? (
                                <>
                                   ~ ${Number(usdcDepositAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} 
                                </>
                            ) : (
                                "Loading..."
                            )}
                        </p>
                                </div>
                                

                            

                            
                            
                            {usdcDepositState === "init" ? (
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
                            <p style={{marginTop: "10px"}}>Mint Fee:</p>
                            
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
                            {tokenPrice ? (
                                <>
                                    {Number(usdcDepositAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span style={{ fontSize: "12px" }}>sUSD</span>
                                </>
                            ) : (
                                "Loading..."
                            )}
                        </p>
                        
                        
                        
                        
                        </div>


                                <TransactionButton
                                transaction={() => (
                                    approve ({
                                        contract: USDC_CONTRACT,
                                        spender: SUSD_CONTRACT.address,
                                        amount: usdcDepositAmount,
                                    })
                                )}
                                onTransactionConfirmed={() => (
                                    setUsdcDepositState("approved")
                                )}
                                style={{
                                    width: "100%",
                                    marginTop: "10px",
                                }}
                                >Set Approval</TransactionButton>
                                
                                </>

                            ) : (
                                <>
                                <p style={{marginTop: "10px"}}>When you deposit</p>
                                <h1 style={{ marginTop: "5px"}}>{usdcDepositAmount.toLocaleString()}<span style={{fontSize: "12px"}}> USDC</span></h1>
                                <p style={{marginTop: "10px"}}>You will receive</p>
                                
          <h1>{truncate((usdcDepositAmount!)-(usdcDepositAmount*0.015),2).toLocaleString()}<span style={{
            fontSize: "12px"
        }}> sUSD</span></h1>
         
         
                                <TransactionButton style={{width:"100%", marginTop:"10px",}}
                                 transaction={() => (
                                    prepareContractCall({
                                        contract: SUSD_CONTRACT,
                                        method: "mintWithUSDC",
                                        params: [toUSDC(usdcDepositAmount.toString())]
                                    })
                                 )}
                                 onTransactionConfirmed={() => {
                                    setSosDepositAmount(100);
                                    setSosDepositState("init");
                                    refetchsosBalance;
                                    setIsDepositingSos(false);
                                 }}
                                >
                                    Mint sUSD
                                </TransactionButton>
                                

                                
                                </>
                                
                            ) } 


                        


                            
                            
                            
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
                                onClick={() => setIsDepositingUsdc(false)}
                    
                                    >

                                    Close
                                    </button>
                            
                            
                        </div>
                    </div>
                )}
                {isDepositingDai && (
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
                                    Deposit DAI
                                </h1>
                                <Image style={{height: "26px", width: "26px", marginLeft: "15px"}}
                                                    src={DAI}
                                                    alt='logo'
                                                    />
                            </div>
                            <p style={{marginTop: "10px", fontSize: "14px"}}>
                            Mint sUSD by using your DAI as collateral. Deposit DAI into the vault and
                            sUSD is instantly credited to your wallet.
                            </p>

    
                            
                                
                            

                            <div style={{width: "100%"}}>
                            <div style={{display:"flex",
                                    flexDirection: "row",
                                    marginTop: "20px",
                                justifyContent: "space-between",
                            fontSize: "10px"}}
                                    >
                                <p>Deposit:</p>
                               
                                <p>
                                        Balance: {truncate(toEther(daiBalance!),2).toLocaleString()}<span style={{
                                            fontSize: "10px"
                                        }}> DAI</span>
                                    </p>
                                
                            </div>
                                <div>

                                </div>
                                <div style={{ display: "flex", alignItems: "center", border: "1px solid #333", borderRadius: "5px", padding: "5px", marginTop: "5px" }}>
    <Image
        src={DAI} // Logo source
        alt="logo"
        style={{ height: "24px", width: "24px", marginRight: "8px" }}
    />
    <input
        type="number"
        placeholder="Enter amount"
        value={daiDepositAmount}
        onChange={(e) => setDaiDepositAmount(Number(e.target.value))}
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

                                <p style={{ fontSize: "10px",
                                    marginTop: "5px"
                                }}>
                            {tokenPrice ? (
                                <>
                                   ~ ${Number(daiDepositAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} 
                                </>
                            ) : (
                                "Loading..."
                            )}
                        </p>


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
                                        Balance: {truncate(toEther(susdBalance!),2).toLocaleString()}<span style={{
                                            fontSize: "10px"
                                        }}> sUSD</span>
                                    </p>
                                
                            </div>
                            <div style={{ display: "flex", alignItems: "center", border: "1px solid #333", borderRadius: "5px", padding: "5px", marginTop: "5px" }}>
                            <Image
        src={sUSD} // Logo source
        alt="logo"
        style={{ height: "24px", width: "24px", marginRight: "8px" }}
    />
                            <input
    type="number"
    placeholder="0"
    value={daiDepositAmount} // Ensures two decimal places
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
<p style={{ fontSize: "10px",
                                    marginTop: "5px"
                                }}>
                            {tokenPrice ? (
                                <>
                                   ~ ${Number(daiDepositAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} 
                                </>
                            ) : (
                                "Loading..."
                            )}
                        </p>
                                </div>
                                

                            

                            
                            
                            {daiDepositState === "init" ? (
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
                            <p style={{marginTop: "10px"}}>Mint Fee:</p>
                            
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
                            {tokenPrice ? (
                                <>
                                    {Number(daiDepositAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span style={{ fontSize: "12px" }}>sUSD</span>
                                </>
                            ) : (
                                "Loading..."
                            )}
                        </p>
                        
                        
                        
                        
                        </div>


                                <TransactionButton
                                transaction={() => (
                                    approve ({
                                        contract: DAI_CONTRACT,
                                        spender: SUSD_CONTRACT.address,
                                        amount: usdcDepositAmount,
                                    })
                                )}
                                onTransactionConfirmed={() => (
                                    setDaiDepositState("approved")
                                )}
                                style={{
                                    width: "100%",
                                    marginTop: "10px",
                                }}
                                >Set Approval</TransactionButton>
                                
                                </>

                            ) : (
                                <>
                                <p style={{marginTop: "10px"}}>When you deposit</p>
                                <h1 style={{ marginTop: "5px"}}>{daiDepositAmount.toLocaleString()}<span style={{fontSize: "12px"}}> USDC</span></h1>
                                <p style={{marginTop: "10px"}}>You will receive</p>
                                
          <h1>{truncate((daiDepositAmount!)-(daiDepositAmount*0.015),2).toLocaleString()}<span style={{
            fontSize: "12px"
        }}> sUSD</span></h1>
         
         
                                <TransactionButton style={{width:"100%", marginTop:"10px",}}
                                 transaction={() => (
                                    prepareContractCall({
                                        contract: SUSD_CONTRACT,
                                        method: "mintWithDAI",
                                        params: [toWei(daiDepositAmount.toString())]
                                    })
                                 )}
                                 onTransactionConfirmed={() => {
                                    setSosDepositAmount(100);
                                    setSosDepositState("init");
                                    refetchsosBalance;
                                    setIsDepositingSos(false);
                                 }}
                                >
                                    Mint sUSD
                                </TransactionButton>
                                

                                
                                </>
                                
                            ) } 


                        


                            
                            
                            
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
                                onClick={() => setIsDepositingDai(false)}
                    
                                    >

                                    Close
                                    </button>
                            
                            
                        </div>
                    </div>
                )}

{isRedeeming && (
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
                            
                            <h1>
                                Redeem sUSD
                            </h1>
                            <p>
                            To redeem your sUSD, you only need to provide your sUSD and you will receive DAI tokens back at a stable exchange rate of 1:1.
                            </p>
                            
                            

                            <p style={{
                                marginTop: "20px"
                            }}>
                                Available sUSD:
                            </p>
                            <h1>
                                {truncate(toEther(susdBalance!),2)}<span style={{
                                    fontSize: "10px"
                                }}>sUSD</span>
                            </h1>

                            
                            
                            <p style={{ marginTop: "20px"}}>Redeem: </p>
                            <input
                             type="number"
                             placeholder="100"
                             value={redeemAmount}
                             onChange={(e) => setRedeemAmount(Number(e.target.value))}
                             style={{
                                marginTop: "10px",
                                padding: "5px",
                                borderRadius: "5px",
                                border: "1px solid #333",
                                width: "100%",
                                height: "40px",
                                fontSize: "18px"
                            }}
                             />
                             


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
                            <p style={{marginTop: "10px"}}>Redemption Fee:</p>
                            
                        </div>
                        <div style={{
                            display: "flex",
                            flexDirection: "column",
                            textAlign: "right"
                            
                        }} >
                            <p style={{marginTop: "10px"}}>15%</p>
                            
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
                        <div style={{
                            display: "flex",
                            flexDirection: "column",
                            textAlign: "right"
                            
                        }} >
                    <p style={{ marginTop: "5px"}}>{redeemAmount ? (
                    <p>... <span style={{
                            fontSize: "12px"
                    }}>SOS</span></p>
         ) : (
                    <p>{truncate((redeemAmount!),2).toLocaleString()} <span style={{
                    fontSize: "12px"
                    }}>SOS</span></p>
                    )} </p>                            
                        </div>

                        
                        
                        
                        
                        </div>
                             
                            <TransactionButton style={{marginTop: "10px", width: "100%"}}
                            transaction={() => (
                                prepareContractCall({
                                    contract: SUSD_CONTRACT,
                                    method: "redeem",
                                    params: [toWei(redeemAmount.toString()),] 
                                })
                            )}
                            onTransactionConfirmed={() => {
                                setRedeemAmount(0);
                                refetchSusdBalance;
                                refetchsosBalance;
                                setIsRedeeming(false);
                            }}
                            >
                                Redeem sUSD
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
                                onClick={() => setIsRedeeming(false)}
                    
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
                    export default Mint;
                    
