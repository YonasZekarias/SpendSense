"use server";

import AdminPanelShell from "../_components/admin-panel-shell";
import { apiClient, ApiError } from "@/lib/api";
import { revalidatePath } from "next/cache";
import ConfirmSubmitButton from "@/components/ConfirmSubmitButton";
import type { UserProfile } from "@/lib/auth-types";

async function fetchUsers(): Promise<UserProfile[]> {
	return await apiClient<UserProfile[]>({ method: "GET", endpoint: "/api/users/admin/users/" });
}

export default async function AdminPanelUsersPage() {
	let users: UserProfile[] = [];
	let errorMessage: string | null = null;
	try {
		users = await fetchUsers();
	} catch (err) {
		console.error("Failed to load users", err);
		errorMessage = err instanceof Error ? err.message : String(err ?? "Unknown error");
	}

	return (
		<AdminPanelShell activeTab="users" subtitle="Manage permissions, monitor activity, and moderate user access." title="Platform Users">
			<section className="grid grid-cols-1 gap-6 md:grid-cols-4">
				<Tile label="Total Users" value={String(users.length)} />
				<Tile label="Active Shoppers" value="—" />
				<Tile label="Active Vendors" value="—" />
				<Tile label="Suspended" value="—" />
			</section>

			<section className="mt-8 overflow-hidden rounded-xl bg-white shadow-sm">
				<div className="border-b border-slate-100 p-6">
					<h3 className="text-lg font-bold">Users Directory</h3>
				</div>
				{errorMessage ? (
					<div className="p-6">
						<div className="rounded-md bg-red-50 p-4">
							<p className="text-sm font-medium text-red-800">Failed to load users</p>
							<p className="mt-1 text-sm text-red-700">{errorMessage}</p>
						</div>
					</div>
				) : users.length === 0 ? (
					<div className="p-6">
						<LoadingSkeleton />
					</div>
				) : (
					<table className="w-full text-left">
					<thead className="bg-slate-50 text-[11px] uppercase tracking-widest text-slate-500">
						<tr>
							<th className="px-6 py-4">User Profile</th>
							<th className="px-6 py-4">Role</th>
							<th className="px-6 py-4">Status</th>
							<th className="px-6 py-4">Join Date</th>
							<th className="px-6 py-4 text-right">Actions</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-slate-100 text-sm">
						{users.map((user) => (
							<tr key={user.id} className="hover:bg-slate-50">
								<td className="px-6 py-4">
									<p className="font-bold text-slate-900">{user.full_name}</p>
									<p className="text-xs text-slate-500">{user.email}</p>
								</td>
								<td className="px-6 py-4">{user.role}</td>
								<td className="px-6 py-4">
									<span className="rounded-full px-2.5 py-1 text-xs font-bold bg-green-100 text-green-700">Active</span>
								</td>
								<td className="px-6 py-4 text-slate-500">{user.created_at?.slice(0, 10) ?? "—"}</td>
								<td className="px-6 py-4 text-right">
									<form id={`suspend-form-${user.id}`} action={async (formData: FormData) => {
										"use server";
										const id = String(formData.get("userId"));
										try {
											await apiClient<UserProfile>({
												method: "PATCH",
												endpoint: `/api/admin/users/${id}/`,
												body: { suspended: true },
											});
											revalidatePath("/admin/admin-panel/users");
										} catch (e) {
											console.error("Failed to suspend user", e);
										}
									}}>
										<input type="hidden" name="userId" value={user.id} />
										<ConfirmSubmitButton formId={`suspend-form-${user.id}`} />
									</form>
								</td>
							</tr>
						))}
					</tbody>
				</table>
				)}
			</section>
		</AdminPanelShell>
	);
}

function Tile({ label, value }: { label: string; value: string }) {
	return (
		<div className="rounded-xl bg-white p-6 shadow-sm">
			<p className="text-xs font-bold uppercase tracking-widest text-slate-500">{label}</p>
			<p className="mt-2 text-2xl font-black text-slate-900">{value}</p>
		</div>
	);
}

function LoadingSkeleton() {
	return (
		<div className="space-y-4">
			<div className="h-6 w-1/4 animate-pulse rounded bg-slate-200" />
			<div className="overflow-hidden rounded-md border border-slate-100">
				<div className="p-4">
					<div className="space-y-3">
						{Array.from({ length: 5 }).map((_, i) => (
							<div key={i} className="flex items-center justify-between">
								<div className="flex-1">
									<div className="h-4 w-48 animate-pulse rounded bg-slate-200" />
									<div className="mt-2 h-3 w-32 animate-pulse rounded bg-slate-200" />
								</div>
								<div className="ml-4 h-3 w-20 animate-pulse rounded bg-slate-200" />
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
