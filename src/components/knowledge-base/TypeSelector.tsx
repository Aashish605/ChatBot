import { Stack, Button } from "@mui/material";

const TYPES = ["faq", "policy", "article", "guide", "tutorial"];

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function TypeSelector({ value, onChange }: Props) {
  return (
    <Stack direction="row" spacing={1} flexWrap="wrap">
      {TYPES.map((type) => (
        <Button
          key={type}
          variant={value === type ? "contained" : "outlined"}
          onClick={() => onChange(type)}
          sx={{
            textTransform: "capitalize",
            borderRadius: 5,
          }}
        >
          {type}
        </Button>
      ))}
    </Stack>
  );
}
