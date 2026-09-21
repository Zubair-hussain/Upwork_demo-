import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminClient } from "@/components/AdminClient";
import { JobDetailClient } from "@/components/JobDetailClient";
import { PlatformClient } from "@/components/PlatformClient";
import { jobs } from "@/lib/jobs";

const profile = {
  name: "Zubair Hussain",
  email: "zubair@example.com",
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

  it("saves candidate name, email, and short description", async () => {
    const user = userEvent.setup();
    render(<PlatformClient />);

    fireEvent.change(screen.getByLabelText(/what is your name/i), { target: { value: "Zubair Hussain" } });
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: "Zubair@Example.com" } });
    fireEvent.change(screen.getByLabelText(/short description/i), { target: { value: "Full stack AI and n8n expert" } });
    await user.click(screen.getByRole("button", { name: /save profile/i }));

    expect(await screen.findByText(/profile saved/i)).toBeInTheDocument();
    const saved = JSON.parse(window.localStorage.getItem("uet-candidate-profile") ?? "null");
    expect(saved).toMatchObject({
      name: "Zubair Hussain",
      email: "zubair@example.com",
      description: "Full stack AI and n8n expert"
    });
  });

  it("shows the two instruction cards once for a first-time visitor", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<PlatformClient />);

    expect(await screen.findByRole("heading", { name: /set up your candidate profile/i })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /^next/i }));
    expect(screen.getByRole("heading", { name: /send a strong proposal/i })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /get started/i }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(window.localStorage.getItem("uet-onboarding-seen")).toBe("true");

    unmount();
    render(<PlatformClient />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("blocks applying until name and title are saved", async () => {
    const user = userEvent.setup();
    render(<JobDetailClient job={jobs[0]} />);

    await user.click(screen.getByRole("button", { name: /apply now/i }));

    // The banner and the submit message both carry this text, so match all.
    expect(await screen.findAllByText(/please add your name, email, and title/i)).not.toHaveLength(0);
  });

  it("requires a bid amount before submitting a proposal", async () => {
    saveProfile();
    const user = userEvent.setup();
    render(<JobDetailClient job={jobs[0]} />);

    // Pay "By project" so milestone details are not required for this check.
    await user.click(screen.getByRole("radio", { name: /by project/i }));
    fireEvent.change(screen.getByLabelText(/cover letter/i), { target: { value: "I can deliver this safely with tests and clear updates." } });
    fireEvent.change(screen.getByLabelText(/your expert answer/i), { target: { value: "My answer explains architecture, risk, testing, and delivery." } });
    await user.click(screen.getByRole("button", { name: /apply now/i }));

    expect(await screen.findByText(/please add your bid amount/i)).toBeInTheDocument();
  });

  it("requires milestone details when paid by milestone", async () => {
    saveProfile();
    const user = userEvent.setup();
    render(<JobDetailClient job={jobs[0]} />);

    // "By milestone" is the default selection.
    fireEvent.change(screen.getByLabelText(/full amount/i), { target: { value: "1200" } });
    fireEvent.change(screen.getByLabelText(/cover letter/i), { target: { value: "Cover letter with enough detail for review." } });
    fireEvent.change(screen.getByLabelText(/your expert answer/i), { target: { value: "Answer with enough detail about the delivery." } });
    await user.click(screen.getByRole("button", { name: /apply now/i }));

    expect(await screen.findByText(/milestone title and description/i)).toBeInTheDocument();
  });

  it("adds and stores multiple milestones", async () => {
    saveProfile();
    const user = userEvent.setup();
    render(<JobDetailClient job={jobs[0]} />);

    fireEvent.change(screen.getByLabelText(/full amount/i), { target: { value: "1800" } });
    fireEvent.change(screen.getByLabelText(/milestone title 1/i), { target: { value: "Working prototype" } });
    fireEvent.change(screen.getByLabelText(/milestone description 1/i), { target: { value: "Deliver the first tested prototype." } });
    await user.click(screen.getByRole("button", { name: /add milestone/i }));
    fireEvent.change(screen.getByLabelText(/milestone title 2/i), { target: { value: "Production launch" } });
    fireEvent.change(screen.getByLabelText(/milestone description 2/i), { target: { value: "Deploy and verify the production release." } });
    fireEvent.change(screen.getByLabelText(/cover letter/i), { target: { value: "I will deliver both stages with tests and clear updates." } });
    fireEvent.change(screen.getByLabelText(/your expert answer/i), { target: { value: "My answer covers architecture, security, testing, and deployment risks." } });
    await user.click(screen.getByRole("button", { name: /apply now/i }));

    const applications = JSON.parse(window.localStorage.getItem("uet-applications") ?? "[]");
    expect(applications[0].milestones).toEqual([
      { title: "Working prototype", description: "Deliver the first tested prototype." },
      { title: "Production launch", description: "Deploy and verify the production release." }
    ]);
  });

  it("keeps saved personal details out of the proposal form", () => {
    saveProfile();
    render(<JobDetailClient job={jobs[0]} />);

    expect(screen.queryByLabelText(/email address/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/professional title/i)).not.toBeInTheDocument();
  });

  it("shows test-only notices for portfolio and certificate actions", async () => {
    saveProfile();
    const user = userEvent.setup();
    render(<JobDetailClient job={jobs[0]} />);

    await user.click(screen.getByRole("button", { name: /add a portfolio project/i }));
    expect(screen.getByRole("heading", { name: /no portfolio needed/i })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /got it/i }));
    await user.click(screen.getByRole("button", { name: /add a certificate/i }));
    expect(screen.getByRole("heading", { name: /no certificate needed/i })).toBeInTheDocument();
  });

  it("uses anonymous labels and adds the candidate to the live Connects ranking", () => {
    saveProfile();
    render(<JobDetailClient job={jobs[0]} />);

    expect(screen.queryByText("Ayesha Khan")).not.toBeInTheDocument();
    expect(screen.getByText("User 1")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/bid connects for higher visibility/i), { target: { value: "40" } });
    expect(screen.getByText("You")).toBeInTheDocument();
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

    const fetchMock = vi.mocked(fetch);
    const requestBody = JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body));
    expect(requestBody.candidateEmail).toBe("zubair@example.com");
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
              candidateEmail: "zubair@example.com",
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
    expect(await screen.findAllByText(/zubair@example.com/)).not.toHaveLength(0);
  });
});
