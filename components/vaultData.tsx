'use client'

import { useActiveAccount, useReadContract } from "thirdweb/react";
import { STAKE_CONTRACT, TOKEN_CONTRACT  } from "../utils/constants";
import { balanceOf } from "thirdweb/extensions/erc20";
import { toEther } from "thirdweb";
import Sos from "../public/red logo.svg"
import Image from "next/image";
import Link from "next/link";



const VaultData: React.FC = () => {
   
    const account = useActiveAccount();

    const tokenContract = "0xf63Fca327C555408819e26eDAc30F83E55a119f4";
    const stakeContract = "0x234329EA252e2B1Cc03c6efcfE1f072cb35Bc754";


    const { data: vaultTotalSupply, isLoading: loadingVaultTotalSupply} = useReadContract ({
        contract: TOKEN_CONTRACT,
        method: "totalSupply"
    });

 

    const { data: spUsdtBalance, isLoading: loadingSpUsdtBalance} = useReadContract (
        balanceOf,
        {
            contract: STAKE_CONTRACT,
            address: account?.address || "",
            queryOptions: {
                enabled: !!account
            }
       
    });

    const { data: vaultReserve, isLoading: loadingVaultReserve} = useReadContract (
        balanceOf,
        {
            contract: STAKE_CONTRACT,
            address: tokenContract,
            queryOptions: {
                enabled: !!account
            }
       
    });



    const { 
        data: totalDeposit, 
        isLoading: loadingTotalDeposit,
        refetch: refetchTotalDeposit,
    } = useReadContract (
        balanceOf,
        {
            contract: TOKEN_CONTRACT,
            address: stakeContract,
            
       
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
        <div style={{
            display: "flex",
            flexDirection: "column",
            
            
            
        }}>
            <div style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between"
                  
            }}>
                
                
                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  padding: "20px",
                  textAlign:"center",
                  borderRadius: "10px",
                  borderColor: "gray",
                  border: "solid",
                  marginTop: "20px",
                }}
                  >
                    <p>Total Supply</p>
                    {loadingVaultTotalSupply ? (
                
                <p>...</p>
            
                
            ) : (
                
                <h3>{truncate(toEther(vaultTotalSupply!),2).toLocaleString() }
                
                <Image style={{height: "12px", width: "12px", marginLeft: "5px"}}
                    src={Sos}
                    alt='logo'
                    />


                </h3>
                
            )}

<Link style={{
                    fontSize: "8px",
                    marginTop: "5px"
                }}
                
                href={"https://basescan.org/token/0xf63fca327c555408819e26edac30f83e55a119f4"}>View on Basescan</Link>


                    </div>

                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  padding: "20px",
                  textAlign:"center",
                  borderRadius: "10px",
                  borderColor: "gray",
                  border: "solid",
                  marginTop: "20px",
                }}
                  >
                    <p >Total SOS Staked</p>
                    {loadingTotalDeposit ? (
                
                <p>...</p>
            
                
            ) : (
                
                <h3>{truncate(toEther(totalDeposit!),2).toLocaleString() }
                
                <Image style={{height: "12px", width: "12px", marginLeft: "5px"}}
                    src={Sos}
                    alt='logo'
                    />                
                
                </h3>
                
            )}
                
                </div>

                

                
                
            </div>
        </div>
        
    )
};

export default VaultData;