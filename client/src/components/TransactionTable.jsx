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
import React, { useEffect, useState } from "react";
import TransactionRow from "./TransactionRow";
import { useTable, usePagination } from "react-table";
import TableTemplate from "./TableTemplate";

const TransactionTable = ({ transactions }) => {
  const columns = React.useMemo(
    () => [
      {
        Header: "Block",
        accessor: "blockNumber",
      },
      {
        Header: "Time",
        accessor: "timeStamp",
        Cell: ({ cell: { value } }) => {
          const date = new Date(value * 1000).toLocaleString();
          return <>{date}</>;
        },
      },
      {
        Header: "From",
        accessor: "from",
      },
      {
        Header: "To",
        accessor: "to",
      },
      {
        Header: "Value",
        accessor: "value",
        Cell: ({ cell: { value } }) => {
          const ethValue = Number(value) / 1e18;
          return <>{ethValue}</>;
        },
      },
    ],
    []
  );

  return (
    <TableTemplate
      columns={columns}
      data={transactions}
      title="External Transaction History"
    />
  );
};

export default TransactionTable;
