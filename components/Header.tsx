'use client'

import Logo from "../public/logo_Sos.svg";
import Image from "next/image";
import { ConnectButton, useActiveAccount } from "thirdweb/react";
import Login from "./login";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import styles from "./Header.module.css"; // Create this CSS file for custom styling

const Header: React.FC = () => {
  const account = useActiveAccount();
  const [openMenu, setOpenMenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);


  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const toggleMenu = () => setOpenMenu(!openMenu);

  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current && // Check if ref is set
      !dropdownRef.current.contains(event.target as Node) // Check if the click is outside
    ) {
      setIsDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <Image src={Logo} alt="logo" height={50} width={100} />
        </div>

        <nav className={`${styles.nav} ${openMenu ? styles.navOpen : ""}`}>
          <Link href="/sUSD">sUSD</Link>
          
          <div className={styles.dropdown} ref={dropdownRef}>
      <button
        className={styles.dropdownToggle}
        onClick={toggleDropdown}
        aria-expanded={isDropdownOpen}
      >
        Staking <span className={styles.soon}> comming soon</span>
      </button>
      {isDropdownOpen && (
        <div className={styles.dropdownMenu}>
          <Link href="/sUSD/">SOS Staking</Link>
          <Link href="/sUSD/">LP Staking</Link>
          <Link href="/sUSD/">sUSD Staking</Link>
        </div>
      )}
    </div>
          <Link href="/dashboard">
            Dashboard
          </Link>
          <Link href="/lend">
            Lend
          </Link>
          <Link href="/borrow">
            Borrow <span className={styles.soon}>BETA</span>
          </Link>
        </nav>

        <div className={styles.login}>
          <Login />
        </div>

        {/* Hamburger Menu */}
        <button className={styles.hamburger} onClick={toggleMenu}>
          <span className={styles.bar}></span>
          <span className={styles.bar}></span>
          <span className={styles.bar}></span>
        </button>
      </div>
    </header>
  );
};

export default Header;
