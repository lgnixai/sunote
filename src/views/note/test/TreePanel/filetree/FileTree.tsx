
import { Directory } from "../typings";
import clsx from "clsx";
import React, { useEffect, useRef } from "react";
import { Tree, TreeApi } from "react-arborist";
import AutoSize from "react-virtualized-auto-sizer";
 import FileTreeItem from "./FileTreeItem";
import { useFileTree } from "./use-file-tree";
import NodeItem from "~/views/note/TreePanel/filetree/node";

interface FileNavigationProps {
  files: Directory;
}

const FileTree: React.FC<FileNavigationProps> = ({ files }) => {
  const { data, onToggle, onMove, onEdit } = useFileTree(files);

  // const tabs = useTypedSelector((s) => s.editor.tabs);


  const ref = useRef<TreeApi<Directory>>(null);

  useEffect(() => {
    if (!ref.current  ) return;



     // ref.current.selectById("");

  }, [ files]);

  return (
    <div
      className={clsx(
        "h-full z-10 flex overflow-clip will-change flex-col relative py-1 bg-dark-900 border-r border-dark-600"
      )}
    >


          <Tree
            openByDefault={true}
            className="react-aborist"
            getChildren="children"
            isOpen={"isOpen"}
            indent={12}
            rowHeight={24}
            ref={ref}
            data={data}
            hideRoot
            onToggle={onToggle}
            onEdit={onEdit}
            onMove={onMove}
			width={260}
			height={1000}
          >
            {/* @ts-ignore */}
            {NodeItem}
          </Tree>


    </div>
  );
};

export default FileTree;
