import { Td, Tr } from "@chakra-ui/react";

const TransactionRow = () => {
  return (
    <Tr>
      <Td isNumeric>231234324</Td>
      <Td>02/01/2022</Td>
      <Td>0x6A5437e7bA91D52b706872502B263e7F756b2C03</Td>
      <Td>0x6A5437e7bA91D52b706872502B263e7F756b2C03</Td>
      <Td isNumeric>0.91444</Td>
    </Tr>
  );
};

export default TransactionRow;
