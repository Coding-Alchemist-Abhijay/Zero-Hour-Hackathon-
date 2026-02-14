"use client"; // Needed for useState

import { useState } from "react";

export default function EditIssueForm({ issue, session }) {
  if (!issue) return null; // Safety guard

  const [formData, setFormData] = useState({
    title: issue.title,
    description: issue.description,
    category: issue.category,
    severity: issue.severity,
    address: issue.address || "",
    city: issue.city || "",
    location: {
      lat: issue.location?.coordinates?.[1] ?? 0,
      lng: issue.location?.coordinates?.[0] ?? 0,
    },
    images: issue.images || [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch(`/api/issues/${issue.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.token ?? ""}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update issue");

      setSuccess(true);
      setTimeout(() => {
        window.location.href = `/dashboard/issues/${issue.id}`;
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLocationSelect = () => {
    // Mock location (replace with real map integration if needed)
    setFormData({
      ...formData,
      location: {
        lat: 28.6139 + Math.random() * 0.01,
        lng: 77.2090 + Math.random() * 0.01,
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <p className="text-green-700 font-medium">Issue Updated Successfully!</p>
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 grid gap-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
              required
              minLength={5}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border rounded-md"
              required
              minLength={20}
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Category *</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
              required
            >
              <option value="Road">Road</option>
              <option value="Garbage">Garbage</option>
              <option value="Water">Water</option>
              <option value="Electricity">Electricity</option>
            </select>
          </div>

          {/* Severity */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Severity *</label>
            <select
              value={formData.severity}
              onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
              required
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          {/* City */}
          <div>
            <label className="block text-sm font-medium text-gray-700">City</label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
            <div className="flex gap-2">
              <input
                type="number"
                step="0.000001"
                value={formData.location.lat}
                onChange={(e) =>
                  setFormData({ ...formData, location: { ...formData.location, lat: parseFloat(e.target.value) } })
                }
                placeholder="Latitude"
                className="flex-1 px-3 py-2 border rounded-md"
                required
              />
              <input
                type="number"
                step="0.000001"
                value={formData.location.lng}
                onChange={(e) =>
                  setFormData({ ...formData, location: { ...formData.location, lng: parseFloat(e.target.value) } })
                }
                placeholder="Longitude"
                className="flex-1 px-3 py-2 border rounded-md"
                required
              />
              <button
                type="button"
                onClick={handleLocationSelect}
                className="px-4 py-2 bg-blue-600 text-white rounded-md"
              >
                Use Current Location
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-blue-600 text-white rounded-md disabled:opacity-50"
          >
            {isSubmitting ? "Updating..." : "Update Issue"}
          </button>
        </form>
      </main>
    </div>
  );
}
