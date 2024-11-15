'use client'


import { useState } from "react";
import { approve, balanceOf } from "thirdweb/extensions/erc20";
import { TransactionButton, useActiveAccount, useReadContract } from "thirdweb/react";
import { SUSD_CONTRACT, TOKEN_CONTRACT } from "../utils/constants";
import { prepareContractCall, toEther, toWei } from "thirdweb";
import { Box, createTheme, Tab, Tabs, Typography } from "@mui/material";


const NewMint: React.FC = () => {
    const account = useActiveAccount();

    const [mintAmount, setMintAmount] = useState(100);
    const [redeemAmount, setRedeemAmount] = useState(0);
    const [mintingState, setMintingState] = useState<"init" | "approved">("init");
    const [isMinting, setIsMinting] = useState(false);
    const [isRedeeming, setIsRedeeming] = useState(false);

    const [selectedTab, setSelectedTab] = useState(0);

    
       
      
        const handleTabClick = (index: number) => {
          setSelectedTab(index);
        };

  // Handler to update the selectedTab state
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

    const { 
        data: spUsdtBalance, 
        isLoading: loadingSpUsdtBalance,
        refetch: refetchSpUsdtBalance,
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
            
                    
                    </div>
                    )
                    };
                    export default NewMint;
                    
