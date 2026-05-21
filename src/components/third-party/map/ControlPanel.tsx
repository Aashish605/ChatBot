import { ReactElement, ReactNode } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';

// project imports
import { withAlpha } from 'utils/colorUtils';
import SubCard from 'components/cards/SubCard';

interface Props {
  title?: ReactNode | string;
  children: ReactElement;
}

// ==============================|| MAPLIBRE - CONTROL PANEL ||============================== //

export default function ControlPanel({ title, children }: Props) {
  const theme = useTheme();

  return (
    <SubCard
      {...(title && { title })}
      contentSX={{ px: 2, pt: 1, '&:last-child': { pb: 1 } }}
      sx={{
        minWidth: 180,
        position: 'absolute',
        top: 20,
        right: 20,
        zIndex: 1,
        backdropFilter: `blur(4px)`,
        WebkitBackdropFilter: `blur(4px)`,
        backgroundColor: withAlpha(theme.vars.palette.background.paper, 0.8)
      }}
    >
      {children}
    </SubCard>
  );
}
