'use client'

import { ConnectButton, useActiveAccount } from "thirdweb/react"
import { chain, client } from "../utils/constants";


const Login: React.FC = () => {
    const account = useActiveAccount();

    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "end",
            justifyContent: "center",
            
            
        }}>
            {account ? (
                <div style={{ textAlign: "center"}}>
                <ConnectButton
                client={client}
                chain={chain}
            />

            
            
           
    </div>
            ) : (
                <div style={{ textAlign: "center"}}>
                <ConnectButton
                client={client}
                chain={chain}
            />
            </div>
            )}
            
        </div>
        
    )
};

export default Login;