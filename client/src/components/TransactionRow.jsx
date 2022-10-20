import { Td, Tr } from "@chakra-ui/react";
import { useEffect } from "react";
import { useState } from "react";

const TransactionRow = ({ transaction }) => {

  function getDate(timestamp){
    return (new Date(timestamp * 1000)).toLocaleString()
  }

  return (
    <Tr>
      <Td isNumeric>{transaction.blockNumber}</Td>
      <Td>{getDate(transaction.timestamp)}</Td>
      <Td>{transaction.from}</Td>
      <Td>{transaction.to}</Td>
      <Td isNumeric>{Number(transaction.value.hex) / 1e18}</Td>
    </Tr>
  );
};

export default TransactionRow;
