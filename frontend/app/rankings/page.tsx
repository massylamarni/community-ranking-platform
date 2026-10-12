"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw, Trophy } from "lucide-react";

import { rankingsRepository } from "@/repositories/rankings.repository";
import type { GlobalRankingItem } from "@/types/api";

import LoadingGuard from "@/components/guards/loadingGuard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export default function RankingsPage() {
  const [items, setItems] = useState<GlobalRankingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadRankings() {
    setLoading(true);
    setError(null);
    try {
      const data = await rankingsRepository.getGlobal();
      setItems(data);
    } catch {
      setError(
        "Impossible de charger le classement global. Veuillez vérifier votre connexion ou réessayer.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRankings();
  }, []);

  if (loading) {
    return <LoadingGuard />;
  }

  if (error) {
    return (
      <div className="w-full max-w-4xl py-12 flex flex-col items-center justify-center gap-4 text-center">
        <div className="flex items-center gap-2 text-destructive font-medium">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
        <Button onClick={loadRankings} variant="outline" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Réessayer
        </Button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <Empty className="w-full max-w-4xl my-8">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Trophy className="w-6 h-6 text-muted-foreground" />
          </EmptyMedia>
          <EmptyTitle>Aucune œuvre classée</EmptyTitle>
          <EmptyDescription>
            Aucune œuvre publiée n'est disponible dans le classement global pour le moment.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="w-full max-w-4xl flex flex-col gap-6 py-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-primary" />
            <CardTitle>Classement global</CardTitle>
          </div>
          <CardDescription>
            Découvrez les meilleures œuvres publiées toutes catégories confondues, triées par score.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/40 text-muted-foreground">
                <tr>
                  <th className="h-10 px-6 text-left font-medium w-24">Position</th>
                  <th className="h-10 px-4 text-left font-medium">Œuvre</th>
                  <th className="h-10 px-4 text-left font-medium">Catégorie</th>
                  <th className="h-10 px-6 text-right font-medium w-28">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {items.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-muted/50 transition-colors"
                  >
                    <td className="px-6 py-4 font-semibold text-foreground">
                      <span className="inline-flex items-center justify-center rounded-full text-xs font-bold px-2.5 py-0.5 bg-muted">
                        #{item.position}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <Link
                        href={`/works/${item.id}`}
                        className="font-medium hover:underline text-foreground block"
                      >
                        {item.title}
                      </Link>
                      {item.author && (
                        <span className="text-xs text-muted-foreground">
                          par {item.author}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-1">
                        {item.categories.length > 0 ? (
                          item.categories.map((cat, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {cat}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs text-muted-foreground">Général</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-foreground">
                      {item.score}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
