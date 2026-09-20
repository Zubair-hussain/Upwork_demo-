import { notFound } from "next/navigation";
import { JobDetailClient } from "@/components/JobDetailClient";
import { getJobById, jobs } from "@/lib/jobs";

export function generateStaticParams() {
  return jobs.map((job) => ({ id: job.id }));
}

export default async function ClientJobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = getJobById(id);

  if (!job) {
    notFound();
  }

  return <JobDetailClient job={job} mode="client" />;
}
