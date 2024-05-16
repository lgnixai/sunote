import { AiFillFolder, AiFillFile } from "react-icons/ai";
import { MdArrowRight, MdArrowDropDown, MdEdit } from "react-icons/md";
import { RxCross2 } from "react-icons/rx";
import {FocusEvent, KeyboardEvent} from "react";

export default function NodeItem  ({ node, style, dragHandle, tree }) {
	const CustomIcon = node.data.icon;
	const iconColor = node.data.iconColor;

	// console.log(node, tree);
	return (
		<div
			className={`node-container ${node.state.isSelected ? "isSelected" : ""}`}
			style={style}
			ref={dragHandle}
		>
			<div
				className="node-content"
				onClick={() => node.isInternal && node.toggle()}
			>
				{node.isLeaf ? (
					<>
						<span className="arrow"></span>
						<span className="file-folder-icon">
              {CustomIcon ? (
				  <CustomIcon color={iconColor ? iconColor : "#6bc7f6"} />
			  ) : (
				  <AiFillFile color="#6bc7f6" />
			  )}
            </span>
					</>
				) : (
					<>
            <span className="arrow">
              {node.isOpen ? <MdArrowDropDown /> : <MdArrowRight />}
            </span>
						<span className="file-folder-icon">
              {CustomIcon ? (
				  <CustomIcon color={iconColor ? iconColor : "#f6cf60"} />
			  ) : (
				  <AiFillFolder color="#f6cf60" />
			  )}
            </span>
					</>
				)}
				<span className="node-text">
          {node.isEditing ? (
				  <RenameForm defaultValue={name} {...node} />
			  // <input
				//   type="text"
				//   defaultValue={node.data.name}
				//   onFocus={(e) => e.currentTarget.select()}
				//   onBlur={() => node.reset()}
				//   onKeyDown={(e) => {
				// 	  if (e.key === "Escape") node.reset();
				// 	  if (e.key === "Enter") node.submit(e.currentTarget.value);
				//   }}
				//   autoFocus
			  // />
		  ) : (
			  <span>{ node.data.name }</span>
		  )}
        </span>
			</div>

			<div className="file-actions">
				<div className="folderFileActions">
					<button onClick={() => node.edit()} title="Rename...">
						<MdEdit />
					</button>
					<button onClick={() => tree.delete(node.id)} title="Delete">
						<RxCross2 />
					</button>
				</div>
			</div>
		</div>
	);
};
type FormProps = { defaultValue: string }  ;

function RenameForm({ defaultValue, submit, reset }: FormProps) {
	const inputProps = {
		defaultValue,
		autoFocus: true,
		onBlur: (e: FocusEvent<HTMLInputElement>) => {
			submit(e.currentTarget.value);
		},
		onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => {
			switch (e.key) {
				case "Enter":
					submit(e.currentTarget.value);
					break;
				case "Escape":
					reset();
					break;
			}
		},
	};

	return (
		<input
			type="text"
			{...inputProps}
			className="bg-transparent text-cyan-500"
		/>
	);
}
