"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { doc, getDoc } from "../../../../lib/store";
import { PackageX, ShieldAlert } from "lucide-react";
import { db } from "../../../../lib/firebase";
import { can } from "../../../../lib/admin";
import { useAuth } from "../../../../context/AuthContext";
import ProductForm from "../../../../components/admin/ProductForm";
import { EmptyState, Loading } from "../../../../components/admin/ui";

export default function EditProductPage() {
  const { id } = useParams();
  const { userProfile } = useAuth();
  const [state, setState] = useState({ loading: true, product: null });

  useEffect(() => {
    getDoc(doc(db, "products", id))
      .then((snap) => setState({ loading: false, product: snap.exists() ? { id: snap.id, ...snap.data() } : null }))
      .catch(() => setState({ loading: false, product: null }));
  }, [id]);

  if (!can(userProfile?.role, "manageProducts")) {
    return <EmptyState icon={ShieldAlert} title="No permission" text="Only admins and managers can edit products." />;
  }
  if (state.loading) return <Loading />;
  if (!state.product) {
    return (
      <EmptyState
        icon={PackageX}
        title="Product not found"
        text="It may have been deleted."
        action={<Link href="/admin/products" className="btn-dark">Back to products</Link>}
      />
    );
  }
  return <ProductForm product={state.product} />;
}
