import classes from "./style.module.scss";
import { ActionIcon, Badge, Divider, ScrollArea, Stack, Text, TextInput, Tooltip } from "@mantine/core";
import {useEffect, useMemo, useState} from "react";
import { useStable } from "~/hooks/stable";
import { Icon } from "~/components/Icon";
import { ContentPane } from "~/components/Pane";
import { useIsLight } from "~/hooks/theme";
import { useInputState } from "@mantine/hooks";
import { extractEdgeRecords, syncDatabaseSchema } from "~/util/schema";
import { useHasSchemaAccess, useTables } from "~/hooks/schema";
import { sort } from "radash";
import { useActiveConnection, useIsConnected } from "~/hooks/connection";
import { Spacer } from "~/components/Spacer";
import { useConfigStore } from "~/stores/config";
import { Importer } from "../Importer";
import { Exporter } from "../Exporter";
import { useContextMenu } from "mantine-contextmenu";
import { iconDelete, iconExplorer, iconPin, iconPinOff, iconPlus, iconRelation, iconSearch, iconTable } from "~/util/icons";
import { Entry } from "~/components/Entry";
import { useInterfaceStore } from "~/stores/interface";
import { useConfirmation } from "~/providers/Confirmation";
import { tb } from "~/util/helpers";
import { executeQuery } from "~/connection";
import {useEventSubscription} from "~/hooks/event";
import { RecordsChangedEvent } from "~/util/global-events";

export interface TablesPaneProps {
	activeTable: string | undefined;
	onTableSelect: (table: string) => void;
	onCreateRecord: (table: string) => void;
}

export function TablesPane({ activeTable, onTableSelect, onCreateRecord }: TablesPaneProps) {
	const { openChatCreator } = useInterfaceStore.getState();
	const [records, setRecords] = useState<unknown[]>([]);

	const toggleTablePin = useConfigStore((s) => s.toggleTablePin);
	const isLight = useIsLight();
	const [search, setSearch] = useInputState("");
	const hasAccess = useHasSchemaAccess();
	const connection = useActiveConnection();
	const isConnected = useIsConnected();
	const schema = useTables();

	const { showContextMenu } = useContextMenu();

	const isPinned = useStable((table: string) => {
		return connection.pinnedTables.includes(table);
	});
	const fetchRecords = useStable(async () => {
		const response = await executeQuery(`select * from chat`);
		if (Array.isArray(response)) {
			const data = response[0].result || [];
			console.log(data)
			if (isConnected&&data.length > 0) {
				setRecords(data);
			}

		}

	});
	useEventSubscription(RecordsChangedEvent, () => {
		fetchRecords();
	});
	useEffect(() => {
		console.log(isConnected)
		fetchRecords();
	}, [ isConnected]);
	const tablesFiltered = useMemo(() => {
		const needle = search.toLowerCase();
		console.log("===")
		const tables = search ? records.filter((table) => table.name.toLowerCase().includes(needle)) : records;

		return  tables
	}, [schema, search, connection.pinnedTables,records]);

	const togglePinned = useStable((table: string) => {
		if (table && connection) {
			toggleTablePin(table);
		}
	});

	const removeTable = useConfirmation({
		message: "You are about to remove this table and all data contained within it. This action cannot be undone.",
		confirmText: "Remove",
		onConfirm:  async (table: string) => {
			await executeQuery(`REMOVE TABLE ${tb(table)}`);
			await syncDatabaseSchema({
				tables: [table]
			});

			if (activeTable == table) {
				onTableSelect("");
			}
		}
	});

	return (
		<ContentPane
			title="聊天"
			icon={iconExplorer}
			style={{ flexShrink: 0 }}
			leftSection={
				tablesFiltered.length > 0 && (
					<Badge
						color={isLight ? "slate.0" : "slate.9"}
						radius="sm"
						c="inherit"
					>
						{tablesFiltered.length}
					</Badge>
				)
			}
			rightSection={
				<Tooltip label="New table">
					<ActionIcon
						onClick={openChatCreator}
						aria-label="Create new chat"
						disabled={!isConnected}
					>
						<Icon path={iconPlus} />
					</ActionIcon>
				</Tooltip>
			}
		>
			<Stack
				pos="absolute"
				top={0}
				left={12}
				right={12}
				bottom={12}
				gap={0}
			>
				<ScrollArea
					classNames={{
						viewport: classes.scroller
					}}
				>
					<Stack gap="xs" pb="md">
						{isConnected && schema.length > 0 && (
							<TextInput
								placeholder="Search tables..."
								leftSection={<Icon path={iconSearch} />}
								value={search}
								onChange={setSearch}
								variant="unstyled"
								autoFocus
							/>
						)}

						{isConnected ? (tablesFiltered.length === 0 && (
							<Text c="slate" ta="center" mt="lg">
								{hasAccess ? "No tables found" : "Unsupported auth mode"}
							</Text>
						)) : (
							<Text c="slate" ta="center" mt="lg">
								Not connected
							</Text>
						)}

						{tablesFiltered.map((table) => {
							const isActive = activeTable == table.name;
							const isPinned = connection.pinnedTables.includes(table.name);


							return (
								<Entry
									key={table.name}
									isActive={isActive}
									onClick={() => onTableSelect(table.name)}
									onContextMenu={showContextMenu([
										{
											key: 'open',
											title: "View table records",
											icon: <Icon path={iconTable} />,
											onClick: () => onTableSelect(table.name)
										}
									])}
									leftSection={
										<Icon path={iconRelation} />
									}
									rightSection={
										isPinned && (
											<Icon
												title="Pinned table"
												path={iconPin}
												size="sm"
											/>
										)
									}
								>
									<Text
										style={{
											textOverflow: 'ellipsis',
											overflow: 'hidden'
										}}
									>
										{table.name}
									</Text>
								</Entry>
							);
						})}
					</Stack>
				</ScrollArea>
				<Spacer />
				<Divider mb="xs" />
				<Exporter />
				<Importer />
			</Stack>
		</ContentPane>
	);
}
