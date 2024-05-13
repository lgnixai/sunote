import { Box } from "@mantine/core";
import { useMemo } from "react";
import { Article, DocsPreview } from "~/docs/components";
import { Snippets, TopicProps } from "~/docs/types";
import { useSchema } from "~/hooks/schema";

export function DocsGlobalAuthentication({ language, topic }: TopicProps) {
	const schema = useSchema();

	const snippets = useMemo<Snippets>(
		() => ({
			cli: `
			surreal sql --endpoint ${topic.extra?.connectionUri} --namespace ${topic.extra?.namespace} --database ${topic.extra?.database}
		`,
			js: `
		import { Surreal } from 'surrealdb.js';

		const db = new Surreal();

		import { Surreal } from 'surrealdb.js';
		const db = new Surreal();
		await db.connect('<the actual address of the connection>/rpc', {
			namespace: '<the actual ns of the connection>',
			database: '<the action db of the connection>'
		});

		`,
			rust: `
		//Connect to a local endpoint
		DB.connect::<Ws>("127.0.0.1:8000").await?;
		//Connect to a remote endpoint
		DB.connect::<Wss>("cloud.surrealdb.com").await?;
		`,
			py: `
		# Connect to a local endpoint
		db = Surreal()
		await db.connect('http://127.0.0.1:8000/rpc')
		# Connect to a remote endpoint
		db = Surreal()
		await db.connect('https://cloud.surrealdb.com/rpc')
		`,
			go: `
		// Connect to a local endpoint
		surrealdb.New("ws://localhost:8000/rpc");
		// Connect to a remote endpoint
		surrealdb.New("ws://cloud.surrealdb.com/rpc");
		`,
			csharp: `
		await db.Connect();
		`,
			java: `
		// Connect to a local endpoint
		SurrealWebSocketConnection.connect(timeout)
		`,
			php: `
		// Connect to a local endpoint
		$db = new SurrealDB();
		`,
		}),
		[]
	);

	return (
		<Article title="Authentication">
			<div>
				<p>
					Enabling authentication for your database is a critical step
					in securing your data. SurrealDB provides a simple way to
					enable authentication for your database.
				</p>

			</div>
			<Box>
				<DocsPreview
					language={language}
					title="Enable authentication"
					values={snippets}
				/>
			</Box>
		</Article>
	);
}