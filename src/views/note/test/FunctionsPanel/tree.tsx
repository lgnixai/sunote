import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import { NodeApi, NodeRendererProps, Tree, TreeApi } from "react-arborist";
import styles from "./style.module.scss";
import { cities } from "./data/cities";
import { BsMapFill, BsMap, BsGeo, BsGeoFill } from "react-icons/bs";
import { FillFlexParent } from "./components/fill-flex-parent";
import { MdArrowDropDown, MdArrowRight } from "react-icons/md";

type Data = { id: string; name: string; children?: Data[] };

const data = sortData(cities);
const INDENT_STEP = 15;

export default function Cities() {
	const [tree, setTree] = useState<TreeApi<Data> | null | undefined>(null);
	const [active, setActive] = useState<Data | null>(null);
	const [focused, setFocused] = useState<Data | null>(null);
	const [selectedCount, setSelectedCount] = useState(0);
	const [searchTerm, setSearchTerm] = useState("");
	const [count, setCount] = useState(0);
	const [followsFocus, setFollowsFocus] = useState(false);
	const [disableMulti, setDisableMulti] = useState(false);

	useEffect(() => {
		setCount(tree?.visibleNodes.length ?? 0);
	}, [tree, searchTerm]);

	return (
		<div className={styles.container}>
			<div className={styles.split}>
				<div className={styles.treeContainer}>
					<FillFlexParent>
						{(dimens) => (
							<Tree
								{...dimens}
								initialData={data}
								selectionFollowsFocus={followsFocus}
								disableMultiSelection={disableMulti}
								ref={(t) => setTree(t)}
								openByDefault={false}
								searchTerm={searchTerm}
								selection={active?.id}
								className={styles.tree}
								rowClassName={styles.row}
								padding={15}
								rowHeight={30}
								indent={INDENT_STEP}
								overscanCount={8}
								onSelect={(selected) => setSelectedCount(selected.length)}
								onActivate={(node) => setActive(node.data)}
								onFocus={(node) => setFocused(node.data)}
								onToggle={() => {
									setTimeout(() => {
										setCount(tree?.visibleNodes.length ?? 0);
									});
								}}
							>
								{Node}
							</Tree>
						)}
					</FillFlexParent>
				</div>
			</div>
		</div>
	);
}

function Node({ node, style, dragHandle }: NodeRendererProps<Data>) {
	const Icon = node.isInternal ? BsMapFill : BsGeoFill;
	const indentSize = Number.parseFloat(`${style.paddingLeft || 0}`);

	return (
		<div
			ref={dragHandle}
			style={style}
			className={clsx(styles.node, node.state)}
			onClick={() => node.isInternal && node.toggle()}
		>
			<div className={styles.indentLines}>
				{new Array(indentSize / INDENT_STEP).fill(0).map((_, index) => {
					return <div key={index}></div>;
				})}
			</div>
			<FolderArrow node={node} />
			<Icon className={styles.icon} />{" "}
			<span className={styles.text}>
        {node.isEditing ? <Input node={node} /> : node.data.name}
      </span>
		</div>
	);
}

function Input({ node }: { node: NodeApi<Data> }) {
	return (
		<input
			autoFocus
			name="name"
			type="text"
			defaultValue={node.data.name}
			onFocus={(e) => e.currentTarget.select()}
			onBlur={() => node.reset()}
			onKeyDown={(e) => {
				if (e.key === "Escape") node.reset();
				if (e.key === "Enter") node.submit(e.currentTarget.value);
			}}
		/>
	);
}

function sortData(data: Data[]) {
	function sortIt(data: Data[]) {
		data.sort((a, b) => (a.name < b.name ? -1 : 1));
		data.forEach((d) => {
			if (d.children) sortIt(d.children);
		});
		return data;
	}
	return sortIt(data);
}

function FolderArrow({ node }: { node: NodeApi<Data> }) {
	return (
		<span className={styles.arrow}>
      {node.isInternal ? (
		  node.isOpen ? (
			  <MdArrowDropDown />
		  ) : (
			  <MdArrowRight />
		  )
	  ) : null}
    </span>
	);
}
