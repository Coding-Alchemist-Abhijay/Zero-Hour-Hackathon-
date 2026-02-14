"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStoreImpl } from "@/store/authStore";

export default function NewIssuePage() {
  const router = useRouter();
  const accessToken = useAuthStoreImpl((s) => s.accessToken);

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Road",
    severity: "Low",
    address: "",
    city: "",
    lat: "",
    lng: "",
  });

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleImageUpload = async (file) => {
    if (!file.type.startsWith("image/")) return alert("Only images allowed");

    const data = new FormData();
    data.append("file", file);

    const res = await fetch("/api/upload", { method: "POST", body: data });
    const result = await res.json();

    if (result.success) setImages((prev) => [...prev, result.imageUrl]);
    else alert("Image upload failed");
  };

  const handleRemoveImage = (url) =>
    setImages(images.filter((img) => img !== url));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!accessToken) {
      setError("You must be logged in.");
      setLoading(false);
      return;
    }

    const payload = {
      title: form.title,
      description: form.description,
      category: form.category,
      severity: form.severity,
      location: { lat: Number(form.lat), lng: Number(form.lng) },
      address: form.address,
      city: form.city,
      images,
    };

    try {
      const res = await fetch("/api/issues", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) setError(data.message || "Submission failed");
      else {
        setSuccess("Issue submitted successfully!");
        router.push(`/issues/${data.data.issueId}`);
      }
    } catch {
      setError("Network error. Try again.");
    }

    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-6 font-sans">
      <div className="bg-white shadow-xl rounded-2xl p-10 border border-gray-100">
        {/* Header */}
        <h1 className="text-4xl font-extrabold mb-4 text-center text-gray-900 leading-tight">
          Report a Civic Issue
        </h1>
        <p className="text-center text-gray-600 mb-10 text-lg">
          Help improve your city by reporting civic issues quickly and easily.
        </p>

        <form onSubmit={handleSubmit} className="space-y-8 text-gray-900">
          {/* Title */}
          <div>
            <label className="block font-medium mb-2">Issue Title</label>
            <input
              name="title"
              placeholder="Enter a descriptive title"
              value={form.title}
              onChange={handleChange}
              className="w-full border border-gray-300 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block font-medium mb-2">Description</label>
            <textarea
              name="description"
              placeholder="Explain the issue in detail..."
              value={form.description}
              onChange={handleChange}
              rows={5}
              className="w-full border border-gray-300 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400"
              required
            />
          </div>

          {/* Category & Severity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-medium mb-2">Category</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full border border-gray-300 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              >
                <option value="Road">Road</option>
                <option value="Garbage">Garbage</option>
                <option value="Water">Water</option>
                <option value="Electricity">Electricity</option>
              </select>
            </div>
            <div>
              <label className="block font-medium mb-2">Severity</label>
              <select
                name="severity"
                value={form.severity}
                onChange={handleChange}
                className="w-full border border-gray-300 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
          </div>

          {/* Address & City */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input
              name="address"
              placeholder="Address (optional)"
              value={form.address}
              onChange={handleChange}
              className="border border-gray-300 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400"
            />
            <input
              name="city"
              placeholder="City (optional)"
              value={form.city}
              onChange={handleChange}
              className="border border-gray-300 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400"
            />
          </div>

          {/* Latitude & Longitude */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input
              name="lat"
              placeholder="Latitude"
              value={form.lat}
              onChange={handleChange}
              className="border border-gray-300 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400"
              required
            />
            <input
              name="lng"
              placeholder="Longitude"
              value={form.lng}
              onChange={handleChange}
              className="border border-gray-300 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400"
              required
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block font-medium mb-2">Upload Images</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(e.target.files[0])}
              className="mb-4"
            />
            <div className="flex flex-wrap gap-4">
              {images.map((img) => (
                <div
                  key={img}
                  className="relative group w-28 h-28 border rounded-lg overflow-hidden"
                >
                  <img
                    src={img}
                    alt="Uploaded"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(img)}
                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white font-semibold py-4 rounded-xl hover:from-blue-600 hover:to-blue-800 transition"
          >
            {loading ? "Submitting..." : "Submit Issue"}
          </button>

          {/* Messages */}
          {error && <p className="text-red-600 text-center">{error}</p>}
          {success && <p className="text-green-600 text-center">{success}</p>}
        </form>
      </div>
    </div>
  );
}
