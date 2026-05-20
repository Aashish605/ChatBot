// material-ui
import { useColorScheme } from '@mui/material/styles';

// third-party
import SyntaxHighlighter from 'react-syntax-highlighter';
import { a11yDark, a11yLight } from 'react-syntax-highlighter/dist/esm/styles/hljs';

// project imports
import { ThemeMode } from 'config';

interface SyntaxHighlightProps {
  children: string;
  language?: string;
  [key: string]: any;
  darkStyle?: boolean;
}

// ==============================|| CODE HIGHLIGHTER ||============================== //

export default function SyntaxHighlight({ children, language = 'javascript', darkStyle = false, ...others }: SyntaxHighlightProps) {
  const { colorScheme } = useColorScheme();

  return (
    <SyntaxHighlighter
      language={language}
      showLineNumbers
      style={colorScheme === ThemeMode.DARK && !darkStyle ? a11yLight : a11yDark}
      {...others}
    >
      {children}
    </SyntaxHighlighter>
  );
}
