import { NextResponse } from "next/server";

import { extractText } from "@/lib/rich-text-content";
import { postMessageSchema } from "@/lib/rich-text-content-schema";

const authors = [
  { id: "u_akari", name: "Akari" },
  { id: "u_haruto", name: "Haruto" },
  { id: "u_mei", name: "Mei" },
  { id: "u_ren", name: "Ren" },
];

function pickAuthor() {
  return authors[Math.floor(Math.random() * authors.length)] ?? authors[0];
}

export async function POST(request: Request) {
  const body: unknown = await request.json();
  const result = postMessageSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json({ error: "Invalid content" }, { status: 400 });
  }

  return NextResponse.json({
    message: {
      author: pickAuthor(),
      id: crypto.randomUUID(),
      content: result.data.content,
      text: extractText(result.data.content),
      createdAt: new Date().toISOString(),
    },
  });
}
