import React, { useState, useEffect } from "react";
import axios from "axios";
import logo from "../assets/logo.png";

function App() {
  const [wallet, setWallet] = useState({ walletInfo: {} });

  const { address, balance } = wallet.walletInfo;

  useEffect(() => {
    axios
      .get(`${document.location.origin}/api/wallet-info`)
      .then((response) => {
        setWallet({ walletInfo: response.data });
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  return (
    <>
      <img className="logo" src={logo}></img>
      <h1>Welcome to the Blockchain</h1>
      <div className="WalletInfo">
        <h3>Wallet Info</h3>
        <div>Address: {address}</div>
        <div>Balance: {balance}</div>
      </div>
    </>
  );
}

export default App;
