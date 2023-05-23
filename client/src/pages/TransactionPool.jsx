import React, { useEffect, useState } from "react";
import axios from "axios";
import Transaction from "../components/Transaction";
import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

function TransactionPool() {
  const [transactionPool, setTransactionPool] = useState(null);
  const navigate = useNavigate();

  function getTransactionPool() {
    axios
      .get(`${document.location.origin}/api/transaction-pool-map`)
      .then((response) => {
        setTransactionPool(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  function handleMineTransactions() {
    axios
      .get(`${document.location.origin}/api/mine-transactions`)
      .then((response) => {
        if (response.status === 200) {
          return navigate("/blocks");
        } else {
          throw Error("The mine-transactions block request did not complete");
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  useEffect(() => {
    getTransactionPool();
    const fetchPoolMapInterval = setInterval(getTransactionPool, 10000);
    return () => clearInterval(fetchPoolMapInterval);
  }, []);
  return (
    <>
      <h2>Transaction Pool</h2>
      <div className="container600">
        {transactionPool && Object.keys(transactionPool).length > 0 && (
          <div>
            {Object.values(transactionPool).map((transaction) => (
              <Transaction key={transaction.id} transaction={transaction} />
            ))}
            <hr />
            <Button onClick={handleMineTransactions}>Mine Transactions</Button>
          </div>
        )}
      </div>
    </>
  );
}

export default TransactionPool;
