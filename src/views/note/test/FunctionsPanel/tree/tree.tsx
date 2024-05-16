// 1: Uncontrolled Tree
import { useRef, useState } from "react";

import { Tree } from "react-arborist";
import { data } from "../data/data";

// @ts-ignore
import Node from './node'
import { TbFolderPlus } from "react-icons/tb";
import { AiOutlineFileAdd } from "react-icons/ai";
import {useStable} from "~/hooks/stable";

const Arborist = () => {
	const [term, setTerm] = useState("");
	const treeRef = useRef(null);
	const [records, setRecords] = useState<unknown[]>([]);


	const fetchRecords = useStable(async () => {

		const response=await fetch("http://127.0.0.1:11434/api/tags")
		const data=await response.json()
		const rs=data.models.map((t: { name: any; }) => t.name)
		console.log(data)
		setRecords(rs)

	});
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
	initialData={data}
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
