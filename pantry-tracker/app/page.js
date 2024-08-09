'use client';
import Image from "next/image";
import { useState, useEffect } from "react";
import { firestore } from "../firebase";
import { collection, query, getDocs, getDoc, deleteDoc, setDoc } from "firebase/firestore";
import { Box, Typography, Modal, Stack, TextField, Button } from "@mui/material";

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState("");

  const updateInventory = async() => {
    // Get snapshot of inventory
    const snapshot = query(collection(firestore, 'inventory'));

    // Get docs from snapshot
    const docs = await getDocs(snapshot);

    // Update inventory list from the docs
    const inventoryList = [];
    docs.forEach(doc => {
      inventoryList.push({
        name: doc.id,
        ...doc.data()
      });
    });
    
    // Update page's inventory state
    setInventory(inventoryList);
  };

  const removeItem = async (item) => {
    // Get direct item reference
    const docRef = doc(collection(firestore, 'inventory', item));

    // Get snapshot of item data
    const snapshot = await getDoc(docRef);

    // Decrement count by 1 or delete if no more of the item is remaining
    if (snapshot.exists()) {
      const {quantity} = snapshot.data;
      
      if (quantity === 1) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, {quantity: quantity - 1})
      }
    }

    // Update inventory
    await updateInventory();
  };

  const addItem = async (item) => {
    // Get direct item reference
    const docRef = doc(collection(firestore, 'inventory', item));

    // Get snapshot of item data
    const snapshot = await getDoc(docRef);

    // Increment count by 1 or add it to the DB if it doesn't already exist
    if (snapshot.exists()) {
      const {quantity} = snapshot.data;
      await setDoc(docRef, {quantity: quantity + 1});
    } else {
      await setDoc(docRef, {quantity: 1});
    }

    // Update inventory
    await updateInventory();
  }

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  useEffect(() => {
    updateInventory();
  }, []);

  return (
    <Box 
      width="100vw" 
      height="100vw" 
      display="flex" 
      justifyContent="center" 
      alignItems="center"
      flexDirection="column"
      gap={2}
    >
      <Modal open={open} onClose={handleClose}>
        <Box
          position="absolute"
          top="50%"
          left="50%"
          width={400}
          bgcolor="white"
          border="2px solid #000"
          boxShadow={24}
          p={4}
          display="flex"
          flexDirection="column"
          gap={3}
          sx={{
            transform: "translate(-50%, -50%)"
          }}
        >
          <Typography variant="h6">Add item</Typography>
          <Stack width="100%" direction="row" spacing={2}>
            <TextField 
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => {
                setItemName(e.target.value);
              }}
            />
            <Button variant="contained" onClick={() => {
              addItem(itemName);
              setItemName('');
              handleClose();
            }}>
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>
      <Button 
        variant="contained" 
        onClick={() => {
          handleOpen();
        }}
      >
        Add New Item
      </Button>
      <Box border="1px solid #333">
        <Box
          width="800px"
          height="100px"
          bgcolor="#ADD8E6"
        >
          <Typography 
            variant="h2" 
            color="#333" 
            alignItems="center"
            display="flex"
            justifyContent="center"
          >
            Inventory Items
          </Typography>
        </Box>
      </Box>
      <Stack 
        width="800px"
        height="300px"
        spacing={2}
        overflow="auto"
      >
        {
          inventory.map(({name, quantity}) =>  {
            <Box 
              key={name}
              width="100%"
              minHeight="150px"
              display="flex"
              alignItems="center"
              justifyContent="center"
              bgColor="#f0f0f0"
              padding={5}
            >
              <Typography>{name}</Typography>
            </Box>
          })
        }
      </Stack>
    </Box>
  );
}