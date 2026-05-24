import {Snackbar,Alert} from "@mui/material";

interface TableToastProps {
  open: boolean;
  message: string;
  severity: "success" | "error";
  onClose: () => void;
}

export default function TableToast({
  open,
  message,
  severity,
  onClose,
}: TableToastProps) {
  return (
    <Snackbar
      open={open}
      autoHideDuration={3000}
      onClose={onClose}
      anchorOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
    >
      <Alert
        onClose={onClose}
        severity={severity}
        variant="filled"
        sx={{ width: "100%" }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
}