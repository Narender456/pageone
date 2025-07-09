import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

const activities = [
  {
    user: "John Doe",
    email: "john@example.com",
    action: "Made a purchase",
    amount: "$299.00",
    time: "2 minutes ago",
    avatar: "/placeholder.svg?height=32&width=32",
    initials: "JD",
  },
  {
    user: "Sarah Wilson",
    email: "sarah@example.com",
    action: "Created account",
    amount: "",
    time: "5 minutes ago",
    avatar: "/placeholder.svg?height=32&width=32",
    initials: "SW",
  },
  {
    user: "Mike Johnson",
    email: "mike@example.com",
    action: "Updated profile",
    amount: "",
    time: "10 minutes ago",
    avatar: "/placeholder.svg?height=32&width=32",
    initials: "MJ",
  },
  {
    user: "Emma Davis",
    email: "emma@example.com",
    action: "Made a purchase",
    amount: "$149.00",
    time: "15 minutes ago",
    avatar: "/placeholder.svg?height=32&width=32",
    initials: "ED",
  },
  {
    user: "Alex Brown",
    email: "alex@example.com",
    action: "Left a review",
    amount: "",
    time: "20 minutes ago",
    avatar: "/placeholder.svg?height=32&width=32",
    initials: "AB",
  },
];

export function RecentActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>
          Latest user activities and transactions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div key={index} className="flex items-center space-x-4">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={activity.avatar || "/placeholder.svg"}
                  alt={activity.user}
                />
                <AvatarFallback>{activity.initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">
                  {activity.user}
                </p>
                <p className="text-sm text-muted-foreground">
                  {activity.action}
                </p>
              </div>
              <div className="text-right">
                {activity.amount && (
                  <p className="text-sm font-medium">{activity.amount}</p>
                )}
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
