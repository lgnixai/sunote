import {create, StateCreator} from 'zustand';
import {AffineEditorContainer} from "@blocksuite/presets";
import {Provider} from "~/views/note/EditorPanel/editor/provider";
import {DocCollection} from "@blocksuite/store";
import {ComboboxItem} from "@mantine/core";
import {createJSONStorage, persist, PersistOptions} from 'zustand/middleware';

export type NoteStore = {
	workSpace: string;
	editor: AffineEditorContainer;
	provider: Provider | null;
	collection: DocCollection | null;
	setEditor: (editor: AffineEditorContainer) => void;
	setProvider: (provider: Provider) => void;
	setCollection: (collection: DocCollection) => void;
	setWorkSpace: (workspace: string) => void;


}
type MyPersist = (
	config: StateCreator<NoteStore>,
	options: PersistOptions<NoteStore>
) => StateCreator<NoteStore>

export const useNoteStore = create<NoteStore>(
	(set, get) => ({
		workSpace: "",
		collection: null,
		editor: new AffineEditorContainer(),
		provider: null,
		setEditor: (editor: any) => set(() => ({editor})),
		setProvider: (provider: Provider) => set(() => ({provider})),
		setCollection: (collection: DocCollection) => set(() => ({collection})),
		setWorkSpace: (id: string) => {
			console.log("set", id)
			set({workSpace: id})
		},


	}));
