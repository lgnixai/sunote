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
import Arborist from "~/views/note/TreePanel/tree/tree";
import EditTree from "~/views/note/TreePanel/tree/tree";
import Mytree from "~/views/note/TreePanel/mytree";
// import {Tree} from "react-arborist";
// import VSCodeDemoPage from "~/views/note/FunctionsPanel/tree";
// import GmailSidebar from "~/views/note/FunctionsPanel/gmail";
// import Cities from "~/views/note/FunctionsPanel/tree";

export interface FunctionsPanelProps {
	active: string;
	functions: SchemaFunction[];
	onSelect: (id: string) => void;
	onDelete: (id: string) => void;
	onDuplicate: (def: SchemaFunction) => void;
	onCreate: () => void;
}

export function TreePanel() {
	const isLight = useIsLight();
	const isConnected = useIsConnected();
	const { showContextMenu } = useContextMenu();

	const [search, setSearch] = useInputState("");


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

				</Badge>
			}
			rightSection={
				<Tooltip label="New function">
					<ActionIcon

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


				<Mytree />
			</ScrollArea>
		</ContentPane>
	);
}
