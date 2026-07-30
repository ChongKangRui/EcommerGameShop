"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { useIsMobile } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { MonthlySalesData } from "@ecom/shared/type/order";

export const description = "An interactive area chart";

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "var(--primary)",
  },
  units_sold: {
    label: "Units Sold",
    color: "var(--secondary)",
  },
} satisfies ChartConfig;

type SalesChartProps = {
  salesData: MonthlySalesData[];
};

function getFillMonthlyData(
  data: MonthlySalesData[],
  monthsToShow: number = 12,
) {
  const now = new Date();
  const result: MonthlySalesData[] = [];

  for (let i = monthsToShow - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    const existing = data.find((d) => d.year === year && d.month === month);

    result.push(
      existing ?? {
        revenue: 0,
        units_sold: 0,
        year,
        month,
      },
    );
  }

  return result;
}

export function SalesChart({ salesData }: SalesChartProps) {
  const isMobile = useIsMobile();

  const filledData = getFillMonthlyData(salesData);

  const chartData = filledData.map((item) => ({
    month: new Date(item.year, item.month - 1).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    }),
    revenue: item.revenue,
    units_sold: item.units_sold,
  }));

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Monthly Sales</CardTitle>
        <CardDescription>Last 12 months</CardDescription>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={chartData} margin={{ left: 30, right: 30 }}>
            <defs>
              <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--primary)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--primary)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillUnits" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--secondary)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--secondary)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={true}
              axisLine={false}
              tickMargin={8}
              interval={isMobile ? 2 : 0}
            />
            {/* Left axis drives the revenue scale */}
            <YAxis yAxisId="revenue" hide domain={["0", "dataMax"]} />
            {/* Right axis drives the units_sold scale, independent from revenue */}
            <YAxis
              yAxisId="units"
              orientation="right"
              hide

              domain={[0, (dataMax: number) => dataMax * 2]}
            />

            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" className="" />}
            />
            <Area
              yAxisId="revenue"
              dataKey="revenue"
              type="natural"
              fill="url(#fillRevenue)"
              stroke="var(--primary)"
              strokeWidth={2}
            />
            <Area
              yAxisId="units"
              dataKey="units_sold"
              type="natural"
              fill="url(#fillUnits)"
              stroke="var(--secondary)"
              strokeWidth={1}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
