import { colors } from '@mui/material';
import React from 'react';

type Asset = {
    name: string;
    image: string; // Relative path for the image in the public folder
    supplyApy: number;
    borrowApy: number;
    isCollateral: boolean;
};

type MoneyMarketTableProps = {
    assets: Asset[];
};

const MoneyMarketTable: React.FC<MoneyMarketTableProps> = ({ assets }) => {
    return (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
                <tr>
                    <th style={styles.headerCell}>Assets</th>
                    <th style={styles.headerCell}>Supply APY</th>
                    <th style={styles.headerCell}>Borrow APY</th>
                    <th style={styles.headerCell}>Collateral</th>
                </tr>
            </thead>
            <tbody>
                {assets.map((asset, index) => (
                    <tr key={index} style={styles.row}>
                            <td style={{...styles.cell, textAlign: "left"}}>
                            <img 
                                src={asset.image} 
                                alt={`${asset.name} logo`} 
                                style={{ width: "20px", height: "20px", marginRight: "5px", verticalAlign: "middle" }} 
                            />
                            {asset.name}
                        </td>
                        <td style={styles.cell}>{asset.supplyApy.toFixed(2)}%</td>
                        <td style={styles.cell}>{asset.borrowApy.toFixed(2)}%</td>
                        <td style={styles.cell}>{asset.isCollateral ? "True" : "False"}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

const styles = {
    headerCell: {
        padding: "10px",
        borderBottom: "1px solid",
        textAlign: "left" as const,
        fontWeight: "bold",
    },
    row: {
        borderBottom: "1px ",
        
    },
    cell: {
        padding: "10px",
    },
};

export default MoneyMarketTable;
