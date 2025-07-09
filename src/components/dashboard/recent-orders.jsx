import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "../ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "../ui/table"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { Eye } from "lucide-react"

const orders = [
  {
    id: "ORD-001",
    customer: "John Doe",
    email: "john@example.com",
    status: "completed",
    amount: "$299.00",
    date: "2024-01-15"
  },
  {
    id: "ORD-002",
    customer: "Sarah Wilson",
    email: "sarah@example.com",
    status: "pending",
    amount: "$149.00",
    date: "2024-01-14"
  },
  {
    id: "ORD-003",
    customer: "Mike Johnson",
    email: "mike@example.com",
    status: "processing",
    amount: "$399.00",
    date: "2024-01-14"
  },
  {
    id: "ORD-004",
    customer: "Emma Davis",
    email: "emma@example.com",
    status: "completed",
    amount: "$199.00",
    date: "2024-01-13"
  },
  {
    id: "ORD-005",
    customer: "Alex Brown",
    email: "alex@example.com",
    status: "cancelled",
    amount: "$99.00",
    date: "2024-01-13"
  }
]

const getStatusColor = status => {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-800 hover:bg-green-100"
    case "pending":
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
    case "processing":
      return "bg-blue-100 text-blue-800 hover:bg-blue-100"
    case "cancelled":
      return "bg-red-100 text-red-800 hover:bg-red-100"
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-100"
  }
}

export function RecentOrders() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Orders</CardTitle>
        <CardDescription>Latest orders from your customers</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map(order => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.id}</TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{order.customer}</div>
                    <div className="text-sm text-muted-foreground">
                      {order.email}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={getStatusColor(order.status)}
                  >
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">{order.amount}</TableCell>
                <TableCell>{order.date}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
