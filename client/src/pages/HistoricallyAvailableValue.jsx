import {
  Box,
  Center,
  Flex,
  Spinner,
  Stat,
  StatArrow,
  StatGroup,
  StatHelpText,
  StatLabel,
  StatNumber,
  Text,
} from "@chakra-ui/react";
import { useState } from "react";
import SearchValue from "../components/SearchValue";
import {
  GetAvailableERC20Value,
  GetAvailableETHValue,
} from "../services/services";

const HistoricallyAvailableValue = () => {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);

  const searchETHValue = async (address, date) => {
    setLoading(true);

    setValue(await GetAvailableETHValue(address, date));

    setLoading(false);
  };

  const searchERC20Value = async (address, contractAddress, date) => {
    setLoading(true);

    setValue(await GetAvailableERC20Value(address, contractAddress, date));

    setLoading(false);
  };

  return (
    <Box maxW="2xl" mx={"auto"} pt={1} px={{ base: 2, sm: 12, md: 17 }}>
      <SearchValue searchETH={searchETHValue} searchERC20={searchERC20Value} />

      <br></br>
      <br></br>

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
          {value != null && (
            <>
              <Center>
                <Text fontSize="2xl">Historically Available Value</Text>
              </Center>

              <Center>
                <Text fontSize="6xl">{value}</Text>
              </Center>
            </>
          )}
        </>
      )}
    </Box>
  );
};

export default HistoricallyAvailableValue;
