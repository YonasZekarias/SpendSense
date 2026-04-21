import AdminPanelShell from "../_components/admin-panel-shell";

const trend = [52, 61, 58, 72, 69, 81, 88];

export default function AdminPanelDashboardPage() {
	return (
		<AdminPanelShell
			activeTab="dashboard"
			subtitle="Operational summary of users, vendors, moderation, and platform health."
			title="Admin Dashboard"
		>
			<section className="grid grid-cols-1 gap-6 md:grid-cols-4">
				<Tile label="Total Users" value="14,290" />
				<Tile label="Active Vendors" value="2,140" />
				<Tile label="Pending Verification" value="37" />
				<Tile label="Price Flags Today" value="124" />
			</section>

			<section className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
				<article className="rounded-xl bg-white p-6 shadow-sm lg:col-span-2">
					<h3 className="text-lg font-bold text-slate-900">7-Day Activity Trend</h3>
					<p className="mt-1 text-sm text-slate-500">Combined user activity and moderation throughput.</p>
					<div className="mt-6 flex h-40 items-end gap-2">
						{trend.map((point, idx) => (
							<div key={idx} className="w-full rounded-t bg-blue-600/80" style={{ height: `${point}%` }} />
						))}
					</div>
				</article>

				<article className="rounded-xl bg-white p-6 shadow-sm">
					<h3 className="text-lg font-bold text-slate-900">Action Center</h3>
					<ul className="mt-4 space-y-3 text-sm text-slate-700">
						<li className="rounded-lg bg-slate-100 p-3">9 vendor submissions waiting more than 24h</li>
						<li className="rounded-lg bg-slate-100 p-3">3 API keys approaching rotation date</li>
						<li className="rounded-lg bg-slate-100 p-3">18 price outliers need manual review</li>
					</ul>
				</article>
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
