import { z } from "zod";

type RichTextNode = {
  type?: string;
  attrs?: Record<string, unknown>;
  content?: RichTextNode[];
  marks?: RichTextMark[];
  text?: string;
};

type RichTextMark = {
  type: string;
  attrs?: Record<string, unknown>;
};

const richTextMarkSchema = z
  .object({
    type: z.string(),
    attrs: z.record(z.string(), z.unknown()).optional(),
  })
  .passthrough();

const richTextNodeSchema: z.ZodType<RichTextNode> = z.lazy(() =>
  z
    .object({
      type: z.string().optional(),
      attrs: z.record(z.string(), z.unknown()).optional(),
      content: z.array(richTextNodeSchema).optional(),
      marks: z.array(richTextMarkSchema).optional(),
      text: z.string().optional(),
    })
    .passthrough(),
);

export const richTextContentSchema = richTextNodeSchema.refine(
  (node) => node.type === "doc",
  "Root node must be doc",
);

export const postMessageSchema = z.object({
  content: richTextContentSchema,
});

export type PostMessageInput = z.infer<typeof postMessageSchema>;
