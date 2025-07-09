import { StatsCards } from "./stats-cards";
import { RecentActivity } from "./recent-activity";
import { AnalyticsChart } from "./analytics-chart";
import { RecentOrders } from "./recent-orders";


export function DashboardContent() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="grid gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back! Here's what's happening with your business today.
            </p>
          </div>
        </div>

        <StatsCards />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <div className="col-span-4">
            <AnalyticsChart />
          </div>
          <div className="col-span-3">
            <RecentActivity />
          </div>
        </div>

        <RecentOrders />
      </div>
    </div>
  );
}
