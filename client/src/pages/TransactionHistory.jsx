import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  ChakraProvider,
  Flex,
  FormLabel,
  Input,
  Spinner,
  Table,
  TableCaption,
  TableContainer,
  Tbody,
  Td,
  Text,
  Tfoot,
  Th,
  Thead,
  Tr,
  useControllableState,
} from "@chakra-ui/react";
import { useCallback, useEffect, useRef, useState } from "react";
import TransactionTable from "../components/TransactionTable";
import Search from "../components/Search";
import GetHistory from "../services/services.js";
import TransactionRow from "../components/TransactionRow";

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  const getTransactions = async (
    address,
    fromBlock,
    toBlock,
    pageIndex,
    pageSize
  ) => {
    setLoading(true);

    setTransactions(
      await GetHistory(address, fromBlock, toBlock, pageIndex, pageSize)
    );

    setLoading(false);
  };

  useEffect(() => {
    console.log(transactions);
  }, [transactions]);

  return (
    <Box maxW="8xl" mx={"auto"} pt={5} px={{ base: 2, sm: 12, md: 17 }}>
      <Search SearchTransactions={getTransactions} />

      {loading ? (
        <Flex
          minH={"75vh"}
          fontSize={"2xl"}
          justifyContent={"center"}
          alignItems={"center"}
        >
          <Spinner size={"xl"} />
        </Flex>
      ) : (
        <>
          <br></br>
          <br></br>
          {transactions.length === 10000 && (
            <Alert status="warning">
              <AlertIcon />
              Table only shows 10000 newest transactions
            </Alert>
          )}
          <TransactionTable transactions={transactions} />
        </>
      )}
    </Box>
  );
};

export default TransactionHistory;
