// material-ui
import Box from '@mui/material/Box';

// third-party
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

// project imports
import { ThemeDirection } from 'config';

interface Props {
  value?: string;
  editorMinHeight?: number;
  placeholder?: string;
  onChange?: (value: string) => void;
}

// ==============================|| QUILL EDITOR ||============================== //

export default function ReactQuillDemo({ value, editorMinHeight = 135, onChange, placeholder = 'Write something...' }: Props) {
  const quillProps = {
    placeholder,
    ...(value && { value }),
    ...(onChange && { onChange })
  };
  return (
    <Box
      sx={(theme) => ({
        borderRadius: '4px',
        '& .quill': {
          '& .ql-toolbar': {
            bgcolor: 'secondary.lighter',
            borderColor: 'grey.300',
            borderTopLeftRadius: '4px',
            borderTopRightRadius: '4px',
            ...theme.applyStyles('dark', { bgcolor: 'secondary.400', borderColor: 'grey.200' }),
            '& .ql-picker-options': {
              backgroundColor: 'background.paper',
              borderColor: `${theme.vars.palette.divider} !important`,
              borderRadius: '8px',
              color: 'text.primary',
              '& .ql-picker-item:hover': {
                color: theme.vars.palette.primary.main
              }
            },
            '& .ql-formats': {
              'button:hover, button.ql-active': {
                '& .ql-stroke': { stroke: theme.vars.palette.primary.main },
                '& .ql-fill': { fill: theme.vars.palette.primary.main }
              },
              '& .ql-expanded .ql-picker-label': {
                borderColor: `${theme.vars.palette.text.primary} !important`,
                color: 'text.primary',
                '& .ql-stroke': { stroke: theme.vars.palette.text.primary },
                '& .ql-fill': { fill: theme.vars.palette.text.primary }
              },
              '& .ql-picker-label:hover, & .ql-picker-label.ql-active': {
                color: 'primary.main',
                'svg .ql-stroke': {
                  stroke: theme.vars.palette.primary.main
                }
              }
            }
          },
          '& .ql-container': {
            borderColor: 'grey.300',
            borderBottomLeftRadius: '4px',
            borderBottomRightRadius: '4px',
            ...theme.applyStyles('dark', { borderColor: 'grey.200' }),
            '& .ql-editor': {
              minHeight: editorMinHeight,
              textAlign: 'left',
              // placeholder styles
              '&.ql-blank::before': {
                color: 'text.secondary',
                opacity: 0.5,
                fontStyle: 'unset',
                ...theme.typography.body2,
                left: 16,
                right: 'unset'
              }
            }
          },
          ...(theme.direction === ThemeDirection.RTL && {
            '& .ql-snow .ql-picker:not(.ql-color-picker):not(.ql-icon-picker) svg': {
              right: '0%',
              left: 'inherit'
            }
          })
        }
      })}
    >
      <ReactQuill {...quillProps} />
    </Box>
  );
}
