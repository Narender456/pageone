"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { Activity, Calendar, Clock, MapPin, Monitor, RefreshCw, AlertCircle } from "lucide-react"
import { usersAPI } from "../../lib/users-api"
import { useApi } from "../../hooks/use-api"

export function UserActivityDialog({ open, onOpenChange, user }) {
  // Guard clause to prevent errors when user is null/undefined
  if (!user) {
    return null
  }

  const userId = user.id || user._id
  
  // API call to get user activity
  const {
    data: activityData,
    loading: activityLoading,
    error: activityError,
    refetch: refetchActivity,
  } = useApi(() => {
    if (!userId || !open) return Promise.resolve(null)
    return usersAPI.getUserActivity(userId)
  }, [userId, open])

  // Parse activity data with fallbacks
  const activity = activityData?.data || activityData || {
    loginHistory: [],
    actions: [],
    sessions: [],
    summary: {
      totalLogins: 0,
      lastLogin: null,
      totalActions: 0,
      activeSessions: 0
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    try {
      return new Date(dateString).toLocaleString()
    } catch (error) {
      return "Invalid Date"
    }
  }

  const formatDuration = (minutes) => {
    if (!minutes || minutes < 1) return "< 1 min"
    if (minutes < 60) return `${Math.round(minutes)} min`
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = Math.round(minutes % 60)
    return `${hours}h ${remainingMinutes}m`
  }

  const getActionIcon = (actionType) => {
    switch (actionType?.toLowerCase()) {
      case 'login':
        return <Monitor className="h-4 w-4" />
      case 'logout':
        return <Clock className="h-4 w-4" />
      case 'update':
        return <Activity className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const getActionColor = (actionType) => {
    switch (actionType?.toLowerCase()) {
      case 'login':
        return "bg-green-100 text-green-800"
      case 'logout':
        return "bg-blue-100 text-blue-800"
      case 'update':
        return "bg-yellow-100 text-yellow-800"
      case 'delete':
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleRefresh = () => {
    if (userId) {
      refetchActivity()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            User Activity - {user.name || "Unknown User"}
          </DialogTitle>
          <DialogDescription>
            View login history, actions, and session information for {user.email || "this user"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Actions */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Last Login: {formatDate(user.lastLogin)}
              </Badge>
              {user.isEmailVerified && (
                <Badge variant="secondary">Verified</Badge>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={activityLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${activityLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* Activity Summary Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Logins</CardTitle>
                <Monitor className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {activityLoading ? "..." : activity.summary?.totalLogins || 0}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Actions</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {activityLoading ? "..." : activity.summary?.totalActions || 0}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {activityLoading ? "..." : activity.summary?.activeSessions || 0}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Account Status</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <Badge className={user.hasAccess ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                  {user.hasAccess ? "Active" : "Suspended"}
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* Activity Content */}
          {activityError ? (
            <Card>
              <CardContent className="flex items-center justify-center h-32">
                <div className="text-center">
                  <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
                  <p className="text-destructive">Error loading activity: {activityError}</p>
                  <Button variant="outline" size="sm" onClick={handleRefresh} className="mt-2">
                    Try Again
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : activityLoading ? (
            <Card>
              <CardContent className="flex items-center justify-center h-32">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              </CardContent>
            </Card>
          ) : (
            <Tabs defaultValue="history" className="space-y-4">
              <TabsList>
                <TabsTrigger value="history">Login History</TabsTrigger>
                <TabsTrigger value="actions">Recent Actions</TabsTrigger>
                <TabsTrigger value="sessions">Active Sessions</TabsTrigger>
              </TabsList>

              <TabsContent value="history" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Recent Login History</CardTitle>
                    <CardDescription>Last 20 login attempts</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {!activity.loginHistory || activity.loginHistory.length === 0 ? (
                      <div className="text-center py-8">
                        <Monitor className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No login history found</p>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date & Time</TableHead>
                            <TableHead>IP Address</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Device</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {activity.loginHistory.map((login, index) => (
                            <TableRow key={login.id || index}>
                              <TableCell>{formatDate(login.timestamp || login.createdAt)}</TableCell>
                              <TableCell className="font-mono text-sm">{login.ipAddress || "N/A"}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {login.location || "Unknown"}
                                </div>
                              </TableCell>
                              <TableCell>{login.userAgent || login.device || "Unknown"}</TableCell>
                              <TableCell>
                                <Badge className={login.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                                  {login.success ? "Success" : "Failed"}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="actions" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Recent Actions</CardTitle>
                    <CardDescription>User activities and changes</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {!activity.actions || activity.actions.length === 0 ? (
                      <div className="text-center py-8">
                        <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No recent actions found</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {activity.actions.map((action, index) => (
                          <div key={action.id || index} className="flex items-start gap-3 p-3 border rounded-lg">
                            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted">
                              {getActionIcon(action.type)}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <div className="font-medium">{action.description || action.action || "Unknown Action"}</div>
                                <Badge variant="secondary" className={getActionColor(action.type)}>
                                  {action.type || "unknown"}
                                </Badge>
                              </div>
                              <div className="text-sm text-muted-foreground mt-1">
                                {formatDate(action.timestamp || action.createdAt)}
                              </div>
                              {action.details && (
                                <div className="text-sm text-muted-foreground mt-1">
                                  {action.details}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="sessions" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Active Sessions</CardTitle>
                    <CardDescription>Current login sessions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {!activity.sessions || activity.sessions.length === 0 ? (
                      <div className="text-center py-8">
                        <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No active sessions found</p>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Started</TableHead>
                            <TableHead>IP Address</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Duration</TableHead>
                            <TableHead>Device</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {activity.sessions.map((session, index) => (
                            <TableRow key={session.id || index}>
                              <TableCell>{formatDate(session.startTime || session.createdAt)}</TableCell>
                              <TableCell className="font-mono text-sm">{session.ipAddress || "N/A"}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {session.location || "Unknown"}
                                </div>
                              </TableCell>
                              <TableCell>{formatDuration(session.duration)}</TableCell>
                              <TableCell>{session.userAgent || session.device || "Unknown"}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}