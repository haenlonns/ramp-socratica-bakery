"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export type AdminTeam = {
  id: string; name: string; status: string; availableCents: number; fundLimitCents: number; owner_user_id: string | null; created_at: string; orderCount: number;
  members: { id: string; user_id: string; role: "OWNER" | "MEMBER"; email: string }[];
  pendingInvitations: { id: string; email: string; expires_at: string }[];
};
export type AdminRecord = { email: string; role: "ADMIN" | "SUPERADMIN" };
type PendingAction = { title: string; description: string; payload: Record<string, unknown>; confirmLabel: string; destructive?: boolean } | null;

function formatMoney(cents: number) { return new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" }).format(cents / 100); }
function teamStatus(team: AdminTeam, deadline: string) {
  if (team.status === "ARCHIVED") return "ARCHIVED";
  if (new Date(deadline) <= new Date()) return team.members.length >= 3 ? "SHOP_OPEN" : "LOCKED_INELIGIBLE";
  if (team.members.length < 3) return "FORMING";
  return team.members.length === 6 ? "FULL" : "READY";
}

export function AdminConsole({ teams, admins, deadline, actorRole }: { teams: AdminTeam[]; admins: AdminRecord[]; deadline: string; actorRole: "ADMIN" | "SUPERADMIN" }) {
  const router = useRouter();
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [working, setWorking] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const activeTeams = useMemo(() => teams.filter((team) => team.status !== "ARCHIVED"), [teams]);
  const selectedTeam = teams.find((team) => team.id === selectedTeamId) ?? null;

  async function action(payload: Record<string, unknown>) {
    setWorking(true); setError(""); setNotice("");
    try {
      const response = await fetch("/api/admin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await response.json() as { error?: string; message?: string };
      if (!response.ok) throw new Error(data.error ?? "Admin action failed.");
      setNotice(data.message ?? "Saved.");
      setPendingAction(null);
      router.refresh();
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Admin action failed."); }
    finally { setWorking(false); }
  }

  function submitFundLimits(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const fundLimits = activeTeams.map((team) => ({ teamId: team.id, fundLimitCents: Math.round(Number(data.get(`fund-limit-${team.id}`)) * 100) }));
    if (fundLimits.some(({ fundLimitCents }) => !Number.isSafeInteger(fundLimitCents) || fundLimitCents < 0)) return setError("Each fund limit must be a non-negative amount.");
    void action({ action: "set_fund_limits", fundLimits, reason: String(data.get("fund-limit-reason") ?? "") });
  }

  function submitInvitation(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedTeam) return;
    const email = String(new FormData(event.currentTarget).get("invite-email") ?? "").trim();
    if (!email) return setError("Enter a participant email address.");
    void action({ action: "invite_member", teamId: selectedTeam.id, email });
    event.currentTarget.reset();
  }

  function closeDialog() { if (!working) setPendingAction(null); }

  return <div className="rampAdminSections">
    {(notice || error) && <p className={error ? "rampAdminMessage rampAdminMessage--error" : "rampAdminMessage"} role="status">{error || notice}</p>}

    <section className="rampAdminStack" aria-labelledby="fund-limits-heading">
      <div className="rampAdminRowHead"><h2 className="rampAdminSectionTitle" id="fund-limits-heading">Fund limits</h2></div>
      <form className="rampAdminCard rampAdminCard--table" onSubmit={submitFundLimits}>
        <div className="rampAdminTableScroll"><table className="rampAdminTable">
          <thead><tr><th scope="col">Team</th><th scope="col">Fund limit (CAD)</th><th scope="col">Spent</th><th scope="col">Remaining</th></tr></thead>
          <tbody>{activeTeams.length ? activeTeams.map((team) => {
            const spentCents = team.fundLimitCents - team.availableCents;
            return <tr key={team.id}>
              <th scope="row">{team.name}</th>
              <td><input className="rampAdminTableInput" aria-label={`${team.name} fund limit in CAD`} name={`fund-limit-${team.id}`} type="number" min="0" step="0.01" defaultValue={(team.fundLimitCents / 100).toFixed(2)} /></td>
              <td>{formatMoney(spentCents)}</td>
              <td className={team.availableCents < 0 ? "rampAdminNegative" : undefined}>{formatMoney(team.availableCents)}</td>
            </tr>;
          }) : <tr><td className="rampAdminTableEmpty" colSpan={4}>No teams have submitted yet.</td></tr>}</tbody>
        </table></div>
        <div className="rampAdminCardFooter">
          <label className="rampAdminField"><span>Reason (optional)</span><input name="fund-limit-reason" maxLength={240} placeholder="e.g. Grading allocation" /></label>
          <button className="rampBtn rampBtn--primary" disabled={working || !activeTeams.length}>{working ? "Saving…" : "Save fund limits"}</button>
        </div>
      </form>
    </section>

    <section className="rampAdminStack" aria-labelledby="teams-heading">
      <div className="rampAdminRowHead">
        <h2 className="rampAdminSectionTitle" id="teams-heading">Team directory</h2>
        <button className="rampBtn rampBtn--secondary" type="button" disabled={working || activeTeams.length < 2} onClick={() => setPendingAction({ title: "Merge teams", description: "Choose the source and destination teams. The source team must have no orders, both teams must be unfunded, and the combined team cannot exceed six members.", payload: { action: "merge_teams" }, confirmLabel: "Merge teams", destructive: true })}>Merge teams</button>
      </div>
      <div className="rampAdminCard rampAdminCard--table"><div className="rampAdminTableScroll"><table className="rampAdminTable">
        <thead><tr><th scope="col">Team</th><th scope="col">Status</th><th scope="col">Members</th><th scope="col">Fund limit</th><th scope="col">Orders</th><th scope="col"><span className="rampSrOnly">Action</span></th></tr></thead>
        <tbody>{teams.length ? teams.map((team) => <tr key={team.id} className={selectedTeamId === team.id ? "rampAdminRowSelected" : undefined}>
          <th scope="row">{team.name}</th>
          <td><span className="rampAdminStatus">{teamStatus(team, deadline).replaceAll("_", " ")}</span></td>
          <td>{team.members.length} of 6</td>
          <td>{formatMoney(team.fundLimitCents)}</td>
          <td>{team.orderCount}</td>
          <td className="rampAdminTableAction"><button className="rampBtn rampBtn--secondary rampBtn--small" type="button" onClick={() => setSelectedTeamId(team.id)}>{selectedTeamId === team.id ? "Managing" : "Manage"}</button></td>
        </tr>) : <tr><td className="rampAdminTableEmpty" colSpan={6}>No teams have submitted yet.</td></tr>}</tbody>
      </table></div></div>
    </section>

    {selectedTeam && <section className="rampAdminStack" aria-labelledby="manage-team-heading">
      <div className="rampAdminRowHead">
        <div><h2 className="rampAdminSectionTitle" id="manage-team-heading">{selectedTeam.name}</h2><p className="rampAdminNote">{selectedTeam.members.length}/6 members · {selectedTeam.orderCount} orders · {teamStatus(selectedTeam, deadline).replaceAll("_", " ").toLowerCase()}</p></div>
        <div className="rampAdminActions"><a className="rampBtn rampBtn--secondary" href={`/teams/${selectedTeam.id}`}>View submission</a><button className="rampBtn rampBtn--secondary" type="button" onClick={() => setSelectedTeamId(null)}>Close</button></div>
      </div>
      <div className="rampAdminCard rampAdminCard--table">
        <section className="rampAdminSubsection">
          <h3 className="rampAdminSubTitle">Invite participants</h3>
          <form className="rampAdminInlineForm" onSubmit={submitInvitation}>
            <label className="rampAdminField"><span>Participant email</span><input name="invite-email" type="email" required placeholder="person@example.com" /></label>
            <button className="rampBtn rampBtn--primary" disabled={working || selectedTeam.members.length + selectedTeam.pendingInvitations.length >= 6}>Send invitation</button>
          </form>
          {selectedTeam.pendingInvitations.length > 0 && <div className="rampAdminTableScroll"><table className="rampAdminTable">
            <thead><tr><th scope="col">Invitation pending</th><th scope="col">Expires</th></tr></thead>
            <tbody>{selectedTeam.pendingInvitations.map((invitation) => <tr key={invitation.id}><th scope="row">{invitation.email}</th><td>{new Intl.DateTimeFormat("en-CA", { dateStyle: "medium", timeStyle: "short" }).format(new Date(invitation.expires_at))}</td></tr>)}</tbody>
          </table></div>}
        </section>
        <section className="rampAdminSubsection">
          <h3 className="rampAdminSubTitle">Members</h3>
          <div className="rampAdminTableScroll"><table className="rampAdminTable">
            <thead><tr><th scope="col">Participant</th><th scope="col">Role</th><th scope="col">Move to</th><th scope="col"><span className="rampSrOnly">Remove</span></th></tr></thead>
            <tbody>{selectedTeam.members.length ? selectedTeam.members.map((member) => <tr key={member.id}>
              <th scope="row">{member.email}</th>
              <td>{member.role}</td>
              <td><select className="rampAdminTableInput" aria-label={`Move ${member.email} to another team`} defaultValue="" disabled={working} onChange={(event) => { const destination = event.target.value; event.currentTarget.value = ""; if (destination) { const destinationTeam = teams.find((team) => team.id === destination); setPendingAction({ title: `Move ${member.email}?`, description: `This moves the participant from ${selectedTeam.name} to ${destinationTeam?.name ?? "the selected team"}.`, payload: { action: "reassign_member", membershipId: member.id, destinationTeamId: destination }, confirmLabel: "Move participant" }); } }}><option value="">Choose team</option>{teams.filter((candidate) => candidate.id !== selectedTeam.id && candidate.status !== "ARCHIVED" && candidate.members.length < 6).map((candidate) => <option key={candidate.id} value={candidate.id}>{candidate.name} ({candidate.members.length}/6)</option>)}</select></td>
              <td className="rampAdminTableAction"><button className="rampBtn rampBtn--link" type="button" disabled={working} onClick={() => setPendingAction({ title: `Remove ${member.email}?`, description: `This removes the participant from ${selectedTeam.name}. They will not belong to any bakery team afterward.`, payload: { action: "remove_member", membershipId: member.id }, confirmLabel: "Remove participant", destructive: true })}>Remove</button></td>
            </tr>) : <tr><td className="rampAdminTableEmpty" colSpan={4}>No active participants.</td></tr>}</tbody>
          </table></div>
        </section>
        <section className="rampAdminSubsection rampAdminSubsection--row">
          <div><h3 className="rampAdminSubTitle">Archive team</h3><p className="rampAdminNote">Remove all participants before archiving.</p></div>
          <button className="rampBtn rampBtn--danger" type="button" disabled={working || selectedTeam.status === "ARCHIVED"} onClick={() => setPendingAction({ title: `Archive ${selectedTeam.name}?`, description: "This marks the empty team as archived. Its participants must be removed first.", payload: { action: "archive_team", teamId: selectedTeam.id }, confirmLabel: "Archive team", destructive: true })}>Archive team</button>
        </section>
      </div>
    </section>}

    {actorRole === "SUPERADMIN" && <section className="rampAdminStack" aria-labelledby="access-heading">
      <div className="rampAdminRowHead"><h2 className="rampAdminSectionTitle" id="access-heading">Admin access</h2></div>
      <div className="rampAdminCard rampAdminCard--table">
        <form className="rampAdminSubsection rampAdminInlineForm" onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); void action({ action: "set_admin", email: data.get("email"), role: data.get("role") }); }}>
          <label className="rampAdminField"><span>Email</span><input name="email" type="email" required placeholder="person@example.com" /></label>
          <label className="rampAdminField"><span>Role</span><select name="role"><option value="ADMIN">Admin</option><option value="SUPERADMIN">Superadmin</option><option value="REMOVE">Remove admin access</option></select></label>
          <button className="rampBtn rampBtn--primary" disabled={working}>Save access</button>
        </form>
        <div className="rampAdminTableScroll"><table className="rampAdminTable">
          <thead><tr><th scope="col">Admin</th><th scope="col">Role</th></tr></thead>
          <tbody>{admins.map((admin) => <tr key={admin.email}><th scope="row">{admin.email}</th><td><span className="rampAdminStatus">{admin.role}</span></td></tr>)}</tbody>
        </table></div>
      </div>
    </section>}

    {pendingAction && <div className="rampAdminDialogBackdrop" role="presentation" onMouseDown={closeDialog}>
      <section className="rampAdminDialog" role="dialog" aria-modal="true" aria-labelledby="admin-action-heading" onMouseDown={(event) => event.stopPropagation()}>
        <header><h2 className="rampAdminSectionTitle" id="admin-action-heading">{pendingAction.title}</h2><p className="rampAdminNote">{pendingAction.description}</p></header>
        {pendingAction.payload.action === "merge_teams" ? <form className="rampAdminStack" onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); void action({ ...pendingAction.payload, sourceTeamId: data.get("source"), destinationTeamId: data.get("destination") }); }}>
          <label className="rampAdminField"><span>Source team</span><select name="source" required><option value="">Choose a team</option>{activeTeams.map((team) => <option key={team.id} value={team.id}>{team.name} ({team.members.length}/6)</option>)}</select></label>
          <label className="rampAdminField"><span>Destination team</span><select name="destination" required><option value="">Choose a team</option>{activeTeams.map((team) => <option key={team.id} value={team.id}>{team.name} ({team.members.length}/6)</option>)}</select></label>
          <div className="rampAdminActions rampAdminActions--end"><button className="rampBtn rampBtn--secondary" type="button" disabled={working} onClick={closeDialog}>Cancel</button><button className={pendingAction.destructive ? "rampBtn rampBtn--danger" : "rampBtn rampBtn--primary"} disabled={working}>{working ? "Saving…" : pendingAction.confirmLabel}</button></div>
        </form> : <div className="rampAdminActions rampAdminActions--end"><button className="rampBtn rampBtn--secondary" type="button" disabled={working} onClick={closeDialog}>Cancel</button><button className={pendingAction.destructive ? "rampBtn rampBtn--danger" : "rampBtn rampBtn--primary"} type="button" disabled={working} onClick={() => void action(pendingAction.payload)}>{working ? "Saving…" : pendingAction.confirmLabel}</button></div>}
      </section>
    </div>}
  </div>;
}
