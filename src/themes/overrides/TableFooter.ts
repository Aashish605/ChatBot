// material-ui
import { Theme } from '@mui/material/styles';

// ==============================|| OVERRIDES - TABLE CELL ||============================== //

export default function TableFooter(theme: Theme) {
  return {
    MuiTableFooter: {
      styleOverrides: {
        root: {
          backgroundColor: theme.vars.palette.grey[50],
          borderTop: '2px solid',
          borderTopColor: theme.vars.palette.divider,
          borderBottom: '1px solid',
          borderBottomColor: theme.vars.palette.divider
        }
      }
    }
  };
}
