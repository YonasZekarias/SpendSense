import AdminPanelShell from "../_components/admin-panel-shell";

const users = [
	{ name: "Dawit Solomon", email: "dawit.s@ethioazure.com", role: "Shopper", status: "Active", joined: "Oct 12, 2023" },
	{ name: "Selam Electronics", email: "sales@selamelectro.et", role: "Vendor", status: "Active", joined: "Jan 05, 2023" },
	{ name: "Martha Tekeste", email: "martha.t@admin.spendsense.et", role: "Admin", status: "Active", joined: "Mar 18, 2022" },
	{ name: "Abel Girma", email: "abel.girma@mail.et", role: "Shopper", status: "Suspended", joined: "Jun 22, 2023" },
];

export default function AdminPanelUsersPage() {
	return (
		<AdminPanelShell activeTab="users" subtitle="Manage permissions, monitor activity, and moderate user access." title="Platform Users">
			<section className="grid grid-cols-1 gap-6 md:grid-cols-4">
				<Tile label="Total Users" value="14,290" />
				<Tile label="Active Shoppers" value="12,105" />
				<Tile label="Active Vendors" value="2,140" />
				<Tile label="Suspended" value="45" />
			</section>

			<section className="mt-8 overflow-hidden rounded-xl bg-white shadow-sm">
				<div className="border-b border-slate-100 p-6">
					<h3 className="text-lg font-bold">Users Directory</h3>
				</div>

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
							<tr key={user.email} className="hover:bg-slate-50">
								<td className="px-6 py-4">
									<p className="font-bold text-slate-900">{user.name}</p>
									<p className="text-xs text-slate-500">{user.email}</p>
								</td>
								<td className="px-6 py-4">{user.role}</td>
								<td className="px-6 py-4">
									<span
										className={[
											"rounded-full px-2.5 py-1 text-xs font-bold",
											user.status === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700",
										].join(" ")}
									>
										{user.status}
									</span>
								</td>
								<td className="px-6 py-4 text-slate-500">{user.joined}</td>
								<td className="px-6 py-4 text-right">
									<button className="rounded-lg px-3 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-50" type="button">
										Edit
									</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
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
