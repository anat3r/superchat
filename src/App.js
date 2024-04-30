import logo from './logo.svg';
import './App.css';
import icon from './person-icon.jpg'

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, query, orderBy, limit, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { useState, useRef, useEffect } from 'react';
import { orderByChild, orderByKey } from 'firebase/database';
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseApp = initializeApp({
  apiKey: "AIzaSyBkeYB3HP4z6a5VhWDPB73K-_cvtrXSCgs",
  authDomain: "chat-app-54a2e.firebaseapp.com",
  databaseURL: "https://chat-app-54a2e-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "chat-app-54a2e",
  storageBucket: "chat-app-54a2e.appspot.com",
  messagingSenderId: "335415740965",
  appId: "1:335415740965:web:77722980cc0daeeaa08dcc",
  measurementId: "G-47LM9WWV3Z"
})
// Initialize Firebase
const auth = getAuth(firebaseApp);
const firestore = getFirestore(firebaseApp);
const analytics = getAnalytics(firebaseApp);


function App() {

  const [user] = useAuthState(auth);
  return (
    <div className="App">
      <header>
        <h1>👽✨</h1>
        <SignOut />
      </header>

      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>

    </div>
  );
}

function SignIn(){

  const signInWithGoogle = () => {
    const provider =  new GoogleAuthProvider();
    signInWithPopup(auth, provider);
  }


  return(
    <button onClick={signInWithGoogle}>Sign in with Google</button>
  )
}

function SignOut() {
  
  return auth.currentUser && (

    <button onClick={() => auth.signOut()}>Sign Out</button>
  )
} 

function ChatRoom(){


  const messageRef = collection(firestore, 'messages');
  const q = query(messageRef, orderBy('createdAt', 'desc'), limit(25));

  const [messages] = useCollectionData(q, {idField: 'id'});
  const dummy = useRef();
  const isInitial = useRef(true);
  const [formValue, setFormValue] = useState('');

  useEffect(() => {
    dummy.current.scrollIntoView({ behavior: isInitial ? 'instant' : 'smooth' });
    if(isInitial.current) isInitial.current = false;
    return () => isInitial.current = true;
  }, [messages])

  const sendMessage = async(e) => {
    e.preventDefault();

    const {uid,photoURL} = auth.currentUser;

    await addDoc(messageRef, {
      text: formValue,
      createdAt: serverTimestamp(),
      uid,
      photoURL
    })
    setFormValue('');
  }

  return (
    <>
    <main>
        <div>
          {messages && messages.toReversed().map(msg => <ChatMessage key={msg.id} message={msg} />)}
        </div>
        <div ref={dummy}></div>
    </main>

    <form onSubmit={formValue ? sendMessage : (e) => e.preventDefault()}>

        <input value={formValue} onChange={(e) => setFormValue(e.target.value)} />

        <button type='submit' aria-label="Post message">🕊️</button>
      </form>
    </>
  )
}

function ChatMessage(props) {
  const {text, uid, photoURL} = props.message;

  const messageClass = uid == auth.currentUser.uid ? 'sent' : 'resived';  

  return (
    <div className={`message ${messageClass}`}>
      <img src={photoURL || icon} />
      <p>{text}</p>
    </div>
  )
}
export default App