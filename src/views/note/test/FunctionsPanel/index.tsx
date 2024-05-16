import classes from "./style.module.scss";
import { Badge, Tooltip, ActionIcon, TextInput, ScrollArea, Stack, Text } from "@mantine/core";
import { Entry } from "~/components/Entry";
import { Icon } from "~/components/Icon";
import { ContentPane } from "~/components/Pane";
import { useIsLight } from "~/hooks/theme";
import { iconCopy, iconDelete, iconFunction, iconPlus, iconSearch } from "~/util/icons";
import { SchemaFunction } from "~/types";
import { useInputState } from "@mantine/hooks";
import { useContextMenu } from "mantine-contextmenu";
import { useMemo } from "react";
import { useIsConnected } from "~/hooks/connection";
 import "./tree.scss"
// import {Tree} from "react-arborist";
// import VSCodeDemoPage from "~/views/note/FunctionsPanel/tree";
// import GmailSidebar from "~/views/note/FunctionsPanel/gmail";
// import Cities from "~/views/note/FunctionsPanel/tree";
import Arborist from "~/views/note/FunctionsPanel/tree/tree";

export interface FunctionsPanelProps {
	active: string;
	functions: SchemaFunction[];
	onSelect: (id: string) => void;
	onDelete: (id: string) => void;
	onDuplicate: (def: SchemaFunction) => void;
	onCreate: () => void;
}

export function FunctionsPanel({
	active,
	functions,
	onSelect,
	onDelete,
	onDuplicate,
	onCreate,
}: FunctionsPanelProps) {
	const isLight = useIsLight();
	const isConnected = useIsConnected();
	const { showContextMenu } = useContextMenu();

	const [search, setSearch] = useInputState("");

	const filtered = useMemo(() => {
		const needle = search.toLowerCase();

		return functions.filter((f) => f.name.toLowerCase().includes(needle));
	}, [functions, search]);
	const data = [
		{ id: "1", name: "Unread" },
		{ id: "2", name: "Threads" },
		{
			id: "3",
			name: "Chat Rooms",
			children: [
				{ id: "c1", name: "General" },
				{ id: "c2", name: "Random" },
				{ id: "c3", name: "Open Source Projects" },
			],
		},
		{
			id: "4",
			name: "Direct Messages",
			children: [
				{ id: "d1", name: "Alice" },
				{ id: "d2", name: "Bob" },
				{ id: "d3", name: "Charlie" },
			],
		},
	];


	return (
		<ContentPane
			title="Functions"
			icon={iconFunction}
			style={{ flexShrink: 0 }}
			leftSection={
				<Badge
					color={isLight ? "slate.0" : "slate.9"}
					radius="sm"
					c="inherit"
				>
					{functions.length}
				</Badge>
			}
			rightSection={
				<Tooltip label="New function">
					<ActionIcon
						onClick={onCreate}
						aria-label="Create new function"
						disabled={!isConnected}
					>
						<Icon path={iconPlus} />
					</ActionIcon>
				</Tooltip>
			}
		>
			<ScrollArea
				pos="absolute"
				top={0}
				left={12}
				right={12}
				bottom={12}
				classNames={{
					viewport: classes.scroller
				}}
			>
				{/*<Tree initialData={data} />;*/}


				<Arborist/>
			</ScrollArea>
		</ContentPane>
	);
}
