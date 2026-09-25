import { RankingEntry, RankingPeriod } from "@/types/api";
import { delay, http, HttpResponse } from "msw";
import { currentUserFrom, isValidPeriod } from "../utils";
import { db, paginate } from "../db";

export const rankingsHandlers = [
  // GET /rankings (CLAS-001/002/003-005/011/012)
  http.get("*/rankings", async ({ request }) => {
    await delay(100);
    const url = new URL(request.url);
    const categoryId = url.searchParams.get("categoryId") ?? undefined;
    const periodParam = url.searchParams.get("period");
    const period: RankingPeriod = isValidPeriod(periodParam)
      ? periodParam
      : "all";
    const page = Number(url.searchParams.get("page") ?? 1);
    const pageSize = Number(url.searchParams.get("pageSize") ?? 20);
    const viewer = currentUserFrom(request);

    let works = db.works.filter((w) => w.status === "accepted");
    if (categoryId)
      works = works.filter((w) => w.categoryIds.includes(categoryId));

    const sorted = [...works].sort(
      (a, b) => db.scoreInPeriod(b, period) - db.scoreInPeriod(a, period),
    );
    const entries: RankingEntry[] = sorted.map((w, i) => ({
      rank: i + 1,
      work: db.serializeWork(w, viewer),
    }));
    const { items } = paginate(entries, page, pageSize);

    return HttpResponse.json({
      period,
      categoryId: categoryId ?? null,
      entries: items,
    });
  }),

  // GET /rankings/archive (CLAS-007)
  http.get("*/rankings/archive", async ({ request }) => {
    await delay(100);
    const url = new URL(request.url);
    const period = url.searchParams.get("period");
    const viewer = currentUserFrom(request);
    const snapshots = db.rankingSnapshots
      .filter((s) => s.period === period)
      .map((s) => ({
        period: s.period,
        periodStart: s.periodStart,
        entries: s.workIdsInOrder
          .map((id, i) => {
            const work = db.works.find((w) => w.id === id);
            return work
              ? { rank: i + 1, work: db.serializeWork(work, viewer) }
              : null;
          })
          .filter((e): e is RankingEntry => e !== null),
      }));
    return HttpResponse.json(snapshots);
  }),
];
