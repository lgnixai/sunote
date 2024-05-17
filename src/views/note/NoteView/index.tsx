import {Box, Button, Group, Modal, Select, Stack, Text, TextInput} from "@mantine/core";

import { ChangeEvent, useRef, useState } from "react";
import { Icon } from "~/components/Icon";
import { iconChevronRight, iconFunction, iconOpen, iconPlus } from "~/util/icons";
import { useStable } from "~/hooks/stable";
import { useDisclosure } from "@mantine/hooks";
import { ModalTitle } from "~/components/ModalTitle";
import { Form } from "~/components/Form";
import { SchemaFunction } from "~/types";
import { useImmer } from "use-immer";
import { useSchema } from "~/hooks/schema";
import { useSaveable } from "~/hooks/save";
import { buildFunctionDefinition, syncDatabaseSchema } from "~/util/schema";
import { useConfirmation } from "~/providers/Confirmation";
import { useViewEffect } from "~/hooks/view";
import { executeQuery } from "~/connection";
import { Panel, PanelGroup } from "react-resizable-panels";
import { PanelDragger } from "~/components/Pane/dragger";
import { usePanelMinSize } from "~/hooks/panels";
import { adapter } from "~/adapter";
import { Introduction } from "~/components/Introduction";
import { useIsConnected } from "~/hooks/connection";

 import {EditorProvider} from "~/views/note/EditorPanel/EditorProvider";
import NodePanel from "~/views/note/NotePanel";
 import {SiHtml5} from "react-icons/si";
import TreePanel from "~/views/note/TreePanel";
import EditorPanel from "~/views/note/EditorPanel";
import {useNoteStore} from "~/stores/note";

export function NoteView() {
	const functions = useSchema()?.functions ?? [];
	const duplicationRef = useRef<SchemaFunction | null>(null);
	//const {workSpace,setWorkSpace, editor,collection,provider } = useNoteStore.getState();
	const workSpace = useNoteStore((state) => state.workSpace)

	const [details, setDetails] = useImmer<SchemaFunction | null>(null);
	const [isCreating, isCreatingHandle] = useDisclosure();
	const [showCreator, showCreatorHandle] = useDisclosure();
	const [createName, setCreateName] = useState("");

	const isConnected = useIsConnected();
	const files=[
		{
			id: "1",
			name: "public",
			children: [
				{
					id: "c1-1",
					name: "index.html",
					icon: SiHtml5,
					iconColor: "#dc4a25"
				}
			]
		}]
	const handle = useSaveable({
		valid: !!details && details.args.every(([name, kind]) => name && kind),
		track: {
			details
		},
		onSave: async () => {
			const query = buildFunctionDefinition(details!);

			await executeQuery(query).catch(console.error);
			await syncDatabaseSchema();

			editFunction(details!.name);
		},
		onRevert({ details }) {
			setDetails(details);
		},
	});

	const updateCreateName = useStable((e: ChangeEvent<HTMLInputElement>) => {
		const name = e.target.value
			.replaceAll(/\s/g, '_')
			.replaceAll(/[^\w:]/g, '')
			.toLocaleLowerCase();

		setCreateName(name);
	});

	const openCreator = useStable(() => {
		showCreatorHandle.open();
		duplicationRef.current = null;
		setCreateName("");
	});

	const editFunction = useStable((name: string) => {
		isCreatingHandle.close();
		setDetails(functions.find((f) => f.name === name) || null);
		handle.track();
	});

	const createFunction = useStable(async () => {
		const duplication = duplicationRef.current;

		showCreatorHandle.close();
		isCreatingHandle.open();

		setDetails({
			...(duplication || {
				args: [],
				comment: "",
				block: "",
				permissions: true
			}),
			name: createName
		});

		duplicationRef.current = null;
		handle.track();
	});

	const duplicateFunction = useStable((def: SchemaFunction) => {
		showCreatorHandle.open();
		duplicationRef.current = def;
		setCreateName(def.name);
	});

	const removeFunction = useConfirmation({
		message: "You are about to remove this function. This action cannot be undone.",
		confirmText: "Remove",
		onConfirm: async (name: string) => {
			await executeQuery(`REMOVE FUNCTION fn::${name}`);
			await syncDatabaseSchema();

			setDetails(null);
			handle.track();
		},
	});

	useViewEffect("functions", () => {
		syncDatabaseSchema();
	});

	const [minSize, ref] = usePanelMinSize(300);

	return (
		<>

			<Box h="100%" ref={ref}>
				<PanelGroup direction="horizontal">
					<Panel
						defaultSize={minSize}
						minSize={minSize}
						maxSize={35}
					>


						<TreePanel />
					</Panel>
					<PanelDragger />
					<Panel minSize={minSize}>

						 <EditorPanel />
					</Panel>
				</PanelGroup>
			</Box>



		</>
	);
}
