// material-ui
import { Theme } from '@mui/material/styles';

// project imports
import { withAlpha } from 'utils/colorUtils';

// ==============================|| OVERRIDES - DIALOG ||============================== //

export default function Dialog(theme: Theme) {
  return {
    MuiDialog: {
      styleOverrides: {
        root: {
          '& .MuiBackdrop-root': {
            backgroundColor: withAlpha(theme.vars.palette.common.black, 0.7)
          }
        },
        paper: {
          backgroundImage: 'none'
        }
      }
    }
  };
}
