import classes from "./style.module.scss";
import surrealistIcon from "~/assets/images/logo.png";
import posthog from "posthog-js";
import { QueryPane } from "../QueryPane";
import { ResultPane } from "../ResultPane";
import { VariablesPane } from "../VariablesPane";
import { TabsPane } from "../TabsPane";
import { useDisclosure, useInputState } from "@mantine/hooks";
import { useState } from "react";
import { HistoryDrawer } from "../HistoryDrawer";
import { adapter, isMini } from "~/adapter";
import { Box, Button, Group, Modal, SegmentedControl, Stack, TagsInput, Text, TextInput, Textarea } from "@mantine/core";
import { Spacer } from "~/components/Spacer";
import { Image } from "@mantine/core";
import { PanelGroup, Panel } from "react-resizable-panels";
import { PanelDragger } from "~/components/Pane/dragger";
import { SavesDrawer } from "../SavesDrawer";
import { Form } from "~/components/Form";
import { Icon } from "~/components/Icon";
import { ON_FOCUS_SELECT, newId } from "~/util/helpers";
import { useActiveQuery, useSavedQueryTags } from "~/hooks/connection";
import { useStable } from "~/hooks/stable";
import { useConfigStore } from "~/stores/config";
import { SavedQuery } from "~/types";
import { ModalTitle } from "~/components/ModalTitle";
import { iconCheck } from "~/util/icons";
import { SurrealistLogo } from "~/components/SurrealistLogo";
import { useIsLight } from "~/hooks/theme";
import { MiniAdapter } from "~/adapter/mini";
import { useBoolean } from "~/hooks/boolean";
import { InPortal, createHtmlPortalNode } from "react-reverse-portal";
import { SelectionRange } from "@codemirror/state";
import { useIntent } from "~/hooks/url";
import { executeUserQuery } from "~/connection";
import { useSetting } from "~/hooks/config";
import { useCompatHotkeys } from "~/hooks/hotkey";
import { usePanelMinSize } from "~/hooks/panels";

const switchPortal = createHtmlPortalNode();

export function KnowledgeView() {
	const { saveQuery } = useConfigStore.getState();
	const isLight = useIsLight();

	const [orientation] = useSetting("appearance", "queryOrientation");
	const [showVariables, showVariablesHandle] = useBoolean();
	const [variablesValid, setVariablesValid] = useState(true);
	const [queryValid, setQueryValid] = useState(true);

	const [showHistory, showHistoryHandle] = useDisclosure();
	const [showSaved, showSavedHandle] = useDisclosure();

	const [selection, setSelection] = useState<SelectionRange>();

	const tags = useSavedQueryTags();
	const active = useActiveQuery();

	const [isSaving, isSavingHandle] = useDisclosure();
	const [editingId, setEditingId] = useState("");
	const [saveName, setSaveName] = useInputState("");
	const [saveContent, setSaveContent] = useInputState("");
	const [saveTags, setSaveTags] = useInputState<string[]>([]);

	const handleSaveRequest = useStable(async () => {
		if (!active) {
			return;
		}

		setEditingId("");
		setSaveTags([]);
		setSaveName(active.name);
		setSaveContent(active.query);
		isSavingHandle.open();
	});

	const handleEditRequest = useStable(async (entry: SavedQuery) => {
		if (!active) {
			return;
		}

		setEditingId(entry.id);
		setSaveTags(entry.tags);
		setSaveName(entry.name);
		setSaveContent(entry.query);
		isSavingHandle.open();
	});

	const handleSaveQuery = useStable(async () => {
		if (!active || !saveName) {
			return;
		}

		saveQuery({
			id: editingId || newId(),
			name: saveName,
			query: saveContent,
			tags: saveTags
		});

		isSavingHandle.close();

		posthog.capture('query_save');
	});

	const runQuery = useStable(() => {
		if (!active) return;

		executeUserQuery({
			override: selection?.empty === false
				? active.query.slice(selection.from, selection.to)
				: undefined
		});
	});

	const variablesOrientation = orientation === "horizontal"
		? "vertical"
		: "horizontal";

	useIntent("open-saved-queries", showSavedHandle.open);
	useIntent("open-query-history", showHistoryHandle.open);
	useIntent("run-query", runQuery);
	useIntent("save-query", handleSaveRequest);
	useIntent("toggle-variables", showVariablesHandle.toggle);

	useCompatHotkeys([
		["F9", () => runQuery()],
		["mod+Enter", () => runQuery()],
	]);

	const [minSize, ref] = usePanelMinSize(275);

	const queryEditor = (
		active && (

				<ResultPane
					activeTab={active}
					isQueryValid={queryValid}
					selection={selection}
					onRunQuery={runQuery}
				/>

		)
	);

	return (
		<Stack
			gap="md"
			h="100%"
		>


				<Box flex={1} ref={ref}>
					<PanelGroup direction="horizontal">

						<Panel>
							{queryEditor}
						</Panel>
					</PanelGroup>
				</Box>



		</Stack>
	);
}
