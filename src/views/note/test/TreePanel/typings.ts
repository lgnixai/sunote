


export enum DirectoryTypes {
	DEFAULT = 1,
	HIDDEN = 0,
}


export type EditorLanguages =
	| "javascript"
	| "html"
	| "css"
	| "typescript"
	| "markdown"
	| "text";



type Item = {
	id: string;
	path: string;
	parent?: string;
	name: string;
	createdAt: string;
};

export type File = Item & {
	content: string;
	mimeType: string;
};

export type Directory = Item & {
	type: DirectoryTypes;
	children: (File | Directory)[];
	isOpen: boolean;
};
export function isFile(item: any): item is File {
	return typeof item.content === "string";
}
