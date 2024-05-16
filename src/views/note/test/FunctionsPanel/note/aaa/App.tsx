import '@blocksuite/presets/themes/affine.css';

import { createEmptyDoc, PageEditor } from '@blocksuite/presets';
import { Text } from '@blocksuite/store';
import {useEffect, useRef} from "react";

const EditorExample = () => {


	const editorContainerRef = useRef(null);

	useEffect(() => {
		const doc = createEmptyDoc().init();
		const editor = new PageEditor();
		editor.doc = doc;

		const paragraphs = doc.getBlockByFlavour('affine:paragraph');
		const paragraph = paragraphs[0];
		doc.updateBlock(paragraph, { text: new Text('Hello World!') });
		// @ts-ignore
		editorContainerRef.current.appendChild(editor);
	}, []);

	return (
		<div id="editor-example" style={{height:"500px"}} ref={editorContainerRef} />
	);
};

export default EditorExample;
