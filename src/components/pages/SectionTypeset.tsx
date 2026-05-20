import { ReactNode } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import Stack, { StackProps } from '@mui/material/Stack';
import Typography, { TypographyProps } from '@mui/material/Typography';

type Props = {
  caption?: string;
  heading: string;
  stackProps?: StackProps;
  headingProps?: TypographyProps;
  description: string | ReactNode;
  descriptionProps?: TypographyProps;
};

// ==============================|| SECTIONS - HEADER TYPESET ||============================== //

export default function SectionTypeset({ caption, heading, description, stackProps, headingProps, descriptionProps }: Props) {
  const theme = useTheme();
  const { sx: descriptionSx, ...otherDescriptionProps } = descriptionProps || {};
  const { sx: stackSx, ...otherStackProps } = stackProps || {};
  const { sx: headingSx, ...otherHeadingProps } = headingProps || {};

  return (
    <Stack {...otherStackProps} sx={{ gap: 2.5, textAlign: 'center', justifyContent: 'center', ...stackSx }}>
      {caption && (
        <Typography variant="h5" color="primary" sx={{ fontWeight: 500 }}>
          {caption}
        </Typography>
      )}
      <Stack sx={{ gap: 1.25 }}>
        <Typography variant="h2" {...otherHeadingProps} sx={{ fontWeight: 700, fontSize: { xs: 24, md: 30 }, ...headingSx }}>
          {heading}
        </Typography>

        <Typography
          variant="h5"
          {...otherDescriptionProps}
          sx={{ fontWeight: 400, color: 'secondary.main', ...theme.applyStyles('dark', { color: 'secondary.400' }), ...descriptionSx }}
        >
          {description}
        </Typography>
      </Stack>
    </Stack>
  );
}
