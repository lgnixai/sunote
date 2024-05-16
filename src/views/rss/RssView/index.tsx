import {Grid, SimpleGrid} from "@mantine/core";
import { AccountsPane } from "../AccountsPane";
import { ScopePane } from "../ScopesPane";
import { useIsConnected } from "~/hooks/connection";
import { iconAuth, iconFolderSecure, iconServerSecure } from "~/util/icons";
import { useViewEffect } from "~/hooks/view";
import { syncDatabaseSchema } from "~/util/schema";
import {FeedsPane} from "~/views/rss/FeedsPane";
import {useState} from "react";
import {FeedsItemsPane} from "~/views/rss/FeedsItemsPane";
import {ArticlePane} from "~/views/rss/ArticlePane";
import {useViewportSize} from "@mantine/hooks";

export function RssView() {
	const isOnline = useIsConnected();
	const [activeFeed, setActiveFeed] = useState<string>();
	const [activeFeedItem, setActiveFeedItem] = useState<string>();

	useViewEffect("authentication", () => {
		syncDatabaseSchema();
	});
	const { height, width } = useViewportSize();

	return (
		<Grid

			  style={{
				  gridAutoRows: '1fr',

			  }}
		>
			<Grid.Col span={2}  style={{height}}><FeedsPane
				isOnline={isOnline}
				onFeedSelect={setActiveFeed}
				title="Feeds list"
				icon={iconAuth}
				iconColor="red.6"
				field="kvUsers"
				type="ROOT"
			/></Grid.Col>
			<Grid.Col span={3} style={{ flex: 1 }}>
			<FeedsItemsPane
				onFeedItemSelect={setActiveFeedItem}
				activeFeed={activeFeed}
				isOnline={isOnline}
				title="文章列表"
				icon={iconFolderSecure}
				iconColor="blue.6"
				field="nsUsers"
				type="NAMESPACE"
			/>
			</Grid.Col>
			<Grid.Col span="auto" style={{ flex: 1 }}>
			{/*<ArticlePane*/}
			{/*	activeFeedItem={activeFeedItem}*/}
			{/*	isOnline={isOnline}*/}
			{/*	title="Database Users"*/}
			{/*	icon={iconServerSecure}*/}
			{/*	iconColor="yellow.6"*/}
			{/*	field="dbUsers"*/}
			{/*	type="DATABASE"*/}
			{/*/>*/}
			</Grid.Col>

		</Grid>

	);
}
