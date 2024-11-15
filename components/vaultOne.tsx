'use client'

import Image from "next/image";
import { useState } from "react";
import Sos from "../public/red logo.svg"
import sUSD from "../public/sUSD.svg"

import { approve, balanceOf } from "thirdweb/extensions/erc20";
import { TransactionButton, useActiveAccount, useReadContract } from "thirdweb/react";
import { TOKEN_CONTRACT, STAKE_CONTRACT } from "../utils/constants";
import { prepareContractCall, toEther, toWei } from "thirdweb";
import { addEvent } from "thirdweb/extensions/farcaster/keyRegistry";
import Link from "next/link";


const VaultOne: React.FC = () => {

    const account = useActiveAccount();

    

    const [mintAmount, setMintAmount] = useState(10000);
    const [redeemAmount, setRedeemAmount] = useState(0);
    const [mintingState, setMintingState] = useState<"init" | "approved">("init");
    const [isMinting, setIsMinting] = useState(false);
    const [isRedeeming, setIsRedeeming] = useState(false);

    const { 
        data: stakedBalance, 
        isLoading: loadingStakedBalance,
        refetch: refetchStakedBalance,
    } = useReadContract (
        
        {
            contract: STAKE_CONTRACT,
            method: "stakers",
            params: [account?.address || ""],
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
            contract: TOKEN_CONTRACT,
            address: account?.address || "",
            queryOptions: {
                enabled: !!account
            }
       
    });

    const { 
        data: pendingRewards, 
        isLoading: loadingPendingRewards,
        refetch: refetchPendingReward,
    } = useReadContract (
        
        {
            contract: STAKE_CONTRACT,
            method: "calculateRewards",
            params: [account?.address || ""],
            queryOptions: {
                enabled: !!account
            }
       
    });

    const { 
        data: unclaimedReward, 
        isLoading: loadingUnclaimedReward,
        refetch: refetchUnclaimedReward,
    } = useReadContract (
        
        {
            contract: STAKE_CONTRACT,
            method: "stakers",
            params: [account?.address || ""],
            queryOptions: {
                enabled: !!account
            }
       
    });

    const { 
        data: stakeTimeStamp, 
        isLoading: loadingStakeTimeStamp,
        refetch: reftchStakeTimeStamp,
    } = useReadContract (
        
        {
            contract: STAKE_CONTRACT,
            method: "stakers",
            params: [account?.address || ""],
            queryOptions: {
                enabled: !!account
            }
       
    });

    const { 
        data: lastClaim, 
        
        refetch: reftchLastClaim,
    } = useReadContract (
        
        {
            contract: STAKE_CONTRACT,
            method: "stakers",
            params: [account?.address || ""],
            queryOptions: {
                enabled: !!account
            }
       
    });

    const { 
        data: lockPeriod, 
        
        refetch: reftchLockPeriod,
    } = useReadContract (
        
        {
            contract: STAKE_CONTRACT,
            method: "lockPeriod",
            queryOptions: {
                enabled: !!account
            }
       
    });

    const currentTime = Math.floor(Date.now() / 1000);  // Current time in seconds
const unlockTime = stakeTimeStamp ? Number(stakeTimeStamp[3]) + 604800 : 0;  // Unlock time in seconds (7 days after stake)

// Check if the unlock time has been reached
const isUnlockDateReached = currentTime >= unlockTime;

    
    

    function truncate(vaule: string | number, decimalPlaces: number): number {
        const numericValue: number = Number(vaule);
        if (isNaN(numericValue)) {
            throw new Error('Invalid input: value must be convertible to a number');
        }
        const factor: number = Math.pow(10,decimalPlaces);
        return Math.trunc(numericValue*factor) / factor
    }
    
    function formatDuration(seconds: number) {
        const days = Math.floor(seconds / (24 * 3600));
        
    
        return `${days} day(s)`;
    }

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
                        <div>
                            <h2>Entry Stack</h2>
                            <p style={{marginTop: "2px", fontSize: "12px"}}>1
                                
                                <Image style={{height: "10px", width: "10px", marginLeft: "5px"}}
                    src={Sos}
                    alt='logo'
                    />  = 0.00001<Image style={{height: "10px", width: "40px", marginLeft: "1px"}}
                    src={sUSD}
                    alt='logo'
                    />  Daily </p>
                        </div>

                        <div style={{textAlign: "right"}}>
                            
                            
                            <h2>{lockPeriod ?
                                formatDuration(Number(lockPeriod))  // Convert and format the duration
                                :
                                'Not Staked'
                            } </h2>
                            <p> Lockup</p>
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
                        <div style={{
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "end",
                            alignItems: "start"
                        }}>
                            <p>
                               Available Balance:
                        </p>
                        
                        {loadingSusdBalance ? (
          <h1>...<Image style={{height: "12px", width: "12px", marginLeft: "5px"}}
          src={Sos}
          alt='logo'
          />  </h1>
         ) : (
          <h1>{truncate(toEther(susdBalance!),2).toLocaleString() }<Image style={{height: "12px", width: "12px", marginLeft: "5px"}}
          src={Sos}
          alt='logo'
          />  
        </h1>
         )} 
         <p style={{
                                marginTop: "20px"
                            }}>
                                Deposited Balance:
                            </p>
                            <h1>
            {stakedBalance ? 
                truncate(toEther(stakedBalance[0] * BigInt(1)).toString(), 2).toLocaleString() 
                : 
                '...'
            }
                <Image style={{height: "12px", width: "12px", marginLeft: "5px"}}
                    src={Sos}
                    alt='logo'
                    />        </h1>
                        </div>
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
                                                    onClick={() => setIsMinting(true)}
                                                    
                                                    >
                                    Deposit SOS
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
                                                    
                                                    onClick={() => setIsRedeeming(true)}
                                                    >
                                    Withdraw SOS
                                </button>
                            </div>
                            <Link style={{
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
                    href={"https://app.uniswap.org/swap?outputCurrency=0xf63fca327c555408819e26edac30f83e55a119f4&chain=base"}
                    
                    >
                                Buy SOS
                            </Link>
                            
                        </div>
                        <div style={{
                            display: "flex",
                            flexDirection: "row",
                            marginTop: "20px",
                        }}>
                        
                        <div style={{
                            display: "flex",
                            flexDirection: "column",
                            textAlign: "left"
                        }} >
                            <p style={{marginTop: "10px"}}>Unclaimed Rewards:</p>
                            
                            <h1>
                            {unclaimedReward ? 
                                truncate(toEther((unclaimedReward[2] + (pendingRewards!) )  * BigInt(1)).toString(), 2).toLocaleString() 
                                : 
                                '0.00'
                            } 
                            <Image style={{height: "14px", width: "50px", marginLeft: "5px"}}
                    src={sUSD}
                    alt='logo'
                    />
                            </h1>
                        </div>
                        
                        
                        </div>
                        <TransactionButton style={{
                                        
                                        marginTop: "10px"
                                    }}
                                        transaction={() => (
                                            prepareContractCall({
                                                contract: STAKE_CONTRACT,
                                                method: "claim",
                                            })
                                        )}
                                        onTransactionConfirmed={() => {
                                            refetchPendingReward();
                                            refetchUnclaimedReward();
                                            reftchLastClaim();
                                        }}
                                    >
                                        Claim Reward
                                    </TransactionButton>
                        
                    
                        {isMinting && (
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
                                Deposit SOS
                            </h1>
                            <p style={{
                                marginTop: "10px"
                            }}>
                            Stake your SOS to earn rewards. SOS deposited into this vault is locked for 7 days. Once a deposit is made you have to wait 7 days before you can initiate a withdrawal.
                            </p>
                            
                            

                            <p style={{
                                marginTop: "20px"
                            }}>
                                Available Balance:
                            </p>
                            <h1>
                                {truncate(toEther(susdBalance!),2).toLocaleString() }
                                <Image style={{height: "12px", width: "12px", marginLeft: "5px"}}
                    src={Sos}
                    alt='logo'
                    /> 
                            </h1>

                            <p style={{
                                marginTop: "20px"
                            }}>
                                Deposited Balance:
                            </p>
                            <h1>
            {stakedBalance ? 
                truncate(toEther(stakedBalance[0] * BigInt(1)).toString(), 2).toLocaleString() 
                : 
                '0.00'
            }
            <Image style={{height: "12px", width: "12px", marginLeft: "5px"}}
                    src={Sos}
                    alt='logo'
                    /> 
        </h1>

        
                            
                            {mintingState === "init" ? (
                                <>
                                <p style={{
                                    marginTop: "40px"
                                }}>Enter Amount To Deposit:</p>
                                <input
                                type="number"
                                placeholder="100"
                                value={mintAmount}
                                onChange={(e) => setMintAmount(Number(e.target.value))}
                                style={{
                                    marginTop: "2px",
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
                            <p style={{marginTop: "10px"}}>Minimum Deposit:</p>
                            
                        </div>
                        <div style={{
                            display: "flex",
                            flexDirection: "column",
                            textAlign: "right"
                            
                        }} >
                            <p style={{marginTop: "10px"}}>1,000,000
                            <Image style={{height: "12px", width: "12px", marginLeft: "5px"}}
                    src={Sos}
                    alt='logo'
                    />                                 
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
                            <p style={{marginTop: "10px"}}>Maximum Deposit:</p>
                            
                        </div>
                        <div style={{
                            display: "flex",
                            flexDirection: "column",
                            textAlign: "right"
                            
                        }} >
                            <p style={{marginTop: "10px"}}>10,000,000
                            <Image style={{height: "12px", width: "12px", marginLeft: "5px"}}
                    src={Sos}
                    alt='logo'
                    />                                 
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
                            <p style={{marginTop: "10px"}}>Unclaimed Rewards:</p>
                            
                        </div>
                        <div style={{
                            display: "flex",
                            flexDirection: "column",
                            textAlign: "right"
                            
                        }} >
                            <p style={{marginTop: "10px"}}>{unclaimedReward ? 
                                truncate(toEther((unclaimedReward[2] + (pendingRewards!) )  * BigInt(1)).toString(), 2).toLocaleString() 
                                : 
                                '0.00'
                            } 
                            <Image style={{height: "14px", width: "50px", marginLeft: "5px"}}
                    src={sUSD}
                    alt='logo'
                    /></p>
                            
                        </div>

                        
                        
                        
                        </div>

                                <TransactionButton
                                transaction={() => (
                                    approve ({
                                        contract: TOKEN_CONTRACT,
                                        spender: STAKE_CONTRACT.address,
                                        amount: mintAmount,
                                    })
                                )}
                                onTransactionConfirmed={() => (
                                    setMintingState("approved")
                                )}
                                style={{
                                    width: "100%",
                                    marginTop: "10px",
                                }}
                                >Set Approval</TransactionButton>
                                
                                </>

                            ) : (
                                <>
                                <p style={{marginTop: "10px"}}>Deposit</p>
                                <h1 style={{ marginTop: "5px"}}>{mintAmount.toLocaleString()}
                                <Image style={{height: "12px", width: "12px", marginLeft: "5px"}}
                    src={Sos}
                    alt='logo'
                    />                                     
                                    </h1>
                                
         
         
                                <TransactionButton style={{width:"100%", marginTop:"10px",}}
                                 transaction={() => (
                                    prepareContractCall({
                                        contract: STAKE_CONTRACT,
                                        method: "stake",
                                        params: [toWei(mintAmount.toString())],
                                    })
                                 )}
                                 onTransactionConfirmed={() => {
                                    setMintAmount(100);
                                    setMintingState("init");
                                    refetchSusdBalance;
                                    refetchStakedBalance;
                                    setIsMinting(false);
                                 }}
                                 
                                >
                                    Deposit SOS
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
                                onClick={() => setIsMinting(false)}
                    
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
                            margin: "20px",
                            borderRadius: "10px",
                            maxWidth: "500px",
                        }}>
                            
                            <h1>
                                Withdraw SOS
                            </h1>
                            <p style={{marginTop: "10px"}}>
                            SOS deposited into this vault is locked for 7 days. Once a deposit is made you have to wait 7 days before you can initiate a withdrawal.
                            </p>
                            
                            

                            <p style={{
                                marginTop: "20px"
                            }}>
                                Deposited Balance:
                            </p>
                            <h1>
            {stakedBalance ? 
                truncate(toEther(stakedBalance[0] * BigInt(1)).toString(), 2).toLocaleString() 
                : 
                '0.00'
            }
<Image style={{height: "12px", width: "12px", marginLeft: "5px"}}
                    src={Sos}
                    alt='logo'
                    /> 
                            </h1>

                            
                            
                            <p style={{ marginTop: "20px"}}>Enter Amount To Withdraw: </p>
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
                            <p style={{marginTop: "10px"}}>Lock Date:</p>
                            
                        </div>
                        <div style={{
                            display: "flex",
                            flexDirection: "column",
                            textAlign: "right"
                            
                        }} >
                            <p style={{marginTop: "10px"}}>
    {stakeTimeStamp ? 
new Date(Number(stakeTimeStamp[3]) * 1000).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
})
        : 
        'Not Staked'
    }
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
                            <p style={{marginTop: "5px"}}>Unlock Date:</p>
                            
                        </div>
                        <div style={{
                            display: "flex",
                            flexDirection: "column",
                            textAlign: "right"
                            
                        }} >
                            <p style={{marginTop: "5px"}}>
                            
    {stakeTimeStamp ? 
        new Date((Number(stakeTimeStamp[3]) + 604800) * 1000).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
})  // Add 7 days in seconds and format
        : 
        'Not Staked'
    }

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
                            <p style={{marginTop: "5px"}}>Unclaimed Rewards:</p>
                            
                        </div>
                        <div style={{
                            display: "flex",
                            flexDirection: "column",
                            textAlign: "right"
                            
                        }} >
                            <p style={{marginTop: "5px"}}>{unclaimedReward ? 
                                truncate(toEther((unclaimedReward[2] + (pendingRewards!) )  * BigInt(1)).toString(), 2).toLocaleString() 
                                : 
                                '0.00'
                            } 
                            <Image style={{height: "14px", width: "50px", marginLeft: "5px"}}
                    src={sUSD}
                    alt='logo'
                    /></p>
                            
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
                            <p style={{marginTop: "5px"}}>Emergency Withdrawal Fee:</p>
                            
                        </div>
                        <div style={{
                            display: "flex",
                            flexDirection: "column",
                            textAlign: "right"
                            
                        }} >
                            <p style={{marginTop: "5px"}}>
                            
    50%

 </p>
                            
                        </div>
                        
                        </div>



                        <TransactionButton style={{
                                        
                                        marginTop: "10px",
                                        width: "100%",
                                    }}
                                        transaction={() => (
                                            prepareContractCall({
                                                contract: STAKE_CONTRACT,
                                                method: "claim",
                                            })
                                        )}
                                        onTransactionConfirmed={() => {
                                            refetchPendingReward();
                                            refetchUnclaimedReward();
                                            reftchLastClaim();
                                        }}
                                    >
                                        Claim Reward
                                    </TransactionButton>

                                    <TransactionButton style={{marginTop: "5px", width: "100%"}}
                            transaction={() => (
                                prepareContractCall({
                                    contract: STAKE_CONTRACT,
                                    method: "unstake",
                                    params: [toWei(redeemAmount.toString())] 
                                })
                            )}
                            onTransactionConfirmed={() => {
                                setRedeemAmount(0);
                                refetchSusdBalance;
                                refetchStakedBalance;
                                setIsRedeeming(false);
                            }}
                            disabled={!isUnlockDateReached}
                            >
                                Withdraw SOS
                            </TransactionButton>

                            



                            
                            <TransactionButton style={{marginTop: "5px", width: "100%",
                                        backgroundColor: "red",
                                        color: "white",}}
                            transaction={() => (
                                prepareContractCall({
                                    contract: STAKE_CONTRACT,
                                    method: "earlyWithdraw",
                                    params: [toWei(redeemAmount.toString())] 
                                })
                            )}
                            onTransactionConfirmed={() => {
                                setRedeemAmount(0);
                                refetchSusdBalance;
                                refetchStakedBalance;
                                setIsRedeeming(false);
                            }}
                            disabled={isUnlockDateReached}
                            >
                                Emergency Withdrawal
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
                    export default VaultOne;
                    
