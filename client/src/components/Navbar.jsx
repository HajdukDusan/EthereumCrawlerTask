import { Button, Flex, Box, Text, useColorMode } from "@chakra-ui/react";
import { Link } from "react-router-dom";

const Navbar = () => {

  return (
    <Flex
      flexDirection="row"
      justifyContent="space-between"
      alignItems="center"
      width="100%"
      as="nav"
      p={4}
      mx="auto"
      maxWidth="1150px"
      marginBottom="40px"
    >
      <Box>
        <Link to="/">
          <Button
            fontWeight={["medium", "medium", "medium"]}
            fontSize={["xs", "sm", "lg", "xl"]}
            variant="ghost"
            _hover={{ bg: "rgba(0,0,0,.2)" }}
            padding="1"
            color="white"
            letterSpacing="0.65px"
          >
            Ethereum Transaction Crawler
          </Button>
        </Link>
      </Box>

      <Box>
        <Link to="/">
          <Button
            fontWeight={["medium", "medium", "medium"]}
            fontSize={["xs", "sm", "lg", "xl"]}
            variant="ghost"
            p={[1, 4]}
          >
            List
          </Button>
        </Link>
        <Link to="/add-new-book">
          <Button
            fontWeight={["medium", "medium", "medium"]}
            fontSize={["xs", "sm", "lg", "xl"]}
            variant="ghost"
            p={[1, 4]}
          >
            Add
          </Button>
        </Link>
      </Box>
    </Flex>
  );
};

export default Navbar;
