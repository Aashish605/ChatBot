import { ReactElement } from 'react';

// assets
import ApartmentOutlined from '@ant-design/icons/ApartmentOutlined';
import BuildOutlined from '@ant-design/icons/BuildOutlined';
import CalendarOutlined from '@ant-design/icons/CalendarOutlined';
import CheckSquareOutlined from '@ant-design/icons/CheckSquareOutlined';
import ChromeOutlined from '@ant-design/icons/ChromeOutlined';
import CopyOutlined from '@ant-design/icons/CopyOutlined';
import CustomerServiceOutlined from '@ant-design/icons/CustomerServiceOutlined';
import DashboardOutlined from '@ant-design/icons/DashboardOutlined';
import DashOutlined from '@ant-design/icons/DashOutlined';
import DatabaseOutlined from '@ant-design/icons/DatabaseOutlined';
import DollarOutlined from '@ant-design/icons/DollarOutlined';
import DotChartOutlined from '@ant-design/icons/DotChartOutlined';
import DragOutlined from '@ant-design/icons/DragOutlined';
import EnvironmentOutlined from '@ant-design/icons/EnvironmentOutlined';
import FileDoneOutlined from '@ant-design/icons/FileDoneOutlined';
import FileTextOutlined from '@ant-design/icons/FileTextOutlined';
import FormOutlined from '@ant-design/icons/FormOutlined';
import HighlightOutlined from '@ant-design/icons/HighlightOutlined';
import IdcardOutlined from '@ant-design/icons/IdcardOutlined';
import InsertRowAboveOutlined from '@ant-design/icons/InsertRowAboveOutlined';
import LineChartOutlined from '@ant-design/icons/LineChartOutlined';
import MessageOutlined from '@ant-design/icons/MessageOutlined';
import PhoneOutlined from '@ant-design/icons/PhoneOutlined';
import PieChartOutlined from '@ant-design/icons/PieChartOutlined';
import QuestionCircleOutlined from '@ant-design/icons/QuestionCircleOutlined';
import ShoppingCartOutlined from '@ant-design/icons/ShoppingCartOutlined';
import StepForwardOutlined from '@ant-design/icons/StepForwardOutlined';
import TableOutlined from '@ant-design/icons/TableOutlined';
import UserOutlined from '@ant-design/icons/UserOutlined';

export interface SearchChild {
  id: string;
  title: string;
  icon: ReactElement;
  path: string;
  isExternal?: boolean;
}

export interface SearchGroup {
  id: string;
  title: string;
  childs: SearchChild[];
}

export type SearchDataType = SearchGroup[];

export const searchData: SearchDataType = [
  {
    id: 'dashboard',
    title: 'Dashboards',
    childs: [
      { id: 'dash-default', title: 'Default', icon: <DashboardOutlined />, path: '#!' },
      { id: 'dash-analytics', title: 'Analytics', icon: <DotChartOutlined />, path: '#!' },
      { id: 'dash-invoice', title: 'Invoice', icon: <FileTextOutlined />, path: '#!' }
    ]
  },
  {
    id: 'widgets',
    title: 'Widgets',
    childs: [
      { id: 'wid-statistics', title: 'Statistics', icon: <IdcardOutlined />, path: '#!' },
      { id: 'wid-data', title: 'Data', icon: <DatabaseOutlined />, path: '#!' },
      { id: 'wid-chart', title: 'Chart', icon: <LineChartOutlined />, path: '#!' }
    ]
  },
  {
    id: 'applications',
    title: 'Applications',
    childs: [
      { id: 'app-chat', title: 'Chat', icon: <MessageOutlined />, path: '#!' },
      { id: 'app-calendar', title: 'Calendar', icon: <CalendarOutlined />, path: '#!' },
      { id: 'app-kanban', title: 'Kanban', icon: <BuildOutlined />, path: '#!' },
      { id: 'app-customer', title: 'Customer', icon: <CustomerServiceOutlined />, path: '#!' },
      { id: 'app-invoice', title: 'Invoice', icon: <FileTextOutlined />, path: '#!' },
      { id: 'app-profile', title: 'Profile', icon: <UserOutlined />, path: '#!' },
      { id: 'app-e-commerce', title: 'E-commerce', icon: <ShoppingCartOutlined />, path: '#!' }
    ]
  },
  {
    id: 'forms-tables',
    title: 'Forms & Tables',
    childs: [
      { id: 'ft-forms-validation', title: 'Forms Validation', icon: <FileDoneOutlined />, path: '#!' },
      { id: 'ft-forms-wizard', title: 'Forms Wizard', icon: <StepForwardOutlined />, path: '#!' },
      { id: 'ft-forms-layout', title: 'Layout', icon: <FormOutlined />, path: '#!' },
      { id: 'ft-react-tables', title: 'React Table', icon: <InsertRowAboveOutlined />, path: '#!' },
      { id: 'ft-mui-tables', title: 'MUI Table', icon: <TableOutlined />, path: '#!' }
    ]
  },
  {
    id: 'plugins',
    title: 'Plugins',
    childs: [
      { id: 'plug-mask', title: 'Mask', icon: <DashOutlined />, path: '#!' },
      { id: 'plug-clipboard', title: 'Clipboard', icon: <CopyOutlined />, path: '#!' },
      { id: 'plug-re-captcha', title: 'ReCaptcha', icon: <CheckSquareOutlined />, path: '#!' },
      { id: 'plug-editor', title: 'Editor', icon: <HighlightOutlined />, path: '#!' },
      { id: 'plug-dropzone', title: 'Dropzone', icon: <DragOutlined />, path: '#!' }
    ]
  },
  {
    id: 'charts-map',
    title: 'Charts & Map',
    childs: [
      { id: 'cm-apexchart', title: 'Apexchart', icon: <PieChartOutlined />, path: '#!' },
      { id: 'cm-org-chart', title: 'Organization Chart', icon: <ApartmentOutlined />, path: '#!' },
      { id: 'cm-map', title: 'Map', icon: <EnvironmentOutlined />, path: '#!' }
    ]
  },
  {
    id: 'pages',
    title: 'Pages',
    childs: [
      { id: 'page-sample', title: 'Sample Page', icon: <ChromeOutlined />, path: '/sample-page' },
      { id: 'page-change-log', title: 'Change Log', icon: <QuestionCircleOutlined />, path: '#!', isExternal: true },
      { id: 'page-contact-us', title: 'Contact US', icon: <PhoneOutlined />, path: '/contact-us', isExternal: true },
      { id: 'page-faqs', title: 'Faqs', icon: <QuestionCircleOutlined />, path: '#!', isExternal: true },
      { id: 'page-pricing', title: 'Pricing', icon: <DollarOutlined />, path: '#!' }
    ]
  }
];
