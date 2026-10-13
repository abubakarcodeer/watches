"use client";

import { useAuth } from "../../../../context/AuthContext";
import { can } from "../../../../lib/admin";
import ProductForm from "../../../../components/admin/ProductForm";
import { EmptyState } from "../../../../components/admin/ui";
import { ShieldAlert } from "lucide-react";

export default function NewProductPage() {
  const { userProfile } = useAuth();
  if (!can(userProfile?.role, "manageProducts")) {
    return <EmptyState icon={ShieldAlert} title="No permission" text="Only admins and managers can add products." />;
  }
  return <ProductForm />;
}
