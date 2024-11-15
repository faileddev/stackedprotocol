'use client'

import { ConnectButton, useActiveAccount } from "thirdweb/react"
import { chain, client } from "../utils/constants";


const Footer: React.FC = () => {

    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "start",
            justifyContent: "center",
            marginTop: "10px",
            
            
        }}>
            <p>
                SOS Token Contract: 0xf63fca327c555408819e26edac30f83e55a119f4
            </p>
            <p>
                sUSD Token Contrcat: 0xf63fca327c555408819e26edac30f83e55a119f4
            </p>
            
            
        </div>
        
    )
};

export default Footer;