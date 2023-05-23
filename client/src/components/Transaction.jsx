import React from "react";

function Transaction({ transaction }) {
  const { input, outputMap } = transaction;
  const recipients = Object.keys(outputMap);

  return (
    <div className="Transaction">
      <div className="flexSpaceBetween">
        <span>
          <strong>From:</strong> {`${input.address.substring(0, 20)}...`}
        </span>
        <span>
          <strong>Balance: </strong> {input.amount}
        </span>
      </div>
      <hr />
      {recipients.map((recipient) => (
        <div key={recipient} className="flexSpaceBetween">
          <span>
            <strong>To: </strong> {`${recipient.substring(0, 20)}...`}
          </span>
          <span>
            <strong>Sent:</strong> {outputMap[recipient]}
          </span>
        </div>
      ))}
    </div>
  );
}

export default Transaction;
