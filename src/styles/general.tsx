import styled from 'styled-components';
import MultiSelect from "@khanacademy/react-multi-select";
import TextField from '@mui/material/TextField';
import MUIAutocomplete from '@mui/material/Autocomplete';

export const Form = styled.form`
    > div.multi-select {
        margin: 10px;
    }

    .dropdown-heading-value span {
        font-size: 13px;
        color: #757576 !important;
    }
`

export const Input = styled(TextField).attrs({
    variant: "standard"
})`
`

export const Autocomplete = styled(MUIAutocomplete)`
`

export const Wrapper = styled.div`
    width: 100vw;
    display: flex;
`

export const WrapperColumn = styled(Wrapper)`
    flex-direction: column;
    border-right: 1px solid #cdcaca;
    border-left: 1px solid #cdcaca;
    border-bottom: 1px solid #cdcaca;
    margin: 10px;
`

export const Side = styled.div`
    display: flex;
    flex-direction: column;
    width: 50%;
`

export const StyledMultiSelect =  styled(MultiSelect)`
    div {
        margin: 10px !important;
    }
    
`

export const Row = styled.div`
    width: auto;
    display: flex;
    justify-content: space-between;
    padding: 10px;
    border-top: 1px solid #cdcaca;
`

export const Col = styled.div`
    padding-right: 10px;
`