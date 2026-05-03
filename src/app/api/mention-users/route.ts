import { getRandomMentionUsers } from "@/lib/mention-users";

export function GET() {
  return Response.json({
    users: getRandomMentionUsers(50),
  });
}
