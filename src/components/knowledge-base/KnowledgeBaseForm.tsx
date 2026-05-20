import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
  Grid,
  Stack,
  TextField,
  MenuItem,
  Button,
  Slider,
  Alert,
  Paper,
  IconButton,
  Switch,
  FormControlLabel,
} from "@mui/material";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

import MainCard from "components/MainCard";

import { Controller, useForm, useFieldArray } from "react-hook-form";

import { useState } from "react";

import { useKnowledgeBase } from "hooks/useKnowledgeBase";
import { KnowledgeBaseFormData } from "types/knowledgeBase";

/* ───────────────── CONSTANTS ───────────────── */

const TYPES = ["faq", "policy", "article", "guide", "tutorial"];

const CATEGORIES = [
  "General",
  "Billing",
  "Technical",
  "Account",
  "Product",
  "Support",
];

/* ───────────────── SECTION CARD ───────────────── */

interface SectionCardProps {
  title: string;
  icon?: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

function SectionCard({
  title,
  icon,
  children,
  defaultExpanded = false,
}: SectionCardProps) {
  return (
    <Accordion
      defaultExpanded={defaultExpanded}
      disableGutters
      elevation={0}
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: "12px !important",
        overflow: "hidden",
      }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography>{icon}</Typography>
          <Typography fontWeight={600}>{title}</Typography>
        </Box>
      </AccordionSummary>

      <AccordionDetails>{children}</AccordionDetails>
    </Accordion>
  );
}

/* ───────────────── TYPE SELECTOR ───────────────── */

interface TypeSelectorProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

function TypeSelector({ value, onChange, error }: TypeSelectorProps) {
  return (
    <Box>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        {TYPES.map((type) => (
          <Button
            key={type}
            variant={value === type ? "contained" : "outlined"}
            onClick={() => onChange(type)}
            sx={{ textTransform: "capitalize", borderRadius: 5 }}
          >
            {type}
          </Button>
        ))}
      </Stack>

      {error && (
        <Typography color="error" mt={1} variant="caption">
          {error}
        </Typography>
      )}
    </Box>
  );
}

/* ───────────────── MAIN COMPONENT ───────────────── */

const DEFAULT_VALUES: KnowledgeBaseFormData = {
  type: "",
  title: "",
  question: "",
  answer: "",
  content: "",
  category: "",
  tags: "",
  keywords: "",
  common_user_phrases: "",
  steps: [{ text: "" }],
  priority: 5,
  visibility: "public",
  is_active: true,
};

