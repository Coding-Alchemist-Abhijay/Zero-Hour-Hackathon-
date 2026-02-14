import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import EditIssueForm from "./EditIssueForm";

export default async function EditIssuePage({ params }) {
  const session = await getServerSession(authOptions);
  const { issueId } = params;

  if (!session) {
    redirect("/login");
  }

  // Fetch issue details with proper access check
  const issue = await prisma.issue.findUnique({
    where: { id: issueId },
    include: {
      timelines: true,
      comments: true,
    },
  });

  // Only allow editing if the user is the creator or admin
  if (!issue || (issue.createdById !== session.user.id && session.user.role !== "ADMIN")) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Issue Not Found / Unauthorized</h2>
          <p className="text-gray-600 mb-6">
            The issue doesn't exist or you don't have permission to edit it.
          </p>
          <a
            href="/dashboard"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            Back to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return <EditIssueForm issue={issue} session={session} />;
}
