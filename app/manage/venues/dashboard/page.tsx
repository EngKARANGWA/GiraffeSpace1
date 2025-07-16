"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Calendar,
  MapPin,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Wallet,
  Building,
  Check,
  X,
} from "lucide-react"
import ApiService from "@/api/apiConfig"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"

const ITEMS_PER_PAGE = 5

export default function AdminOverview() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [events, setEvents] = useState<any[]>([])
  const [venues, setVenues] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Pagination state
  const [eventPage, setEventPage] = useState(1)
  const [venuePage, setVenuePage] = useState(1)

  useEffect(() => {
    setLoading(true)
    setError(null)
    Promise.all([
      ApiService.getAllEvents(),
      ApiService.getAllVenues(),
    ])
      .then(([eventsRes, venuesRes]) => {
        setEvents(Array.isArray(eventsRes) ? eventsRes : (eventsRes.data || []))
        setVenues(Array.isArray(venuesRes) ? venuesRes : (venuesRes.data || []))
      })
      .catch((err) => {
        setError("Failed to load data.")
      })
      .finally(() => setLoading(false))
  }, [])

  // Filter for pending status
  const pendingEvents = events.filter((event) => (event.status?.toUpperCase?.() === "PENDING" || event.status?.toUpperCase?.() === "DRAFT"))
  const pendingVenues = venues.filter((venue) => venue.status?.toUpperCase?.() === "PENDING")

  // Pagination logic
  const totalEventPages = Math.max(1, Math.ceil(pendingEvents.length / ITEMS_PER_PAGE))
  const totalVenuePages = Math.max(1, Math.ceil(pendingVenues.length / ITEMS_PER_PAGE))
  const paginatedEvents = pendingEvents.slice((eventPage - 1) * ITEMS_PER_PAGE, eventPage * ITEMS_PER_PAGE)
  const paginatedVenues = pendingVenues.slice((venuePage - 1) * ITEMS_PER_PAGE, venuePage * ITEMS_PER_PAGE)

  // Approve/Reject handlers
  const handleApproveEvent = async (eventId: string) => {
    try {
      await ApiService.updateEventById(eventId, { status: "APPROVED" })
      setEvents((prev) => prev.map(e => e.eventId === eventId ? { ...e, status: "APPROVED" } : e))
      toast({ title: "Event Approved", description: "The event has been approved." })
    } catch {
      toast({ title: "Error", description: "Failed to approve event.", variant: "destructive" })
    }
  }
  const handleRejectEvent = async (eventId: string) => {
    try {
      await ApiService.updateEventById(eventId, { status: "REJECTED" })
      setEvents((prev) => prev.map(e => e.eventId === eventId ? { ...e, status: "REJECTED" } : e))
      toast({ title: "Event Rejected", description: "The event has been rejected." })
    } catch {
      toast({ title: "Error", description: "Failed to reject event.", variant: "destructive" })
    }
  }
  const handleApproveVenue = async (venueId: string) => {
    try {
      await ApiService.approveVenue(venueId)
      setVenues((prev) => prev.map(v => v.venueId === venueId ? { ...v, status: "APPROVED", isAvailable: true } : v))
      toast({ title: "Venue Approved", description: "The venue has been approved." })
    } catch {
      toast({ title: "Error", description: "Failed to approve venue.", variant: "destructive" })
    }
  }
  const handleRejectVenue = async (venueId: string) => {
    try {
      await ApiService.cancelVenue(venueId, { status: "REJECTED", isAvailable: false })
      setVenues((prev) => prev.map(v => v.venueId === venueId ? { ...v, status: "REJECTED", isAvailable: false } : v))
      toast({ title: "Venue Rejected", description: "The venue has been rejected." })
    } catch {
      toast({ title: "Error", description: "Failed to reject venue.", variant: "destructive" })
    }
  }

  // Statistics (optional, can be improved with real data)
  const stats = {
    totalEvents: events.length,
    totalVenues: venues.length,
    pendingApprovals: pendingEvents.length + pendingVenues.length,
    approvedEvents: events.filter((event) => event.status?.toUpperCase?.() === "APPROVED").length,
    approvedVenues: venues.filter((venue) => venue.status?.toUpperCase?.() === "APPROVED").length,
    totalPayments: 0, // Placeholder for total payments
  }

  // Sample data for booking requests table
  const bookingsData = [
    { id: 1, event: "Corporate Event", customer: "John Doe", customerEmail: "john@example.com", venue: "Venue A", date: "2024-07-15", time: "10:00 AM", status: "Pending" },
    { id: 2, event: "Wedding Ceremony", customer: "Jane Smith", customerEmail: "jane@example.com", venue: "Venue B", date: "2024-07-20", time: "02:00 PM", status: "Pending" },
    { id: 3, event: "Birthday Party", customer: "Acme Corp.", customerEmail: "info@acme.com", venue: "Venue A", date: "2024-07-25", time: "05:00 PM", status: "Approved" },
    { id: 4, event: "Conference", customer: "Tech Solutions", customerEmail: "contact@techsol.com", venue: "Venue B", date: "2024-07-30", time: "09:00 AM", status: "Rejected" },
  ];

  return (
    <div className="flex-1 p-8">
      <h2 className="text-2xl font-bold mb-4"> Venue Manager</h2>
      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Payments</p>
                <p className="text-2xl font-bold">{stats.totalPayments || 'Frw0'}</p>
              </div>
              <Wallet className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Venues</p>
                <p className="text-2xl font-bold">{stats.totalVenues}</p>
              </div>
              <MapPin className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Bookings</p>
                <p className="text-2xl font-bold">{stats.pendingApprovals}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Available Venues</p>
                <p className="text-2xl font-bold">{stats.approvedEvents}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold">{stats.approvedVenues}</p>
              </div>
              <Wallet className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main content grid */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Pending Payments Section (static data) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Wallet className="h-5 w-5 mr-2 text-orange-500" />
              Pending Payments
            </CardTitle>
            <CardDescription>Payments waiting for confirmation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { id: 1, payer: 'John Doe', amount: 'Frw 150,000', date: '2024-06-01' },
                { id: 2, payer: 'Jane Smith', amount: 'Frw 80,000', date: '2024-06-03' },
                { id: 3, payer: 'Acme Corp.', amount: 'Frw 200,000', date: '2024-06-05' },
              ].map(payment => (
                <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg bg-orange-50">
                  <div>
                    <p className="font-medium">{payment.payer}</p>
                    <p className="text-sm text-gray-600">{payment.date}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-lg font-bold text-orange-700">{payment.amount}</span>
                    <button
                      className="px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                      onClick={() => alert(`Approved payment for ${payment.payer}`)}
                      title="Approve"
                    >
                      Approve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        {/* Booking Requests Table (replaces Pending Event Approvals) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              Booking Requests
            </CardTitle>
            <CardDescription>Manage and approve booking requests for your venues</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Venue</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bookingsData.map((booking) => (
                    <tr key={booking.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{booking.event}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{booking.customer}</div>
                        <div className="text-xs text-gray-500">{booking.customerEmail}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{booking.venue}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{booking.date}</div>
                        <div className="text-xs text-gray-500">{booking.time}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${booking.status === "Approved" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>{booking.status}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {booking.status === "Pending" ? (
                          <div className="flex space-x-2">
                            <button className="text-green-600 hover:text-green-900">
                              <Check className="h-5 w-5" />
                            </button>
                            <button className="text-red-600 hover:text-red-900">
                              <X className="h-5 w-5" />
                            </button>
                          </div>
                        ) : (
                          <button className="text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-md">
                            View
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
        {/* Pending Venue Approvals Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building className="h-5 w-5 mr-2" />
              Pending Venue Approvals
            </CardTitle>
            <CardDescription>Venues waiting for approval</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {paginatedVenues.length > 0 ? (
                paginatedVenues.map((venue) => (
                  <div
                    key={venue.venueId}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{venue.venueName}</p>
                      <p className="text-sm text-gray-600">{venue.location || "-"}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No pending venue approvals</p>
              )}
            </div>
            {/* Pagination controls */}
            {totalVenuePages > 1 && (
              <div className="flex justify-end gap-2 mt-4">
                <Button size="sm" variant="outline" disabled={venuePage === 1} onClick={() => setVenuePage(venuePage - 1)}>Previous</Button>
                <span className="px-2 py-1 text-sm">Page {venuePage} of {totalVenuePages}</span>
                <Button size="sm" variant="outline" disabled={venuePage === totalVenuePages} onClick={() => setVenuePage(venuePage + 1)}>Next</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}