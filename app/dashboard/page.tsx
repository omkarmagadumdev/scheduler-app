'use client';

import { useState, FormEvent, useEffect } from 'react';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';

interface ScheduleFormData {
  date: string;
  startTime: string;
  endTime: string;
}

interface Booking {
  id: string;
  name: string;
  email: string;
  date: string;
  time: string;
}

export default function Dashboard() {
  const [formData, setFormData] = useState<ScheduleFormData>({
    date: '',
    startTime: '',
    endTime: '',
  });
  const [username, setUsername] = useState('user1');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [bookingsError, setBookingsError] = useState('');

  useEffect(() => {
    const fetchBookings = async () => {
      if (!isSupabaseConfigured) {
        setBookingsError('Supabase environment variables are not configured.');
        setBookingsLoading(false);
        return;
      }

      setBookingsLoading(true);
      setBookingsError('');

      try {
        const { data, error } = await supabase
          .from('bookings')
          .select('id, name, email, date, time')
          .order('date', { ascending: true })
          .order('time', { ascending: true });

        if (error) {
          setBookingsError('Failed to load bookings.');
          return;
        }

        setBookings(data || []);
      } catch (err) {
        setBookingsError('An unexpected error occurred while loading bookings.');
        console.error(err);
      } finally {
        setBookingsLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isSupabaseConfigured) {
      setErrorMessage('Supabase environment variables are not configured.');
      return;
    }

    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    const normalizedUsername = username.trim() || 'user1';

    try {
      const { data, error } = await supabase.from('availability').insert([
        {
          user_id: normalizedUsername,
          date: formData.date,
          start_time: formData.startTime,
          end_time: formData.endTime,
        },
      ]);

      console.log({ data, error });

      if (error) {
        setErrorMessage('Failed to save availability. Please try again.');
      } else {
        setSuccessMessage('Availability saved!');
        // Reset form after successful submission
        setFormData({
          date: '',
          startTime: '',
          endTime: '',
        });
      }
    } catch (err) {
      setErrorMessage('An unexpected error occurred. Please try again.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const bookingLink = `http://localhost:3000/book/${encodeURIComponent(
    username.trim() || 'user1'
  )}`;

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(bookingLink);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        {/* Heading */}
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Dashboard
        </h1>

        <div className="mb-6">
          <p className="text-sm font-medium text-gray-700">Share this link to get bookings</p>

          <div className="flex items-center gap-2 mt-2">
            <input
              value={bookingLink}
              readOnly
              className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-800"
            />
            <button
              onClick={handleCopyLink}
              className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-3 py-2 transition duration-200 cursor-pointer"
            >
              Copy
            </button>
          </div>

          {copied && <p className="mt-2 text-xs text-green-600">Copied!</p>}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username Input */}
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-150"
            />
          </div>

          {/* Date Input */}
          <div>
            <label
              htmlFor="date"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Date
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-150"
            />
          </div>

          {/* Start Time Input */}
          <div>
            <label
              htmlFor="startTime"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Start Time
            </label>
            <input
              type="time"
              id="startTime"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-150"
            />
          </div>

          {/* End Time Input */}
          <div>
            <label
              htmlFor="endTime"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              End Time
            </label>
            <input
              type="time"
              id="endTime"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-150"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-2.5 px-4 rounded-lg shadow-md hover:shadow-lg transition duration-200 cursor-pointer"
          >
            {loading ? 'Saving...' : 'Submit'}
          </button>

          {/* Success Message */}
          {successMessage && (
            <p className="mt-4 p-3 bg-green-100 border border-green-300 text-green-700 rounded-lg text-sm text-center">
              {successMessage}
            </p>
          )}

          {/* Error Message */}
          {errorMessage && (
            <p className="mt-4 p-3 bg-red-100 border border-red-400 text-red-800 rounded-lg text-sm text-center">
              {errorMessage}
            </p>
          )}
        </form>

        {/* Form Status */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Availability saved successfully
        </p>

        <div className="mt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">All Bookings</h2>

          {bookingsLoading && (
            <p className="text-sm text-gray-500">Loading bookings...</p>
          )}

          {!bookingsLoading && bookingsError && (
            <p className="text-sm text-red-600">{bookingsError}</p>
          )}

          {!bookingsLoading && !bookingsError && bookings.length === 0 && (
            <p className="text-sm text-gray-500">No bookings yet</p>
          )}

          {!bookingsLoading && !bookingsError && bookings.length > 0 && (
            <ul className="space-y-2">
              {bookings.map((booking) => (
                <li
                  key={booking.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm text-sm text-gray-700"
                >
                  <p>
                    <span className="font-semibold">Name:</span> {booking.name}
                  </p>
                  <p>
                    <span className="font-semibold">Email:</span> {booking.email}
                  </p>
                  <p>
                    <span className="font-semibold">Date:</span> {booking.date}
                  </p>
                  <p>
                    <span className="font-semibold">Time:</span> {booking.time}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>
    </div>
  );
}
