import { getHenrikClient } from "@/lib/api/henrik";
import { createClient } from "@/lib/supabase/server";
import type { ValorantRegion } from "@/types/valorant";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const BodySchema = z.object({
  riotId: z.string().min(3).max(64),
});

function asRegion(r: string): ValorantRegion {
  const x = r.toLowerCase();
  if (x === "latam" || x === "las") return "latam";
  if (x === "br" || x === "brazil") return "br";
  if (x === "na" || x === "eu" || x === "ap" || x === "kr") return x;
  return "na";
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  let body: z.infer<typeof BodySchema>;
  try {
    body = BodySchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const hash = body.riotId.lastIndexOf("#");
  if (hash === -1) {
    return NextResponse.json({ error: "Use Name#TAG format" }, { status: 400 });
  }
  const name = body.riotId.slice(0, hash).trim();
  const tag = body.riotId.slice(hash + 1).trim();
  if (!name || !tag) {
    return NextResponse.json({ error: "Invalid Riot ID" }, { status: 400 });
  }

  let henrik;
  try {
    henrik = getHenrikClient();
  } catch {
    return NextResponse.json({ error: "Henrik API not configured" }, { status: 500 });
  }

  const acc = await henrik.getAccount(name, tag);
  if (acc.status !== 200 || !acc.data) {
    return NextResponse.json({ error: "Riot account not found" }, { status: 404 });
  }

  const { puuid, region } = acc.data;
  const { error } = await supabase
    .from("profiles")
    .update({
      riot_name: name,
      riot_tag: tag,
      riot_puuid: puuid,
      region: asRegion(region),
    })
    .eq("id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, puuid, region: asRegion(region) });
}
