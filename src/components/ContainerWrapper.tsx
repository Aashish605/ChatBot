// project imports
import useMediaQuery from '@mui/material/useMediaQuery';
import Container, { ContainerProps } from '@mui/material/Container';
import Box from '@mui/material/Box';

// ==============================|| CONTAINER WRAPPER ||============================== //

export default function ContainerWrapper({ children, ...rest }: ContainerProps & { children: React.ReactNode }) {
  const downMD = useMediaQuery((theme) => theme.breakpoints.down('md'));

  return (
    <Container maxWidth="lg" disableGutters={downMD} {...rest}>
      <Box sx={{ px: { xs: 1.5, sm: 2, md: 0 } }}>{children}</Box>
    </Container>
  );
}
