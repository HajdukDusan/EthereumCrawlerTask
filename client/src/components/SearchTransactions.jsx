import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
} from "@chakra-ui/react";
import { useState } from "react";

const SearchTransactions = ({ search }) => {
  const [address, setAddress] = useState(
    "0xaa7a9ca87d3694b5755f213b5d04094b8d0f0a6f"
  );
  const [from, setFrom] = useState(9000000);
  const [to, setTo] = useState(10000000000);

  return (
    <Box maxW="2xl" mx={"auto"} pt={1} px={{ base: 2, sm: 12, md: 17 }}>
      <FormLabel color="white">Address</FormLabel>
      <Input
        placeholder="0x0.."
        onChange={(event) => setAddress(event.target.value)}
        type="text"
        value={address}
      />
      <br></br>
      <br></br>
      <Flex>
        <FormControl>
          <FormLabel htmlFor="from">From Block</FormLabel>
          <Input
            name="from"
            placeholder="0"
            onChange={(event) => setFrom(event.target.value)}
            type="number"
            value={from}
          />
        </FormControl>
        <FormControl>
          <FormLabel htmlFor="to">To Block</FormLabel>
          <Input
            name="to"
            placeholder="0"
            onChange={(event) => setTo(event.target.value)}
            type="number"
            value={to}
          />
        </FormControl>
      </Flex>
      <Button
        marginTop={4}
        type="submit"
        onClick={async () => {
          await search(address, from, to, 0, 10000);
        }}
      >
        Search
      </Button>
    </Box>
  );
};

export default SearchTransactions;
