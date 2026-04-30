import AdminPanelShell from "../_components/admin-panel-shell";
import { apiClient, ApiError } from "@/lib/api";
import { vendorListSchema, Vendor } from "@/lib/validation/vendors";

export default async function AdminPanelVendorsPage() {
	let vendors: Vendor[] = [];

	try {
		const raw = await apiClient<unknown>({
			method: "GET",
			endpoint: "/api/ecommerce/vendors",
			next: { revalidate: 300, tags: ["ecommerce:vendors"] },
		});

		// Backend might return { items: Vendor[] } or Vendor[] directly
		const maybeArray = raw && typeof raw === "object" && "items" in (raw as any) ? (raw as any).items : raw;
		vendors = vendorListSchema.parse(maybeArray);
	} catch (err) {
		if (err instanceof ApiError) {
			console.error("API error fetching vendors:", err.message, err.payload);
		} else {
			console.error("Vendors parse/fetch error:", err);
		}
	}

	return (
		<AdminPanelShell
			activeTab="vendors"
			subtitle="Review vendor onboarding status and manage marketplace participation."
			title="Vendor Management"
		>
			<section className="grid grid-cols-1 gap-6 md:grid-cols-4">
				<Tile label="Total Vendors" value={String(vendors.length)} />
				<Tile label="Verified" value="—" />
				<Tile label="Pending" value="—" />
				<Tile label="Flagged" value="—" />
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
							<tr key={vendor.id} className="hover:bg-slate-50">
								<td className="px-6 py-4 font-bold text-slate-900">{vendor.name}</td>
								<td className="px-6 py-4 text-slate-700">{vendor.category}</td>
								<td className="px-6 py-4 text-slate-500">{vendor.city}</td>
								<td className="px-6 py-4 text-slate-700">{vendor.products ?? "—"}</td>
								<td className="px-6 py-4">
									<span
										className={[
											"rounded-full px-2.5 py-1 text-xs font-bold",
											vendor.status === "Verified" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700",
										].join(" ")}
									>
										{vendor.status ?? "Unknown"}
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
