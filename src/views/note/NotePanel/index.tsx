import { useEffect, useRef } from 'react';
import { useEditor } from './editor/context';

export default function NodePanel() {
	const { editor } = useEditor()!;
	const editorContainerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (editorContainerRef.current && editor) {
			editorContainerRef.current.innerHTML = '';
			editorContainerRef.current.appendChild(editor);
		}
	}, [editor]);

	return <div className="editor-container" style={{height:"600px"}} ref={editorContainerRef}></div>;
};

