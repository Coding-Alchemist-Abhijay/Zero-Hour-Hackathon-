import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function IssueDetailPage({ params }) {
  const session = await getServerSession(authOptions);
  const { issueId } = params;

  if (!session) {
    redirect("/login");
  }

  // Fetch issue details
  const issue = await prisma.issue.findUnique({
    where: {
      id: issueId,
      createdBy: session.user.id,
    },
    include: {
      timeline: {
        orderBy: {
          createdAt: "desc",
        },
      },
      comments: {
        orderBy: {
          createdAt: "asc",
        },
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });

  if (!issue) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Issue Not Found</h2>
          <p className="text-gray-600 mb-6">The issue you're looking for doesn't exist or you don't have permission to view it.</p>
          <a
            href="/dashboard"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Back to Dashboard
          </a>
        </div>
      </div>
    );
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Issue Details</h1>
              <p className="text-sm text-gray-600">Issue #{issue.id}</p>
            </div>
            <div className="flex gap-2">
              <a
                href={`/dashboard/issues/edit/${issue.id}`}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Edit Issue
              </a>
              <a
                href="/dashboard"
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Back to Dashboard
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Issue Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Issue Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">{issue.title}</h2>
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      issue.status === 'Resolved' 
                        ? 'bg-green-100 text-green-800' 
                        : issue.status === 'In Progress'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {issue.status}
                    </span>
                    <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                      {issue.category}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      issue.severity === 'Critical'
                        ? 'bg-red-100 text-red-800'
                        : issue.severity === 'High'
                        ? 'bg-orange-100 text-orange-800'
                        : issue.severity === 'Medium'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {issue.severity}
                    </span>
                  </div>
                  <p className="text-gray-600">{issue.description}</p>
                </div>
              </div>

              {/* Location Info */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Location</h3>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Latitude:</span> {issue.location.coordinates[1]}
                  </div>
                  <div>
                    <span className="font-medium">Longitude:</span> {issue.location.coordinates[0]}
                  </div>
                  {issue.address && (
                    <div className="col-span-2">
                      <span className="font-medium">Address:</span> {issue.address}
                    </div>
                  )}
                  {issue.city && (
                    <div className="col-span-2">
                      <span className="font-medium">City:</span> {issue.city}
                    </div>
                  )}
                </div>
              </div>

              {/* Images */}
              {issue.images && issue.images.length > 0 && (
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Images</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {issue.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Issue image ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border border-gray-200"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Comments Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Comments</h3>
              {issue.comments.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No comments yet. Be the first to comment!</p>
              ) : (
                <div className="space-y-4">
                  {issue.comments.map((comment) => (
                    <div key={comment.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{comment.user.name}</span>
                          <span className="text-xs text-gray-500">•</span>
                          <span className="text-xs text-gray-500">{formatDate(comment.createdAt)}</span>
                        </div>
                      </div>
                      <p className="text-gray-700">{comment.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Issue Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Issue Information</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span className="font-medium">Issue ID:</span>
                  <span>{issue.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Reported:</span>
                  <span>{formatDate(issue.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Updated:</span>
                  <span>{formatDate(issue.updatedAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Priority Score:</span>
                  <span>{issue.priorityScore}</span>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Timeline</h3>
              <div className="space-y-3">
                {issue.timeline.map((timeline, index) => (
                  <div key={timeline.id} className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">{timeline.status}</span>
                        <span className="text-xs text-gray-500">{formatDate(timeline.createdAt)}</span>
                      </div>
                      <p className="text-xs text-gray-600">Updated by system</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <a
                  href={`/dashboard/issues/edit/${issue.id}`}
                  className="block w-full text-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Edit Issue
                </a>
                <button
                  onClick={() => {
                    // In a real app, you might want to add a confirmation dialog
                    // For now, just show a message
                    alert("This would delete the issue. In a real app, this would require confirmation and backend integration.");
                  }}
                  className="w-full text-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100"
                >
                  Delete Issue
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}