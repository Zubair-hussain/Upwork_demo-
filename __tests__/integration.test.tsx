import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminClient } from "@/components/AdminClient";
import { JobDetailClient } from "@/components/JobDetailClient";
import { PlatformClient } from "@/components/PlatformClient";
import { jobs } from "@/lib/jobs";

describe("candidate integration flow", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it("saves candidate name and short description so admin can see it", async () => {
    const user = userEvent.setup();
    render(<PlatformClient />);

    await user.type(screen.getByLabelText(/what is your name/i), "Zubair Hussain");
    await user.type(screen.getByLabelText(/short description/i), "Full stack AI and n8n expert");
    await user.click(screen.getByRole("button", { name: /save profile/i }));

    expect(await screen.findByText(/profile saved/i)).toBeInTheDocument();

    render(<AdminClient />);

    expect(await screen.findByRole("heading", { name: "Zubair Hussain" })).toBeInTheDocument();
    expect(screen.getByText("Full stack AI and n8n expert")).toBeInTheDocument();
  });

  it("requires a bid amount before submitting a proposal", async () => {
    const user = userEvent.setup();
    render(<JobDetailClient job={jobs[0]} />);

    await user.type(screen.getByLabelText(/what is your name/i), "Candidate One");
    await user.type(screen.getByLabelText(/boosted connects bid/i), "0");
    await user.type(screen.getByLabelText(/cover letter/i), "I can deliver this safely with tests and clear updates.");
    await user.type(screen.getByLabelText(/your expert answer/i), "My answer explains architecture, risk, testing, and delivery.");
    await user.click(screen.getByRole("button", { name: /apply now/i }));

    expect(await screen.findByText(/please add your bid amount/i)).toBeInTheDocument();
  });

  it("stores a complete proposal record after required fields are filled", async () => {
    const user = userEvent.setup();
    render(<JobDetailClient job={jobs[1]} />);

    await user.type(screen.getByLabelText(/what is your name/i), "Candidate Two");
    fireEvent.change(screen.getByLabelText(/full amount/i), { target: { value: "950" } });
    fireEvent.change(screen.getByLabelText(/boosted connects bid/i), { target: { value: "0" } });
    fireEvent.change(screen.getByLabelText(/cover letter/i), {
      target: { value: "I have built similar automation workflows with retries and logging." }
    });
    fireEvent.change(screen.getByLabelText(/your expert answer/i), {
      target: { value: "My answer covers n8n error handling, idempotency, and CRM retries." }
    });
    await user.click(screen.getByRole("button", { name: /apply now/i }));

    await waitFor(() => {
      const applications = JSON.parse(window.localStorage.getItem("uet-applications") ?? "[]");
      expect(applications).toHaveLength(1);
      expect(applications[0]).toMatchObject({
        candidateName: "Candidate Two",
        bidAmount: 950,
        boostConnects: 0
      });
    });
  });
});
