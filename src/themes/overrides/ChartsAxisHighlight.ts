// material-ui
import { Theme } from '@mui/material/styles';

// ==============================|| OVERRIDES - CHART AXIS HIGHLIGHT ||============================== //

export default function ChartsAxiasHighlight(theme: Theme) {
  return {
    MuiChartsAxisHighlight: {
      styleOverrides: {
        root: {
          '&&': {
            stroke: theme.vars.palette.secondary.light,
            strokeDasharray: '4 4',
            strokeWidth: 1
          },
          ':where([data-color-scheme="light"]) &, :where([data-color-scheme="dark"]) &': {
            stroke: theme.vars.palette.secondary.light
          }
        }
      }
    }
  };
}
