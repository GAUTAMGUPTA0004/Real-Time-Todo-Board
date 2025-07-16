import React from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import TaskCard from './taskcard';
import api from '../services/api';

const Board = ({ tasks, setTasks, socket }) => {
    // This function is called when a drag-and-drop action is completed
    const onDragEnd = async (result) => {
        const { source, destination, draggableId } = result;
        
        // Exit if the item was dropped outside of a valid column
        if (!destination) return;
        
        // Exit if the item was dropped back into its original position
        if (source.droppableId === destination.droppableId && source.index === destination.index) {
            return;
        }

        // Find the task that was dragged
        const task = tasks.find(t => t._id === draggableId);
        const userId = localStorage.getItem('userId');

        // Prepare the updated task data
        // The destination droppableId is the new status (e.g., 'Todo', 'In Progress')
        const updatedTaskData = {
            ...task,
            status: destination.droppableId, 
            userId, // Include the user who made the change for logging
        };

        try {
            // Send the update request to the backend API
            const res = await api.put(`/tasks/${draggableId}`, updatedTaskData);

            [cite_start]// Emit a 'task-update' event via WebSocket to notify all other clients [cite: 11]
            socket.emit('task-update', res.data);

        } catch (error) {
            console.error("Failed to update task status", error);
            // Alert the user if a conflict occurred or another error happened
            if (error.response && error.response.status === 409) {
                alert("Could not move task! Someone else updated it just now. The board will refresh.");
            } else {
                alert("An error occurred while moving the task.");
            }
            // The board will auto-refresh from the socket listener, showing the latest state
        }
    };

    // Organize tasks into columns based on their status
    const columns = {
        'Todo': tasks.filter(t => t.status === 'Todo'),
        'In Progress': tasks.filter(t => t.status === 'In Progress'),
        'Done': tasks.filter(t => t.status === 'Done'),
    };

    return (
        // The main context for the drag-and-drop functionality
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="board">
                {/* Map over the columns object to render each column */}
                {Object.entries(columns).map(([columnId, columnTasks]) => (
                    // Each column is a 'Droppable' area
                    <Droppable droppableId={columnId} key={columnId}>
                        {(provided, snapshot) => (
                            <div className="board-column" ref={provided.innerRef} {...provided.droppableProps}>
                                <h3>{columnId}</h3>
                                <div className="tasks-container">
                                    {/* Map over the tasks for the current column */}
                                    {columnTasks.map((task, index) => (
                                        // Each task is a 'Draggable' item
                                        <Draggable key={task._id} draggableId={task._id} index={index}>
                                            {(provided) => (
                                                <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                                                    <TaskCard task={task} />
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {/* Placeholder for when dragging an item */}
                                    {provided.placeholder}
                                </div>
                            </div>
                        )}
                    </Droppable>
                ))}
            </div>
        </DragDropContext>
    );
};

export default Board;