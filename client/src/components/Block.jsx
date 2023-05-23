import React, { useState } from "react";
import { Button } from "react-bootstrap";
import Transaction from "./Transaction";

function Block({ block }) {
  const [displayTransaction, setDisplayTransaction] = useState(false);

  const { data, hash, lastHash, timestamp } = block;
  const hashDisplay = `${hash.substring(0, 15)}...`;
  const simpleDataDisplay = `${JSON.stringify(data).substring(0, 35)}...`;
  const fullDataDisplay = JSON.stringify(data);
  let dataDisplay = simpleDataDisplay;

  function toogleTransaction() {
    setDisplayTransaction(!displayTransaction);
  }
  return (
    <div className="Block">
      <div>
        <strong>Hash:</strong> {hashDisplay}
      </div>
      <div>
        <strong>Timestamp:</strong> {new Date(timestamp).toLocaleString()}
      </div>
      <div>
        <strong> Data:</strong>
        <div className="dataBox">
          {displayTransaction
            ? data.map((transaction) => (
                <Transaction key={transaction.id} transaction={transaction} />
              ))
            : simpleDataDisplay}
        </div>
      </div>
      <Button onClick={toogleTransaction}>
        {displayTransaction ? "Show Less" : "Show More"}
      </Button>
    </div>
  );
}

export default Block;
