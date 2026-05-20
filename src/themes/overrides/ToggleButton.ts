// material-ui
import { Theme } from '@mui/material/styles';

// ==============================|| OVERRIDES - TOGGLE BUTTON ||============================== //

export default function ToggleButton(theme: Theme) {
  return {
    MuiToggleButton: {
      styleOverrides: {
        root: {
          '&.Mui-disabled': {
            borderColor: theme.vars.palette.divider,
            color: theme.vars.palette.text.disabled
          },
          '&:focus-visible': {
            outline: `2px solid ${theme.vars.palette.secondary.dark}`,
            outlineOffset: 2
          }
        }
      }
    }
  };
}
