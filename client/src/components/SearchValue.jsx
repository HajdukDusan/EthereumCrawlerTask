import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Radio,
  RadioGroup,
  Stack,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";

const SearchValue = ({ searchETH, searchERC20 }) => {
  const [address, setAddress] = useState(
    ""
  );
  const [contractAddress, setContractAddress] = useState(
    ""
  );
  const [value, setValue] = useState("ETH");

  const currDate = new Date();

  const [date, setDate] = useState(
    currDate.getFullYear() +
      "-" +
      currDate.getMonth() +
      "-" +
      currDate.getDate()
  );

  return (
    <>
      <RadioGroup onChange={setValue} value={value}>
        <Stack direction="row">
          <Radio value="ETH">ETH</Radio>
          <Radio value="ERC20">ERC20 Token</Radio>
        </Stack>
      </RadioGroup>

      <br></br>

      {value !== "ETH" && (
        <>
          <Input
            placeholder="ERC20 token address.."
            onChange={(event) => setContractAddress(event.target.value)}
            type="text"
            value={contractAddress}
          />
          <br></br>
          <br></br>
        </>
      )}

      <FormLabel>Address</FormLabel>
      <Input
        placeholder="Address to search for value.."
        onChange={(event) => setAddress(event.target.value)}
        type="text"
        value={address}
      />

      <Flex>
        <FormControl>
          <FormLabel>Date</FormLabel>
          <Input
            onChange={(event) => setDate(event.target.value)}
            type="date"
            value={date}
          />
        </FormControl>
      </Flex>

      <Button
        marginTop={4}
        type="submit"
        onClick={async () => {
          switch (value) {
            case "ETH":
              await searchETH(address, date);
              break;
            case "ERC20":
              await searchERC20(address, contractAddress, date);
              break;
            default:
              break;
          }
        }}
      >
        Search
      </Button>
    </>
  );
};

export default SearchValue;
