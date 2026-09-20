import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminClient } from "@/components/AdminClient";
import { JobDetailClient } from "@/components/JobDetailClient";
import { PlatformClient } from "@/components/PlatformClient";
import { jobs } from "@/lib/jobs";

const profile = {
  name: "Zubair Hussain",
  description: "Full stack AI and n8n expert",
  savedAt: "2026-09-20T12:00:00.000Z"
};

function saveProfile() {
  window.localStorage.setItem("uet-candidate-profile", JSON.stringify(profile));
}

describe("candidate integration flow", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
    // Components call the applications API; stub fetch so tests run offline.
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ ok: true, json: async () => ({ candidates: [] }) }))
    );
  });

  it("saves candidate name and short description", async () => {
    const user = userEvent.setup();
    render(<PlatformClient />);

    await user.type(screen.getByLabelText(/what is your name/i), "Zubair Hussain");
    await user.type(screen.getByLabelText(/short description/i), "Full stack AI and n8n expert");
    await user.click(screen.getByRole("button", { name: /save profile/i }));

    expect(await screen.findByText(/profile saved/i)).toBeInTheDocument();
    const saved = JSON.parse(window.localStorage.getItem("uet-candidate-profile") ?? "null");
    expect(saved).toMatchObject({ name: "Zubair Hussain", description: "Full stack AI and n8n expert" });
  });

  it("blocks applying until name and title are saved", async () => {
    const user = userEvent.setup();
    render(<JobDetailClient job={jobs[0]} />);

    await user.click(screen.getByRole("button", { name: /apply now/i }));

    // The banner and the submit message both carry this text, so match all.
    expect(await screen.findAllByText(/please add your name and title/i)).not.toHaveLength(0);
  });

  it("requires a bid amount before submitting a proposal", async () => {
    saveProfile();
    const user = userEvent.setup();
    render(<JobDetailClient job={jobs[0]} />);

    // Pay "By project" so milestone details are not required for this check.
    await user.click(screen.getByRole("radio", { name: /by project/i }));
    await user.type(screen.getByLabelText(/cover letter/i), "I can deliver this safely with tests and clear updates.");
    await user.type(screen.getByLabelText(/your expert answer/i), "My answer explains architecture, risk, testing, and delivery.");
    await user.click(screen.getByRole("button", { name: /apply now/i }));

    expect(await screen.findByText(/please add your bid amount/i)).toBeInTheDocument();
  });

  it("requires milestone details when paid by milestone", async () => {
    saveProfile();
    const user = userEvent.setup();
    render(<JobDetailClient job={jobs[0]} />);

    // "By milestone" is the default selection.
    fireEvent.change(screen.getByLabelText(/full amount/i), { target: { value: "1200" } });
    await user.type(screen.getByLabelText(/cover letter/i), "Cover letter with enough detail for review.");
    await user.type(screen.getByLabelText(/your expert answer/i), "Answer with enough detail about the delivery.");
    await user.click(screen.getByRole("button", { name: /apply now/i }));

    expect(await screen.findByText(/milestone title and description/i)).toBeInTheDocument();
  });

  it("stores a complete proposal record after required fields are filled", async () => {
    saveProfile();
    const user = userEvent.setup();
    render(<JobDetailClient job={jobs[1]} />);

    await user.click(screen.getByRole("radio", { name: /by project/i }));
    fireEvent.change(screen.getByLabelText(/full amount/i), { target: { value: "950" } });
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
        candidateName: "Zubair Hussain",
        bidAmount: 950,
        boostConnects: 0
      });
    });
  });

  it("shows candidates returned by the applications API in the admin view", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        json: async () => ({
          candidates: [
            {
              candidateId: "zubair-hussain",
              candidateName: "Zubair Hussain",
              candidateDescription: "Full stack AI and n8n expert",
              updatedAt: "2026-09-20T12:00:00.000Z",
              applications: []
            }
          ]
        })
      }))
    );

    render(<AdminClient />);

    expect(await screen.findAllByText(/Zubair Hussain/)).not.toHaveLength(0);
  });
});
