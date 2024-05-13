import {
	ActionIcon, Badge,
	Box,
	Button,
	Center, Container,
	Divider, Flex,
	Group, Menu,
	ScrollArea,
	Select, SimpleGrid, Stack,
	Text,
	Textarea,
	TextInput,
	Tooltip
} from "@mantine/core";
import {useDebouncedValue, useInputState} from "@mantine/hooks";
import React, {FocusEvent, KeyboardEvent, MouseEvent, useEffect, useMemo, useState} from "react";
import {DataTable} from "~/components/DataTable";
import {Icon} from "~/components/Icon";
import {ContentPane} from "~/components/Pane";
import {useStable} from "~/hooks/stable";
import {useEventSubscription} from "~/hooks/event";
import {useSchema} from "~/hooks/schema";
import {themeColor} from "~/util/mantine";
import {ModelFusionTextStream, asChatMessages} from "@modelfusion/vercel-ai";
import {Message, StreamingTextResponse} from "ai";
import {ollama, streamText} from "modelfusion";
import {
	iconBroadcastOff,
	iconChevronLeft,
	iconChevronRight,
	iconClose,
	iconCopy, iconCursor,
	iconDelete, iconDollar,
	iconFilter,
	iconPlus,
	iconQuery,
	iconRefresh,
	iconServer, iconStar,
	iconTable, iconText,
	iconWrench
} from "~/util/icons";
import {useContextMenu} from "mantine-contextmenu";
import {useConfigStore} from "~/stores/config";
import {RecordsChangedEvent} from "~/util/global-events";
import {executeQuery, getDb} from "~/connection";
import {formatValue, validateWhere} from "~/util/surrealql";
import {RecordId, Table} from "surrealdb.js";
import {tb} from "~/util/helpers";
import {findLast} from "lodash";
import {AiOutlineSend} from "react-icons/ai";
import {useSharedThinking} from "~/views/chat/ChatPane/useSharedThinking";
import {useLiveQuery} from "dexie-react-hooks";
import {notifications} from "@mantine/notifications";
import {ChatMessage, useChatCompletion} from "./useChatCompletion";
import {ChatRole, MessageEntity, WChatMessage} from "~/db";
import {MessageItem} from "./components/MessageItem";
import {nanoid} from "nanoid";
import "./style.scss"
import classes from "~/views/query/ResultPane/style.module.scss";
import {isMini} from "~/adapter";
import {RESULT_MODES} from "~/constants";
import {OutPortal} from "react-reverse-portal";
import {HoverIcon} from "~/components/HoverIcon";
import autoFixAnim from "~/assets/animation/autofix.json";
import {IconTrashOff} from '@tabler/icons-react';
import {FetchStream} from "~/views/chat/ChatPane/fetch";

export interface ChatPaneProps {
	activeTable: string;
	onCreateRecord: () => void;
}

