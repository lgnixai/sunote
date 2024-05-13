import { useState, useEffect, CSSProperties } from 'react';
import { ObjectId } from 'mongodb';
import { useInView } from 'react-intersection-observer';
import { ScrollArea, Loader } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
 type Message = {
	_id: ObjectId;
	text: string;
	date: string;
	unixTime: number;
	imageUrl?: string;
};

  type MessagesProps = {
	allMsgs: Message[];
	isFetchingNextPage: boolean;
	refetch: () => void;
	fetchNextPage: () => void;
};
export default function Messages(props: MessagesProps) {
	const [msgId, setMsgId] = useState<ObjectId | null>(null); // track which msg is being hovered
	const { ref, inView } = useInView();
	const { allMsgs, isFetchingNextPage, refetch, fetchNextPage } = props;

	//const { mutate } = trpc.deleteMsg.useMutation({ onSettled: refetch });

	function deleteMsg(_id: ObjectId) {
		const idAsString = _id.toString();
		//mutate({ id: idAsString });
	}

	function formatTimestamp(unixTimestamp: number) {
		const dateString = new Date(unixTimestamp).toString();
		const date = dateString.slice(0, 10);
		const time = dateString.slice(16, 21);
		return `${date} - ${time}`;
	}
	//
	// useEffect(() => {
	// 	if (inView) fetchNextPage();
	// }, [inView]);

	return (
		<ScrollArea h={400}>
			{allMsgs?.map((msg) => {
				const { _id, text, unixTime, imageUrl } = msg;
				return (
					<div style={msgWrapStyle} key={_id.toString()}>
						{imageUrl ? <img style={imageStyle} src={imageUrl} /> : null}
						<div
							style={msgIconStyle}
							onMouseEnter={() => setMsgId(_id)}
							onMouseLeave={() => setMsgId(null)}
						>
							<div style={msgStyle}>{text}</div>
							<IconTrash
								style={trashIcon}
								onClick={() => deleteMsg(_id)}
								visibility={msgId === _id ? 'visible' : 'hidden'}
								onMouseOver={(e) => (e.currentTarget.style.cursor = 'pointer')}
							/>
						</div>
						<div style={timestampStyle}>{formatTimestamp(unixTime)}</div>
					</div>
				);
			})}
			{isFetchingNextPage ? (
				<Loader style={loaderStyle} variant='dots' size='lg' />
			) : null}
			<div ref={ref}></div>
		</ScrollArea>
	);
}

const msgWrapStyle: CSSProperties = {
	margin: '5px 20px 10px 10px',
};

const imageStyle: CSSProperties = {
	maxWidth: '200px',
	maxHeight: '300px',
};

const msgIconStyle: CSSProperties = {
	display: 'flex',
	alignItems: 'center',
};

const msgStyle: CSSProperties = {
	width: 'fit-content',
	padding: '8px',
	border: '1px solid #9bc5d6',
	borderRadius: '5px',
	backgroundColor: '#fff',
};

const timestampStyle: CSSProperties = {
	fontSize: '10px',
	paddingLeft: '5px',
};

const trashIcon: CSSProperties = {
	color: '#9da2a4',
};

const loaderStyle: CSSProperties = {
	display: 'block',
	margin: '0px auto 20px',
};
