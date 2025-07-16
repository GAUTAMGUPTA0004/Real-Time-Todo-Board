import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import TaskCard from './TaskCard';
import ConflictModal from './ConflictModal'; // Import the new component
import api from '../services/api';

const Board = ({ tasks, setTasks, socket }) => {
    // State to hold conflict information
    const [conflict, setConflict] = useState(null);

    // This function is called when a drag-and-drop action is completed
    const onDragEnd = async (result) => {
        const { source, destination, draggableId } = result;
        
        if (!destination || (source.droppableId === destination.droppableId && source.index === destination.index)) {
            return;
        }

        const task = tasks.find(t => t._id === draggableId);
        const userId = localStorage.getItem('userId');

        // Prepare the user's intended update
        const updatedTaskData = {
            ...task,
            status: destination.droppableId,
            userId,
        };

        try {
            // Attempt to update the task optimistically
            const res = await api.put(`/tasks/${draggableId}`, updatedTaskData);
            socket.emit('task-update', res.data);

        } catch (error) {
            if (error.response && error.response.status === 409) {
                // A conflict occurred, store the details and show the modal
                console.warn('Conflict detected:', error.response.data.message);
                setConflict({
                    userAttempt: updatedTaskData,
                    serverVersion: error.response.data.serverVersion,
                });
            } else {
                console.error("Failed to update task status", error);
                alert("An error occurred while moving the task.");
            }
        }
    };

    // Function to handle overwriting the server's version
    const resolveConflict = async () => {
        if (!conflict) return;

        const { userAttempt, serverVersion } = conflict;

        // Prepare the data for the forced update, using the latest version number
        const forceUpdateData = {
            ...userAttempt,
            version: serverVersion.version, // Use the latest version from the server
        };

        try {
            const res = await api.put(`/tasks/${userAttempt._id}`, forceUpdateData);
            socket.emit('task-update', res.data);
            alert('Your changes have been applied.');
        } catch (err) {
            console.error('Failed to force update task:', err);
            alert('Failed to apply changes. The board will refresh.');
            // Refetch tasks to ensure UI consistency after failed overwrite
            socket.emit('task-update', {}); 
        } finally {
            // Close the modal
            setConflict(null);
        }
    };

    // Function to cancel the user's changes
    const cancelConflict = () => {
        setConflict(null);
        // Optionally, you can trigger a refresh to show the latest state
        socket.emit('task-update', {});
        alert('Your changes have been discarded.');
    };

    // Organize tasks into columns based on their status
    const columns = {
        'Todo': tasks.filter(t => t.status === 'Todo'),
        'In Progress': tasks.filter(t => t.status === 'In Progress'),
        'Done': tasks.filter(t => t.status === 'Done'),
    };

    return (
        <>
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="board">
                    {Object.entries(columns).map(([columnId, columnTasks]) => (
                        <Droppable droppableId={columnId} key={columnId}>
                            {(provided) => (
                                <div className="board-column" ref={provided.innerRef} {...provided.droppableProps}>
                                    <h3>{columnId}</h3>
                                    <div className="tasks-container">
                                        {columnTasks.map((task, index) => (
                                            <Draggable key={task._id} draggableId={task._id} index={index}>
                                                {(provided) => (
                                                    <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                                                        <TaskCard task={task} socket={socket} />
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                </div>
                            )}
                        </Droppable>
                    ))}
                </div>
            </DragDropContext>

            {/* Render the conflict modal when a conflict exists */}
            <ConflictModal
                conflict={conflict}
                onResolve={resolveConflict}
                onCancel={cancelConflict}
            />
        </>
    );
};

export default Board;