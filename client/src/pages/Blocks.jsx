import React, { useState, useEffect } from "react";
import axios from "axios";
import Block from "../components/Block";
import { Button } from "react-bootstrap";

function Blocks() {
  const [blocks, setBlocks] = useState([]);
  const [pageNum, setPageNum] = useState(1);
  const [totalNumBlocks, setTotalNumBlocks] = useState(0);
  const pageSize = 5;

  useEffect(() => {
    axios
      .get(`${document.location.origin}/api/blocks/`)
      .then((response) => {
        setTotalNumBlocks(response.data.length);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  useEffect(() => {
    axios
      .get(`${document.location.origin}/api/blocks/${pageNum}`)
      .then((response) => {
        setBlocks(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, [pageNum]);
  return (
    <>
      <h2>Blocks</h2>
      <div>
        {[...Array(Math.ceil(totalNumBlocks / pageSize)).keys()].map((key) => {
          const paginatedId = key + 1;

          return (
            <span key={key} onClick={() => setPageNum(paginatedId)}>
              <Button>{paginatedId}</Button>{" "}
            </span>
          );
        })}
      </div>

      {blocks.map((block) => (
        <Block key={block.hash} block={block} />
      ))}
    </>
  );
}

export default Blocks;
