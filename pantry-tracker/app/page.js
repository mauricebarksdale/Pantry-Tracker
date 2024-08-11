'use client';
import Image from "next/image";
import { useState, useEffect } from "react";
import { firestore } from "../firebase";
import { collection, doc, query, where, getDocs, getDoc, deleteDoc, setDoc } from "firebase/firestore";
import { Box, Typography, Modal, Stack, TextField, Button, FormControl, OutlinedInput } from "@mui/material";

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'white',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
}

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState("");
  const [searchPhrase, setSearchPhrase] = useState("");

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  useEffect(() => {
    updateInventory();
  }, []);

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
    const docRef = doc(collection(firestore, 'inventory'), item);

    // Get snapshot of item data
    const docSnap = await getDoc(docRef);

    // Decrement count by 1 or delete if no more of the item is remaining
    if (docSnap.exists()) {
      const {quantity} = docSnap.data();
      
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
    const docRef = doc(collection(firestore, 'inventory'), item);

    // Get snapshot of item data
    const docSnap = await getDoc(docRef);

    // Increment count by 1 or add it to the DB if it doesn't already exist
    if (docSnap.exists()) {
      const {quantity} = docSnap.data();
      await setDoc(docRef, {quantity: quantity + 1});
    } else {
      await setDoc(docRef, {quantity: 1});
    }

    // Update inventory
    await updateInventory();
  }

  const searchItem = async (phrase) => {
    if (phrase) {
      // Get items that contain the search phrase
      const snapshot = query(collection(firestore, 'inventory'));
  
      // Get snapshot of item data
      const docRefs = await getDocs(snapshot);
      
      // Filter items that contain the search phrase
      const inventoryList = [];
      docRefs.forEach(doc => {
        if (doc.id.toLowerCase().includes(phrase.toLowerCase())) {
          inventoryList.push({
            name: doc.id,
            ...doc.data()
          });
        }
      });
  
      setInventory(inventoryList);
    } else {
      // Get the entire collection if the phrase is blank
      await updateInventory();
    }
  }

  return (
    <>
      <Box display="flex" justifyContent="center">
        <Typography variant="h1">
          Pantry Tracker
        </Typography>
      </Box>
      <Box
        width="100vw"
        height="100vh"
        display={'flex'}
        justifyContent={'center'}
        flexDirection={'column'}
        alignItems={'center'}
        gap={2}
      >
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style}>
            <Typography id="modal-modal-title" variant="h6" component="h2">
              Add Item
            </Typography>
            <Stack width="100%" direction={'row'} spacing={2}>
              <TextField
                id="outlined-basic"
                label="Item"
                variant="outlined"
                fullWidth
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
              />
              <Button
                variant="outlined"
                onClick={() => {
                  addItem(itemName)
                  setItemName('')
                  handleClose()
                }}
              >
                Add
              </Button>
            </Stack>
          </Box>
        </Modal>
        <Button variant="contained" onClick={handleOpen}>
          Add New Item
        </Button>
        <Box>
          <FormControl>
            <Stack 
              direction="row" 
              spacing={5} 
              justifyContent="center" 
              alignItems="center"
            >
              <OutlinedInput 
                id="ItemPhrase"
                variant="outlined" 
                placeholder="Search for item by name"
                sx={{ width: '50vh'}}
                value={searchPhrase}
                onChange={(e) => setSearchPhrase(e.target.value)}
              />
              <Button 
                variant="contained" 
                onClick={() => searchItem(searchPhrase)}>
                  Search
              </Button>
            </Stack>
          </FormControl>
        </Box>
        <Box border={'1px solid #333'}>
          <Box
            width="800px"
            height="100px"
            bgcolor={'#ADD8E6'}
            display={'flex'}
            justifyContent={'center'}
            alignItems={'center'}
          >
            <Typography variant={'h2'} color={'#333'} textAlign={'center'}>
              Inventory Items
            </Typography>
          </Box>
          <Stack width="800px" height="300px" spacing={2} overflow={'auto'}>
            {inventory.map(({name, quantity}) => (
              <Box
                key={name}
                width="100%"
                minHeight="150px"
                display={'flex'}
                justifyContent={'space-between'}
                alignItems={'center'}
                bgcolor={'#f0f0f0'}
                paddingX={5}
              >
                <Typography variant={'h3'} color={'#333'} textAlign={'center'}>
                  {name.charAt(0).toUpperCase() + name.slice(1)}
                </Typography>
                <Typography variant={'h3'} color={'#333'} textAlign={'center'}>
                  Quantity: {quantity}
                </Typography>
                <Button variant="contained" onClick={() => addItem(name)}>
                  Add
                </Button>
                <Button variant="contained" onClick={() => removeItem(name)}>
                  Remove
                </Button>
              </Box>
            ))}
          </Stack>
        </Box>
      </Box>
    </>
  )
}