import {createMuiTheme} from '@material-ui/core/styles';
import { isWhiteSpaceLike } from 'typescript';


// TODO - get these to come from props.theme via styled components
const primary = '#1DA1DA';
const primary_white = '#FCFCFC';
const secondary = '#A781EA';

const theme = createMuiTheme({
    palette: {
        primary: {
            main: primary,
            contrastText: primary_white,
        },
        secondary: {
            main: secondary,
        },
    },
    overrides: {
        MuiTabs: {
            indicator: {
                borderBottom: '5px solid '+ primary_white
            }
        },
        MuiSelect: {
            icon: {
                color: primary_white
            }
        },
        MuiInputBase:{
            input:{
              boxSizing:'inherit'
            }
        },
        MuiSelect:{
            select: {
              "&:focus": {
                backgroundColor: 'transparent'
            }
            },
          }
    },
});

export default theme;