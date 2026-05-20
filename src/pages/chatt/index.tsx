import { Box, Typography } from "@mui/material";
import ChatCard from "components/ChatCard";

export default function ChatPage() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography
        variant="h4"
        sx={{ mb: 3, fontWeight: 600 }}
      >
        AI Chat Assistant
      </Typography>

      <ChatCard />
    </Box>
  );
}
