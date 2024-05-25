"use client"; // Ensure this directive is at the top

import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import styled from 'styled-components';

type Item = {
  id: string;
  content: string;
};

type List = {
  id: string;
  name: string;
  items: Item[];
};

const initialState: List[] = [
  {
    id: '1',
    name: 'To Do',
    items: [
      { id: '1-1', content: 'Task 1' },
      { id: '1-2', content: 'Task 2' },
    ],
  },
  {
    id: '2',
    name: 'In Progress',
    items: [
      { id: '2-1', content: 'Task 3' },
    ],
  },
  {
    id: '3',
    name: 'Done',
    items: [],
  },
];

const Container = styled.div`
  display: flex;
  justify-content: space-around;
  padding: 20px;
  color: #000000;
`;

const ListContainer = styled.div`
  background: #f0f0f0;
  padding: 10px;
  width: 250px;
  border-radius: 5px;
`;

const ListTitle = styled.h3`
  text-align: center;
`;

const ItemContainer = styled.div`
  background: #fff;
  padding: 10px;
  margin-bottom: 8px;
  border-radius: 3px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
`;

const App: React.FC = () => {
  const [lists, setLists] = useState<List[]>(initialState);

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    // If no destination, return early
    if (!destination) {
      return;
    }

    // If source and destination are the same, return early
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    // Find the source and destination lists
    const sourceList = lists.find(list => list.id === source.droppableId);
    const destinationList = lists.find(list => list.id === destination.droppableId);

    if (!sourceList || !destinationList) {
      return;
    }

    // Copy the source items
    const sourceItems = Array.from(sourceList.items);
    const [removed] = sourceItems.splice(source.index, 1);

    // Copy the destination items and insert the moved item
    const destinationItems = Array.from(destinationList.items);
    destinationItems.splice(destination.index, 0, removed);

    // Update the state with new lists
    setLists(
      lists.map(list => {
        if (list.id === sourceList.id) {
          return { ...list, items: sourceItems };
        }
        if (list.id === destinationList.id) {
          return { ...list, items: destinationItems };
        }
        return list;
      })
    );
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Container>
        {lists.map(list => (
          <Droppable key={list.id} droppableId={list.id}>
            {(provided) => (
              <ListContainer ref={provided.innerRef} {...provided.droppableProps}>
                <ListTitle>{list.name}</ListTitle>
                {list.items.map((item, index) => (
                  <Draggable key={item.id} draggableId={item.id} index={index}>
                    {(provided) => (
                      <ItemContainer
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        {item.content}
                      </ItemContainer>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </ListContainer>
            )}
          </Droppable>
        ))}
      </Container>
    </DragDropContext>
  );
};

export default App;
