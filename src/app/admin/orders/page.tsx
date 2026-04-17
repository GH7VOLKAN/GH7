import { getAllServiceOrders, getOrderStats } from "@/lib/dal/admin-orders";
import { OrdersContent } from "./orders-content";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ status?: string }>;
}

export default async function AdminOrdersPage({ searchParams }: Props) {
  const params = await searchParams;
  const filter = params.status ?? "all";

  const [orders, stats] = await Promise.all([
    getAllServiceOrders(filter),
    getOrderStats(),
  ]);

  return <OrdersContent orders={orders} stats={stats} currentFilter={filter} />;
}
