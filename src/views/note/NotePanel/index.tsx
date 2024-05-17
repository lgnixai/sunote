import { useEffect, useRef } from 'react';
import { useEditor } from './editor/context';
import {useDatabaseStore} from "~/stores/database";
import {useNoteStore} from "~/stores/note";

export default function NodePanel() {

	const { setEditor,setProvider } = useNoteStore.getState();

	return <div className="editor-container" style={{height:"600px"}} ref={}></div>;
};