export function ChatPane({activeTable, onCreateRecord}: ChatPaneProps) {
	const {addQueryTab, setActiveView} = useConfigStore.getState();
	const {showContextMenu} = useContextMenu();
	const db = getDb();
	const schema = useSchema();
	const uMessage = new Map<string, boolean>();
	const scrollAreaRef = React.useRef<HTMLDivElement | null>(null)

	const [records, setRecords] = useState<unknown[]>([]);
	const [recordCount, setRecordCount] = useState(0);

	const [messages, setMessages] = useState<[]>([]);

	const [chatId, setChatId] = useState<string>();
	const chatCompletion = useChatCompletion(records.model)
	const scrollToBottom = () => {
		if (scrollAreaRef.current) {
			console.log("Scrolling to bottom")
			const scrollElement = scrollAreaRef.current
			console.log(scrollElement.scrollHeight, scrollElement.clientHeight)
			scrollElement.scrollTo({
				top: scrollElement.scrollHeight,
				behavior: "smooth",
			})
		}
	}
	const fetchRecords = useStable(async () => {


		if (!activeTable) {
			setRecords([]);
			setRecordCount(0);
			return;
		}
		//console.log(activeTable)

		const response = await executeQuery(`select id, <string>model,name from  chat where name="${activeTable}" `);
		console.log(response)
		const rs = response[0].result?.[0];
		const data = {
			model: rs['<string> model'],
			name: rs.name
		}
		console.log(rs?.id.toJSON().id)
		setRecords(data);
		setChatId(rs?.id.toJSON().id)

		uMessage.clear()
		messages.length = 0
		setMessages([])

		console.log(`select id, <string>model,name from  chat where name="${activeTable}" `)
		console.log(messages.join(','))
		getMessages(rs?.id.toJSON().id);
		setTimeout(()=>{
			scrollToBottom()
		},100)

	});
	useEffect(() => {
		fetchRecords();

	}, [activeTable]);

	const test = useStable(async (id, content) => {
		console.log(333)
		let updated = await db.merge(new RecordId('messages', id), {
			content: content,
		});
		console.log(updated)

	});
	const CallAi = useStable(async () => {
		const textStream = await streamText({
			model: ollama.CompletionTextGenerator({model: "qwen:7b"}).withChatPrompt(),
			prompt: {
				system:
					"You are an AI chat bot. " +
					"Follow the user's instructions carefully.",

				// map Vercel AI SDK Message to ModelFusion ChatMessage:
				messages: asChatMessages([{
					role: "user",
					content: "河南是一个什么样的地方",
					id: ""
				}]),
			},
		});

		// Return the result using the Vercel AI SDK:
		return new StreamingTextResponse(
			ModelFusionTextStream(
				textStream,
				// optional callbacks:
				{
					onStart() {
						console.log("onStart");
					},
					onToken(token) {
						console.log("onToken", token);
					},
					onCompletion: () => {
						console.log("onCompletion");
					},
					onText: (text) => {
						console.log(text)
					},
					onFinal(completion) {
						console.log("onFinal", completion);
					},
				}
			)
		);

	})
	useEffect(() => {
		//CallAi()
	}, [activeTable]);

	//获取聊天室内容
	const getMessages = useStable(async (cid) => {
		if (!activeTable) {
			return;
		}
		//console.log(`select  * from  messages where chatId="${cid}" `)

		const response = await executeQuery(`select  * from  messages where chatId="${cid}" order by createdAt asc `);
		const rs = response[0].result;
		console.log("rs", rs)
		setMessages(rs)

	});


	// const Live = useStable(async () => {
	//
	// 	await db.live("messages", async (action, result) => {
	//
	// 		if (action == "CREATE") {
	// 			  //getMessages(chatId)
	// 			const id = result.id.toJSON().id
	// 			//console.log(result)
	//
	// 			if (uMessage.get(id) == undefined) {
	// 				console.log("fuck1",messages.length)
	// 				 //messages.push(result)
	// 				// console.log("fuck2",messages.length)
	// 				 // setMessages(messages)
	// 				// console.log("fuck3",messages.length)
	//
	// 				uMessage.set(id, true)
	// 			} else {
	// 				console.log("live ya", action, result, uMessage.get(id))
	//
	//
	// 			}
	// 		}
	// 		if (action == "DELETE") {
	//
	// 			const response = await executeQuery(`select  * from  messages where chatId="${chatId}"  `);
	// 			const rs = response[0].result;
	// 			//console.log("rs", rs)
	//
	// 			setMessages(rs)
	//
	// 		}
	// 		if (action == "UPDATE") {
	// 			// console.log("1111", result.content)
	// 			//messages[messages.length-1].content=result.content
	// 			const id = new Table("messages")
	//
	// 			const createMessage: WChatMessage = {
	// 				id: id,
	// 				content: result.content,
	// 				role: ChatRole.ASSISTANT,
	// 				chatId: chatId,
	// 				createdAt: Date.now(),
	//
	// 			}
	// 			messages[messages.length - 1] = createMessage
	//
	// 		}
	// 	})
	// })
	// useEffect(async () => {
	//
	// 	await db.live("messages", async (action, result) => {
	//
	// 		if (action == "CREATE") {
	// 			//getMessages(chatId)
	// 			// const id = result.id.toJSON().id
	// 			// //console.log(result)
	// 			//
	// 			// if (uMessage.get(id) == undefined) {
	// 			// 	console.log("fuck1",messages.length)
	// 			// 	  messages.push(result)
	// 			// 	// console.log("fuck2",messages.length)
	// 			// 	 // setMessages(messages)
	// 			// 	// console.log("fuck3",messages.length)
	// 			//
	// 			// 	uMessage.set(id, true)
	// 			// } else {
	// 			// 	console.log("live ya", action, result, uMessage.get(id))
	// 			//
	// 			//
	// 			// }
	// 		}
	// 		if (action == "DELETE") {
	// 			console.log("delete", messages.length)
	// 			const response = await executeQuery(`select  * from  messages where chatId="${chatId}"  `);
	// 			const rs = response[0].result;
	// 			//console.log("rs", rs)
	//
	// 			setMessages(rs)
	//
	// 		}
	// 		if (action == "UPDATE") {
	// 			// console.log("1111", result.content)
	// 			//messages[messages.length-1].content=result.content
	//
	//
	// 		}
	// 	})
	//
	//
	// }, []);


	const [content, setContent] = useState('')
	const {
		opened: submitting,
		setOpenThinking,
		setCloseThinking,
	} = useSharedThinking()

	// const chat = useLiveQuery(async () => {
	// 	if (!chatId) return null
	// 	return db.chats.get(chatId)
	// }, [chatId])
	const onClearMessages = async () => {
		messages.length = 0
		setMessages([])

		const response = await executeQuery(`delete      messages where chatId="${chatId}"  `);
		const rs = response[0].result;
		console.log("clear ok")
		console.log(messages)
	}


	const submit = async () => {


		if (submitting) return

		if (!chatId) {
			notifications.show({
				title: 'Error',
				color: 'red',
				message: 'chatId is not defined. Please create a chat to get started.',
			})
			return
		}


		try {
			setOpenThinking()

			const id = new Table("messages");


			// console.log(`CREATE $id CONTENT $content`)
			// return
			const createMessage: WChatMessage = {
				content: content,
				role: ChatRole.USER,
				chatId: chatId,
				createdAt: Date.now(),

			}
			let created = await db.create("messages", createMessage)
			let tempMessage = [...messages, created[0]]

			console.log("temp length", tempMessage.length)
			setMessages(tempMessage)
			console.log("messages length", messages.length)
			setContent('')
			const getSystemMessage = () => {
				const message: string[] = []

				if (message.length === 0)
					message.push('You are ChatGPT, a large language model trained by OpenAI. please use Chinese talk')
				return message.join(' ')
			}
			const messagesSending = await chatCompletion.makeMessagesSendingRequest({
				chatId,
				systemContent: getSystemMessage(),
			})


			const newAssista: WChatMessage = {
				content: "",
				role: ChatRole.ASSISTANT,
				chatId: chatId,
				createdAt: Date.now(),

			}
			const newc = await db.create("messages", newAssista)
			console.log(newc)
			let history = [...tempMessage, newc[0]]
			console.log("tempMessage1 length", history.length)

			setMessages(history)
			const tempIndex = history.length - 1;

			console.log('message 2', messages.length)

			const newcid = newc[0].id.toJSON().id

			chatCompletion.send(messagesSending, records.model, async (chatMessage: ChatMessage, done: boolean) => {
				// console.log("newc.id.toJSON().id", messagesSending)
				// console.log()
				// let updated = await db.update(new RecordId('messages', newcid), {
				// 	content: chatMessage.content,
				// 	role: ChatRole.ASSISTANT,
				// 	chatId: chatId,
				// 	createdAt: Date.now(),
				// });

				const id = new RecordId('messages', newcid)

				const updateMessage: WChatMessage = {
					id: newcid,
					content: chatMessage.content,
					role: ChatRole.ASSISTANT,
					chatId: chatId,
					createdAt: Date.now(),
					repliedId: 0
				}
				history[tempIndex].content = chatMessage.content;
				console.log(chatMessage, done)
				setMessages([...history]);
				scrollToBottom()
				if (done) {
					test(newcid, chatMessage.content)
				}
				///messages[messages.length - 1] = updateMessage
				// messages[messages.length - 1].content = chatMessage.content
				// console.log("===", messages[messages.length - 1], chatMessage.content)


			})

			setCloseThinking()

		} catch (error: any) {
			if (error.toJSON().message === 'Network Error') {
				notifications.show({
					title: 'Error',
					color: 'red',
					message: 'No internet connection.',
				})
			}
			const message = error.response?.data?.error?.message
			if (message) {
				notifications.show({title: 'Error', color: 'red', message})
			}
		} finally {
			setCloseThinking()
		}
	}
	return (
		<ContentPane
			title="Ai对话"
			icon={iconTable}
			leftSection={
				messages.length > 0 && (
					<Badge
						// color={isLight ? "slate.0" : "slate.9"}
						radius="sm"
						c="inherit"
					>
						{messages.length}
					</Badge>
				)
			}
			rightSection={

				<Group gap="sm">
					<Tooltip label="clear history ">
						<ActionIcon
							onClick={onClearMessages}
							variant="light"
							aria-label="Save query"
						>

							<IconTrashOff style={{width: '70%', height: '70%'}}/>

						</ActionIcon>
					</Tooltip>

					<Tooltip label={`Format  `}>
						<ActionIcon

							variant="light"
							aria-label={`Format `}
						>
							<Icon path={iconText}/>
						</ActionIcon>
					</Tooltip>

					<Tooltip maw={175} multiline label={
						<Stack gap={4}>
							<Text>Infer variables from query</Text>
							<Text c="dimmed" size="sm">
								Automatically add missing variables.
							</Text>
						</Stack>
					}>
						<HoverIcon
							color="slate"

							animation={autoFixAnim}
						/>
					</Tooltip>


				</Group>

			}
		>

			<ScrollArea
				style={{
					position: "absolute",
					inset: 12,
					top: 0,
					bottom: 100,
					transition: "top .1s",

				}}
				viewportRef={scrollAreaRef}
				offsetScrollbars
			>
				{messages?.map((message, i) => (
					// <div key={i}>{message.content}</div>
					<MessageItem key={i} message={message}/>
				))}
			</ScrollArea>

			<Group

				justify="center"
				style={{
					position: "absolute",
					insetInline: 12,
					bottom: 12,
					width: '100%',

				}}
			>
				<Container style={{width: "100%"}}>

					<Flex gap="sm">
						<Textarea style={{width: "100%"}}
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

								  }}
						/>
						<Button h="auto" onClick={submit}>
							<AiOutlineSend/>
						</Button>
						{chatId}
					</Flex>
				</Container>
			</Group>
		</ContentPane>
	)
}
