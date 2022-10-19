import { Box } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import Search from "../components/Search";
import TransactionTable from "../components/TransactionTable";
import GetHistory from "../services/history";

const TransactionHistory = () => {
  const [data, setData] = useState(null);

  // useEffect(() => {
  //   setData(GetHistory());
  // }, []);

  return (
    <Box maxW="7xl" mx={"auto"} pt={5} px={{ base: 2, sm: 12, md: 17 }}>
      <Search />
      <br></br>
      <br></br>
      <TransactionTable transactions={data} />
    </Box>
  );
};

export default TransactionHistory;
