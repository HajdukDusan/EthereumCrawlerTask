import { Box, FormLabel, Input } from "@chakra-ui/react";

const Search = () => {
  return (
    <Box maxW="2xl" mx={"auto"} pt={1} px={{ base: 2, sm: 12, md: 17 }}>
      <FormLabel color="white">Wallet Address</FormLabel>
      <Input placeholder="0x0.." />
    
      <FormLabel color="white">From Block</FormLabel>
      <Input placeholder="0" />
    </Box>
  );
};

export default Search;
