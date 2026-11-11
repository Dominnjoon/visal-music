
import { useState } from "react";
import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp
} from "firebase/firestore";

import { db } from "../services/firebase";

function FirebaseTest() {
  const [message, setMessage] = useState("");
  const [data, setData] = useState([]);

  // INSERT DATA
  const addTestData = async () => {
    try {
      const docRef = await addDoc(
        collection(db, "connection_tests"),
        {
          name: "Firebase Test",
          status: "Connected",
          createdAt: serverTimestamp()
        }
      );

      setMessage("Insert Success! ID: " + docRef.id);
    } catch (error) {
      setMessage("Insert Error: " + error.message);
    }
  };

  // READ DATA
  const readTestData = async () => {
    try {
      const querySnapshot = await getDocs(
        collection(db, "connection_tests")
      );

      const result = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setData(result);
      setMessage("Read Data Successfully!");
    } catch (error) {
      setMessage("Read Error: " + error.message);
    }
  };

  return (
    <div style={{ padding: 30 }}>
      <h1>Firebase Database Testing</h1>

      <button onClick={addTestData}>
        Insert Data
      </button>

      <button onClick={readTestData}>
        Read Data
      </button>

      <h3>{message}</h3>

      {data.map(item => (
        <div key={item.id}>
          <p>Name: {item.name}</p>
          <p>Status: {item.status}</p>
          <hr />
        </div>
      ))}
    </div>
  );
}

export default FirebaseTest;
