// material-ui
import { PaletteMode } from '@mui/material/styles';

// third-party
import { presetDarkPalettes, presetPalettes, PalettesProps } from '@ant-design/colors';

// project imports
import ThemeOption from './theme';
import { ThemeMode } from 'config';
import { extendPaletteWithChannels, withAlpha } from 'utils/colorUtils';

// types
import { PaletteThemeProps } from 'types/theme';
import { PresetColor } from 'types/config';

const greyAscent = ['#fafafa', '#bfbfbf', '#434343', '#1f1f1f'];

// ==============================|| GREY COLORS BUILDER ||============================== //

function buildGrey(mode: ThemeMode) {
  let greyPrimary = [
    '#ffffff',
    '#fafafa',
    '#f5f5f5',
    '#f0f0f0',
    '#d9d9d9',
    '#bfbfbf',
    '#8c8c8c',
    '#595959',
    '#262626',
    '#141414',
    '#000000'
  ];
  let greyConstant = ['#fafafb', '#e6ebf1'];

  if (mode === ThemeMode.DARK) {
    greyPrimary = ['#000000', '#141414', '#1e1e1e', '#595959', '#8c8c8c', '#bfbfbf', '#d9d9d9', '#f0f0f0', '#f5f5f5', '#fafafa', '#ffffff'];
    greyConstant = ['#121212', '#d3d8db'];
  }

  return [...greyPrimary, ...greyAscent, ...greyConstant];
}

// ==============================|| DEFAULT THEME - PALETTE ||============================== //

export function buildPalette(presetColor: PresetColor = 'default') {
  // light colors
  const lightColors: PalettesProps = { ...presetPalettes, grey: buildGrey(ThemeMode.LIGHT) };
  const lightPaletteColor: PaletteThemeProps = ThemeOption(lightColors, presetColor, ThemeMode.LIGHT);

  // dark colors
  const darkColors: PalettesProps = { ...presetDarkPalettes, grey: buildGrey(ThemeMode.DARK) };
  const darkPaletteColor: PaletteThemeProps = ThemeOption(darkColors, presetColor, ThemeMode.DARK);

  const commonColor = { common: { black: '#000', white: '#fff' } };

  const extendedLight = extendPaletteWithChannels(lightPaletteColor);
  const extendedDark = extendPaletteWithChannels(darkPaletteColor);
  const extendedCommon = extendPaletteWithChannels(commonColor);

  return {
    light: {
      mode: 'light' as PaletteMode,
      ...extendedCommon,
      ...extendedLight,
      text: {
        primary: extendedLight.grey[700],
        secondary: extendedLight.grey[500],
        disabled: extendedLight.grey[400]
      },
      action: { disabled: extendedLight.grey[300] },
      divider: extendedLight.grey[200],
      background: {
        paper: extendedLight.grey[0],
        default: extendedLight.grey.A50
      }
    },
    dark: {
      mode: 'dark' as PaletteMode,
      ...extendedCommon,
      ...extendedDark,
      text: {
        primary: withAlpha(extendedDark.grey[900]!, 0.87),
        secondary: withAlpha(extendedDark.grey[900]!, 0.45),
        disabled: withAlpha(extendedDark.grey[900]!, 0.1)
      },
      action: { disabled: extendedDark.grey[300] },
      divider: withAlpha(extendedDark.grey[900]!, 0.05),
      background: {
        paper: extendedDark.grey[100],
        default: extendedDark.grey.A50
      }
    }
  };
}
