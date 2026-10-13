"use client";

import { useMemo, useState } from "react";
import { deleteDoc, doc } from "../../../lib/store";
import { Download, Mail, Trash2 } from "lucide-react";
import { db } from "../../../lib/firebase";
import { useCollection } from "../../../lib/useCollection";
import { can, downloadCsv, formatDate } from "../../../lib/admin";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../context/ToastContext";
import { EmptyState, Loading, PageHeader, SearchInput, TableShell, Td, Th } from "../../../components/admin/ui";

export default function SubscribersPage() {
  const { userProfile } = useAuth();
  const { addToast } = useToast();
  const { data: subscribers, loading } = useCollection("subscribers");
  const [term, setTerm] = useState("");
  const canDelete = can(userProfile?.role, "manageSubscribers");

  const filtered = useMemo(() => {
    const q = term.trim().toLowerCase();
    return subscribers.filter((s) => !q || s.email?.toLowerCase().includes(q));
  }, [subscribers, term]);

  async function remove(sub) {
    if (!window.confirm(`Remove ${sub.email} from the list?`)) return;
    try {
      await deleteDoc(doc(db, "subscribers", sub.id));
      addToast("Subscriber removed");
    } catch {
      addToast("Could not remove the subscriber", "error");
    }
  }

  if (loading) return <Loading />;

  return (
    <>
      <PageHeader
        title="Subscribers"
        subtitle={`${subscribers.length} people signed up for the 20% offer`}
        actions={
          <>
            <SearchInput value={term} onChange={setTerm} placeholder="Search email" />
            <button
              onClick={() =>
                downloadCsv(
                  `watchshop-subscribers-${new Date().toISOString().slice(0, 10)}.csv`,
                  filtered.map((s) => ({ email: s.email, subscribed: formatDate(s.createdAt, true) }))
                )
              }
              disabled={!filtered.length}
              className="btn-outline gap-2 bg-white py-2.5 disabled:opacity-40"
            >
              <Download size={16} /> Export CSV
            </button>
          </>
        }
      />

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-line bg-white">
          <EmptyState icon={Mail} title="No subscribers yet" text="Emails from the homepage newsletter form appear here." />
        </div>
      ) : (
        <TableShell>
          <thead>
            <tr>
              <Th>Email</Th>
              <Th>Subscribed</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.id} className="hover:bg-sand">
                <Td>
                  <a href={`mailto:${s.email}`} className="font-medium hover:text-forest">{s.email}</a>
                </Td>
                <Td className="text-muted">{formatDate(s.createdAt, true)}</Td>
                <Td className="text-right">
                  {canDelete && (
                    <button onClick={() => remove(s)} className="ml-auto grid h-9 w-9 place-items-center rounded-full hover:bg-cream hover:text-forest-deep" aria-label="Remove">
                      <Trash2 size={16} />
                    </button>
                  )}
                </Td>
              </tr>
            ))}
          </tbody>
        </TableShell>
      )}
    </>
  );
}
