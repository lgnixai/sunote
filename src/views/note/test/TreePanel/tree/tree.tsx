// 1: Uncontrolled Tree
import {useRef, useState, useEffect, useCallback} from "react";
import { Tree,useSimpleTree} from "react-arborist";

import Node from "./node";

import { TbFolderPlus } from "react-icons/tb";
import { AiOutlineFileAdd } from "react-icons/ai";
import {uuidv4} from "surrealdb.js";

const initialData=[
	{
		id: "1",
		uuid: "1798797987969",
		name: "public",
		children: [{ id: "c1-1",uuid:"33456546", name: "index.html" }]
	},
	{
		id: "2",
		uuid: "1798797987dsfds",
		name: "src",
		children: [
			{ id: "c2-1", uuid:"33456546",name: "App.js" },
			{ id: "c2-2",uuid:"6897987",name: "index.js" },
			{ id: "c2-3", uuid:"33456546",name: "styles.css" }
		]
	},
	{ id: "3", uuid:"33456546",name: "package.json" },
	{ id: "4", uuid:"33456546",name: "README.md" }
];
const EditTree = () => {
	const [term, setTerm] = useState("");
	const treeRef = useRef(null);
	const [ data ] = useSimpleTree( initialData );

	const addTable = ()=>{
		const node=treeRef.current
		treeRef.current.create()
	}



	useEffect( () => {
		console.log( data );
	}, [ data ]);

	const createFileFolder = (
		<>
			<button
				onClick={() => treeRef.current.createInternal()}
				title="New Folder..."
			>
				<TbFolderPlus />
			</button>
			<button onClick={() => treeRef.current.createLeaf()} title="New File...">
				<AiOutlineFileAdd />
			</button>
		</>
	);

	const onRename = ({ id, name }) => {
		console.log(id,name)
		const node = treeRef.current.get(id);
		if (node) {
			node.data.name = name;
			initialData[ 0 ].uuid = '999999999999999';
			console.log(data);
		}
	};
	const onDelete = ({ ids }) => {};
	const onCreate = ({ parentId, index, type }) => {};
	const onMove = ( { dragIds, parentId, index } ) => {
	};



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
				ref={treeRef}
				data={data}
				width={260}
				height={1000}
				indent={24}
				rowHeight={32}
				// openByDefault={false}
				searchTerm={term}
				searchMatch={(node, term) =>
					node.data.name.toLowerCase().includes(term.toLowerCase())
				}

				onRename={onRename}
				onDelete={onDelete}
				onCreate={onCreate}
				onMove={onMove}
			>
				{Node}
			</Tree>
		</div>
	);
};

export default EditTree;
