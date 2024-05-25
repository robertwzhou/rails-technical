"use client"; // Ensure this directive is at the top

import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
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
  flex-direction: column;
  align-items: center;
  padding: 20px;
`;

const ListsContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  padding: 20px;
  width: 100%;
  overflow-x: auto; // Allow horizontal scrolling if needed
`;

const ListContainer = styled.div`
  background: #f0f0f0;
  padding: 10px;
  width: 250px;
  border-radius: 5px;
  margin: 0 10px; // Adjust margin to space out lists
  display: flex;
  flex-direction: column;
`;

const ListTitle = styled.h3`
  text-align: center;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: black;
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: red;
  cursor: pointer;
`;

const ItemContainer = styled.div`
  background: #fff;
  padding: 10px;
  margin-bottom: 8px;
  border-radius: 3px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  color: black;  // Ensure item text color is black
`;

const AddItemForm = styled.form`
  display: flex;
  flex-direction: column;
  margin-top: 10px;
`;

const AddItemInput = styled.input`
  padding: 5px;
  margin-bottom: 5px;
  color: black; // Ensure input text color is black
`;

const AddItemButton = styled.button`
  padding: 5px 10px;
  background-color: #007bff; // Add background color
  color: white; // Ensure button text color is white
  border: none; // Remove border
  cursor: pointer; // Change cursor to pointer
  &:hover {
    background-color: #0056b3; // Darken background on hover
  }
`;

const AddListForm = styled.form`
  display: flex;
  justify-content: space-between;
  width: 100%;
  max-width: 600px;
  margin-bottom: 20px;
`;

const AddListInput = styled.input`
  flex: 1;
  padding: 5px;
  margin-right: 5px;
  color: black; // Ensure input text color is black
`;

const AddListButton = styled.button`
  padding: 5px 10px;
  background-color: #28a745; // Add background color
  color: white; // Ensure button text color is white
  border: none; // Remove border
  cursor: pointer; // Change cursor to pointer
  &:hover {
    background-color: #218838; // Darken background on hover
  }
`;

const App: React.FC = () => {
  const [lists, setLists] = useState<List[]>(initialState);
  const [newItemContent, setNewItemContent] = useState<{ [key: string]: string }>({});
  const [newListName, setNewListName] = useState('');

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    if (!destination) {
      return;
    }

    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    const sourceList = lists.find(list => list.id === source.droppableId);
    const destinationList = lists.find(list => list.id === destination.droppableId);

    if (!sourceList || !destinationList) {
      return;
    }

    const sourceItems = Array.from(sourceList.items);
    const [removed] = sourceItems.splice(source.index, 1);

    if (sourceList.id === destinationList.id) {
      sourceItems.splice(destination.index, 0, removed);
      setLists(
        lists.map(list => (list.id === sourceList.id ? { ...list, items: sourceItems } : list))
      );
    } else {
      const destinationItems = Array.from(destinationList.items);
      destinationItems.splice(destination.index, 0, removed);
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
    }
  };

  const handleAddItem = (listId: string) => (e: React.FormEvent) => {
    e.preventDefault();
    const content = newItemContent[listId]?.trim();
    if (!content) return;

    const newItem: Item = {
      id: `${listId}-${Date.now()}`,
      content,
    };

    setLists(lists.map(list => (list.id === listId ? { ...list, items: [...list.items, newItem] } : list)));
    setNewItemContent({ ...newItemContent, [listId]: '' });
  };

  const handleInputChange = (listId: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewItemContent({ ...newItemContent, [listId]: e.target.value });
  };

  const handleAddList = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newListName.trim();
    if (!name) return;

    const newList: List = {
      id: `${Date.now()}`,
      name,
      items: [],
    };

    setLists([...lists, newList]);
    setNewListName('');
  };

  const handleRemoveList = (listId: string) => {
    setLists(lists.filter(list => list.id !== listId));
  };

  return (
    <Container>
      <AddListForm onSubmit={handleAddList}>
        <AddListInput
          type="text"
          value={newListName}
          onChange={(e) => setNewListName(e.target.value)}
          placeholder="Add new list"
        />
        <AddListButton type="submit">Add List</AddListButton>
      </AddListForm>

      <DragDropContext onDragEnd={onDragEnd}>
        <ListsContainer>
          {lists.map(list => (
            <Droppable key={list.id} droppableId={list.id}>
              {(provided) => (
                <ListContainer ref={provided.innerRef} {...provided.droppableProps}>
                  <ListTitle>
                    {list.name}
                    <RemoveButton onClick={() => handleRemoveList(list.id)}>Remove</RemoveButton>
                  </ListTitle>
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
                  <AddItemForm onSubmit={handleAddItem(list.id)}>
                    <AddItemInput
                      type="text"
                      value={newItemContent[list.id] || ''}
                      onChange={handleInputChange(list.id)}
                      placeholder="Add new item"
                    />
                    <AddItemButton type="submit">Add</AddItemButton>
                  </AddItemForm>
                </ListContainer>
              )}
            </Droppable>
          ))}
        </ListsContainer>
      </DragDropContext>
    </Container>
  );
};

export default App;
