import { useEffect, useMemo, useState } from 'react'
import { createUserWithEmailAndPassword, onAuthStateChanged, sendPasswordResetEmail, signInWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth'
import { doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore'
import { Routes, Route, useNavigate, useParams } from 'react-router-dom'
import { auth, db, hasFirebaseConfig } from './firebase'
import './App.css'

function PetDetailPage({ pets, tasks, healthRecords, setSelectedPet, setModal, setPetForm, setReminderForm }) {
  const navigate = useNavigate()
  const { petKey } = useParams()
  const activePet = pets.find((pet) => (pet.id || pet.name) === petKey)

  useEffect(() => {
    if (activePet) {
      setSelectedPet(activePet.name)
    }
  }, [activePet, setSelectedPet])

  if (!activePet) {
    return (
      <section className="empty-page">
        <p className="eyebrow">Pet not found</p>
        <h2>We couldn't find that pet.</h2>
        <button className="add-button" onClick={() => navigate('/')}>Back home</button>
      </section>
    )
  }

  const activePetTasks = tasks.filter((task) => task.pet === activePet.name)
  const petKeyValue = activePet.id || activePet.name
  const activePetRecords = [...(healthRecords[petKeyValue] || [])].sort((a, b) => new Date(b.date) - new Date(a.date))

  return (
    <section className="pet-detail-page">
      <button className="back-button" onClick={() => navigate('/')}>← Back to my pets</button>
      <div className="pet-detail-hero" style={{ '--pet-color': activePet.color }}>
        <span className="detail-art">{activePet.icon}</span>
        <div><p className="eyebrow">PET PROFILE</p><h2>{activePet.name}</h2><p>{activePet.breed} · {activePet.age}</p><span className="health-pill">● {activePet.status}</span></div>
        <div className="pet-actions"><button className="edit-button" onClick={() => { setPetForm({ name: activePet.name, breed: activePet.breed, age: activePet.age, species: activePet.icon === '🐈' ? 'Cat' : 'Dog' }); setModal('edit-pet') }}>Edit pet</button><button className="delete-button" onClick={() => navigate('/')}>Delete</button><button className="add-button" onClick={() => { setReminderForm({ title: '', pet: activePet.name, due: '', type: '💊' }); setModal('reminder') }}>+ Add reminder</button></div>
      </div>
      <div className="detail-grid">
        <div className="detail-card"><p className="eyebrow">ABOUT {activePet.name.toUpperCase()}</p><h3>Pet details</h3><p>{activePet.status}</p></div>
        <div className="detail-card"><p className="eyebrow">CARE AT A GLANCE</p><h3>Upcoming reminders</h3>{activePetTasks.length ? <ul className="detail-task-list">{activePetTasks.map((task) => <li key={task.id}><span>{task.icon}</span><div><strong>{task.title}</strong><small>{task.due}</small></div></li>)}</ul> : <p>No upcoming reminders for {activePet.name}.</p>}</div>
      </div>
      <div className="detail-card health-records-card">
        <div className="record-heading"><div><p className="eyebrow">DIGITAL HEALTH RECORDS</p><h3>{activePet.name}'s health records</h3></div><button className="text-button" onClick={() => setModal('record')}>+ Add record</button></div>
        {activePetRecords.length ? <div className="health-record-list">{activePetRecords.map((record) => <button key={record.id} className="health-record" onClick={() => navigate(`/pets/${petKeyValue}/records/${record.id}`)}><span className={`record-icon ${record.type.toLowerCase().replace(' ', '-')}`}>{record.type === 'Vaccination' ? '💉' : record.type === 'Vet Visit' ? '🩺' : '💊'}</span><div><time>{new Date(`${record.date}T00:00:00`).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</time><strong>{record.type}</strong><h4>{record.title}</h4>{record.description && <p>{record.description}</p>}{(record.veterinarian || record.nextDueDate) && <div className="record-meta">{record.veterinarian && <span>🩺 {record.veterinarian}</span>}{record.nextDueDate && <span>Next due: {new Date(`${record.nextDueDate}T00:00:00`).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>}</div>}</div><span className="record-arrow">→</span></button>)}</div> : <div className="health-empty"><span>📋</span><p>No health records yet. Add vaccinations, vet visits, or medications to keep {activePet.name}'s history in one place.</p></div>}
      </div>
    </section>
  )
}

function HealthRecordDetailPage({ pets, healthRecords, setModal, setRecordForm, setSelectedHealthRecord }) {
  const navigate = useNavigate()
  const { petKey, recordId } = useParams()
  const activePet = pets.find((pet) => (pet.id || pet.name) === petKey)
  const activeRecord = activePet ? (healthRecords[petKey] || []).find((record) => record.id === recordId) : null

  if (!activePet || !activeRecord) {
    return (
      <section className="empty-page">
        <p className="eyebrow">Record not found</p>
        <h2>We couldn't find that health record.</h2>
        <button className="add-button" onClick={() => navigate('/')}>Back home</button>
      </section>
    )
  }

  useEffect(() => {
    setSelectedHealthRecord(activeRecord)
  }, [activeRecord, setSelectedHealthRecord])

  const petKeyValue = activePet.id || activePet.name

  return (
    <section className="health-record-detail">
      <button className="back-button" onClick={() => navigate(`/pets/${petKeyValue}`)}>← Back to health records</button>
      <div className="record-detail-heading"><span className={`record-icon ${activeRecord.type.toLowerCase().replace(' ', '-')}`}>{activeRecord.type === 'Vaccination' ? '💉' : activeRecord.type === 'Vet Visit' ? '🩺' : '💊'}</span><div><p className="eyebrow">DIGITAL HEALTH RECORD</p><h3>{activeRecord.title}</h3><p>{activeRecord.type}</p></div><div className="record-actions"><button className="edit-button" onClick={() => { setSelectedHealthRecord(activeRecord); setRecordForm({ date: activeRecord.date, type: activeRecord.type, title: activeRecord.title, description: activeRecord.description || '', veterinarian: activeRecord.veterinarian || '', nextDueDate: activeRecord.nextDueDate || '' }); setModal('edit-record') }}>Edit</button><button className="delete-button" onClick={() => navigate(`/pets/${petKeyValue}`)}>Delete</button></div></div>
      <div className="record-detail-grid"><div><span>Date</span><strong>{new Date(`${activeRecord.date}T00:00:00`).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</strong></div><div><span>Veterinarian</span><strong>{activeRecord.veterinarian || 'Not specified'}</strong></div><div><span>Next due date</span><strong>{activeRecord.nextDueDate ? new Date(`${activeRecord.nextDueDate}T00:00:00`).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'Not specified'}</strong></div></div>
      <div className="record-detail-notes"><span>Description</span><p>{activeRecord.description || 'No additional description was added for this record.'}</p></div>
    </section>
  )
}

const defaultPets = [
  { name: 'Buddy', breed: 'Golden Retriever', age: '3 years', icon: '🐕', color: '#f9c66a', status: 'Happy & healthy' },
  { name: 'Luna', breed: 'Siamese Cat', age: '2 years', icon: '🐈', color: '#bca4ed', status: 'Due for a checkup' },
  { name: 'Max', breed: 'German Shepherd', age: '5 years', icon: '🐕', color: '#e6a980', status: 'Medication today' },
]

const defaultTasks = [
  { id: 1, title: 'Heartgard Plus', pet: 'Buddy', due: 'Today', icon: '💊', tone: 'orange' },
  { id: 2, title: 'Apoquel refill', pet: 'Max', due: 'Aug 15', icon: '💊', tone: 'purple' },
  { id: 3, title: 'Full grooming session', pet: 'Buddy', due: 'Aug 20', icon: '✂️', tone: 'teal' },
]

function App() {
  const [activeTab, setActiveTab] = useState('Overview')
  const [pets, setPets] = useState([])
  const [tasks, setTasks] = useState([])
  const [healthRecords, setHealthRecords] = useState({})
  const [selectedPet, setSelectedPet] = useState('Buddy')
  const [completedCount, setCompletedCount] = useState(0)
  const [notice, setNotice] = useState('')
  const [firebaseStatus, setFirebaseStatus] = useState(hasFirebaseConfig ? 'Connecting your PawPal account…' : 'Demo mode')
  const [modal, setModal] = useState(null)
  const [petForm, setPetForm] = useState({ name: '', breed: '', age: '', species: 'Dog' })
  const [reminderForm, setReminderForm] = useState({ title: '', pet: 'Buddy', due: '', type: '💊' })
  const [recordForm, setRecordForm] = useState({ date: '', type: 'Vaccination', title: '', description: '', veterinarian: '', nextDueDate: '' })
  const [selectedHealthRecord, setSelectedHealthRecord] = useState(null)
  const [authModal, setAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState('login')
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' })
  const [authUser, setAuthUser] = useState(null)
  const [authError, setAuthError] = useState('')
  const [authBusy, setAuthBusy] = useState(false)
  const navigate = useNavigate()

  const completed = 0
  const firstName = useMemo(() => {
    if (!authUser || authUser.isAnonymous) return ''
    return (authUser.displayName || authUser.email?.split('@')[0] || '').split(' ')[0]
  }, [authUser])
  const greeting = useMemo(() => selectedPet === 'Buddy' ? `Good morning${firstName ? `, ${firstName}` : ''}!` : `${selectedPet} is looking great!`, [firstName, selectedPet])

  const persistDashboard = async (nextPets, nextTasks, nextHealthRecords = healthRecords, nextCompletedCount = completedCount) => {
    if (hasFirebaseConfig && auth?.currentUser && db) {
      const user = auth.currentUser
      await setDoc(doc(db, 'pawpalDashboards', user.uid), {
        pets: nextPets,
        tasks: nextTasks,
        healthRecords: nextHealthRecords,
        completedCount: nextCompletedCount,
        profile: {
          displayName: user.displayName || '',
          email: user.isAnonymous ? '' : user.email || '',
        },
        updatedAt: serverTimestamp(),
      }, { merge: true })
    }
  }

  const firebaseErrorMessage = (error, action) => {
    const messages = {
      'permission-denied': `Firestore blocked ${action}. Publish the PawPal Firestore security rule.`,
      'unauthenticated': `Sign in is required before ${action} can be synced.`,
      'failed-precondition': 'Create a Firestore Database in Firebase Console, then try again.',
      'unavailable': 'Firestore is temporarily unavailable. Check your connection and try again.',
    }
    return messages[error?.code] || `${action} could not be synced (${error?.code || 'unknown Firebase error'}).`
  }

  const openSection = (section) => {
    setActiveTab(section === 'my-pets' ? 'My Pets' : section === 'calendar' ? 'Calendar' : 'Overview')
    document.getElementById(section)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const formatDueDate = (date) => {
    if (!date) return 'Upcoming'
    if (date === new Date().toISOString().slice(0, 10)) return 'Today'
    return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  }

  const isStarterDashboard = (data) =>
    Array.isArray(data.pets) &&
    Array.isArray(data.tasks) &&
    data.pets.length === defaultPets.length &&
    data.tasks.length === defaultTasks.length &&
    data.pets.every((pet, index) => pet.name === defaultPets[index].name) &&
    data.tasks.every((task, index) => task.title === defaultTasks[index].title)

  useEffect(() => {
    if (!hasFirebaseConfig || !auth || !db) {
      setPets([])
      setTasks([])
      setHealthRecords({})
      setFirebaseStatus('Firebase configuration required')
      return undefined
    }

    let unsubscribeSnapshot
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      try {
        unsubscribeSnapshot?.()
        if (!user || user.isAnonymous) {
          if (user?.isAnonymous) await signOut(auth)
          setAuthUser(null)
          setPets([])
          setTasks([])
          setHealthRecords({})
          setFirebaseStatus('Sign in to access your private dashboard')
          return
        }
        setAuthUser(user)
        const dashboardRef = doc(db, 'pawpalDashboards', user.uid)

        unsubscribeSnapshot = onSnapshot(dashboardRef, async (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data()
            if (isStarterDashboard(data)) {
              setPets([])
              setTasks([])
              setCompletedCount(0)
              await persistDashboard([], [], {}, 0)
            } else {
              if (Array.isArray(data.pets)) setPets(data.pets)
              if (Array.isArray(data.tasks)) setTasks(data.tasks)
              setHealthRecords(data.healthRecords && typeof data.healthRecords === 'object' ? data.healthRecords : {})
              setCompletedCount(typeof data.completedCount === 'number' ? data.completedCount : 0)
            }
          } else {
            try {
              await persistDashboard([], [], {})
            } catch (error) {
              setFirebaseStatus('Unable to sync — using demo data')
              setNotice(firebaseErrorMessage(error, 'your dashboard'))
              return
            }
          }
          setFirebaseStatus('Synced with Firebase')
        }, (error) => {
          setFirebaseStatus('Unable to sync — using demo data')
          setNotice(error.code === 'permission-denied' ? 'Firestore access is blocked by your security rules.' : 'Firebase sync is unavailable. Check your project settings.')
        })
      } catch (error) {
        setAuthUser(null)
        setFirebaseStatus('Unable to connect — using demo data')
        setNotice(error.code === 'auth/operation-not-allowed' ? 'Enable Anonymous sign-in in Firebase Authentication to connect PawPal.' : 'Firebase could not connect. Check .env.local values.')
      }
    })

    return () => {
      unsubscribeAuth()
      unsubscribeSnapshot?.()
    }
  }, [])

  const openAuth = (mode) => {
    setAuthMode(mode)
    setAuthError('')
    setAuthModal(true)
  }

  const submitAuth = async (event) => {
    event.preventDefault()
    if (!auth) {
      setAuthError('Add your Firebase configuration in .env.local before using authentication.')
      return
    }
    setAuthBusy(true)
    setAuthError('')
    try {
      if (authMode === 'signup') {
        const credential = await createUserWithEmailAndPassword(auth, authForm.email, authForm.password)
        if (authForm.name.trim()) await updateProfile(credential.user, { displayName: authForm.name.trim() })
        await persistDashboard([], [], {})
        setNotice('Your PawPal account is ready.')
      } else if (authMode === 'reset') {
        await sendPasswordResetEmail(auth, authForm.email)
        setNotice('Check your inbox for a password reset link.')
      } else {
        await signInWithEmailAndPassword(auth, authForm.email, authForm.password)
        setNotice('Welcome back to PawPal!')
      }
      setAuthForm({ name: '', email: '', password: '' })
      setAuthModal(false)
    } catch (error) {
      const messages = {
        'auth/email-already-in-use': 'An account already exists for this email.',
        'auth/invalid-credential': 'Email or password is incorrect.',
        'auth/weak-password': 'Use a password with at least 6 characters.',
        'auth/invalid-email': 'Enter a valid email address.',
        'auth/user-not-found': 'No account was found for that email.',
        'auth/missing-email': 'Please provide an email address to reset your password.',
        'auth/operation-not-allowed': 'Enable Email/Password sign-in in Firebase Authentication.',
      }
      setAuthError(messages[error.code] || 'Could not complete authentication. Please try again.')
    } finally {
      setAuthBusy(false)
    }
  }

  const logout = async () => {
    if (!auth) return
    await signOut(auth)
    setNotice('You have been logged out.')
  }

  const completeTask = async (id) => {
    const task = tasks.find((item) => item.id === id)
    const updatedTasks = tasks.filter((item) => item.id !== id)
    const nextCompleted = completedCount + 1
    setTasks(updatedTasks)
    setCompletedCount(nextCompleted)
    setNotice(`${task.title} marked as complete.`)

    if (hasFirebaseConfig && auth?.currentUser && db) {
      try {
        await persistDashboard(pets, updatedTasks, healthRecords, nextCompleted)
      } catch (error) {
        setNotice(firebaseErrorMessage(error, `${task.title} completion`))
      }
    }
  }

  const addPet = async (event) => {
    event.preventDefault()
    const species = petForm.species === 'Cat' ? '🐈' : '🐕'
    const colors = petForm.species === 'Cat' ? ['#bca4ed', '#d7c5a7', '#a9c7e8'] : ['#f9c66a', '#e6a980', '#b9d5b5']
    const newPet = {
      id: `pet-${Date.now()}`,
      name: petForm.name.trim(),
      breed: petForm.breed.trim() || `${petForm.species} companion`,
      age: petForm.age.trim() || 'Age not set',
      icon: species,
      color: colors[pets.length % colors.length],
      status: 'Happy & healthy',
    }
    const updatedPets = [...pets, newPet]
    setPets(updatedPets)
    setSelectedPet(newPet.name)
    setModal(null)
    setPetForm({ name: '', breed: '', age: '', species: 'Dog' })
    setNotice(`${newPet.name} has been added to your family.`)
    try { await persistDashboard(updatedPets, tasks, healthRecords) } catch (error) { setNotice(firebaseErrorMessage(error, `${newPet.name} addition`)) }
  }

  const editPet = async (event) => {
    event.preventDefault()
    if (!activePet) return
    const updatedPet = {
      ...activePet,
      name: petForm.name.trim(),
      breed: petForm.breed.trim() || `${petForm.species} companion`,
      age: petForm.age.trim() || 'Age not set',
      icon: petForm.species === 'Cat' ? '🐈' : '🐕',
    }
    const updatedPets = pets.map((pet) => pet.id === activePet.id ? updatedPet : pet)
    const updatedTasks = tasks.map((task) => task.pet === activePet.name ? { ...task, pet: updatedPet.name } : task)
    setPets(updatedPets)
    setTasks(updatedTasks)
    setSelectedPet(updatedPet.name)
    setPetForm({ name: '', breed: '', age: '', species: 'Dog' })
    setModal(null)
    setNotice(`${updatedPet.name}'s details were updated.`)
    try { await persistDashboard(updatedPets, updatedTasks, healthRecords) } catch (error) { setNotice(firebaseErrorMessage(error, `${updatedPet.name}'s update`)) }
  }

  const deletePet = async () => {
    if (!activePet || !window.confirm(`Delete ${activePet.name} and all of their reminders and health records?`)) return
    const petKey = activePet.id || activePet.name
    const updatedPets = pets.filter((pet) => pet.id !== activePet.id)
    const updatedTasks = tasks.filter((task) => task.pet !== activePet.name)
    const updatedRecords = { ...healthRecords }
    delete updatedRecords[petKey]
    const petName = activePet.name
    setPets(updatedPets)
    setTasks(updatedTasks)
    setHealthRecords(updatedRecords)
    setSelectedPet(updatedPets[0]?.name || '')
    navigate('/')
    setNotice(`${petName} and their records were deleted.`)
    try { await persistDashboard(updatedPets, updatedTasks, updatedRecords) } catch (error) { setNotice(firebaseErrorMessage(error, `${petName}'s deletion`)) }
  }

  const addReminder = async (event) => {
    event.preventDefault()
    const newReminder = { id: Date.now(), title: reminderForm.title.trim(), pet: reminderForm.pet, due: formatDueDate(reminderForm.due), icon: reminderForm.type, tone: reminderForm.type === '✂️' ? 'teal' : reminderForm.type === '🩺' ? 'purple' : 'orange' }
    const updatedTasks = [...tasks, newReminder]
    setTasks(updatedTasks)
    setModal(null)
    setReminderForm({ title: '', pet: pets[0]?.name || '', due: '', type: '💊' })
    setNotice(`${newReminder.title} reminder added.`)
    try { await persistDashboard(pets, updatedTasks, healthRecords) } catch (error) { setNotice(firebaseErrorMessage(error, `${newReminder.title} reminder`)) }
  }

  const addHealthRecord = async (event) => {
    event.preventDefault()
    if (!activePet) return
    const petKey = activePet.id || activePet.name
    const newRecord = {
      id: `record-${Date.now()}`,
      date: recordForm.date,
      type: recordForm.type,
      title: recordForm.title.trim(),
      description: recordForm.description.trim(),
      veterinarian: recordForm.veterinarian.trim(),
      nextDueDate: recordForm.nextDueDate,
    }
    const updatedRecords = { ...healthRecords, [petKey]: [...(healthRecords[petKey] || []), newRecord] }
    setHealthRecords(updatedRecords)
    setModal(null)
    setRecordForm({ date: '', type: 'Vaccination', title: '', description: '', veterinarian: '', nextDueDate: '' })
    setNotice(`${newRecord.title} was added to ${activePet.name}'s health records.`)
    try { await persistDashboard(pets, tasks, updatedRecords) } catch (error) { setNotice(firebaseErrorMessage(error, `${activePet.name}'s health record`)) }
  }

  const editHealthRecord = async (event) => {
    event.preventDefault()
    if (!activePet || !selectedHealthRecord) return
    const petKey = activePet.id || activePet.name
    const updatedRecord = {
      ...selectedHealthRecord,
      date: recordForm.date,
      type: recordForm.type,
      title: recordForm.title.trim(),
      description: recordForm.description.trim(),
      veterinarian: recordForm.veterinarian.trim(),
      nextDueDate: recordForm.nextDueDate,
    }
    const updatedRecords = { ...healthRecords, [petKey]: (healthRecords[petKey] || []).map((record) => record.id === selectedHealthRecord.id ? updatedRecord : record) }
    setHealthRecords(updatedRecords)
    setSelectedHealthRecord(updatedRecord)
    setModal(null)
    setNotice(`${updatedRecord.title} was updated.`)
    try { await persistDashboard(pets, tasks, updatedRecords) } catch (error) { setNotice(firebaseErrorMessage(error, `${activePet.name}'s health record update`)) }
  }

  const deleteHealthRecord = async () => {
    if (!activePet || !selectedHealthRecord || !window.confirm(`Delete the health record “${selectedHealthRecord.title}”?`)) return
    const petKey = activePet.id || activePet.name
    const updatedRecords = { ...healthRecords, [petKey]: (healthRecords[petKey] || []).filter((record) => record.id !== selectedHealthRecord.id) }
    const recordTitle = selectedHealthRecord.title
    setHealthRecords(updatedRecords)
    setSelectedHealthRecord(null)
    setNotice(`${recordTitle} was deleted.`)
    try { await persistDashboard(pets, tasks, updatedRecords) } catch (error) { setNotice(firebaseErrorMessage(error, `${activePet.name}'s health record deletion`)) }
  }

  const activePet = pets.find((pet) => pet.name === selectedPet)
  const activePetTasks = tasks.filter((task) => task.pet === selectedPet)
  const activePetRecords = activePet ? [...(healthRecords[activePet.id || activePet.name] || [])].sort((a, b) => new Date(b.date) - new Date(a.date)) : []
  const isLoggedIn = Boolean(authUser && !authUser.isAnonymous)

  if (!isLoggedIn) {
    return (
      <main className="pawpal-shell">
        <nav className="topbar">
          <button className="brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="PawPal home"><span className="brand-mark">🐾</span><span>PawPal</span></button>
          <div className="auth-links"><button onClick={() => openAuth('login')}>Log in</button><button className="signup-button" onClick={() => openAuth('signup')}>Sign up</button></div>
        </nav>
        <section className="signed-out">
          <span>🐾</span><p className="eyebrow">YOUR PRIVATE PET CARE SPACE</p><h1>Every pet has a home here.</h1><p>Log in to view and manage the pets, reminders, and care details saved only to your account.</p><div><button className="add-button" onClick={() => openAuth('signup')}>Create an account</button><button className="secondary-cta" onClick={() => openAuth('login')}>Log in</button></div>
        </section>
        {notice && <div className="toast" role="status">{notice}<button onClick={() => setNotice('')} aria-label="Dismiss">×</button></div>}
        {authModal && <div className="modal-backdrop" role="presentation" onMouseDown={() => setAuthModal(false)}>
          <form className="modal-card auth-card" onSubmit={submitAuth} onMouseDown={(event) => event.stopPropagation()}>
            <div className="modal-heading"><div><p className="eyebrow">WELCOME TO PAWPAL</p><h2>{authMode === 'login' ? 'Log in' : authMode === 'signup' ? 'Create your account' : 'Reset password'}</h2></div><button type="button" className="close-button" onClick={() => setAuthModal(false)} aria-label="Close">×</button></div>
            {authMode === 'signup' && <label>Your name<input required value={authForm.name} onChange={(event) => setAuthForm({ ...authForm, name: event.target.value })} placeholder="e.g. Sarah Mitchell" /></label>}
            <label>Email<input required type="email" value={authForm.email} onChange={(event) => setAuthForm({ ...authForm, email: event.target.value })} placeholder="you@example.com" /></label>
            {(authMode === 'login' || authMode === 'signup') && <label>Password<input required minLength="6" type="password" value={authForm.password} onChange={(event) => setAuthForm({ ...authForm, password: event.target.value })} placeholder="At least 6 characters" /></label>}
            {authError && <p className="auth-error" role="alert">{authError}</p>}
            <button className="add-button auth-submit" type="submit" disabled={authBusy}>{authBusy ? 'Please wait…' : authMode === 'login' ? 'Log in' : authMode === 'reset' ? 'Send reset link' : 'Create account'}</button>
            <p className="auth-switch">{authMode === 'login' ? 'New to PawPal?' : authMode === 'signup' ? 'Already have an account?' : 'Remembered your password?'} <button type="button" onClick={() => { setAuthMode(authMode === 'login' ? 'signup' : authMode === 'signup' ? 'reset' : 'login'); setAuthError('') }}>{authMode === 'login' ? 'Sign up' : authMode === 'signup' ? 'Reset password' : 'Log in'}</button></p>
            {authMode === 'login' && <p className="auth-footer"><button type="button" className="link-button" onClick={() => { setAuthMode('reset'); setAuthError('') }}>Forgot password?</button></p>}
          </form>
        </div>}
      </main>
    )
  }

  return (
    <main className="pawpal-shell">
      <nav className="topbar">
        <button className="brand" onClick={() => { navigate('/'); setActiveTab('Overview') }} aria-label="PawPal home">
          <span className="brand-mark">🐾</span><span>PawPal</span>
        </button>
        <div className="nav-links">
          {['Overview', 'My Pets', 'Calendar'].map((item) => (
            <button key={item} className={activeTab === item ? 'nav-link active' : 'nav-link'} onClick={() => openSection(item === 'My Pets' ? 'my-pets' : item === 'Calendar' ? 'calendar' : 'top')}>{item}</button>
          ))}
        </div>
        {authUser && !authUser.isAnonymous ? <div className="profile"><span className="avatar">{(authUser.displayName || authUser.email || 'P').slice(0, 1).toUpperCase()}</span><span className="profile-name">{authUser.displayName || authUser.email}</span><button className="logout-button" onClick={logout}>Log out</button></div> : <div className="auth-links"><button onClick={() => openAuth('login')}>Log in</button><button className="signup-button" onClick={() => openAuth('signup')}>Sign up</button></div>}
      </nav>

      <section className="welcome-row">
        <div><p className="eyebrow">YOUR PET CARE COMPANION</p><h1>{greeting}</h1><p className="welcome-copy">Here’s what’s happening with your furry family today.</p></div>
        <div className="header-actions"><span className={`sync-status ${firebaseStatus.startsWith('Synced') ? 'synced' : ''}`}>{firebaseStatus}</span><button className="add-button" onClick={() => { setPetForm({ name: '', breed: '', age: '', species: 'Dog' }); setModal('pet') }}>+ Add a pet</button></div>
      </section>

      {notice && <div className="toast" role="status">{notice}<button onClick={() => setNotice('')} aria-label="Dismiss">×</button></div>}

      <Routes>
        <Route path="/" element={
          <>
            <section className="summary-grid" aria-label="Pet care summary">
              <div className="summary-card"><span className="summary-icon peach">🐾</span><div><strong>{pets.length}</strong><span>Pets in your family</span></div></div>
              <div className="summary-card"><span className="summary-icon lavender">📅</span><div><strong>{tasks.length}</strong><span>Upcoming reminders</span></div></div>
              <div className="summary-card"><span className="summary-icon mint">✓</span><div><strong>{completedCount}</strong><span>Tasks completed</span></div></div>
            </section>

            <section className="content-grid">
              <div className="panel pets-panel" id="my-pets">
                <div className="panel-heading"><div><p className="eyebrow">YOUR COMPANIONS</p><h2>My pets</h2></div><button className="text-button" onClick={() => openSection('my-pets')}>View all <span>→</span></button></div>
                <div className="pet-grid">
                  {pets.map((pet) => <button className={`pet-card ${selectedPet === pet.name ? 'selected' : ''}`} key={pet.name} onClick={() => navigate(`/pets/${pet.id || pet.name}`)}>
                    <span className="pet-art" style={{ background: pet.color }}>{pet.icon}</span><span className="pet-info"><strong>{pet.name}</strong><small>{pet.breed} · {pet.age}</small><em>{pet.status}</em></span><span className="arrow">→</span>
                  </button>)}
                </div>
              </div>
              <aside className="panel task-panel" id="calendar">
                <div className="panel-heading"><div><p className="eyebrow">STAY ON TRACK</p><h2>Upcoming care</h2></div><button className="text-button" onClick={() => openSection('calendar')}>Calendar <span>→</span></button></div>
                <div className="tasks">
                  {tasks.length ? tasks.map((task) => <div className="task" key={task.id}><span className={`task-icon ${task.tone}`}>{task.icon}</span><div><strong>{task.title}</strong><small>{task.pet} · <b>{task.due}</b></small></div><button className="done-button" onClick={() => completeTask(task.id)} aria-label={`Complete ${task.title}`}>✓</button></div>) : <p className="empty">All caught up — nice work!</p>}
                </div>
                <button className="reminder-button" onClick={() => { setReminderForm((current) => ({ ...current, pet: pets[0]?.name || '' })); setModal('reminder') }}>+ Add reminder</button>
              </aside>
            </section>
            <section className="tip-card"><span>💡</span><div><p className="eyebrow">PAWPAL TIP</p><h3>A little consistency goes a long way.</h3><p>Keep health records and reminders together so every member of the family can give the best care.</p></div><button onClick={() => setNotice('Health records opened.')}>View health records →</button></section>
          </>
        } />
        <Route path="/pets/:petKey" element={
          <PetDetailPage pets={pets} tasks={tasks} healthRecords={healthRecords} setSelectedPet={setSelectedPet} setModal={setModal} setPetForm={setPetForm} setReminderForm={setReminderForm} />
        } />
        <Route path="/pets/:petKey/records/:recordId" element={
          <HealthRecordDetailPage pets={pets} healthRecords={healthRecords} setModal={setModal} setRecordForm={setRecordForm} setSelectedHealthRecord={setSelectedHealthRecord} />
        } />
      </Routes>

      {modal && <div className="modal-backdrop" role="presentation" onMouseDown={() => setModal(null)}>
        <form className="modal-card" onSubmit={modal === 'pet' ? addPet : modal === 'edit-pet' ? editPet : modal === 'reminder' ? addReminder : modal === 'edit-record' ? editHealthRecord : addHealthRecord} onMouseDown={(event) => event.stopPropagation()}>
          <div className="modal-heading"><div><p className="eyebrow">PAWPAL</p><h2>{modal === 'pet' ? 'Add a pet' : modal === 'edit-pet' ? 'Edit pet' : modal === 'reminder' ? 'Add a reminder' : modal === 'edit-record' ? 'Edit health record' : 'Add health record'}</h2></div><button type="button" className="close-button" onClick={() => setModal(null)} aria-label="Close">×</button></div>
          {modal === 'pet' || modal === 'edit-pet' ? <>
            <label>Name<input required value={petForm.name} onChange={(event) => setPetForm({ ...petForm, name: event.target.value })} placeholder="e.g. Bailey" /></label>
            <label>Species<select value={petForm.species} onChange={(event) => setPetForm({ ...petForm, species: event.target.value })}><option>Dog</option><option>Cat</option></select></label>
            <label>Breed<input value={petForm.breed} onChange={(event) => setPetForm({ ...petForm, breed: event.target.value })} placeholder="e.g. Golden Retriever" /></label>
            <label>Age<input value={petForm.age} onChange={(event) => setPetForm({ ...petForm, age: event.target.value })} placeholder="e.g. 2 years" /></label>
          </> : modal === 'reminder' ? <>
            <label>Reminder<input required value={reminderForm.title} onChange={(event) => setReminderForm({ ...reminderForm, title: event.target.value })} placeholder="e.g. Vet checkup" /></label>
          <label>Pet<select value={reminderForm.pet} onChange={(event) => setReminderForm({ ...reminderForm, pet: event.target.value })}>{pets.map((pet) => <option key={pet.id || pet.name}>{pet.name}</option>)}</select></label>
            <label>Due date<input type="date" required value={reminderForm.due} onChange={(event) => setReminderForm({ ...reminderForm, due: event.target.value })} /></label>
            <label>Care type<select value={reminderForm.type} onChange={(event) => setReminderForm({ ...reminderForm, type: event.target.value })}><option value="💊">Medication</option><option value="🩺">Checkup</option><option value="✂️">Grooming</option></select></label>
          </> : <>
            <label>Date<input required type="date" value={recordForm.date} onChange={(event) => setRecordForm({ ...recordForm, date: event.target.value })} /></label>
            <label>Record type<select value={recordForm.type} onChange={(event) => setRecordForm({ ...recordForm, type: event.target.value })}><option>Vaccination</option><option>Vet Visit</option><option>Medication</option></select></label>
            <label>Title<input required value={recordForm.title} onChange={(event) => setRecordForm({ ...recordForm, title: event.target.value })} placeholder="e.g. Rabies Vaccine" /></label>
            <label>Description<textarea value={recordForm.description} onChange={(event) => setRecordForm({ ...recordForm, description: event.target.value })} placeholder="Treatment notes or observations" /></label>
            <label>Veterinarian<input value={recordForm.veterinarian} onChange={(event) => setRecordForm({ ...recordForm, veterinarian: event.target.value })} placeholder="e.g. Dr. Ahmed" /></label>
            <label>Next due date<input type="date" value={recordForm.nextDueDate} onChange={(event) => setRecordForm({ ...recordForm, nextDueDate: event.target.value })} /></label>
          </>}
          <div className="modal-actions"><button type="button" className="cancel-button" onClick={() => setModal(null)}>Cancel</button><button className="add-button" type="submit">{modal === 'pet' ? 'Add pet' : modal === 'edit-pet' ? 'Save changes' : modal === 'reminder' ? 'Add reminder' : modal === 'edit-record' ? 'Save changes' : 'Add record'}</button></div>
        </form>
      </div>}

      {authModal && <div className="modal-backdrop" role="presentation" onMouseDown={() => setAuthModal(false)}>
        <form className="modal-card auth-card" onSubmit={submitAuth} onMouseDown={(event) => event.stopPropagation()}>
          <div className="modal-heading"><div><p className="eyebrow">WELCOME TO PAWPAL</p><h2>{authMode === 'login' ? 'Log in' : authMode === 'signup' ? 'Create your account' : 'Reset password'}</h2></div><button type="button" className="close-button" onClick={() => setAuthModal(false)} aria-label="Close">×</button></div>
          {authMode === 'signup' && <label>Your name<input required value={authForm.name} onChange={(event) => setAuthForm({ ...authForm, name: event.target.value })} placeholder="e.g. Sarah Mitchell" /></label>}
          <label>Email<input required type="email" value={authForm.email} onChange={(event) => setAuthForm({ ...authForm, email: event.target.value })} placeholder="you@example.com" /></label>
          {(authMode === 'login' || authMode === 'signup') && <label>Password<input required minLength="6" type="password" value={authForm.password} onChange={(event) => setAuthForm({ ...authForm, password: event.target.value })} placeholder="At least 6 characters" /></label>}
          {authError && <p className="auth-error" role="alert">{authError}</p>}
          <button className="add-button auth-submit" type="submit" disabled={authBusy}>{authBusy ? 'Please wait…' : authMode === 'login' ? 'Log in' : authMode === 'reset' ? 'Send reset link' : 'Create account'}</button>
          <p className="auth-switch">
            {authMode === 'login' ? 'New to PawPal?' : authMode === 'signup' ? 'Already have an account?' : 'Remembered your password?'}
            <button type="button" onClick={() => {
              setAuthMode(authMode === 'login' ? 'signup' : authMode === 'signup' ? 'reset' : 'login')
              setAuthError('')
            }}>
              {authMode === 'login' ? 'Sign up' : authMode === 'signup' ? 'Reset password' : 'Log in'}
            </button>
          </p>
          {authMode === 'login' && <p className="auth-footer"><button type="button" className="link-button" onClick={() => { setAuthMode('reset'); setAuthError('') }}>Forgot password?</button></p>}
        </form>
      </div>}
    </main>
  )
}

export default App
