import { EditorProvider } from './components/EditorProvider';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
 import './index.css';
import EditorContainer from "~/views/note/EditorPanel/components/EditorContainer";
import {useNoteStore} from "~/stores/note";
import {useEditor} from "~/views/note/EditorPanel/editor/context";
import {useEffect, useRef} from "react";
import {initEditor} from "~/views/note/EditorPanel/editor/editor";

function EditorPanel() {

	const {workSpace, editor,setEditor,setProvider,setCollection } = useNoteStore.getState();

	const hasInitCalled = useRef(false);

	const editorContainerRef = useRef<HTMLDivElement>(null);
	useEffect(() => {
		if (hasInitCalled.current) return;

		initEditor().then(({ editor, collection, provider }) => {
			setEditor(editor);
			setCollection(collection);
			setProvider(provider);
		});

		hasInitCalled.current = true;
	}, [hasInitCalled,workSpace]);

	useEffect(() => {
		if (editorContainerRef.current && editor) {
			editorContainerRef.current.innerHTML = '';
			editorContainerRef.current.appendChild(editor);
		}
	}, [editor]);

	return (
		<>
			11{workSpace}22
			<div className="editor-container" style={{height:"500px"}} ref={editorContainerRef}></div>;
			<Sidebar/>
		</>

)
}

export default EditorPanel;
