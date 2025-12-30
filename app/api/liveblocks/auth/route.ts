import { Liveblocks } from "@liveblocks/node";
import { NextRequest } from "next/server";

const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY!,
});

export async function POST(request: NextRequest) {
  // Get the user info from the request (for now, anonymous sessions)
  // In production, you'd get this from your auth system
  const { room } = await request.json();

  // Generate a unique user ID for anonymous sessions
  const userId = `user_${Math.random().toString(36).substring(2, 11)}`;

  // Create a Liveblocks session
  const session = liveblocks.prepareSession(userId, {
    userInfo: {
      name: '익명 플레이어',
      role: 'streamer', // Default role
    },
  });

  // Grant full access to the requested room
  session.allow(room, session.FULL_ACCESS);

  // Authorize the user and return the token
  const { status, body } = await session.authorize();
  return new Response(body, { status });
}
