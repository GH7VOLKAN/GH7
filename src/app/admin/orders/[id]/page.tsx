import { getServiceOrderDetail } from "@/lib/dal/admin-orders";
import { OrderDetail } from "./order-detail";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminOrderDetailPage({ params }: Props) {
  const { id } = await params;
  const order = await getServiceOrderDetail(id);

  if (!order) notFound();

  return <OrderDetail order={order} />;
}
