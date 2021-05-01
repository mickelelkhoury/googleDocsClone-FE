import React, { useCallback, useEffect, useState } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { io } from 'socket.io-client';
import { useParams } from 'react-router-dom';

// time to autosave
const SAVE_INTERVAL_MS = 2000;

// things that are added to the toolbar
const TOOLBAR_OPTION = [
	[{ header: [1, 2, 3, 4, 5, 6, false] }],
	[{ font: [] }],
	[{ list: 'ordered' }, { list: 'bullet' }],
	['bold', 'italic', 'underline'],
	[{ color: [] }, { background: [] }],
	[{ script: 'sub' }, { script: 'super' }],
	[{ align: [] }],
	['image', 'blockquote', 'code-block'],
	['clean'],
];

function TextEditor() {
	const [socket, setSocket] = useState();
	const [quill, setQuill] = useState();
	const { id: documentId } = useParams();

	// on start connect socket to the server
	useEffect(() => {
		const s = io('http://localhost:3001');
		setSocket(s);
		return () => {
			s.disconnect();
		};
	}, []);

	useEffect(() => {
		if (socket == null || quill == null) return;

		// loading content from the document beofre starting to edit
		socket.once('load-document', (document) => {
			quill.setContents(document);
			quill.enable();
		});

		socket.emit('get-document', documentId);
	}, [socket, quill, documentId]);

	useEffect(() => {
		if (socket == null || quill == null) return;

		// Saving the content to the DB every SAVE_INTERVAL_MS seconds
		const interval = setInterval(() => {
			socket.emit('save-document', quill.getContents());
		}, SAVE_INTERVAL_MS);

		return () => {
			clearInterval(interval);
		};
	}, [socket, quill]);

	useEffect(() => {
		if (socket == null || quill == null) return;

		// Getting the new data from the server
		const handler = (delta) => {
			quill.updateContents(delta);
		};

		socket.on('receive-changes', handler);

		return () => {
			socket.off('receive-changes');
		};
	}, [socket, quill]);

	useEffect(() => {
		if (socket == null || quill == null) return;

		// Sending the new content of the document to the server
		const handler = (delta, oldDelta, source) => {
			if (source !== 'user') return;
			socket.emit('send-changes', delta);
		};

		quill.on('text-change', handler);

		return () => {
			quill.off('text-change');
		};
	}, [socket, quill]);

	const wrapperRef = useCallback((wrapper) => {
		if (wrapper == null) return;

		wrapper.innerHTML = '';
		const editor = document.createElement('div');
		wrapper.append(editor);
		const q = new Quill(editor, {
			theme: 'snow',
			modules: { toolbar: TOOLBAR_OPTION },
		});
		q.disable();
		q.setText('Loading...');
		setQuill(q);
	}, []);

	return <div className='container' ref={wrapperRef}></div>;
}

export default TextEditor;
