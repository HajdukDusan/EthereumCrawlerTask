import { Box, Button, FormLabel, Input } from "@chakra-ui/react";
import { useState } from "react";

const Search = ({ SearchTransactions }) => {

  const [address, setAddress] = useState('0xaa7a9ca87d3694b5755f213b5d04094b8d0f0a6f')
  const [from, setFrom] = useState(9000000)

  return (
    <Box maxW="2xl" mx={"auto"} pt={1} px={{ base: 2, sm: 12, md: 17 }}>
      <FormLabel color="white">Wallet Address</FormLabel>
      <Input 
        placeholder="0x0.."
        onChange={event => setAddress(event.target.value)}
        type="text" 
        value={address}
      />

      <FormLabel color="white">From Block</FormLabel>
      <Input 
        placeholder="0" 
        onChange={event => setFrom(event.target.value)}
        type="number" 
        value={from}
      />

      <Button
        marginTop={4}
        type="submit"
        onClick={async () => {
          await SearchTransactions(address, from, 10000000000)
        }}
      >
        Search
      </Button>
    </Box>
  );
};

export default Search;
