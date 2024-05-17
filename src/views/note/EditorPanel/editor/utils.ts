import {AffineSchemas} from '@blocksuite/blocks';
import {Schema, DocCollection} from '@blocksuite/store';

export function getCurrentRoom() {
	const id = window.location.pathname.replace(/^\//, '');
	return id === '' ? undefined : id;
}

export function setRoom(id: string) {
	if (getCurrentRoom() === id) return;
	const newPath = `/${encodeURIComponent(id)}`;
	window.history.pushState({path: newPath}, '', newPath);
}

export function initCollection(id = 'blocksuite-example') {
	const schema = new Schema().register(AffineSchemas);
	const collection = new DocCollection({schema, id});
	collection.start()
	return collection;
}

export function createDoc(collection: DocCollection, title: string) {
	const doc = collection.createDoc();
	console.log("doc title",title)
	doc.load(() => {
		const rootId = doc.addBlock('affine:page', {
			title: new doc.Text(title),
		});
		console.log("doc title33333",title)
		const noteId = doc.addBlock('affine:note', {}, rootId);
		doc.addBlock('affine:paragraph', {}, noteId);
	});
	doc.resetHistory();
	return doc;
}
