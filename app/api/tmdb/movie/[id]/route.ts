import { NextResponse, NextRequest } from "next/server";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Next.js versions can pass params as a Promise in some setups
    const resolved = await Promise.resolve(context.params);
    const id = resolved?.id;

    if (!id) {
      return NextResponse.json({ error: "Missing movie id." }, { status: 400 });
    }

    const apiKey = process.env.TMDB_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "TMDB_API_KEY is not set on the server." },
        { status: 500 }
      );
    }

    const tmdbUrl = new URL(`https://api.themoviedb.org/3/movie/${id}`);
    tmdbUrl.searchParams.set("api_key", apiKey);

    const resp = await fetch(tmdbUrl.toString(), { cache: "no-store" });

    if (!resp.ok) {
      const text = await resp.text();
      return NextResponse.json(
        { error: "TMDB request failed", status: resp.status, details: text },
        { status: 502 }
      );
    }

    const data = await resp.json();
    return NextResponse.json(data, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Unexpected server error." }, { status: 500 });
  }
}
