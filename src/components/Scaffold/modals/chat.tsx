import {Button, Group, Modal, MultiSelect, Select, Stack, Tabs, TextInput} from "@mantine/core";
import {useEffect, useLayoutEffect, useState} from "react";
import {useStable} from "~/hooks/stable";
import {Icon} from "~/components/Icon";
import {useInputState} from "@mantine/hooks";
import {Form} from "../../Form";
import {syncDatabaseSchema} from "~/util/schema";
import {useTableNames} from "~/hooks/schema";
import {ModalTitle} from "../../ModalTitle";
import {iconPlus, iconRelation, iconTable} from "~/util/icons";
import {useInterfaceStore} from "~/stores/interface";
import {dispatchIntent, useIntent} from "~/hooks/url";
import {executeQuery} from "~/connection";
import {useConfigStore} from "~/stores/config";
import {tb} from "~/util/helpers";
import {RecordId, Table} from "surrealdb.js";
import {RecordsChangedEvent} from "~/util/global-events";
import {useValueValidator} from "~/hooks/surrealql";

export function ChatCreator() {
	const {openChatCreator, closeChatCreator} = useInterfaceStore.getState();
	const [recordTable, setRecordTable] = useState('');

	const [records, setRecords] = useState<unknown[]>([]);
	const [model, setModel] = useState<string[]>([]);
	const [recordId, setRecordId] = useInputState('');
	const [recordBody, setRecordBody] = useState('');
	const [isValid, content] = useValueValidator(recordBody);

	const opened = useInterfaceStore((s) => s.showChatCreator);

	const fetchRecords = useStable(async () => {

		const response=await fetch("http://127.0.0.1:11434/api/tags")
		const data=await response.json()
		const rs=data.models.map((t: { name: any; }) => t.name)
		console.log(data)
		setRecords(rs)

	});
	const [tableName, setTableName] = useInputState("");
	const createChat = useStable(async () => {
		const id = recordId
			? new RecordId(recordTable, recordId)
			: new Table(recordTable);

		// console.log(`CREATE $id CONTENT $content`)
		// return
		const rs=await executeQuery(/* surql */ `CREATE $id CONTENT $content`, {
			id,
			content
		});


		closeChatCreator();
		RecordsChangedEvent.dispatch(null);
	})

	useEffect(() => {
		setRecordBody(`{"name":"${tableName}","model":"${model}"}`)
	}, [tableName,model]);


	useLayoutEffect(() => {
		if (opened) {
			fetchRecords();
			setRecordId('')
			setRecordTable('chat')
		}
	}, [opened]);

	useIntent("new-chat", openChatCreator);

	return (
		<>
			<Modal
				opened={opened}
				onClose={closeChatCreator}
				trapFocus={false}
				size="sm"
				title={
					<ModalTitle>{`Create new chat`}</ModalTitle>
				}
			>


				<Form onSubmit={createChat}>
					<Stack>
						<TextInput placeholder="Enter table name222" value={tableName} onChange={setTableName}
								   autoFocus/>

						<Select
							data={records}
							placeholder="Select incoming tables"
							value={model}
							onChange={setModel}
						/>

						<Group mt="lg">
							<Button
								onClick={closeChatCreator}
								color="slate"
								variant="light"
								flex={1}
							>
								Close
							</Button>
							<Button
								type="submit"
								variant="gradient"
								flex={1}

								rightSection={<Icon path={iconPlus}/>}
							>
								Create
							</Button>
						</Group>
					</Stack>
				</Form>
			</Modal>
		</>
	);
}
