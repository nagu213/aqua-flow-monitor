import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { TankPreview } from "@/components/TankPreview";
import { TANK_TEMPLATES, type TankShape } from "@/components/tankShapes";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useTankSelection } from "@/hooks/useTankSelection";
import { Check, Droplet } from "lucide-react";

export const Route = createFileRoute("/templates")({
  head: () => ({
    meta: [
      { title: "Choose Your Tank Design — Aqua Flow Monitor" },
      { name: "description", content: "Pick from 10 realistic water tank designs with optional underground sump." },
      { property: "og:title", content: "Choose Your Tank Design" },
      { property: "og:description", content: "10 tank shape templates — with or without sump." },
    ],
  }),
  component: TemplatesPage,
});

function TemplatesPage() {
  const navigate = useNavigate();
  const { shape: savedShape, withSump: savedSump, setSelection } = useTankSelection();
  const [withSump, setWithSump] = useState<boolean>(savedSump);
  const [picked, setPicked] = useState<TankShape>(savedShape);

  const apply = (s: TankShape) => {
    setPicked(s);
    setSelection(s, withSump);
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-background py-10 px-4">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight flex items-center justify-center gap-3">
            <Droplet className="h-8 w-8 text-chart-2" />
            Choose Your Tank Design
          </h1>
          <p className="text-muted-foreground mt-2">
            10 realistic templates — toggle the underground sump on or off and pick the one you like.
          </p>

          <div className="mt-5 inline-flex items-center gap-3 rounded-full border bg-card/60 backdrop-blur px-4 py-2">
            <Label htmlFor="sump-toggle" className="text-sm">Underground sump</Label>
            <Switch id="sump-toggle" checked={withSump} onCheckedChange={setWithSump} />
            <span className="text-xs font-mono text-muted-foreground">{withSump ? "ON" : "OFF"}</span>
          </div>

          <div className="mt-3">
            <Link to="/" className="text-sm text-primary underline-offset-4 hover:underline">
              ← Back to monitor
            </Link>
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {TANK_TEMPLATES.map((tpl) => {
            const isPicked = picked === tpl.id;
            return (
              <Card
                key={tpl.id}
                className={`p-3 flex flex-col gap-3 transition-all hover:shadow-xl ${
                  isPicked ? "ring-2 ring-primary" : ""
                }`}
              >
                <div className="bg-card/40 rounded-md overflow-hidden">
                  <TankPreview
                    shape={tpl.id}
                    level={65}
                    sumpLevel={75}
                    pumpOn
                    withSump={withSump}
                    className="w-full h-64 object-contain"
                  />
                </div>
                <div className="px-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{tpl.name}</h3>
                    {isPicked && <Check className="h-4 w-4 text-primary" />}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{tpl.description}</p>
                </div>
                <Button
                  size="sm"
                  variant={isPicked ? "default" : "outline"}
                  className="w-full"
                  onClick={() => apply(tpl.id)}
                >
                  {isPicked ? "Selected — Use this" : "Select"}
                </Button>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
