// material-ui
import { Theme } from '@mui/material/styles';

// ==============================|| OVERRIDES - CHART TOOLTIP ||============================== //

export default function ChartTooltip(theme: Theme) {
  return {
    MuiChartsTooltip: {
      styleOverrides: {
        container: {
          overflow: 'hidden'
        },
        root: { '& div.MuiChartsTooltip-markContainer': { width: 24 } },
        table: {
          borderSpacing: '0 8px',
          '& caption': {
            color: theme.vars.palette.text.primary,
            backgroundColor: theme.vars.palette.background.default
          }
        },
        cell: { lineHeight: 1 }
      }
    }
  };
}
