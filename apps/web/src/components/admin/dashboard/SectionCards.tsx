import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type SectionCardsProps = {
  totalRevenueThisMonths: number;
  revenuePercentageIncrease: number;
  totalOrderThisMonths: number;
  orderPercentageIncrease: number;
  activeProductsNumber: number;
  newCustomer: number;
  customerPercentageIncrease: number;
};



export default function SectionCards({
  totalRevenueThisMonths,
  revenuePercentageIncrease,
  totalOrderThisMonths,
  orderPercentageIncrease,
  activeProductsNumber,
  newCustomer,
  customerPercentageIncrease
}: SectionCardsProps) {


  const symbolDecoration = (num: number) : string=>{
    return `${num < 0 ? "-" : "+"}${num}%`;
  }


  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      <Card className="@container/card">
  <CardHeader>
    <CardDescription>Total Revenue This Month</CardDescription>
    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
      ${totalRevenueThisMonths}
    </CardTitle>
    <CardAction>
      <Badge variant="outline">
        {revenuePercentageIncrease > 0 ? <IconTrendingUp /> : <IconTrendingDown />}
        {symbolDecoration(revenuePercentageIncrease)}
      </Badge>
    </CardAction>
  </CardHeader>
</Card>

<Card className="@container/card">
  <CardHeader>
    <CardDescription>Total Order This Month</CardDescription>
    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
      {totalOrderThisMonths}
    </CardTitle>
    <CardAction>
      <Badge variant="outline">
        {orderPercentageIncrease > 0 ? <IconTrendingUp /> : <IconTrendingDown />}
        {symbolDecoration(orderPercentageIncrease)}
      </Badge>
    </CardAction>
  </CardHeader>
</Card>

<Card className="@container/card">
  <CardHeader>
    <CardDescription>Active Product</CardDescription>
    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
      {activeProductsNumber}
    </CardTitle>
  </CardHeader>
</Card>

<Card className="@container/card">
  <CardHeader>
    <CardDescription>New Customer This Month</CardDescription>
    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
      {newCustomer}
    </CardTitle>
    <CardAction>
      <Badge variant="outline">
        {customerPercentageIncrease > 0 ? <IconTrendingUp /> : <IconTrendingDown />}
        {symbolDecoration(customerPercentageIncrease)}
      </Badge>
    </CardAction>
  </CardHeader>
</Card>
    </div>
  );
}
