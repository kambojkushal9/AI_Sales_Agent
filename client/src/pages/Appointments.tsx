import React, { useEffect, useState } from 'react';
import { Calendar as CalendarIcon, Clock, Plus, CheckCircle2, XCircle, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, Button, Badge, Input, Modal, EmptyState } from '../components/ui';
import { appointmentsAPI } from '../lib/api';
import { demoAppointments } from '../lib/demoData';
import { Appointment } from '../types';
import { formatDate } from '../lib/utils';

const TIME_SLOTS = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'];

export const Appointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>(demoAppointments);
  const [selectedDate, setSelectedDate] = useState(() => new Date(Date.now() + 86400000).toISOString().split('T')[0]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    startTime: '10:00',
    duration: 30,
    meetingType: 'demo',
    notes: '',
  });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await appointmentsAPI.getAll();
        if (res.data?.appointments) setAppointments(res.data.appointments);
      } catch {
        // fallback to demo
      }
    };
    load();
  }, []);

  const bookedForDay = appointments
    .filter((a) => String(a.date).startsWith(selectedDate) && a.status !== 'cancelled')
    .map((a) => a.startTime);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerName) return toast.error('Customer name is required');
    try {
      const res = await appointmentsAPI.create(form);
      if (res.data?.appointment) {
        setAppointments((prev) => [res.data.appointment, ...prev]);
      }
      toast.success('Appointment booked!');
      setModalOpen(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Could not book slot');
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      if (status === 'cancelled') {
        await appointmentsAPI.cancel(id);
      } else {
        await appointmentsAPI.update(id, { status });
      }
      setAppointments((prev) => prev.map((a) => (a._id === id ? { ...a, status: status as any } : a)));
      toast.success(`Appointment ${status}`);
    } catch {
      toast.error('Failed to update appointment');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-space text-2xl font-bold tracking-tight">Appointments</h2>
          <p className="text-sm text-gray-400">Internal application calendar synced with AI agent bookings.</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="w-4 h-4" />
          New Appointment
        </Button>
      </div>

      {/* Day Slot Selector */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-secondary" />
            <h3 className="font-space font-semibold">Available Slots</h3>
          </div>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-bg-secondary border border-white/10 rounded-xl px-3 py-1.5 text-sm text-white focus:outline-none focus:border-secondary/60"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
          {TIME_SLOTS.map((slot) => {
            const isBooked = bookedForDay.includes(slot);
            return (
              <button
                key={slot}
                disabled={isBooked}
                onClick={() => {
                  setForm({ ...form, date: selectedDate, startTime: slot });
                  setModalOpen(true);
                }}
                className={`p-3 rounded-xl text-sm font-medium border transition-all ${
                  isBooked
                    ? 'bg-primary/15 border-primary/35 text-purple-300 cursor-not-allowed opacity-75'
                    : 'bg-white/[0.025] border-white/10 text-gray-200 hover:border-secondary/60 hover:bg-secondary/10'
                }`}
              >
                <span className="tabular-nums">{slot}</span>
                <span className="block text-[10px] mt-0.5 opacity-75">
                  {isBooked ? 'Booked' : 'Available'}
                </span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Upcoming Appointments */}
      {appointments.length === 0 ? (
        <EmptyState
          icon={CalendarIcon}
          title="No appointments scheduled"
          description="Select an available time slot above or click New Appointment to schedule a demo."
          action={<Button onClick={() => setModalOpen(true)}>Schedule Demo</Button>}
        />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {appointments.map((apt) => (
            <Card key={apt._id} hover className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-space font-semibold text-base">{apt.title}</h3>
                    {apt.createdByAgent && (
                      <Badge variant="secondary">
                        <Sparkles className="w-3 h-3" /> AI Booked
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-400 mt-0.5">{apt.customerName} • {apt.customerEmail || apt.customerPhone}</p>
                </div>
                <Badge
                  variant={
                    apt.status === 'confirmed'
                      ? 'success'
                      : apt.status === 'cancelled'
                      ? 'error'
                      : 'warning'
                  }
                >
                  {apt.status}
                </Badge>
              </div>

              <div className="flex items-center gap-4 text-xs text-gray-300">
                <span className="flex items-center gap-1.5">
                  <CalendarIcon className="w-3.5 h-3.5 text-primary" /> {formatDate(apt.date)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-secondary" /> {apt.startTime} - {apt.endTime} ({apt.duration}m)
                </span>
              </div>

              {apt.status !== 'cancelled' && (
                <div className="flex gap-2 pt-2 border-t border-white/[0.08]">
                  {apt.status !== 'confirmed' && (
                    <Button size="sm" variant="secondary" onClick={() => handleStatusChange(apt._id, 'confirmed')}>
                      <CheckCircle2 className="w-3.5 h-3.5 text-success" /> Confirm
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => handleStatusChange(apt._id, 'cancelled')}>
                    <XCircle className="w-3.5 h-3.5 text-error" /> Cancel
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* New Appointment Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Schedule Appointment">
        <form onSubmit={handleBook} className="space-y-4">
          <Input
            label="Customer Name *"
            value={form.customerName}
            onChange={(e) => setForm({ ...form, customerName: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Email"
              type="email"
              value={form.customerEmail}
              onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
            />
            <Input
              label="Phone"
              value={form.customerPhone}
              onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Date"
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Time Slot</label>
              <select
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                className="w-full bg-bg-secondary border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white"
              >
                {TIME_SLOTS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Meeting Type</label>
              <select
                value={form.meetingType}
                onChange={(e) => setForm({ ...form, meetingType: e.target.value })}
                className="w-full bg-bg-secondary border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white"
              >
                <option value="demo">Product Demo</option>
                <option value="consultation">Consultation</option>
                <option value="followup">Follow-up</option>
                <option value="closing">Closing</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Duration</label>
              <select
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })}
                className="w-full bg-bg-secondary border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white"
              >
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>60 minutes</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Book Slot</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