export default function KnowledgeBaseForm() {
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<KnowledgeBaseFormData>({
    defaultValues: DEFAULT_VALUES,
  });

  /* ───────────────── FIELD ARRAY ───────────────── */

  const { fields, append, remove } = useFieldArray({
    control,
    name: "steps",
  });

  /* ───────────────── HOOKS ───────────────── */

  const { submitKnowledgeBase } = useKnowledgeBase();

  const [saved, setSaved] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const selectedType = watch("type");
  const priority = watch("priority");

  /* ───────────────── SUBMIT ───────────────── */

  const onSubmit = async (data: KnowledgeBaseFormData) => {
    try {
      setSubmitError(null);

      const success = await submitKnowledgeBase(data);

      if (success) {
        setSaved(true);
        reset(DEFAULT_VALUES);
        setTimeout(() => setSaved(false), 3000);
      } else {
        setSubmitError("Failed to save. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setSubmitError("An unexpected error occurred.");
    }
  };

  /* ───────────────── UI ───────────────── */

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        px: { xs: 1, sm: 2, md: 3 },
        py: 2,
      }}
    >
      <MainCard title="Knowledge Base" sx={{ width: "100%", maxWidth: 1400 }}>
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          {/* ALERTS */}
          <Stack spacing={2} mb={3}>
            {saved && (
              <Alert severity="success">
                Knowledge Base saved successfully!
              </Alert>
            )}
            {submitError && <Alert severity="error">{submitError}</Alert>}
          </Stack>

          {/*
            ── OUTER 8 / 4 GRID ──────────────────────────────────────────
            xs (< 600 px)   → both columns full-width (stacked)
            sm (600–899 px) → still stacked (form is dense; sidebar below)
            md (900 px +)   → left=8, right=4 side-by-side
          */}
          <Grid container spacing={3} alignItems="flex-start">
            {/* ── LEFT COLUMN: main form sections (8 cols on md+) ── */}
            <Grid size={{ xs: 12, md: 8 }}>
              <Stack spacing={3}>
                {/* ───────────────── ENTRY TYPE ───────────────── */}
                <SectionCard title="Entry Type" icon="📚" defaultExpanded>
                  <Controller
                    name="type"
                    control={control}
                    rules={{ required: "Please select a type" }}
                    render={({ field, fieldState }) => (
                      <TypeSelector
                        value={field.value}
                        onChange={field.onChange}
                        error={fieldState.error?.message}
                      />
                    )}
                  />
                </SectionCard>

                {/* ───────────────── CORE INFO ───────────────── */}
                <SectionCard title="Core Information" icon="📄">
                  <Grid container spacing={3}>
                    <Grid size={12}>
                      <TextField
                        fullWidth
                        label="Title"
                        error={!!errors.title}
                        helperText={errors.title?.message}
                        {...register("title", {
                          required: "Title is required",
                        })}
                      />
                    </Grid>

                    <Grid size={12}>
                      <Controller
                        name="category"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            select
                            fullWidth
                            label="Category"
                            id="category"
                            inputProps={{ id: "category", name: "category" }}
                            {...field}
                          >
                            <MenuItem value="">
                              <em>Select a category</em>
                            </MenuItem>
                            {CATEGORIES.map((category) => (
                              <MenuItem
                                key={category}
                                value={category.toLowerCase()}
                              >
                                {category}
                              </MenuItem>
                            ))}
                          </TextField>
                        )}
                      />
                    </Grid>

                    <Grid size={12}>
                      <TextField
                        fullWidth
                        label="Question"
                        {...register("question")}
                      />
                    </Grid>

                    <Grid size={12}>
                      <TextField
                        fullWidth
                        label="Short Answer"
                        {...register("answer")}
                      />
                    </Grid>

                    <Grid size={12}>
                      <TextField
                        fullWidth
                        multiline
                        minRows={6}
                        label="Full Content"
                        {...register("content")}
                      />
                    </Grid>
                  </Grid>
                </SectionCard>

                {/* ───────────────── METADATA ───────────────── */}
                <SectionCard title="Metadata & Discoverability" icon="🏷️">
                  <Stack spacing={3}>
                    <TextField
                      fullWidth
                      label="Tags"
                      helperText="Comma separated (e.g. refund, billing, payment)"
                      {...register("tags")}
                    />

                    <TextField
                      fullWidth
                      label="Keywords"
                      helperText="Comma separated"
                      {...register("keywords")}
                    />

                    <TextField
                      fullWidth
                      label="Common User Phrases"
                      helperText='How users ask this (e.g. "how do I cancel", "refund policy")'
                      {...register("common_user_phrases")}
                    />
                  </Stack>
                </SectionCard>
              </Stack>
            </Grid>

            {/* ── RIGHT COLUMN: publishing settings + submit (4 cols on md+) ── */}
            <Grid
              size={{ xs: 12, md: 4 }}
              sx={{
                /*
                  Sticky sidebar on md+.
                  top offset accounts for any fixed app-bar height; adjust
                  the value (e.g. 80px) to match your layout.
                */
                position: { md: "sticky" },
                top: { md: "80px" },
                alignSelf: { md: "flex-start" },
              }}
            >
              <Stack spacing={3}>
                {/* ───────────────── STEP BUILDER ───────────────── */}
                <SectionCard title="Step-by-step Guide" icon="📋">
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                      mt: 1,
                    }}
                  >
                    {fields.length === 0 && (
                      <Typography variant="body2" color="text.secondary">
                        No steps added yet. Click "Add Step" to begin building
                        your guide.
                      </Typography>
                    )}

                    {fields.map((field, index) => (
                      <Paper
                        key={field.id}
                        elevation={0}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          p: 2,
                          border: "1px solid",
                          borderColor: "divider",
                          borderRadius: 2,
                          backgroundColor: "background.paper",
                        }}
                      >
                        {/* STEP NUMBER */}
                        <Box
                          sx={{
                            minWidth: 36,
                            width: 36,
                            height: 36,
                            borderRadius: "50%",
                            bgcolor: "primary.main",
                            color: "#fff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 700,
                            fontSize: 14,
                            flexShrink: 0,
                          }}
                        >
                          {index + 1}
                        </Box>

                        <TextField
                          fullWidth
                          placeholder={`Describe step ${index + 1}…`}
                          {...register(`steps.${index}.text` as const)}
                        />

                        <IconButton
                          color="error"
                          onClick={() => remove(index)}
                          disabled={fields.length === 1}
                          title={
                            fields.length === 1
                              ? "At least one step is required"
                              : "Remove step"
                          }
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Paper>
                    ))}

                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={() => append({ text: "" })}
                      sx={{ alignSelf: "flex-start" }}
                    >
                      Add Step
                    </Button>
                  </Box>
                </SectionCard>

                {/* ───────────────── SETTINGS ───────────────── */}
                <SectionCard
                  title="Publishing Settings"
                  icon="⚙️"
                  defaultExpanded
                >
                  <Stack spacing={4}>
                    <Controller
                      name="visibility"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          select
                          label="Visibility"
                          fullWidth
                          id="visibility"
                          inputProps={{ id: "visibility", name: "visibility" }}
                          {...field}
                        >
                          <MenuItem value="public">Public</MenuItem>
                          <MenuItem value="private">Private</MenuItem>
                        </TextField>
                      )}
                    />

                    <Box>
                      <Typography gutterBottom>
                        Priority — <strong>{priority}</strong>
                      </Typography>

                      <Slider
                        value={priority}
                        min={0}
                        max={10}
                        step={1}
                        marks
                        valueLabelDisplay="auto"
                        name="priority"
                        id="priority"
                        onChange={(_, value) =>
                          setValue("priority", value as number)
                        }
                      />
                    </Box>

                    <Controller
                      name="is_active"
                      control={control}
                      render={({ field }) => (
                        <FormControlLabel
                          control={
                            <Switch
                              id="is_active"
                              name="is_active"
                              checked={field.value}
                              onChange={(e) => field.onChange(e.target.checked)}
                            />
                          }
                          label="Active (visible to users)"
                        />
                      )}
                    />
                  </Stack>
                </SectionCard>

                {/* ───────────────── SUBMIT ───────────────── */}
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving…" : "Save Knowledge Base"}
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Box>
      </MainCard>
    </Box>
  );
}
