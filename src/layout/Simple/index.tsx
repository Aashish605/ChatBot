import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';

// project imports
import Loader from 'components/Loader';
import { SimpleLayoutType } from 'config';

const Header = lazy(() => import('components/pages/Header'));
const Footer = lazy(() => import('components/pages/Footer'));

type SimpleLayoutProps = {
  layout?: SimpleLayoutType;
  enableElevationScroll?: boolean;
};

// ==============================|| LAYOUT - SIMPLE / LANDING ||============================== //

export default function SimpleLayout({ layout = SimpleLayoutType.SIMPLE, enableElevationScroll = false }: SimpleLayoutProps) {
  return (
    <Suspense fallback={<Loader />}>
      <Header enableElevationScroll={enableElevationScroll} />
      <Outlet />
      <Footer isFull={layout === SimpleLayoutType.LANDING} />
    </Suspense>
  );
}
