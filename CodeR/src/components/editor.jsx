import React, { useEffect, useRef } from 'react';
import { EditorView, basicSetup } from 'codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark'; // Dark theme
import { autocompletion } from '@codemirror/autocomplete'; // Auto-closing brackets

function Editor({ roomId, socketRef, code, isHost }) {
    const editorRef = useRef(null); // ref for the div
    const editorViewRef = useRef(null); // ref for the editor view  

    const isSyncingRef = useRef(false); // ✅ Prevent infinite loop

    useEffect(() => {
        if (!editorRef.current) return;

        console.log("Editor is mounting...");

        editorViewRef.current = new EditorView({
            doc: 'console.log("Hello, World!");', // ✅ Default content
            extensions: [
                basicSetup,
                autocompletion(),
                javascript(),
                oneDark,
                EditorView.updateListener.of((update) => {
                    if (update.docChanged) {
                        const newContent = update.state.doc.toString();

                        console.log("Code changed:", newContent);

                        if (isSyncingRef.current) {
                            console.log("🔄 Skipping sync update to prevent loop");
                            return;
                        }

                        // Emit code change event only if socketRef is available
                        if (socketRef.current && !isHost) {
                            socketRef.current.emit("code_changed", {
                                roomId,
                                code: newContent,
                                socketid: socketRef.current.id,
                            });
                        } else if (socketRef.current && isHost) {
                            socketRef.current.emit("teacher_edit", {
                                roomId,
                                code: newContent,
                                socketid: socketRef.current.id,
                            });
                        } else {
                            console.warn("⚠️ Socket not initialized yet.");
                        }
                    }
                }),
            ],
            parent: editorRef.current, // ✅ Assign parent correctly
        });

        return () => {
            console.log("Editor is unmounting...");
            if (editorViewRef.current) {
                editorViewRef.current.destroy();
            }
        };
    }, []);

    // ✅ Ensure syncing code updates properly
    useEffect(() => {
        if (editorViewRef.current) {
            const currentCode = editorViewRef.current.state.doc.toString();
            const codeToSync = code;

            if (currentCode !== codeToSync && codeToSync !== undefined) {
                console.log("🔄 Syncing new code:", codeToSync);

                isSyncingRef.current = true; // ✅ Prevent infinite loop

                editorViewRef.current.dispatch({
                    changes: { from: 0, to: editorViewRef.current.state.doc.length, insert: codeToSync || "" },
                });

                setTimeout(() => {
                    isSyncingRef.current = false; // ✅ Reset sync flag after applying changes
                }, 10);
            }
        }
    }, [code]);

    return (
        <div className="flex-1 bg-gray-800 p-1 flex flex-col h-full border-r border-gray-700 " >
    {/* Editor Header */}
    <div className="bg-gray-800 p-2 border-b border-gray-700">
        <h2 className="text-xl font-semibold text-white">
            {isHost ? "Student" : "Editor" }</h2>
    </div>

    {/* Editor Area (Fills Remaining Space) */}
    <div className="flex-1 border border-gray-700 rounded mt-2 overflow-hidden">
        <div 
            ref={editorRef} 
            className="h-full w-full bg-gray-700 text-white p-2 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600"
        ></div>
    </div>
</div>

    );
}

export default Editor;
