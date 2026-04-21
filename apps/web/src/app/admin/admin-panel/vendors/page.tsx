import AdminPanelShell from "../_components/admin-panel-shell";

const vendors = [
	{ name: "Abyssinia Trading PLC", category: "Import/Export", city: "Addis Ababa", status: "Pending", products: 48 },
	{ name: "Selam Electronics", category: "Electronics", city: "Addis Ababa", status: "Verified", products: 136 },
	{ name: "Sheger Agro-Processing", category: "Manufacturing", city: "Adama", status: "Pending", products: 22 },
	{ name: "Ethio Telecom Retailer", category: "Telecommunications", city: "Bahir Dar", status: "Verified", products: 64 },
];

export default function AdminPanelVendorsPage() {
	return (
		<AdminPanelShell
			activeTab="vendors"
			subtitle="Review vendor onboarding status and manage marketplace participation."
			title="Vendor Management"
		>
			<section className="grid grid-cols-1 gap-6 md:grid-cols-4">
				<Tile label="Total Vendors" value="2,140" />
				<Tile label="Verified" value="2,003" />
				<Tile label="Pending" value="137" />
				<Tile label="Flagged" value="11" />
			</section>

			<section className="mt-8 overflow-hidden rounded-xl bg-white shadow-sm">
				<div className="border-b border-slate-100 p-6">
					<h3 className="text-lg font-bold">Vendors Directory</h3>
				</div>

				<table className="w-full text-left">
					<thead className="bg-slate-50 text-[11px] uppercase tracking-widest text-slate-500">
						<tr>
							<th className="px-6 py-4">Vendor</th>
							<th className="px-6 py-4">Category</th>
							<th className="px-6 py-4">City</th>
							<th className="px-6 py-4">Products</th>
							<th className="px-6 py-4">Status</th>
							<th className="px-6 py-4 text-right">Actions</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-slate-100 text-sm">
						{vendors.map((vendor) => (
							<tr key={vendor.name} className="hover:bg-slate-50">
								<td className="px-6 py-4 font-bold text-slate-900">{vendor.name}</td>
								<td className="px-6 py-4 text-slate-700">{vendor.category}</td>
								<td className="px-6 py-4 text-slate-500">{vendor.city}</td>
								<td className="px-6 py-4 text-slate-700">{vendor.products}</td>
								<td className="px-6 py-4">
									<span
										className={[
											"rounded-full px-2.5 py-1 text-xs font-bold",
											vendor.status === "Verified" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700",
										].join(" ")}
									>
										{vendor.status}
									</span>
								</td>
								<td className="px-6 py-4 text-right">
									<button className="rounded-lg px-3 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-50" type="button">
										Review
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
