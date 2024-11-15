'use client'


import { useEffect, useState } from "react";
import Image from "next/image";
import { approve, balanceOf } from "thirdweb/extensions/erc20";
import { TransactionButton, useActiveAccount, useReadContract } from "thirdweb/react";
import { DAI_CONTRACT, LENDING_POOL_CONTRACT, SUSD_CONTRACT, TOKEN_CONTRACT, USDC_CONTRACT } from "../utils/constants";
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





const balanceCard: React.FC = () => {

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
        data: Networth, 
        isLoading: loadingNetworth,
        refetch: refetchNetworth,
    } = useReadContract (
        
        {
            contract: LENDING_POOL_CONTRACT,
            method: "getNetWorthInUSD",
            params: [account?.address || "" ,],
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
                               Net worth:
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
                            {loadingNetworth ? (
                                      <h1>...</h1>
                                     ) : (
                                      <h1>{truncate(toEther(Networth!),2).toLocaleString()}</h1>
                                     )}
                        </div>
                        {loadingNetworth ? (
                                      <p style={{
                                        fontSize: "8px",

                                      }}>...</p>
                                     ) : (
                                      <p style={{
                                        fontSize: "8px",

                                      }}>~ ${truncate(toEther(Networth!),2).toLocaleString()}</p>
                                     )}
                        </div>
                        
                        
                    
                       
                



                        
                    </div>
                    </div>
                    </div>
                    )
                    };
                    export default balanceCard;
                    
