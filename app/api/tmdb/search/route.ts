import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = (searchParams.get("query") || "").trim();

    if (!query) {
      return NextResponse.json(
        { error: "Missing query parameter." },
        { status: 400 }
      );
    }

    const apiKey = process.env.TMDB_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "TMDB_API_KEY is not set on the server." },
        { status: 500 }
      );
    }

    const tmdbUrl = new URL("https://api.themoviedb.org/3/search/movie");
    tmdbUrl.searchParams.set("api_key", apiKey);
    tmdbUrl.searchParams.set("query", query);
    tmdbUrl.searchParams.set("include_adult", "false");

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
  } catch (err) {
    return NextResponse.json(
      { error: "Unexpected server error." },
      { status: 500 }
    );
  }
}
