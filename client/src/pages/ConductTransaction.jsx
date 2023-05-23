import React, { useState, useRef } from "react";
import axios from "axios";
import { Button, FormControl, FormGroup, Alert } from "react-bootstrap";

function ConductTransaction() {
  const [message, setMessage] = useState(null);
  const recipientEl = useRef(null);
  const amountEl = useRef(null);

  function handleSubmit() {
    const recipient = recipientEl.current.value;
    const amount = amountEl.current.value;
    if (!recipient) {
      setMessage("Missing recipient");
      return;
    }
    if (!amount) {
      setMessage("Missing amount");
      return;
    }
    axios
      .post(`${document.location.origin}/api/transact`, {
        amount: Number(amount),
        recipient: recipient,
      })
      .then((res) => {
        const successMessage = `SUCCESS: ${amount} was sent to ${recipient}`;
        setMessage(res.data?.message ?? successMessage);
        amountEl.current.value = "";
        recipientEl.current.value = "";
      })
      .catch((error) => {
        console.log(error);
      });
  }
  return (
    <>
      <h2>Conduct a Transaction</h2>
      {message && (
        <Alert variant="info" className="alert">
          {message}{" "}
        </Alert>
      )}
      <form id="conductTransactionForm">
        <FormGroup>
          <FormControl input="text" placeholder="recipient" ref={recipientEl} />
        </FormGroup>
        <FormGroup>
          <FormControl input="number" placeholder="amount" ref={amountEl} />
        </FormGroup>
        <Button onClick={handleSubmit}> Add Transaction </Button>
      </form>
    </>
  );
}

export default ConductTransaction;
