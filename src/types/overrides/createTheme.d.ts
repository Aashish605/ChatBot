// material-ui
// eslint-disable-next-line
import * as Theme from '@mui/material/styles';

// project imports
import { CustomShadowProps } from 'types/theme';

declare module '@mui/material/styles' {
  interface Theme {
    customShadows: CustomShadowProps;
  }

  interface ThemeOptions {
    customShadows?: CustomShadowProps;
  }

  interface ThemeVars {
    customShadows: CustomShadowProps;
    typography: Theme['typography'];
    transitions: Theme['transitions'];
  }
}
