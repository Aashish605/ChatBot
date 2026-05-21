// material-ui
import { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// third-party
import { PatternFormat } from 'react-number-format';

// project imports
import Avatar from 'components/@extended/Avatar';
import MainCard from 'components/MainCard';
import { getImageUrl, ImagePath } from 'utils/getImageUrl';

// types
import { TableDataProps } from 'types/table';

// assets
import DatabaseOutlined from '@ant-design/icons/lib/icons/DatabaseOutlined';
import EnvironmentOutlined from '@ant-design/icons/EnvironmentOutlined';
import MailOutlined from '@ant-design/icons/MailOutlined';
import PhoneOutlined from '@ant-design/icons/PhoneOutlined';

interface ExpandingUserDetailProps {
  data: TableDataProps;
}

// ==============================|| EXPANDING TABLE - USER DETAILS ||============================== //

export default function ExpandingUserDetail({ data }: ExpandingUserDetailProps) {
  const downMD = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));

  return (
    <Grid container spacing={2.5} sx={{ pl: { xs: 0, sm: 5, md: 6, lg: 10, xl: 12 } }}>
      <Grid size={{ xs: 12, sm: 5, md: 4, xl: 3.5 }}>
        <MainCard sx={{ position: 'relative' }}>
          <Chip label={data.status} size="small" sx={{ position: 'absolute', right: -1, top: -1, borderRadius: '0 4px 0 4px' }} />
          <Stack sx={{ gap: 3 }}>
            <Stack sx={{ gap: 2.5, alignItems: 'center' }}>
              <Avatar alt="Avatar 1" size="xl" src={getImageUrl(`avatar-${data.avatar}.png`, ImagePath.USERS)} />
              <Stack sx={{ gap: 0.5, alignItems: 'center' }}>
                <Typography variant="h5">
                  {data.firstName} {data.lastName}
                </Typography>
                <Typography sx={{ color: 'text.secondary' }}>{data.role}</Typography>
              </Stack>
            </Stack>
            <Divider />
            <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-around' }}>
              <Stack sx={{ gap: 0.5, alignItems: 'center' }}>
                <Typography variant="h5">{data.age}</Typography>
                <Typography sx={{ color: 'text.secondary' }}>Age</Typography>
              </Stack>
              <Divider orientation="vertical" flexItem />
              <Stack sx={{ gap: 0.5, alignItems: 'center' }}>
                <Typography variant="h5">{data.progress}%</Typography>
                <Typography sx={{ color: 'text.secondary' }}>Progress</Typography>
              </Stack>
              <Divider orientation="vertical" flexItem />
              <Stack sx={{ gap: 0.5, alignItems: 'center' }}>
                <Typography variant="h5">{data.visits}</Typography>
                <Typography sx={{ color: 'text.secondary' }}>Visits</Typography>
              </Stack>
            </Stack>
            <Divider />
            <List aria-label="contact-details">
              <ListItem disablePadding>
                <ListItemIcon>
                  <MailOutlined />
                </ListItemIcon>
                <ListItemText primary={data.email} />
              </ListItem>
              <ListItem disablePadding>
                <ListItemIcon>
                  <PhoneOutlined />
                </ListItemIcon>
                <ListItemText primary={data.contact} />
              </ListItem>
              <ListItem disablePadding>
                <ListItemIcon>
                  <EnvironmentOutlined />
                </ListItemIcon>
                <ListItemText primary={data.country} />
              </ListItem>
              <ListItem disablePadding>
                <ListItemIcon>
                  <DatabaseOutlined />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Link align="right" href="https://google.com" target="_blank">
                      https://anshan.dh.url
                    </Link>
                  }
                />
              </ListItem>
            </List>
          </Stack>
        </MainCard>
      </Grid>
      <Grid size={{ xs: 12, sm: 7, md: 8, xl: 8.5 }}>
        <Stack sx={{ gap: 2.5 }}>
          <MainCard title="Personal Details">
            <List disablePadding sx={{ '& .MuiListItem-root': { display: 'block' } }}>
              <ListItem divider={!downMD} disableGutters>
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography sx={{ mb: 0.5, color: 'text.secondary' }}>Full Name</Typography>
                    <Typography>
                      {data.firstName} {data.lastName}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography sx={{ mb: 0.5, color: 'text.secondary' }}>Father Name</Typography>
                    <Typography>Mr. {data.fatherName}</Typography>
                  </Grid>
                </Grid>
              </ListItem>
              <ListItem divider={!downMD} disableGutters>
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography sx={{ mb: 0.5, color: 'text.secondary' }}>Country</Typography>
                    <Typography>{data.country}</Typography>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography sx={{ mb: 0.5, color: 'text.secondary' }}>Zip Code</Typography>
                    <Typography>
                      <PatternFormat displayType="text" format="### ###" mask="_" defaultValue={data.contact} />
                    </Typography>
                  </Grid>
                </Grid>
              </ListItem>
              <ListItem disableGutters>
                <Typography sx={{ mb: 0.5, color: 'text.secondary' }}>Address</Typography>
                <Typography>{data.address}</Typography>
              </ListItem>
            </List>
          </MainCard>
          <MainCard title="About me">
            <Typography sx={{ color: 'text.secondary' }}>
              Hello, I’m {data.firstName} {data.lastName} {data.role} based in international company, {data.about}
            </Typography>
          </MainCard>
        </Stack>
      </Grid>
    </Grid>
  );
}
