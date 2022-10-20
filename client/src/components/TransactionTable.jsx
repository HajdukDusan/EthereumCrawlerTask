import {
  Box,
  Flex,
  Grid,
  GridItem,
  Table,
  TableCaption,
  TableContainer,
  Tbody,
  Td,
  Tfoot,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import TransactionRow from "./TransactionRow";

const TransactionTable = ({ transactions }) => {

  return (
    <>
      <TableContainer>
        <Table variant="simple">
          <TableCaption>Transaction History</TableCaption>
          <Thead>
            <Tr>
              <Th>Block</Th>
              <Th>Time</Th>
              <Th>From</Th>
              <Th>To</Th>
              <Th isNumeric>Value</Th>
            </Tr>
          </Thead>
          <Tbody>
            {transactions &&
            transactions.map((tx) => (
                <TransactionRow transaction={tx} />
            ))}
          </Tbody>
          <Tfoot>
            <Tr>
              <Th>To convert</Th>
              <Th>into</Th>
              <Th isNumeric>multiply by</Th>
            </Tr>
          </Tfoot>
        </Table>
      </TableContainer>
    </>
  );
};

export default TransactionTable;
