import classes from "./style.module.scss";
import {ActionIcon, Box, Button, Center, Divider, Group, Menu, Pagination, Stack, Text, Tooltip} from "@mantine/core";
import {useIsLight} from "~/hooks/theme";
import {useState} from "react";
import {useLayoutEffect} from "react";
import {Icon} from "~/components/Icon";
import {ContentPane} from "~/components/Pane";
import {DataTable} from "~/components/DataTable";
import {RESULT_MODES} from "~/constants";
import {CombinedJsonPreview, LivePreview, SingleJsonPreview} from "./preview";
import {useConfigStore} from "~/stores/config";
import {useInterfaceStore} from "~/stores/interface";
import {QueryResponse, ResultMode, TabQuery} from "~/types";
import {useStable} from "~/hooks/stable";
import {iconBroadcastOff, iconCursor, iconQuery, iconUpload} from "~/util/icons";
import {SelectionRange} from "@codemirror/state";
import {cancelLiveQueries} from "~/connection";
import {useDatabaseStore} from "~/stores/database";
import {adapter, isMini} from "~/adapter";
import {syncDatabaseSchema} from "~/util/schema";
import posthog from "posthog-js";

function computeRowCount(response: QueryResponse) {
	if (!response) {
		return 0;
	}

	// We can count an array, otherwise it's always 1 result (unless there is an error, in which case there is no result :D)
	if (Array.isArray(response.result)) {
		return response.result.length;
	}

	return response.success ? 1 : 0;
}

export interface ResultPaneProps {
	activeTab: TabQuery;
	isQueryValid: boolean;
	selection: SelectionRange | undefined;
	onRunQuery: () => void;
}

export function ResultPane({
							   activeTab,
							   isQueryValid,
							   selection,
							   onRunQuery,
						   }: ResultPaneProps) {
	const {updateQueryTab} = useConfigStore.getState();

	const liveTabs = useInterfaceStore((s) => s.liveTabs);
	const responseMap = useDatabaseStore((s) => s.responses);

	const isLight = useIsLight();
	const [resultTab, setResultTab] = useState<number>(1);
	const resultMode = activeTab.resultMode;
	const responses = responseMap[activeTab.id] || [];
	const activeResponse = responses[resultTab - 1];

	const responseCount = responses.length;
	const rowCount = computeRowCount(activeResponse);

	const showCombined = resultMode == 'combined' || resultMode == "live";
	const showTabs = !showCombined && responses.length > 1;
	const showResponses = showCombined && responseCount > 0;
	const showTime = !showCombined && !!activeResponse?.execution_time;

	const isLive = liveTabs.has(activeTab.id);

	const cancelQueries = useStable(() => {
		cancelLiveQueries(activeTab.id);
	});

	const setResultMode = (mode: ResultMode) => {
		updateQueryTab({
			id: activeTab.id,
			resultMode: mode
		});
	};

	useLayoutEffect(() => {
		setResultTab(1);
	}, [responses.length]);

	const activeMode = RESULT_MODES.find(r => r.value == resultMode)!;
	const hasSelection = selection?.empty === false;

	const statusText = (showResponses
		? `${responseCount} ${responseCount == 1 ? 'response' : 'responses'}`
		: `${rowCount} ${rowCount == 1 ? 'result' : 'results'} ${showTime ? ` in ${activeResponse.execution_time}` : ''}`);

	const panelTitle = resultMode == 'combined'
		? 'Results'
		: resultMode == 'live'
			? "Live Messages"
			: showTabs
				? `Result #${resultTab}`
				: "Result";


	const SURML_FILTERS = [
		{
			name: "SurrealML Model",
			extensions: ["doc", "txt","pdf"],
		},
	];
	const onUpload = useStable(async () => {

		const formData = new FormData();
		formData.append('title', "leven");

		const files = await adapter.openBinaryFile("Select a SurrealML model", SURML_FILTERS, false);
 		const endpoint="http://0.0.0.0:9877/app/v1/knowledge"
		for (const file of files) {
			console.log(file)
			const formData = new FormData();
			formData.append('file', file.content);
			await fetch(endpoint, {
				method: "POST",

				body: formData
			});
		}


	});


	const [selectedFile, setSelectedFile] = useState(null);
	const [name, setName] = useState('');

	const handleFileChange = (event) => {
		setSelectedFile(event.target.files[0]);
	};

	const handleNameChange = (event) => {
		setName(event.target.value);
	};

	const handleUpload = () => {
		const formData = new FormData();
		formData.append('file', selectedFile);
		formData.append('title', name);

		fetch('http://0.0.0.0:9877/app/v1/knowledge', {
			method: 'POST',
			body: formData
		})
			.then(response => {
				if (response.ok) {
					console.log('File uploaded successfully');
				} else {
					console.error('Failed to upload file');
				}
			})
			.catch(error => {
				console.error('Error uploading file:', error);
			});
	};
	return (
		<ContentPane
			title={panelTitle}
			icon={iconQuery}
			rightSection={
				<Group align="center" wrap="nowrap" className={classes.controls}>

					<Tooltip label="Upload SurrealML Model">
						<ActionIcon
							onClick={onUpload}
							aria-label="Upload SurrealML model"

						>
							<Icon path={iconUpload} />
						</ActionIcon>
					</Tooltip>

					<Button
						size="xs"
						radius="xs"
						onClick={onRunQuery}
						color={isQueryValid ? "surreal" : "pink.9"}
						variant={isQueryValid ? "gradient" : "filled"}
						style={{border: "none"}}
						className={classes.run}
						rightSection={
							<Icon path={iconCursor}/>
						}
					>
						Run {hasSelection ? 'selection' : 'query'}
					</Button>
				</Group>
			}
		>
			{(resultMode == "live") ? (
				<LivePreview
					query={activeTab}
					isLive={isLive}
				/>
			) : activeResponse ? (
				<>
					{resultMode == "combined" ? (
						<CombinedJsonPreview results={responses}/>
					) : activeResponse.success ? (activeResponse.result?.length === 0 ? (
						<Text c="slate" flex={1}>
							No results found for query
						</Text>
					) : resultMode == "table" ? (
						<Box
							mih={0}
							flex={1}
							pos="relative"
						>
							<DataTable data={activeResponse.result}/>
						</Box>
					) : (
						<SingleJsonPreview result={activeResponse.result}/>
					)) : (
						<Text c="red" ff="mono" style={{whiteSpace: "pre-wrap"}}>
							{activeResponse.result}
						</Text>
					)}
				</>
			) : (
				<Center h="100%" c="slate">
					<Stack>
						<Icon
							path={iconQuery}
							mx="auto"
							size="lg"
						/>
						<div>
							<input type="file" onChange={handleFileChange}/>
							<input type="text" value={name} onChange={handleNameChange}/>
							<button onClick={handleUpload}>Upload</button>
						</div>
					</Stack>
				</Center>
			)}

			{showTabs && (
				<Stack gap="xs" align="center">
					<Divider w="100%"/>
					<Pagination total={responses.length} value={resultTab} onChange={setResultTab}/>
				</Stack>
			)}
		</ContentPane>
	);
}
