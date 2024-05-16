// 1: Uncontrolled Tree
import {useCallback, useEffect, useRef, useState} from "react";
import {Tree, TreeApi, useSimpleTree} from "react-arborist";

//import {data} from "./data";

// @ts-ignore
import Node from './node'
import {TbFolderPlus} from "react-icons/tb";
import {AiOutlineFileAdd} from "react-icons/ai";
import {useStable} from "~/hooks/stable";
import {executeQuery, getDb} from "~/connection";
import {useEventSubscription} from "~/hooks/event";
import {RecordsChangedEvent} from "~/util/global-events";
import {useIsConnected} from "~/hooks/connection";
import {useImmer} from "use-immer";
import {uuidv4} from "surrealdb.js";

type TreeData = {
	id: string;
	adddate: number;
	settings: {};
};
type Data = { id: string; name: string; children?: Data[] };

const Arborist = () => {
	const [term, setTerm] = useState("");
	const treeRef = useRef(null);
	const [tree, setTree] = useState<TreeApi<Data> | null | undefined>(null);
	const [model, setModel] = useImmer([]);

	const treeData = useRef([]);
	// treeData.current = [{
	// 	id: "1",
	// 	name: "root",
	// }]
	const isConnected = useIsConnected();
	const db = getDb()
	const onCreate = ({parentId, index, type}) => {
		tree?.visibleNodes;
		console.log(tree)
		console.log(parentId, index, type)
		// @ts-ignore
		// @ts-ignore
		treeData.current.push({
			id: "1",
			name: "root234324",
		})
	};

	const onRename = ({id, name}) => {
	};
	const onMove = ({dragIds, parentId, index}) => {
	};
	const onDelete = ({ids}) => {
	};


	const fetchRecords = useStable(async () => {
		//const rs = await executeQuery(`select * from tree order by adddate desc limit 1`);

		let result = await db.query('SELECT * from tree order by adddate desc limit 1');
		const rs = result[0];

		console.log("=====12323====")
		console.log(rs[0]["setting"])
		console.log(Array.isArray(rs) && rs.length == 1)
		if (Array.isArray(rs) && rs.length == 1) {
			treeData.current = rs[0]["setting"]
			console.log("you")
			setModel(rs[0]["setting"])
		} else {
			console.log("adfasdf")
			const timestamp = Date.now();
			// await db.create<TreeData>('tree:root', {
			// 	adddate:timestamp
			// });

			let created = await db.create("tree", {
				adddate: timestamp,
				setting: [{
					id: "1",
					name: "root",
				}]
			});
		}

	});

	useEffect(() => {
		console.log(isConnected)
		if (isConnected) {
			fetchRecords();
		}

	}, [isConnected]);
	useEffect(() => {
		console.log(tree?.visibleNodes.length);
	}, [tree]);

	const addTable = useCallback(() => setModel(draft => {
			draft.push({id: uuidv4(), name: "doc", children: []})
		}
	), []);
	  const findTable = (model: Data[], id: string): Data => {
		for (const element of model) {
			if (element.id === id) {
				return element;
			}
		}
		throw `no table found for ${id}`;
	}
	const addFile = useCallback(() => setModel(model => {
			const tables = model as Data[];
			console.log(tree?.selectedNodes)
			//if (tree?.selectedNodes.level == 0) {
				const oldParent = findTable(tables, tree?.selectedNodes?.id);
				oldParent?.children.push({id: uuidv4(), name: "newfile", children: []})
		// 	//}
		console.log(oldParent)
		console.log(model)
			return model
		}

	), []);

	const createFileFolder = (
		<>
			<button
				onClick={addTable}
				title="New Folder..."
			>
				<TbFolderPlus/>
			</button>
			<button onClick={addFile} title="New File...">
				<AiOutlineFileAdd/>
			</button>
		</>
	);

	return (
		<div>
			<div className="folderFileActions">{createFileFolder}</div>

			<input
				type="text"
				placeholder="Search..."
				className="search-input"
				value={term}
				onChange={(e) => setTerm(e.target.value)}
			/>
			<Tree
				ref={(t) => setTree(t)}
				onCreate={onCreate}
				onRename={onRename}
				onMove={onMove}
				onDelete={onDelete}

				data={model}
				width={260}
				height={1000}
				indent={24}
				rowHeight={32}
				// openByDefault={false}
				searchTerm={term}
				searchMatch={(node, term) =>
					node.data.name.toLowerCase().includes(term.toLowerCase())
				}
			>
				{Node}
			</Tree>
		</div>
	);
};

export default Arborist;
