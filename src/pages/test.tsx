import React from "react";
import { Container, FormControl, FormLabel } from "@chakra-ui/react";
import { Select } from "chakra-react-select";
import {languageOptions} from '../helpers/index'

const Example = () => (
  <Container mb={16}>
    <FormControl p={4}>
      <FormLabel>chakra-react-select demo</FormLabel>
      <Select
        isMulti
        name="colors"
        options={languageOptions}
        placeholder="Select some colors..."
        closeMenuOnSelect={false}
      />
    </FormControl>
  </Container>
);

export default Example;