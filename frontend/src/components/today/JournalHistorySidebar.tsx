/**
 * Left-side diary history: recent entries with date filter.
 */
import dayjs, { type Dayjs } from "dayjs";
import { DatePicker } from "antd";
import { CalendarOutlined } from "@ant-design/icons";
import { useTheme } from "../../hooks/useTheme";
import type { JournalEntryListItem } from "../../services/journal";

interface JournalHistorySidebarProps {
	entries: JournalEntryListItem[];
	selectedDate: string;
	onSelectDate: (date: string) => void;
	filterMonth: string | null;
	onFilterMonthChange: (month: string | null) => void;
}

function getPreview(entry: JournalEntryListItem) {
	const text = (entry.raw_text || "").trim();
	if (!text) return "No writing yet";
	return text.length > 88 ? `${text.slice(0, 88)}…` : text;
}

export function JournalHistorySidebar({
	entries,
	selectedDate,
	onSelectDate,
	filterMonth,
	onFilterMonthChange,
}: JournalHistorySidebarProps) {
	const theme = useTheme();

	return (
		<div
			style={{
				borderRadius: 18,
				border: `1px solid ${theme.contentCardBorder}`,
				background: theme.contentCardBg,
				padding: 18,
			}}
		>
			<div
				style={{
					display: "flex",
					alignItems: "center",
					gap: 10,
					marginBottom: 14,
				}}
			>
				<DatePicker
					picker="month"
					value={filterMonth ? dayjs(filterMonth + "-01") : null}
					onChange={(d: Dayjs | null) =>
						onFilterMonthChange(d ? d.format("YYYY-MM") : null)
					}
					allowClear
					suffixIcon={
						<CalendarOutlined
							style={{ fontSize: 14, color: theme.textMuted }}
						/>
					}
					style={{
						flex: 1,
						minWidth: 0,
						fontSize: 13,
					}}
					placeholder="All entries"
					format="MMM YYYY"
				/>
			</div>

			<button
				type="button"
				onClick={() => onSelectDate(dayjs().format("YYYY-MM-DD"))}
				style={{
					textAlign: "left",
					width: "100%",
					padding: "10px 12px",
					borderRadius: 14,
					border: `1px solid ${selectedDate === dayjs().format("YYYY-MM-DD") ? theme.accent : theme.contentCardBorder}`,
					background:
						selectedDate === dayjs().format("YYYY-MM-DD")
							? theme.accentLight
							: "transparent",
					cursor: "pointer",
					marginBottom: 10,
				}}
			>
				<div
					style={{
						fontSize: 13,
						fontWeight: 600,
						color:
							selectedDate === dayjs().format("YYYY-MM-DD")
								? theme.accent
								: theme.textPrimary,
					}}
				>
					{dayjs().format("MMM D")}
				</div>
			</button>

			{entries.length === 0 ? (
				<p style={{ margin: 0, fontSize: 13, color: theme.textMuted }}>
					Your past diaries will appear here.
				</p>
			) : (
				<div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
					{entries.map((entry) => {
						const active = entry.date === selectedDate;
						return (
							<button
								key={entry.id}
								type="button"
								onClick={() => onSelectDate(entry.date)}
								style={{
									textAlign: "left",
									width: "100%",
									padding: "12px 12px",
									borderRadius: 14,
									border: `1px solid ${active ? theme.accent : theme.contentCardBorder}`,
									background: active ? theme.accentLight : "transparent",
									cursor: "pointer",
								}}
							>
								<div
									style={{
										display: "flex",
										justifyContent: "space-between",
										alignItems: "center",
										gap: 12,
										marginBottom: 6,
									}}
								>
									<span
										style={{
											fontSize: 13,
											fontWeight: 600,
											color: active ? theme.accent : theme.textPrimary,
										}}
									>
										{dayjs(entry.date).format("MMM D")}
									</span>
									<span style={{ fontSize: 11, color: theme.textMuted }}>
										{dayjs(entry.date).format("ddd")}
									</span>
								</div>
								<div
									style={{
										fontSize: 12,
										lineHeight: 1.5,
										color: theme.textMuted,
									}}
								>
									{getPreview(entry)}
								</div>
							</button>
						);
					})}
				</div>
			)}
		</div>
	);
}
