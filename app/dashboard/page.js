import { redirect } from "next/navigation";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/db";

/**
 * Dashboard page using custom JWT authentication
 */
export default async function DashboardPage({ cookies }) {
  // Get JWT from cookies
  const token = cookies.get("token")?.value;
  if (!token) redirect("/login");

  let payload;
  try {
    payload = verifyToken(token); // verifyToken throws if invalid
  } catch {
    redirect("/login");
  }

  // Fetch user's issues
  const issues = await prisma.issue.findMany({
    where: { createdBy: payload.id },
    orderBy: { createdAt: "desc" },
    include: { timeline: { orderBy: { createdAt: "desc" }, take: 1 } },
  });

  const totalIssues = issues.length;
  const resolvedIssues = issues.filter(i => i.status === "Resolved").length;
  const impactScore = resolvedIssues * 10;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Citizen Dashboard</h1>
            <p className="text-sm text-gray-600">Welcome back, {payload.email}</p>
          </div>
          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
            Resident
          </span>
        </div>
      </header>

      {/* Stats Overview */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm font-medium text-gray-600">Total Issues</p>
            <p className="text-3xl font-bold text-gray-900">{totalIssues}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm font-medium text-gray-600">Resolved</p>
            <p className="text-3xl font-bold text-green-600">{resolvedIssues}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm font-medium text-gray-600">Impact Score</p>
            <p className="text-3xl font-bold text-purple-600">{impactScore}</p>
          </div>
        </div>

        {/* Issues List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Your Issues</h2>
            <a
              href="/dashboard/issues/new"
              className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700"
            >
              Report New Issue
            </a>
          </div>
          <div className="p-6">
            {issues.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="mt-2 text-sm font-medium text-gray-900">No issues reported</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by reporting your first issue.</p>
                <a
                  href="/dashboard/issues/new"
                  className="mt-6 inline-flex items-center px-4 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700"
                >
                  Report Issue
                </a>
              </div>
            ) : (
              <div className="space-y-4">
                {issues.map(issue => (
                  <div key={issue.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-medium text-gray-900">{issue.title}</h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            issue.status === 'Resolved'
                              ? 'bg-green-100 text-green-800'
                              : issue.status === 'In Progress'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>{issue.status}</span>
                        </div>
                        <p className="text-gray-600 mb-3">{issue.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>Reported: {new Date(issue.createdAt).toLocaleDateString()}</span>
                          {issue.timeline[0] && (
                            <span>Updated: {new Date(issue.timeline[0].createdAt).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <a href={`/dashboard/issues/${issue.id}`} className="px-3 py-1 text-sm font-medium rounded border border-gray-300 hover:bg-gray-50">
                          View Details
                        </a>
                        <a href={`/dashboard/issues/edit/${issue.id}`} className="px-3 py-1 text-sm font-medium rounded border border-gray-300 hover:bg-gray-50">
                          Edit
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
