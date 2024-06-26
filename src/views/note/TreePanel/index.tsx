import {useEffect, useState} from "react";
import "./App.css";
import Folder from "./Folder";
import useTraverseTree from "./use-traverse-tree";
import {useStable} from "~/hooks/stable";
import {useIsConnected} from "~/hooks/connection";
import {executeQuery, getDb} from "~/connection";
import {useEditor} from "~/views/note/EditorPanel/editor/context";
import {DocMeta} from "@blocksuite/store";
import {createDoc as createAndInitDoc} from "~/views/note/EditorPanel/editor/utils";
import {ComboboxItem, Select} from "@mantine/core";
import {useNoteStore} from "~/stores/note";
import WorkSpaceSelect from "~/views/note/TreePanel/WorkSpace";

export default function TreePanel() {
	const {workSpace,setWorkSpace, editor,collection,provider } = useNoteStore.getState();

	//const { editor, collection, provider } = useEditor()!;
	const [docMetaInfos, setDocMetaInfos] = useState<DocMeta[]>([]);
	const [currentDocId, setCurrentDocId] = useState<string>('');


	const [value, setValue] = useState<ComboboxItem | null>(workSpace);

	useEffect(() => {
		if (!collection || !editor) return;

		const updateDocMetaInfos = () =>
			setDocMetaInfos([...collection.meta.docMetas]);
		const updateCurrentDocId = () => setCurrentDocId(editor.doc.id);

		updateDocMetaInfos();
		updateCurrentDocId();

		const disposable = [
			collection.meta.docMetaUpdated.on(updateDocMetaInfos),
			editor.slots.docUpdated.on(updateCurrentDocId),
		];

		return () => disposable.forEach(d => d?.dispose());
	}, [collection, editor]);

	const addDoc = (title:string) => {
		if (!collection || !provider) return;
		const doc = createAndInitDoc(collection,title);
		//console.log("doc title",title)
		// doc.collection.setDocMeta(doc.id, {
		// 	title: title,
		// });
		// @ts-ignore
		//doc.meta?.title=title
		provider.connect(doc.id);
		return doc.id
	};

	const deleteDoc = (docId: string) => {
		if (!provider || !collection) return;

		if (currentDocId === docId) {
			const index = docMetaInfos.findIndex(({ id }) => id === docId);
			if (index === 0) {
				if (docMetaInfos.length === 1) {
					const newDoc = createAndInitDoc(collection);
					provider.connect(newDoc.id);
				} else {
					provider.connect(docMetaInfos[1].id);
				}
			} else {
				provider.connect(docMetaInfos[index - 1].id);
			}
		}

		collection.removeDoc(docId);
	};



	const [explorerData, setExplorerData] = useState([]);
	const {insertNode, deleteNode, updateNode} = useTraverseTree();
	const [selNode, setSelNode] = useState({})
	const isConnected = useIsConnected();
	const db = getDb()
	const fetchRecords = useStable(async () => {

		//const rs = await executeQuery(`select * from tree order by adddate desc limit 1`);
		//await db.let('ws', value?.value);
		//let result = await db.query('SELECT * from tree where ws=$ws order by adddate desc limit 1');
		let result = await db.select(`tree:${workSpace}`);
		const rs = result[0];

		console.log("=====12323====")
		console.log(rs)


		if (rs ) {
			//treeData.current = rs[0]["setting"]
			console.log("you",rs["setting"])
			setExplorerData(rs["setting"])
		} else {
			console.log("adfasdf")
			const timestamp = Date.now();
			// await db.create<TreeData>('tree:root', {
			// 	adddate:timestamp
			// });

			let created = await db.create(`tree:${workSpace}`, {
				adddate: timestamp,
				setting: {
					id: "1",
					name: "root",
					isFolder: true,
					items: [],
				}
			});
		}

	});

	useEffect(() => {
		console.log(isConnected,workSpace)
		if (isConnected) {
			fetchRecords();
		}

	}, [isConnected,workSpace]);
	const handleInsertNode = (folderId, itemName, isFolder) => {
		const docid=addDoc(itemName)
		const finalItem = insertNode(explorerData, folderId, itemName, isFolder,docid);
		sysTree();
		provider?.connect(docid)
		return finalItem;
	};
	const handleDeleteNode = (folderId) => {
		// Call deleteNode to get the modified tree
		const finalItem = deleteNode(explorerData, folderId);
		// Update the explorerData state with the modified tree
		setExplorerData(finalItem);
	};

	const handleUpdateFolder = (id, updatedValue, isFolder) => {
		const finalItem = updateNode(explorerData, id, updatedValue, isFolder);
		// Update the explorerData state with the modified tree
		setExplorerData(finalItem);
	};
	const getAll = () => {
		console.log(explorerData)
	}

	const sysTree = useStable(async () => {
		const timestamp = Date.now();

		console.log("timestamp,workSpace")
		console.log(timestamp,workSpace)

		let created = await db.update(`tree:${workSpace}`, {
			adddate: timestamp,
			setting: explorerData
		});


	});
	useEffect(() => {
		sysTree();

	}, [explorerData,workSpace]);



	return (
		<div  >
			<WorkSpaceSelect />


			<div className="folderContainerBody">
				<div className="folder-container">
					{explorerData && (<Folder
						handleInsertNode={handleInsertNode}
						handleDeleteNode={handleDeleteNode}
						handleUpdateFolder={handleUpdateFolder}
						explorerData={explorerData}
						selectData={setSelNode}
					/>)}
				</div>
			</div>
		</div>
	);
}

