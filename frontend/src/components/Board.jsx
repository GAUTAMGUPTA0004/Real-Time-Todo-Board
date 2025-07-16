import React from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import TaskCard from './TaskCard';
import api from '../services/api';

// Add onEditTask to the props
const Board = ({ tasks, setTasks, socket, onEditTask, setConflict }) => {
    // ... (keep the existing onDragEnd and other functions)

    const onDragEnd = async (result) => {
        const { source, destination, draggableId } = result;
        
        if (!destination) return;
        
        if (source.droppableId === destination.droppableId && source.index === destination.index) {
            return;
        }

        const task = tasks.find(t => t._id === draggableId);
        const userId = localStorage.getItem('userId');

        const updatedTaskData = {
            ...task,
            status: destination.droppableId, 
            userId,
        };

        try {
            const res = await api.put(`/tasks/${draggableId}`, updatedTaskData);
            socket.emit('task-update', res.data);
        } catch (error) {
            if (error.response && error.response.status === 409) {
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

    const columns = {
        'Todo': tasks.filter(t => t.status === 'Todo'),
        'In Progress': tasks.filter(t => t.status === 'In Progress'),
        'Done': tasks.filter(t => t.status === 'Done'),
    };

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="board">
                {Object.entries(columns).map(([columnId, columnTasks]) => (
                    <Droppable droppableId={columnId} key={columnId}>
                        {(provided, snapshot) => (
                            <div className="board-column" ref={provided.innerRef} {...provided.droppableProps}>
                                <h3>{columnId}</h3>
                                <div className="tasks-container">
                                    {columnTasks.map((task, index) => (
                                        <Draggable key={task._id} draggableId={task._id} index={index}>
                                            {(provided) => (
                                                <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                                                    {/* Pass the onEdit function to each card */}
                                                    <TaskCard task={task} socket={socket} onEdit={onEditTask} />
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
    );
};

export default Board;