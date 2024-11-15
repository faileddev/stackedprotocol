'use client'


import Image from "next/image";
import styles from "./page.module.css";
import { ConnectButton } from "thirdweb/react";
import { chain, client } from "../../utils/constants";
import Link from "next/link";

export default function Home() {
  return (
    <div>
      <button style={{
              marginRight: "5px",
              padding: "10px",
              backgroundColor: "#efefef",
              border: "none",
              borderRadius: "6px",
              color: "#333",
              fontSize: "1rem",
              cursor: "pointer",
              width: "120px"}}>
        Launch App
      </button>
      <Link href="/about">Go to About Page</Link>
      <Link style={{marginLeft: "10px"}} href="/sUSD">sUSD</Link>
    </div>
  );
}
