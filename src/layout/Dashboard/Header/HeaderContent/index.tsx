import { useMemo } from 'react';

// material-ui
import { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';

// project imports
import Search from './Search';
// import Chat from './Chat';
// import Profile from './Profile';
import Localization from './Localization';
// import Notification from './Notification';
// import FullScreen from './FullScreen';
import MobileSection from './MobileSection';
import MegaMenuSection from './MegaMenuSection';
// import Workspace from './Workspace';

import useConfig from 'hooks/useConfig';
import { MenuOrientation } from 'config';
import DrawerHeader from 'layout/Dashboard/Drawer/DrawerHeader';

// ==============================|| HEADER - CONTENT ||============================== //

export default function HeaderContent() {
  const { state } = useConfig();

  const downLG = useMediaQuery((theme: Theme) => theme.breakpoints.down('lg'));

  const localization = useMemo(() => <Localization />, []);

  const megaMenu = useMemo(() => <MegaMenuSection />, []);

  return (
    <>
      {state.menuOrientation === MenuOrientation.HORIZONTAL && !downLG && <DrawerHeader open={true} />}
      {!downLG && (
        <>
          <Stack direction="row" sx={{ gap: 2, ml: 1 }}>
            {/* <Workspace /> */}
            <Divider orientation="vertical" flexItem sx={{ height: 22, alignSelf: 'center' }} />
            {/* <Search /> */}
          </Stack>
        </>
      )}
      <Box sx={{ width: 1, ml: 1 }} />

      <Stack direction="row" sx={{ alignItems: 'center', gap: 0.75 }}>
        {/* {!downLG && megaMenu} */}
        {/* {localization} */}
        {/* <Notification /> */}
        {/* <Chat /> */}
        {/* {!downLG && <FullScreen />} */}
        {/* {!downLG && <Profile />} */}
        {/* {downLG && <MobileSection />} */}
      </Stack>
    </>
  );
}
