import {
	ActionIcon,
	Badge,
	Button,
	Center,
	Checkbox,
	Group,
	Modal,
	PasswordInput,
	ScrollArea,
	Stack,
	Text,
	TextInput,
	Textarea,
	Tooltip,
} from "@mantine/core";
import { Image } from '@mantine/core';

import {useInputState} from "@mantine/hooks";
import {useEffect, useState} from "react";
import {Form} from "~/components/Form";
import {Icon} from "~/components/Icon";
import {ModalTitle} from "~/components/ModalTitle";
import {ContentPane} from "~/components/Pane";
import {Spacer} from "~/components/Spacer";
import {useIsConnected} from "~/hooks/connection";
import {useHasSchemaAccess, useSchema} from "~/hooks/schema";
import {useStable} from "~/hooks/stable";
import {DatabaseSchema, SchemaFeed, SchemaUser} from "~/types";
import {showError} from "~/util/helpers";
import {syncDatabaseSchema} from "~/util/schema";
import {iconCheck, iconComment, iconEdit, iconKey, iconPlus} from "~/util/icons";
import {useIntent} from "~/hooks/url";
import {executeQuery} from "~/connection";

const ROLES = [
	{value: "OWNER", label: "Owner"},
	{value: "EDITOR", label: "Editor"},
	{value: "VIEWER", label: "Viewer"},
];

export interface AccountsPaneProps {
	isOnline: boolean;
	icon: string;
	title: string;
	iconColor: string;
	field: keyof DatabaseSchema;
	type: string;
	onFeedSelect: (id: string) => void;

}

export function FeedsPane(props: AccountsPaneProps) {
	const isConnected = useIsConnected();
	const isDenied = useHasSchemaAccess();
	const schema = useSchema();

	const [isEditing, setIsEditing] = useState(false);
	const [currentUser, setCurrentUser] = useState<SchemaUser | null>(null);
	const [editingUrl, setEditingUrl] = useInputState("");
	const [records, setRecords] = useState<SchemaFeed[]>([]);

	const users = (schema?.[props.field] || []) as SchemaUser[];

	const closeSaving = useStable(() => {
		setIsEditing(false);
	});
	const fetchRecords = useStable(async () => {
		const response = await executeQuery(`select * from feed`);
		if (Array.isArray(response)) {
			const data = response[0].result || [];
			console.log(data)
			if (isConnected && data.length > 0) {
				setRecords(data);
			}

		}

	});

	useEffect(() => {
		fetchRecords();
	}, [isConnected]);


	const saveAccount = useStable(async () => {
		try {
			setIsEditing(false);
			const response = await fetch("http://localhost:9877/rss/v1/feeds");
			const result = await response.json();
			//
			// let query = `DEFINE USER ${editingName} ON ${props.type} PASSWORD "${editingPassword}"`;
			//
			// if (editingRole.length > 0) {
			// 	query += ` ROLES ${editingRole.join(', ')}`;
			// }
			//
			// if (editingComment) {
			// 	query += ` COMMENT "${editingComment}"`;
			// }
			//
			// await executeQuery(query);
			// await syncDatabaseSchema();
		} catch (err: any) {
			showError({
				title: "Failed to save account",
				subtitle: err.message
			});
		}
	});

	const createUser = useStable(() => {
		setIsEditing(true);

		setEditingUrl("");

	});

	const updateUser = useStable((user: SchemaFeed) => {
		setIsEditing(true);
		setEditingUrl(user.url);

	});

	const closeModal = useStable(() => {
		setIsEditing(false);
	});

	const removeUser = useStable(async () => {
		if (!currentUser) {
			return;
		}

		closeModal();

		await executeQuery(`REMOVE USER ${currentUser.name} ON ${props.type}`);
		await syncDatabaseSchema();
	});

	const formatRoles = useStable((user: SchemaUser) => {
		return user.roles.map((role) => {
			const roleInfo = ROLES.find((r) => r.value === role);

			return roleInfo ? roleInfo.label : role;
		}).join(' / ');
	});

	useIntent("create-user", ({level}) => {
		if (level == props.type) {
			createUser();
		}
	});

	const onFeedSelect = useStable(async (id: any) => {
		console.log(id)
		props.onFeedSelect(id)
	})

	return (
		<ContentPane
			icon={props.icon}
			title={props.title}
			rightSection={
				<Tooltip label="New user">
					<ActionIcon
						onClick={createUser}
						aria-label="Create new user"
						disabled={!isConnected}
					>
						<Icon path={iconPlus}/>
					</ActionIcon>
				</Tooltip>
			}>


			<ScrollArea
				style={{position: "absolute", inset: 10, top: 0}}
			>
				<Stack gap={0}>
					{records.map((rs) => (
						<Group key={rs.id.id} gap="xs" w="100%" h={40} wrap="nowrap" onClick={() => onFeedSelect(rs.id)}

						>

							<Image radius="md" style={{width:20,height:20}} src={`http://localhost:9877/static/feed:${rs.id.id}.ico`}/>
							<Text>
								{rs.title}

							</Text>



						</Group>
					))}
				</Stack>
			</ScrollArea>

			<Modal
				opened={isEditing}
				onClose={closeSaving}
				trapFocus={false}
				title={
					<ModalTitle>
						{currentUser ? "Edit user" : "添加feed"}
					</ModalTitle>
				}
			>
				<Form onSubmit={saveAccount}>
					<Stack>
						<TextInput
							label="Username"
							description="Must be a unique name"
							placeholder="Enter username"
							value={editingUrl}
							onChange={setEditingUrl}
							disabled={!!currentUser}
							required
							autoFocus
						/>

					</Stack>
					<Group mt="lg">
						<Button
							onClick={closeModal}
							color="slate"
							variant="light"
						>
							Close
						</Button>
						<Spacer/>
						{currentUser && (
							<Button
								color="pink.9"
								onClick={removeUser}
							>
								Remove
							</Button>
						)}
						<Button
							disabled={(!editingUrl)}
							rightSection={<Icon path={iconCheck}/>}
							variant="gradient"
							type="submit"
						>
							Save
						</Button>
					</Group>
				</Form>
			</Modal>
		</ContentPane>
	);
}
