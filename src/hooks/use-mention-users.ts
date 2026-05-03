import { useEffect, useState } from "react";

import type { MentionUser } from "@/lib/mention-users";

interface MentionUsersResponse {
  users: MentionUser[];
}

export function useMentionUsers() {
  const [users, setUsers] = useState<MentionUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchMentionUsers() {
      try {
        const response = await fetch("/api/mention-users", {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Mention 候補の取得に失敗しました。");
        }

        const data = (await response.json()) as MentionUsersResponse;

        setUsers(data.users);
        setError(null);
      } catch (fetchError) {
        if (controller.signal.aborted) return;

        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "Mention 候補の取得に失敗しました。",
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void fetchMentionUsers();

    return () => {
      controller.abort();
    };
  }, []);

  return {
    error,
    isLoading,
    users,
  };
}
