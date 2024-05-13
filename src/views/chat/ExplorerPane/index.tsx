import {
	ActionIcon,
	Box,
	Button,
	Center, Container,
	Divider,
	Group,
	ScrollArea,
	Select,
	Text,
	Textarea,
	TextInput,
	Tooltip
} from "@mantine/core";
import {   CSSProperties } from 'react';

import { useDebouncedValue, useInputState } from "@mantine/hooks";
import { FocusEvent, KeyboardEvent, MouseEvent, useEffect, useMemo, useState } from "react";
import { DataTable } from "~/components/DataTable";
import { Icon } from "~/components/Icon";
import { ContentPane } from "~/components/Pane";
import { useStable } from "~/hooks/stable";
import { useEventSubscription } from "~/hooks/event";
import { useSchema } from "~/hooks/schema";
import { themeColor } from "~/util/mantine";
import { iconChevronLeft, iconChevronRight, iconClose, iconCopy, iconDelete, iconFilter, iconPlus, iconQuery, iconRefresh, iconServer, iconTable, iconWrench } from "~/util/icons";
import { useContextMenu } from "mantine-contextmenu";
import { useConfigStore } from "~/stores/config";
import { RecordsChangedEvent } from "~/util/global-events";
import { executeQuery } from "~/connection";
import { formatValue, validateWhere } from "~/util/surrealql";
import { RecordId } from "surrealdb.js";
import { tb } from "~/util/helpers";
import Messages from "~/views/chat/ExplorerPane/messages";
import MessageBar from "~/views/chat/ExplorerPane/send";

export interface ExplorerPaneProps {
	activeTable: string;
	onCreateRecord: () => void;
}

export function ExplorerPane({ activeTable, onCreateRecord }: ExplorerPaneProps) {
	const { addQueryTab, setActiveView } = useConfigStore.getState();
	const { showContextMenu } = useContextMenu();

	const schema = useSchema();

	const [records, setRecords] = useState<unknown[]>([]);
	const [recordCount, setRecordCount] = useState(0);

	const fetchRecords = useStable(async () => {
		if (!activeTable) {
			setRecords([]);
			setRecordCount(0);
			return;
		}
		//console.log(activeTable)

		const response = await executeQuery(`select  <string>model,name from  chat where name="${activeTable}" `);
		console.log(response)
		const rs = response[0].result?.[0] ;
		const data={
			model:rs['<string> model'],
			name:rs.name
		}
		console.log(data)
		setRecords(data);



	});

	useEffect(() => {
		fetchRecords();
	}, [activeTable ]);

	// useEventSubscription(RecordsChangedEvent, () => {
	// 	fetchRecords();
	// });


	const openCreator = useStable(() => {
		onCreateRecord();
	});

	// const openRecordQuery = (id: RecordId, prefix: string) => {
	// 	setActiveView("query");
	// 	addQueryTab({
	// 		query: `${prefix} ${formatValue(id)}`
	// 	});
	// };
	const [value, setValue] = useState('');



	const [history, setHistory] = useState<{ type: 'server' | 'user'; prompt: string; timestamp: number }[]>([]);
	const [context, setContext] = useState([]);
	const [prompt, setPrompt] = useState('');
	const [system, setSystem] = useState('You are a helpful assistant.');
	const [loading, setLoading] = useState(false);
	const [feedback, setFeedback] = useState<{ [key: number]: 'up' | 'down' }>({});
	const [editableIndex, setEditableIndex] = useState<number | null>(null);
	const [editableText, setEditableText] = useState('');
	const [selectedTag, setSelectedTag] = useState('');
	const [tags, setTags] = useState<{name: string}[]>([]);

	const handleCancel = () => {
		if (editableIndex !== null) {
			setEditableText(history[editableIndex]?.prompt || '');
			setEditableIndex(null);
		}
	};

	const handleFeedback = (index: number, type: 'up' | 'down') => {
		setFeedback({
			...feedback,
			[index]: type,
		});

		if (type === 'down') {
			setEditableIndex(index);
			setEditableText(history[index]?.prompt || '');
		}
	};

	const handleSave = () => {
		if (editableIndex !== null) {
			const updatedHistory = [...history];
			updatedHistory[editableIndex].prompt = editableText;
			setHistory(updatedHistory);
			setEditableIndex(null);
		}
	};

	const sendPrompt = async () => {
		setLoading(true);

		let tempHistory = [...history, { prompt: "", type: 'server' as 'server', timestamp: Date.now() }];

		setHistory(tempHistory);
		const tempIndex = tempHistory.length - 1;

		const requestOptions = {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				model: records.model,
				prompt,
				system,
				template: '',
				context,
				options: { temperature: 0.8 }
			})
		};

		const response = await fetch('http://127.0.0.1:11434/api/generate', requestOptions);
		const reader = response.body?.getReader();

		if (reader) {
			let serverResponse = '';

			while (true) {
				const { value, done } = await reader.read();
				if (done) {
					setLoading(false);
					break;
				}

				const decodedValue = new TextDecoder('utf-8').decode(value);

				try {
					const { response, done, context } = JSON.parse(decodedValue);

					if (response) {
						serverResponse += response;
						tempHistory[tempIndex].prompt = serverResponse;
						setHistory([...tempHistory]);
					}

					if (done) {
						setContext(context);
					}
				} catch (e) {
					console.error(e);
				}
			}
		}
	};


	useEffect(() => {
		fetch('http://127.0.0.1:11434/api/tags')
			.then((response) => response.json())
			.then((data: {models: any[]}) => {
				setTags(data.models);
			});
	}, []);

	useEffect(() => {
		// if latest message is from the user, call sendPrompt
		if (history.length > 0 && history[history.length - 1].type === 'user') {
			sendPrompt();
		}
	}, [history, sendPrompt]);

	return (
		<Container style={styles}>
			<Messages
			  allMsgs={history}
			// isFetchingNextPage={isFetchingNextPage}
			// refetch={refetch}
			  fetchNextPage={fetchRecords}
		 allMsgs={history}/>
			<MessageBar   />


		</Container>
	);
}
const styles: CSSProperties = {
	width: '100%',
	height: '100%',
	display: 'flex',
	flexDirection: 'column',
	justifyContent: 'space-between',
	marginTop: '10px',
	padding: '0px',
	borderRadius: '5px',
	boxShadow: 'rgba(0, 0, 0, 0.35) 0px 5px 15px',
	backgroundColor: '#d0d5d7',
};

const loaderStyle: CSSProperties = {
	display: 'block',
	margin: 'auto',
};
