import React, { useState, useRef, useEffect } from "react";

import {
  Box,
  Stack,
  TextField,
  IconButton,
  Typography,
  Avatar,
  Divider,
  Paper,
  InputAdornment,
  CircularProgress,
} from "@mui/material";

import {
  SendOutlined,
  PaperClipOutlined,
  SmileOutlined,
} from "@ant-design/icons";

import MainCard from "components/MainCard";

import { useChat } from "hooks/usechatt";

export default function ChatCard() {
  const { messages, loading, sendMessage } = useChat();

  const [inputValue, setInputValue] = useState("");

  const messageEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  const handleSendMessage = async () => {
    const trimmed = inputValue.trim();

    if (!trimmed || loading) return;

    setInputValue("");

    await sendMessage(trimmed);
  };

  const handleKeyPress = async (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      await handleSendMessage();
    }
  };

  return (
    /* ── CENTERING WRAPPER ── */
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        width: "100%",
        /* No padding on xs so the card is edge-to-edge on mobile */
        px: { xs: 0, sm: 2, md: 4 },
        py: { xs: 0, sm: 2, md: 3 },
      }}
    >
      <MainCard
        content={false}
        sx={{
          /* Full width on mobile, capped on larger screens */
          width: "100%",
          maxWidth: { xs: "100%", sm: 520, md: 600 },

          height: {
            xs: "calc(100vh - 90px)",
            sm: "calc(100vh - 110px)",
            md: "calc(100vh - 130px)",
          },

          display: "flex",
          flexDirection: "column",

          overflow: "hidden",

          /* Square corners on xs (edge-to-edge), rounded on sm+ */
          borderRadius: { xs: 0, sm: 3 },

          border: "1px solid",
          borderColor: "divider",

          boxShadow: 1,

          bgcolor: "background.paper",
        }}
      >
        {/* HEADER */}
        <Box
          sx={{
            px: 2.5,
            py: 2,

            display: "flex",
            alignItems: "center",
            gap: 2,

            bgcolor: "background.paper",

            flexShrink: 0,
          }}
        >
          <Avatar
            sx={{
              width: 42,
              height: 42,

              bgcolor: "primary.lighter",
              color: "primary.main",

              fontWeight: 700,
            }}
          >
            AI
          </Avatar>

          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                lineHeight: 1.2,
              }}
            >
              AI Support Assistant
            </Typography>

            <Typography
              variant="caption"
              color="success.main"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.75,
                mt: 0.3,
              }}
            >
              <Box
                component="span"
                sx={{
                  width: 7,
                  height: 7,
                  bgcolor: "success.main",
                  borderRadius: "50%",
                }}
              />

              Online
            </Typography>
          </Box>
        </Box>

        <Divider />

        {/* MESSAGES */}
        <Box
          sx={{
            flexGrow: 1,

            overflowY: "auto",

            px: {
              xs: 1.5,
              sm: 2,
              md: 3,
            },

            py: 2,

            bgcolor: "grey.50",

            display: "flex",
            flexDirection: "column",

            gap: 2,

            scrollBehavior: "smooth",
          }}
        >
          {messages.map((msg) => {
            const isMe = msg.sender === "me";

            return (
              <Box
                key={msg.id}
                sx={{
                  display: "flex",
                  flexDirection: "column",

                  alignItems: isMe
                    ? "flex-end"
                    : "flex-start",
                }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    px: 1.75,
                    py: 1.25,

                    maxWidth: {
                      xs: "92%",
                      sm: "82%",
                      md: "72%",
                      lg: "65%",
                    },

                    borderRadius: isMe
                      ? "18px 18px 4px 18px"
                      : "18px 18px 18px 4px",

                    bgcolor: isMe
                      ? "primary.main"
                      : "background.paper",

                    color: isMe
                      ? "primary.contrastText"
                      : "text.primary",

                    border: isMe
                      ? "none"
                      : "1px solid",

                    borderColor: "divider",

                    boxShadow: isMe
                      ? "none"
                      : "0 1px 2px rgba(0,0,0,0.04)",
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      wordBreak: "break-word",
                      whiteSpace: "pre-wrap",
                      lineHeight: 1.6,
                    }}
                  >
                    {msg.text}
                  </Typography>
                </Paper>

                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    mt: 0.6,
                    px: 0.5,

                    textAlign: isMe
                      ? "right"
                      : "left",
                  }}
                >
                  {msg.time}
                </Typography>
              </Box>
            );
          })}

          {/* LOADING */}
          {loading && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Paper
                elevation={0}
                sx={{
                  px: 2,
                  py: 1.25,

                  borderRadius: "18px 18px 18px 4px",

                  border: "1px solid",
                  borderColor: "divider",

                  bgcolor: "background.paper",
                }}
              >
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                >
                  <CircularProgress size={16} />

                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    AI is thinking...
                  </Typography>
                </Stack>
              </Paper>
            </Box>
          )}

          <div ref={messageEndRef} />
        </Box>

        <Divider />

        {/* INPUT */}
        <Box
          sx={{
            p: {
              xs: 1.25,
              sm: 1.5,
            },

            bgcolor: "background.paper",

            flexShrink: 0,
          }}
        >
          <TextField
            fullWidth
            multiline
            maxRows={4}
            size="small"
            placeholder="Ask anything..."

            value={inputValue}

            onChange={(e) =>
              setInputValue(e.target.value)
            }

            onKeyDown={handleKeyPress}

            disabled={loading}

            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <IconButton size="small">
                      <SmileOutlined
                        style={{ fontSize: 16 }}
                      />
                    </IconButton>
                  </InputAdornment>
                ),

                endAdornment: (
                  <InputAdornment position="end">
                    <Stack
                      direction="row"
                      spacing={0.5}
                    >
                      <IconButton
                        size="small"
                        disabled={loading}
                      >
                        <PaperClipOutlined
                          style={{ fontSize: 16 }}
                        />
                      </IconButton>

                      <IconButton
                        size="small"
                        color="primary"
                        disabled={
                          !inputValue.trim() || loading
                        }
                        onClick={handleSendMessage}
                      >
                        {loading ? (
                          <CircularProgress size={16} />
                        ) : (
                          <SendOutlined
                            style={{ fontSize: 16 }}
                          />
                        )}
                      </IconButton>
                    </Stack>
                  </InputAdornment>
                ),
              },
            }}

            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 3,

                alignItems: "flex-end",

                py: 0.4,

                bgcolor: "background.default",
              },
            }}
          />
        </Box>
      </MainCard>
    </Box>
  );
}