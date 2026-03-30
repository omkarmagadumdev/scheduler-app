'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useParams } from 'next/navigation';
import { isSupabaseConfigured, supabase } from '../../../lib/supabase';

interface AvailabilitySlot {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
}

interface BookingFormData {
  name: string;
  email: string;
}

export default function BookingPage() {
  const params = useParams();
  const username = params.username as string;

  // State for fetching availability
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [slotsError, setSlotsError] = useState('');
  const [bookedTimes, setBookedTimes] = useState<Set<string>>(new Set());

  // State for booking
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
  const [bookingForm, setBookingForm] = useState<BookingFormData>({
    name: '',
    email: '',
  });
  const [savingBooking, setSavingBooking] = useState(false);
  const [bookingMessage, setBookingMessage] = useState('');
  const [bookingError, setBookingError] = useState('');

  // Fetch availability slots
  useEffect(() => {
    const fetchAvailability = async () => {
      if (!isSupabaseConfigured) {
        setSlotsError('Supabase environment variables are not configured.');
        setLoadingSlots(false);
        return;
      }

      try {
        setLoadingSlots(true);
        setSlotsError('');

        // Fetch availability slots
        const { data: availabilityData, error: availabilityError } =
          await supabase.from('availability').select('*');

        if (availabilityError) {
          setSlotsError('Failed to load availability slots.');
          console.error('Error fetching availability:', availabilityError);
          return;
        }

        setSlots(availabilityData || []);

        // Fetch already booked times to prevent duplicates
        const { data: bookingsData, error: bookingsError } = await supabase
          .from('bookings')
          .select('date, time');

        if (!bookingsError && bookingsData) {
          const bookedSet = new Set(bookingsData.map((b) => `${b.date}-${b.time}`));
          setBookedTimes(bookedSet);
        }
      } catch (err) {
        setSlotsError('An error occurred while fetching availability.');
        console.error('Error:', err);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchAvailability();
  }, []);

  const handleSlotClick = (slot: AvailabilitySlot) => {
    const slotKey = `${slot.date}-${slot.start_time}`;
    if (!bookedTimes.has(slotKey)) {
      setSelectedSlot(slot);
      setBookingMessage('');
      setBookingError('');
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBookingForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBookingSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedSlot) return;

    if (!isSupabaseConfigured) {
      setBookingError('Supabase environment variables are not configured.');
      return;
    }

    setSavingBooking(true);
    setBookingError('');
    setBookingMessage('');

    try {
      // Save booking to database
      const { data, error } = await supabase.from('bookings').insert([
        {
          name: bookingForm.name,
          email: bookingForm.email,
          date: selectedSlot.date,
          time: selectedSlot.start_time,
        },
      ]);

      console.log({ data, error });

      if (error) {
        setBookingError('Failed to complete booking. Please try again.');
      } else {
        setBookingMessage('Booking confirmed! Check your email for details.');
        // Add the booked slot to the set
        const slotKey = `${selectedSlot.date}-${selectedSlot.start_time}`;
        setBookedTimes((prev) => new Set([...prev, slotKey]));
        // Reset form
        setSelectedSlot(null);
        setBookingForm({
          name: '',
          email: '',
        });
      }
    } catch (err) {
      setBookingError('An unexpected error occurred. Please try again.');
      console.error('Error:', err);
    } finally {
      setSavingBooking(false);
    }
  };

  const isSlotBooked = (slot: AvailabilitySlot) => {
    const slotKey = `${slot.date}-${slot.start_time}`;
    return bookedTimes.has(slotKey);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Book with {username}
          </h1>
          <p className="text-gray-600">
            Select an available time slot to schedule your meeting
          </p>
        </div>

        {/* Loading State */}
        {loadingSlots && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Error State */}
        {slotsError && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-800 rounded-lg">
            {slotsError}
          </div>
        )}

        {/* Slots View */}
        {!loadingSlots && !selectedSlot && slots.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Available Slots
            </h2>
            {slots.map((slot) => {
              const isBooked = isSlotBooked(slot);
              return (
                <button
                  key={slot.id}
                  onClick={() => handleSlotClick(slot)}
                  disabled={isBooked}
                  className={`w-full p-4 rounded-lg border-2 transition duration-200 text-left ${
                    isBooked
                      ? 'border-gray-300 bg-gray-100 cursor-not-allowed opacity-60'
                      : 'border-blue-300 bg-white hover:border-blue-500 hover:shadow-lg cursor-pointer'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {formatDate(slot.date)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {slot.start_time} - {slot.end_time}
                      </p>
                    </div>
                    <div className="text-right">
                      {isBooked ? (
                        <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded">
                          Booked
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">
                          Available
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* No Slots */}
        {!loadingSlots && slots.length === 0 && !selectedSlot && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">
              No available slots at the moment. Please check back later.
            </p>
          </div>
        )}

        {/* Booking Form View */}
        {selectedSlot && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Confirm Your Booking
            </h2>

            {/* Selected Slot Info */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Selected Time:</p>
              <p className="font-semibold text-gray-900">
                {formatDate(selectedSlot.date)}
              </p>
              <p className="text-gray-700">
                {selectedSlot.start_time} - {selectedSlot.end_time}
              </p>
            </div>

            {/* Booking Form */}
            <form onSubmit={handleBookingSubmit} className="space-y-4">
              {/* Name Input */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={bookingForm.name}
                  onChange={handleFormChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="John Doe"
                />
              </div>

              {/* Email Input */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={bookingForm.email}
                  onChange={handleFormChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="john@example.com"
                />
              </div>

              {/* Error Message */}
              {bookingError && (
                <div className="p-3 bg-red-100 border border-red-400 text-red-800 rounded-lg text-sm">
                  {bookingError}
                </div>
              )}

              {/* Success Message */}
              {bookingMessage && (
                <div className="p-3 bg-green-100 border border-green-400 text-green-800 rounded-lg text-sm">
                  {bookingMessage}
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSlot(null);
                    setBookingForm({ name: '', email: '' });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={savingBooking}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition cursor-pointer"
                >
                  {savingBooking ? 'Booking...' : 'Confirm Booking'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
