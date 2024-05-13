import {
	ActionIcon,
	Box,
	Button,
	Center, Container,
	Divider, Flex,
	Group,
	ScrollArea,
	Select, SimpleGrid,
	Text,
	Textarea,
	TextInput,
	Tooltip
} from "@mantine/core";
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
import {findLast} from "lodash";
import {AiOutlineSend} from "react-icons/ai";
import {useSharedThinking} from "~/views/chat/ChatPane/useSharedThinking";

export interface ExplorerPaneProps {
	activeTable: string;
	onCreateRecord: () => void;
}

export function ChatPane({ activeTable, onCreateRecord }: ExplorerPaneProps) {
	const { addQueryTab, setActiveView } = useConfigStore.getState();
	const { showContextMenu } = useContextMenu();

	const schema = useSchema();

	const [records, setRecords] = useState<unknown[]>([]);
	const [recordCount, setRecordCount] = useState(0);
	const [content, setContent] = useState('')
	const [messages, setMessages] = useState('')

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
	//获取聊天室内容
	const getMessages = useStable(async () => {
		if (!activeTable) {

			return;
		}


		const response = await executeQuery(`select  * from  messages where chatId="${records.id}" `);
		console.log(response)
		const rs = response[0].result?.[0] ;
		setMessages(rs)
		//return rs
		// const data={
		// 	model:rs['<string> model'],
		// 	name:rs.name
		// }
		// console.log(data)
		// setRecords(data);



	});



	useEffect(() => {
		fetchRecords();
		getMessages()
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
	const {
		opened: submitting,
		setOpenThinking,
		setCloseThinking,
	} = useSharedThinking()


	const submit=async ()=>{
		setHistory(prevHistory => [...prevHistory, { prompt, type: 'user', timestamp: Date.now() }])

	}
	return (
		<ContentPane
			title="Ai对话"
			icon={iconTable}

		>

			<ScrollArea
				style={{
					position: "absolute",
					inset: 12,
					top: 0,
					bottom: 100,
					transition: "top .1s",
					border:"1px solid gray"
				}}
			>
				{history.map((item, index) => (
					<div key={index} className={`message ${item.type}`}>
						<strong>{`${item.type.toUpperCase()} ${new Date(item.timestamp).toLocaleString()}`}</strong>:
						{editableIndex === index ? null : item.prompt}
						{editableIndex === index ? (
							<textarea
								className="textarea-editable"
								value={editableText}
								onChange={(e) => setEditableText(e.target.value)}
							/>
						) : null}
						{item.type === 'server' && (
							<div className="feedback-icons">
								{editableIndex === index && (
									<>
										<button className="saveBtn" onClick={handleSave}>Save</button>
										<button className="cancelBtn" onClick={handleCancel}>Cancel</button>
									</>
								)}
								<span><button className={`${feedback[index] === 'up' ? 'selected' :''}`} onClick={() => handleFeedback(index, 'up')}>👍</button>
                    <button className={`${feedback[index] === 'down' ? 'selected' :''}`} onClick={() => handleFeedback(index, 'down')}>👎</button>
                  </span>

							</div>
						)}
					</div>
				))}
			</ScrollArea>
			<Group

				justify="center"
				style={{
					position: "absolute",
					insetInline: 12,
					bottom: 12,
					width:'100%',

				}}
			>
			<Container style={{width:"100%"}}>

				<Flex gap="sm">
					<Textarea style={{width:"100%"}}
						key={activeTable}
						sx={{flex: 1}}
						placeholder="Your message here..."
						autosize
						autoFocus
						disabled={submitting}
						minRows={1}
						maxRows={5}
						value={content}
						onChange={(event) => setContent(event.currentTarget.value)}
						onKeyDown={async (event) => {
							if (event.code === 'Enter' && !event.shiftKey) {
								event.preventDefault()
								submit()
							}
							if (event.code === 'ArrowUp') {
								event.preventDefault()
								const nextUserMessage = findLast(
									history,
									(message) => message.role === 'user'
								)
								setContent(nextUserMessage?.content ?? '')
							}
							if (event.code === 'ArrowDown') {
								event.preventDefault()
								const lastUserMessage = findLast(
									history,
									(message) => message.role === 'user'
								)
								if (lastUserMessage?.content === content) {
									setContent('')
								}
							}
						}}
					/>
					<Button h="auto" onClick={submit}>
						<AiOutlineSend />
					</Button>
				</Flex>
			</Container>



				{/*<Textarea*/}
				{/*	value={prompt}*/}
				{/*	onChange={(event) => setPrompt(event.currentTarget.value)}*/}
				{/*/>*/}
				{/*{records.model}*/}
				{/*<Button variant="default" disabled={loading}*/}
				{/*		onClick={async () => {*/}
				{/*			setHistory(prevHistory => [...prevHistory, { prompt, type: 'user', timestamp: Date.now() }])*/}
				{/*		}}>提交</Button>*/}

			</Group>



		</ContentPane>
	);
}
