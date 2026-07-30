import { SalesChart } from "@/components/admin/dashboard/SalesChart";
import SectionCards from "@/components/admin/dashboard/SectionCards";
import { useAdminFetchDashboardData } from "@/hooks/useOrder";
import Loading from "@/components/Loading";
import type { DashboardDataResponse } from "@ecom/shared/type/order";

function getDashboardMetrics(data: DashboardDataResponse | undefined) {
  const salesData = data?.salesData ?? [];
  const lastIndex = salesData.length - 1;

  const totalRevenueThisMonths = salesData[lastIndex]?.revenue ?? 0;
  const lastMonthRevenue = salesData[lastIndex - 1]?.revenue;

  let revenueGrowthPercentage: number;
  if (
    totalRevenueThisMonths === 0 &&
    (!lastMonthRevenue || lastMonthRevenue === 0)
  ) {
    revenueGrowthPercentage = 0;
  } else if (!lastMonthRevenue || lastMonthRevenue === 0) {
    revenueGrowthPercentage = 100;
  } else {
    revenueGrowthPercentage =
      ((totalRevenueThisMonths - lastMonthRevenue) / lastMonthRevenue) * 100;
  }

  return {
    salesData,
    totalRevenueThisMonths,
    revenueGrowthPercentage,
    totalOrderThisMonths: data?.orderGrowthStat?.count ?? 0,
    orderGrowthPercentage: data?.orderGrowthStat?.percentageIncrease ?? 0,
    activeProductsNumber: data?.activeProductCount ?? 0,
    newCustomerCount: data?.customerGrowthStat?.count ?? 0,
    customerGrowthPercentage: data?.customerGrowthStat?.percentageIncrease ?? 0,
    monthlySalesData: salesData,
  };
}

export default function AdminDashboard() {
  const now = new Date();
  const endYear = now.getFullYear();
  const endMonth = now.getMonth() + 1;
  const startYear = endYear - 1;
  const startMonth = endMonth + 1 === 13 ? 1 : endMonth;

  const data = useAdminFetchDashboardData({
    startYear,
    endYear,
    startMonth,
    endMonth,
  });

  if (data.isLoading) {
    return <Loading />;
  }

  if (!data.data) {
    return (
      <div className="flex justify-center items-center min-h-[30rem] text-lg">
        No data found. Please refresh.
      </div>
    );
  }

  const metrics = getDashboardMetrics(data.data);

  return (
    <div>
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <SectionCards
              totalRevenueThisMonths={metrics.totalRevenueThisMonths}
              revenuePercentageIncrease={metrics.revenueGrowthPercentage}
              totalOrderThisMonths={metrics.totalOrderThisMonths}
              orderPercentageIncrease={metrics.orderGrowthPercentage}
              activeProductsNumber={metrics.activeProductsNumber}
              newCustomer={metrics.newCustomerCount}
              customerPercentageIncrease={metrics.customerGrowthPercentage}
            />
            <div className="px-4 lg:px-6">
              <SalesChart salesData={metrics.salesData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
