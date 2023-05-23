// https://github.com/indutny/elliptic
const EC = require("elliptic").ec;
const cryptoHash = require("./crypto-hash");

const ec = new EC("secp256k1");

const verifySignature = ({ publicKey, data, signature }) => {
  const key = ec.keyFromPublic(publicKey, "hex");
  const isValid = key.verify(cryptoHash(data), signature);
  return isValid;
};

module.exports = { ec, verifySignature, cryptoHash };
