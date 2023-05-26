// https://github.com/indutny/elliptic
const EC = require("elliptic").ec;
const cryptoHash = require("./crypto-hash");

const ec = new EC("secp256k1");

/**
 * Verifies the signature of the given data using the provided public key.
 * @param {Object} params - The parameters for signature verification.
 * @param {string} params.publicKey - The public key used for verification.
 * @param {string} params.data - The data to be verified.
 * @param {string} params.signature - The signature to be verified.
 * @returns {boolean} True if the signature is valid, false otherwise.
 */
const verifySignature = ({ publicKey, data, signature }) => {
  const key = ec.keyFromPublic(publicKey, "hex");
  const isValid = key.verify(cryptoHash(data), signature);
  return isValid;
};

module.exports = { ec, verifySignature, cryptoHash };
