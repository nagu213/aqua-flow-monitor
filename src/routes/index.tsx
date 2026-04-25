import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { WaterTank } from "@/components/WaterTank";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { Power, Droplet, Gauge } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const [level, setLevel] = useState(45);
  const [sumpLevel, setSumpLevel] = useState(80);
  const [pumpOn, setPumpOn] = useState(true);
  const [autoMode, setAutoMode] = useState(true);

  // Auto fill / drain
  useEffect(() => {
    const id = setInterval(() => {
      setLevel((prev) => {
        if (pumpOn && sumpLevel > 2) {
          if (autoMode && prev >= 100) {
            setPumpOn(false);
            return 100;
          }
          return Math.min(100, prev + 0.5);
        } else {
          // slow natural drain (consumption)
          return Math.max(0, prev - 0.15);
        }
      });

      setSumpLevel((prev) => {
        if (pumpOn && prev > 0) {
          // sump drains slightly faster than overhead fills (pipe loss)
          return Math.max(0, prev - 0.55);
        }
        // slow refill simulating municipal/borewell input
        return Math.min(100, prev + 0.2);
      });
    }, 200);
    return () => clearInterval(id);
  }, [pumpOn, autoMode, sumpLevel]);

  // Auto turn pump back on at low level (and only if sump has water)
  useEffect(() => {
    if (autoMode && !pumpOn && level <= 20 && sumpLevel > 10) setPumpOn(true);
    // Auto stop pump if sump dry to prevent dry-running
    if (autoMode && pumpOn && sumpLevel <= 2) setPumpOn(false);
  }, [level, sumpLevel, autoMode, pumpOn]);

  const status =
    level >= 95 ? "FULL" : level <= 15 ? "LOW" : pumpOn ? "FILLING" : "IDLE";
  const statusColor =
    level >= 95
      ? "text-chart-2"
      : level <= 15
        ? "text-destructive"
        : pumpOn
          ? "text-chart-4"
          : "text-muted-foreground";

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-background py-10 px-4">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight flex items-center justify-center gap-3">
            <Droplet className="h-9 w-9 text-chart-2" />
            Water Tank Monitor
          </h1>
          <p className="text-muted-foreground mt-2">
            Real-time tank level with motor pump control
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-8 items-center">
          <Card className="p-6 flex justify-center bg-card/60 backdrop-blur">
            <WaterTank level={level} pumpOn={pumpOn} sumpLevel={sumpLevel} />
          </Card>

          <div className="space-y-5">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Gauge className="h-5 w-5 text-primary" />
                  <h2 className="font-semibold">Status</h2>
                </div>
                <span className={`font-mono font-bold ${statusColor}`}>
                  {status}
                </span>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Overhead Tank</span>
                  <span className="font-mono font-semibold">{level.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sump Tank</span>
                  <span className={`font-mono font-semibold ${sumpLevel <= 10 ? "text-destructive" : "text-chart-2"}`}>
                    {sumpLevel.toFixed(1)}%
                  </span>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pump</span>
                  <span className={`font-mono font-semibold ${pumpOn ? "text-chart-2" : "text-muted-foreground"}`}>
                    {pumpOn ? "RUNNING" : "STOPPED"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mode</span>
                  <span className="font-mono font-semibold">
                    {autoMode ? "AUTO" : "MANUAL"}
                  </span>
                </div>
              </div>
            </Card>

            <Card className="p-6 space-y-4">
              <h2 className="font-semibold">Controls</h2>

              <Button
                onClick={() => setPumpOn((p) => !p)}
                variant={pumpOn ? "destructive" : "default"}
                className="w-full"
                size="lg"
              >
                <Power className="mr-2 h-4 w-4" />
                {pumpOn ? "Stop Pump" : "Start Pump"}
              </Button>

              <Button
                onClick={() => setAutoMode((a) => !a)}
                variant="outline"
                className="w-full"
              >
                {autoMode ? "Switch to Manual" : "Switch to Auto"}
              </Button>

              <div className="pt-2">
                <label className="text-sm text-muted-foreground mb-2 block">
                  Set Level Manually
                </label>
                <Slider
                  value={[level]}
                  onValueChange={(v) => setLevel(v[0])}
                  max={100}
                  step={1}
                />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
