import { useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom'
import { selectPets, setPets } from './features/petsSlice'
import { selectReminders, setReminders } from './features/reminderSlice'
import { setAllRecords } from './features/healthSlice'
import { completePasswordReset, loginUser, loginWithGoogle, logout as logoutUser, registerUser, requestPasswordReset, selectAuthLoading, selectIsAuth, selectUser, verifyPasswordResetOtp } from './features/userSlice'
import { loadDashboard, saveDashboard, selectCompletedCount, selectDashboardStatus, setCompletedCount } from './features/dashboardSlice'
import ReminderForm from './components/Reminder/ReminderForm'
import ReminderList from './components/Reminder/ReminderList'
import HealthRecordForm from './components/Health/HealthRecordForm'
import HealthRecordList from './components/Health/HealthRecordList'
import HealthTimeline from './components/Health/HealthTimeline'
import DocumentsPage from './components/Documents/DocumentsPage'
import './App.css'
import './styles/global.css'

const emptyPet = () => ({
  name: '',
  species: 'Dog',
  breed: '',
  age: '',
  gender: 'Male',
  weight: '',
  weightUnit: 'kg',
})

const petIcon = (species) => (species === 'Cat' ? '🐈' : species === 'Bird' ? '🐦' : '🐕')

const computeCompletedCount = (list) => list.filter((item) => item.completed).length

const isUuid = (value) =>
  typeof value === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)

const ensureUuid = (value) => (isUuid(value) ? value : crypto.randomUUID())

const loadGoogleIdentityScript = () => new Promise((resolve, reject) => {
  if (window.google?.accounts?.id) {
    resolve()
    return
  }

  const existingScript = document.getElementById('google-identity-services')
  if (existingScript) {
    existingScript.addEventListener('load', resolve, { once: true })
    existingScript.addEventListener('error', reject, { once: true })
    return
  }

  const script = document.createElement('script')
  script.id = 'google-identity-services'
  script.src = 'https://accounts.google.com/gsi/client'
  script.async = true
  script.defer = true
  script.onload = resolve
  script.onerror = reject
  document.head.appendChild(script)
})

const normalizeReminder = (reminder, pets = []) => {
  const dueDate = reminder.dueDate || reminder.due || ''
  const pet = pets.find((item) => item.id === reminder.petId) || pets.find((item) => item.name === reminder.petName) || null

  return {
    ...reminder,
    petId: reminder.petId || pet?.id || '',
    petName: reminder.petName || pet?.name || reminder.pet || '',
    type: reminder.type || 'vaccination',
    title: reminder.title || '',
    dueDate,
    due: dueDate,
    notes: reminder.notes || '',
    completed: Boolean(reminder.completed),
  }
}

const normalizeRecordsMap = (recordsMap, pets = []) => Object.entries(recordsMap || {}).reduce((acc, [petId, items]) => {
  const pet = pets.find((item) => item.id === petId)
  acc[petId] = (Array.isArray(items) ? items : []).map((record) => ({
    ...record,
    petId: record.petId || pet?.id || petId,
    petName: record.petName || pet?.name || '',
    type: record.type || 'vaccination',
    title: record.title || '',
    date: record.date || '',
    description: record.description || record.notes || '',
    notes: record.notes || record.description || '',
    veterinarian: record.veterinarian || '',
    nextDueDate: record.nextDueDate || '',
  }))
  return acc
}, {})

const mergeById = (items, nextItem) => {
  const index = items.findIndex((item) => item.id === nextItem.id)
  if (index === -1) return [...items, nextItem]
  return items.map((item) => (item.id === nextItem.id ? nextItem : item))
}

const locateRecord = (records, recordId) => {
  for (const [petId, items] of Object.entries(records)) {
    const record = items.find((item) => item.id === recordId)
    if (record) return { petId, record }
  }
  return null
}

function ResetPasswordPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    email: '',
    otp: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)
  const [stage, setStage] = useState('request')
  const [resetToken, setResetToken] = useState('')

  const requestOtp = async (event) => {
    event.preventDefault()
    setError('')
    setNotice('')

    if (!form.email.trim()) {
      setError('Enter your email address.')
      return
    }

    setBusy(true)
    try {
      await dispatch(requestPasswordReset(form.email.trim())).unwrap()
      setResetToken('')
      setForm((current) => ({ ...current, otp: '', password: '', confirmPassword: '' }))
      setStage('verify')
      setNotice('OTP sent to your email.')
    } catch (requestError) {
      setError(requestError?.response?.data?.message || requestError?.message || 'Unable to send OTP.')
    } finally {
      setBusy(false)
    }
  }

  const verifyOtp = async (event) => {
    event.preventDefault()
    setError('')
    setNotice('')

    if (!form.email.trim() || !form.otp.trim()) {
      setError('Enter the email and OTP from your email.')
      return
    }

    setBusy(true)
    try {
      const response = await dispatch(verifyPasswordResetOtp({ email: form.email.trim(), otp: form.otp.trim() })).unwrap()
      setResetToken(response.resetToken)
      setStage('reset')
      setNotice('OTP verified. Set your new password.')
    } catch (requestError) {
      setError(requestError?.response?.data?.message || requestError?.message || 'Unable to verify OTP.')
    } finally {
      setBusy(false)
    }
  }

  const submitPassword = async (event) => {
    event.preventDefault()
    setError('')
    setNotice('')

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setBusy(true)
    try {
      await dispatch(completePasswordReset({ resetToken, password: form.password })).unwrap()
      setStage('done')
      setNotice('Your password has been reset. You can sign in now.')
    } catch (requestError) {
      setError(requestError?.response?.data?.message || requestError?.message || 'Unable to reset password.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="pawpal-shell">
      <nav className="topbar">
        <button className="brand" type="button" onClick={() => navigate('/')}>
          <span className="brand-mark">🐾</span>
          <span>PawPal</span>
        </button>
      </nav>
      <section className="signed-out">
        <span>🔐</span>
        <p className="eyebrow">RESET PASSWORD</p>
        <h1>Verify your OTP.</h1>
        <p>Enter the OTP from your email, then choose a new password.</p>
        {stage === 'done' ? (
          <>
            <p>{notice}</p>
            <button className="add-button" type="button" onClick={() => navigate('/')}>Back to login</button>
          </>
        ) : stage === 'request' ? (
          <form className="modal-card auth-card" onSubmit={requestOtp}>
            <label>
              Email
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
              />
            </label>
            {error && <p className="auth-error">{error}</p>}
            {notice && <p className="auth-success">{notice}</p>}
            <button className="add-button auth-submit" disabled={busy}>
              {busy ? 'Please wait…' : 'Send OTP'}
            </button>
            <p className="auth-switch">
              <button type="button" onClick={() => setStage('request')}>Back to email step</button>
            </p>
          </form>
        ) : stage === 'verify' ? (
          <form className="modal-card auth-card" onSubmit={verifyOtp}>
            <label>
              Email
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </label>
            <label>
              OTP
              <input
                required
                inputMode="numeric"
                value={form.otp}
                onChange={(e) => setForm({ ...form, otp: e.target.value })}
                placeholder="6-digit code"
              />
            </label>
            {error && <p className="auth-error">{error}</p>}
            {notice && <p className="auth-success">{notice}</p>}
            <button className="add-button auth-submit" disabled={busy}>
              {busy ? 'Please wait…' : 'Verify OTP'}
            </button>
            <p className="auth-switch">
              <button type="button" onClick={() => setStage('request')}>Resend OTP</button>
              ·
              <button type="button" onClick={() => setStage('request')}>Back to email step</button>
            </p>
          </form>
        ) : (
          <form className="modal-card auth-card" onSubmit={submitPassword}>
            <label>
              New password
              <input
                required
                minLength="6"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </label>
            <label>
              Confirm password
              <input
                required
                minLength="6"
                type="password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              />
            </label>
            {error && <p className="auth-error">{error}</p>}
            {notice && <p className="auth-success">{notice}</p>}
            <button className="add-button auth-submit" disabled={busy}>
              {busy ? 'Please wait…' : 'Reset password'}
            </button>
            <p className="auth-switch">
              <button type="button" onClick={() => setStage('verify')}>Back to OTP</button>
            </p>
          </form>
        )}
      </section>
    </main>
  )
}

function PetPage({
  pets,
  reminders,
  records,
  onRemovePet,
  onOpenReminder,
  onOpenRecord,
  onToggleReminder,
  onDeleteReminder,
  onEditRecord,
  onDeleteRecord,
}) {
  const { petId } = useParams()
  const navigate = useNavigate()
  const pet = pets.find((item) => item.id === petId)

  if (!pet) {
    return (
      <section className="empty-page">
        <h2>Pet not found</h2>
        <button className="add-button" type="button" onClick={() => navigate('/')}>Back home</button>
      </section>
    )
  }

  const petRecords = [...(records[pet.id] || [])].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
  const petReminders = reminders.filter((item) => item.petId === pet.id || item.petName === pet.name)

  return (
    <section className="pet-detail-page">
      <button className="back-button" type="button" onClick={() => navigate('/')}>← Back to my pets</button>
      <div className="pet-detail-hero" style={{ '--pet-color': pet.color || '#f9c66a' }}>
        <span className="detail-art">{pet.icon || petIcon(pet.species)}</span>
        <div>
          <p className="eyebrow">PET PROFILE</p>
          <h2>{pet.name}</h2>
          <p>{pet.breed || `${pet.species} companion`} · {pet.age || 'Age not set'}</p>
          <span className="health-pill">● Happy & healthy</span>
        </div>
        <div className="pet-actions">
          <button className="add-button" type="button" onClick={() => onOpenReminder(pet.id)}>Add reminder</button>
          <button className="add-button" type="button" onClick={() => onOpenRecord(pet.id)}>Add record</button>
          <button className="delete-button" type="button" onClick={() => onRemovePet(pet)}>Delete</button>
        </div>
      </div>

      <div className="detail-card">
        <div className="record-heading">
          <div>
            <p className="eyebrow">REMINDERS</p>
            <h3>{pet.name}'s reminders</h3>
          </div>
        </div>
        <ReminderList reminders={petReminders} onToggle={onToggleReminder} onDelete={onDeleteReminder} />
      </div>

      <div className="detail-card health-records-card">
        <div className="record-heading">
          <div>
            <p className="eyebrow">HEALTH RECORDS</p>
            <h3>{pet.name}'s health records</h3>
          </div>
        </div>
        <HealthRecordList records={petRecords} onEdit={onEditRecord} onDelete={onDeleteRecord} />
      </div>

      <div className="detail-card timeline-card">
        <HealthTimeline records={petRecords} />
      </div>
    </section>
  )
}

function App() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const pets = useSelector(selectPets)
  const reminders = useSelector(selectReminders)
  const records = useSelector((state) => state.health.records)
  const completedCount = useSelector(selectCompletedCount)
  const dashboardStatus = useSelector(selectDashboardStatus)
  const user = useSelector(selectUser)
  const isAuthenticated = useSelector(selectIsAuth)
  const authBusy = useSelector(selectAuthLoading)

  const [notice, setNotice] = useState('')
  const [authMode, setAuthMode] = useState('login')
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' })
  const [authError, setAuthError] = useState('')
  const [modal, setModal] = useState(null)
  const [petForm, setPetForm] = useState(emptyPet)
  const [reminderDraft, setReminderDraft] = useState(null)
  const [recordDraft, setRecordDraft] = useState(null)
  const googleButtonRef = useRef(null)
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
  const isResetRoute = location.pathname === '/reset-password'

  const allRecords = useMemo(
    () => Object.entries(records).flatMap(([petId, items]) => (items || []).map((record) => ({ ...record, petId }))),
    [records],
  )

  const persistDashboard = (nextPets = pets, nextReminders = reminders, nextRecords = records, nextCompletedCount = completedCount) =>
    dispatch(saveDashboard({ pets: nextPets, tasks: nextReminders, healthRecords: nextRecords, completedCount: nextCompletedCount })).unwrap()

  useEffect(() => {
    if (!isAuthenticated) return

    dispatch(loadDashboard()).unwrap()
      .then((data) => {
        const nextPets = Array.isArray(data.pets) ? data.pets : []
        const nextReminders = Array.isArray(data.tasks) ? data.tasks.map((reminder) => normalizeReminder(reminder, nextPets)) : []
        const nextRecords = normalizeRecordsMap(data.healthRecords && typeof data.healthRecords === 'object' ? data.healthRecords : {}, nextPets)

        dispatch(setPets(nextPets))
        dispatch(setReminders(nextReminders))
        dispatch(setAllRecords(nextRecords))
        dispatch(setCompletedCount(typeof data.completedCount === 'number' ? data.completedCount : computeCompletedCount(nextReminders)))
      })
      .catch((error) => {
        if (error?.response?.status === 401) {
          dispatch(logoutUser())
          setNotice('Your session expired. Please sign in again.')
          return
        }

        setNotice('Unable to load your dashboard. Check that the Node API is running.')
      })
  }, [dispatch, isAuthenticated])

  useEffect(() => {
    if (isAuthenticated || isResetRoute || !googleClientId || !googleButtonRef.current) return

    let cancelled = false
    const buttonTarget = googleButtonRef.current
    buttonTarget.innerHTML = ''

    loadGoogleIdentityScript()
      .then(() => {
        if (cancelled || !window.google?.accounts?.id || !googleButtonRef.current) return

        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: async ({ credential }) => {
            if (!credential) {
              setAuthError('Google did not return a sign-in credential.')
              return
            }

            setAuthError('')
            try {
              await dispatch(loginWithGoogle(credential)).unwrap()
              setAuthForm({ name: '', email: '', password: '' })
              setNotice('Welcome back to PawPal!')
            } catch (error) {
              setAuthError(error?.response?.data?.message || error?.message || 'Google sign-in failed. Please try again.')
            }
          },
        })

        window.google.accounts.id.renderButton(googleButtonRef.current, {
          theme: 'outline',
          size: 'large',
          type: 'standard',
          text: authMode === 'signup' ? 'signup_with' : 'signin_with',
          shape: 'pill',
          width: Math.min(360, Math.max(240, googleButtonRef.current.offsetWidth || 320)),
        })
      })
      .catch(() => {
        if (!cancelled) setAuthError('Google sign-in could not be loaded.')
      })

    return () => {
      cancelled = true
      buttonTarget.innerHTML = ''
    }
  }, [authMode, dispatch, googleClientId, isAuthenticated, isResetRoute])

  const openPetModal = () => {
    setPetForm(emptyPet())
    setModal('pet')
  }

  const openReminderModal = (petId = '') => {
    const pet = pets.find((item) => item.id === petId)
    setReminderDraft(
      pet
        ? { petId: pet.id, petName: pet.name, type: 'vaccination', title: '', dueDate: '', notes: '', completed: false }
        : null,
    )
    setModal('reminder')
  }

  const openRecordModal = (petId = '') => {
    const pet = pets.find((item) => item.id === petId)
    setRecordDraft(
      pet
        ? { petId: pet.id, petName: pet.name, type: 'vaccination', title: '', date: '', nextDueDate: '', veterinarian: '', notes: '' }
        : null,
    )
    setModal('record')
  }

  const openRecordEditor = (record) => {
    setRecordDraft({ ...record })
    setModal('record')
  }

  const savePet = async (event) => {
    event.preventDefault()

    const colors = ['#f9c66a', '#bca4ed', '#e6a980']
    const pet = {
      ...petForm,
      id: crypto.randomUUID(),
      name: petForm.name.trim(),
      breed: petForm.breed.trim() || `${petForm.species} companion`,
      age: petForm.age.trim() || 'Age not set',
      icon: petIcon(petForm.species),
      color: colors[pets.length % colors.length],
      status: 'Happy & healthy',
    }

    const nextPets = [...pets, pet]
    dispatch(setPets(nextPets))
    setModal(null)
    setPetForm(emptyPet())

    try {
      await persistDashboard(nextPets)
      setNotice(`${pet.name} has been added to your family.`)
    } catch {
      setNotice('Pet saved locally, but the Node API could not be reached.')
    }
  }

  const saveReminder = async (reminder) => {
    if (!reminder?.petId) {
      setNotice('Choose a pet for the reminder.')
      return
    }

    const pet = pets.find((item) => item.id === reminder.petId)
    if (!pet) {
      setNotice('Choose a valid pet for the reminder.')
      return
    }

    const normalized = {
      ...reminder,
      id: ensureUuid(reminder.id),
      petId: pet.id,
      petName: reminder.petName || pet.name,
      type: reminder.type || 'vaccination',
      title: reminder.title.trim(),
      dueDate: reminder.dueDate || reminder.due || '',
      due: reminder.dueDate || reminder.due || '',
      notes: reminder.notes?.trim() || '',
      completed: Boolean(reminder.completed),
    }

    const nextReminders = mergeById(reminders, normalized)
    const nextCompletedCount = computeCompletedCount(nextReminders)

    dispatch(setReminders(nextReminders))
    dispatch(setCompletedCount(nextCompletedCount))
    setModal(null)
    setReminderDraft(null)

    try {
      await persistDashboard(pets, nextReminders, records, nextCompletedCount)
      setNotice('Reminder saved.')
    } catch {
      setNotice('Reminder saved locally, but the Node API could not be reached.')
    }
  }

  const toggleReminder = async (id) => {
    const nextReminders = reminders.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    const nextCompletedCount = computeCompletedCount(nextReminders)

    dispatch(setReminders(nextReminders))
    dispatch(setCompletedCount(nextCompletedCount))

    try {
      await persistDashboard(pets, nextReminders, records, nextCompletedCount)
    } catch {
      setNotice('Reminder updated locally, but the Node API could not be reached.')
    }
  }

  const deleteReminder = async (id) => {
    const nextReminders = reminders.filter((item) => item.id !== id)
    const nextCompletedCount = computeCompletedCount(nextReminders)

    dispatch(setReminders(nextReminders))
    dispatch(setCompletedCount(nextCompletedCount))

    try {
      await persistDashboard(pets, nextReminders, records, nextCompletedCount)
      setNotice('Reminder removed.')
    } catch {
      setNotice('Reminder removed locally, but the Node API could not be reached.')
    }
  }

  const saveRecord = async (record) => {
    if (!record?.petId) {
      setNotice('Choose a pet for the health record.')
      return
    }

    const pet = pets.find((item) => item.id === record.petId)
    if (!pet) {
      setNotice('Choose a valid pet for the health record.')
      return
    }

    const normalized = {
      ...record,
      id: ensureUuid(record.id),
      petId: pet.id,
      petName: record.petName || pet.name,
      type: record.type || 'vaccination',
      title: record.title.trim(),
      date: record.date || '',
      description: record.description?.trim() || record.notes?.trim() || '',
      notes: record.notes?.trim() || record.description?.trim() || '',
      veterinarian: record.veterinarian?.trim() || '',
      nextDueDate: record.nextDueDate || '',
    }

    const nextRecords = {
      ...records,
      [pet.id]: mergeById(records[pet.id] || [], normalized),
    }

    dispatch(setAllRecords(nextRecords))
    setModal(null)
    setRecordDraft(null)

    try {
      await persistDashboard(pets, reminders, nextRecords, completedCount)
      setNotice('Health record saved.')
    } catch {
      setNotice('Health record saved locally, but the Node API could not be reached.')
    }
  }

  const deleteRecord = async (recordId) => {
    const match = locateRecord(records, recordId)
    if (!match) return

    const nextRecords = { ...records }
    nextRecords[match.petId] = nextRecords[match.petId].filter((item) => item.id !== recordId)
    if (nextRecords[match.petId].length === 0) delete nextRecords[match.petId]

    dispatch(setAllRecords(nextRecords))

    try {
      await persistDashboard(pets, reminders, nextRecords, completedCount)
      setNotice('Health record removed.')
    } catch {
      setNotice('Health record removed locally, but the Node API could not be reached.')
    }
  }

  const removePet = async (pet) => {
    if (!window.confirm(`Delete ${pet.name} and their health records?`)) return

    const nextPets = pets.filter((item) => item.id !== pet.id)
    const nextReminders = reminders.filter((item) => item.petId !== pet.id)
    const nextRecords = { ...records }
    delete nextRecords[pet.id]
    const nextCompletedCount = computeCompletedCount(nextReminders)

    dispatch(setPets(nextPets))
    dispatch(setReminders(nextReminders))
    dispatch(setAllRecords(nextRecords))
    dispatch(setCompletedCount(nextCompletedCount))
    navigate('/')

    try {
      await persistDashboard(nextPets, nextReminders, nextRecords, nextCompletedCount)
      setNotice(`${pet.name} was deleted.`)
    } catch {
      setNotice('Pet removed locally, but the Node API could not be reached.')
    }
  }

  const submitAuth = async (event) => {
    event.preventDefault()
    setAuthError('')

    try {
      if (authMode === 'reset') {
        await dispatch(requestPasswordReset(authForm.email)).unwrap()
        setNotice('Check your inbox for the reset token and link.')
      } else if (authMode === 'signup') {
        await dispatch(registerUser({ name: authForm.name.trim(), email: authForm.email, password: authForm.password })).unwrap()
        setNotice('Your PawPal account is ready.')
      } else {
        await dispatch(loginUser({ email: authForm.email, password: authForm.password })).unwrap()
        setNotice('Welcome back to PawPal!')
      }

      setAuthForm({ name: '', email: '', password: '' })
    } catch (error) {
      setAuthError(error?.response?.data?.message || error?.message || 'Could not complete authentication. Please try again.')
    }
  }

  const greeting = useMemo(() => `Good morning${user?.name ? `, ${user.name.split(' ')[0]}` : ''}!`, [user])

  if (isResetRoute) {
    return <ResetPasswordPage />
  }

  if (!isAuthenticated) {
    return (
      <main className="pawpal-shell">
        <nav className="topbar">
          <button className="brand" type="button">
            <span className="brand-mark">🐾</span>
            <span>PawPal</span>
          </button>
        </nav>
        <section className="signed-out">
          <span>🐾</span>
          <p className="eyebrow">YOUR PRIVATE PET CARE SPACE</p>
          <h1>Every pet has a home here.</h1>
          <p>Sign in to manage pets, reminders, and health details through your Node.js API.</p>
          <form className="modal-card auth-card" onSubmit={submitAuth}>
            {authMode === 'signup' && (
              <label>
                Your name
                <input required value={authForm.name} onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })} />
              </label>
            )}
            <label>
              Email
              <input required type="email" value={authForm.email} onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })} />
            </label>
            {authMode !== 'reset' && (
              <label>
                Password
                <input required minLength="6" type="password" value={authForm.password} onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })} />
              </label>
            )}
            {authError && <p className="auth-error">{authError}</p>}
            <button className="add-button auth-submit" disabled={authBusy}>
              {authBusy ? 'Please wait…' : authMode === 'login' ? 'Log in' : authMode === 'signup' ? 'Create account' : 'Send reset link'}
            </button>
            {googleClientId ? (
              <div className="google-auth-area">
                <span>or</span>
                <div ref={googleButtonRef} className="google-auth-button" />
              </div>
            ) : (
              <p className="auth-help">Add VITE_GOOGLE_CLIENT_ID to enable Google sign-in.</p>
            )}
            <p className="auth-switch">
              <button type="button" onClick={() => { setAuthMode(authMode === 'login' ? 'signup' : 'login'); setAuthError('') }}>
                {authMode === 'login' ? 'Create an account' : 'Log in'}
              </button>
              ·
              <button type="button" onClick={() => navigate('/reset-password')}>Forgot password?</button>
            </p>
          </form>
        </section>
        {notice && (
          <div className="toast">
            {notice}
            <button type="button" onClick={() => setNotice('')}>×</button>
          </div>
        )}
      </main>
    )
  }

  return (
    <main className="pawpal-shell">
      <nav className="topbar">
        <button className="brand" type="button" onClick={() => navigate('/')}>
          <span className="brand-mark">🐾</span>
          <span>PawPal</span>
        </button>
        <div className="profile">
          <span className="avatar">{(user?.name || user?.email || 'P')[0].toUpperCase()}</span>
          <span className="profile-name">{user?.name || user?.email}</span>
          <button className="logout-button" type="button" onClick={() => dispatch(logoutUser())}>Log out</button>
        </div>
      </nav>

      <section className="welcome-row">
        <div>
          <p className="eyebrow">YOUR PET CARE COMPANION</p>
          <h1>{greeting}</h1>
          <p className="welcome-copy">Everything is managed through Redux Toolkit and ready for your Node.js backend.</p>
        </div>
        <div className="header-actions">
          <span className={`sync-status ${dashboardStatus === 'ready' ? 'synced' : ''}`}>
            {dashboardStatus === 'ready' ? 'Synced with API' : dashboardStatus === 'saving' ? 'Saving…' : 'API connection required'}
          </span>
          <button className="add-button" type="button" onClick={openPetModal}>+ Add a pet</button>
        </div>
      </section>

      {notice && (
        <div className="toast">
          {notice}
          <button type="button" onClick={() => setNotice('')}>×</button>
        </div>
      )}

      <Routes>
        <Route
          path="/"
          element={(
            <>
              <section className="summary-grid">
                <div className="summary-card">
                  <span className="summary-icon peach">🐾</span>
                  <div>
                    <strong>{pets.length}</strong>
                    <span>Pets in your family</span>
                  </div>
                </div>
                <div className="summary-card">
                  <span className="summary-icon lavender">📅</span>
                  <div>
                    <strong>{reminders.length}</strong>
                    <span>Upcoming reminders</span>
                  </div>
                </div>
                <div className="summary-card">
                  <span className="summary-icon mint">✓</span>
                  <div>
                    <strong>{completedCount}</strong>
                    <span>Tasks completed</span>
                  </div>
                </div>
              </section>

              <section className="content-grid">
                <div className="panel pets-panel">
                  <div className="panel-heading">
                    <div>
                      <p className="eyebrow">YOUR COMPANIONS</p>
                      <h2>My pets</h2>
                    </div>
                  </div>
                  <div className="pet-grid">
                    {pets.length ? (
                      pets.map((pet) => (
                        <button className="pet-card" key={pet.id} type="button" onClick={() => navigate(`/pets/${pet.id}`)}>
                          <span className="pet-art" style={{ background: pet.color }}>{pet.icon || petIcon(pet.species)}</span>
                          <span className="pet-info">
                            <strong>{pet.name}</strong>
                            <small>{pet.breed} · {pet.age}</small>
                            <em>{pet.status}</em>
                          </span>
                          <span className="arrow">→</span>
                        </button>
                      ))
                    ) : (
                      <p className="empty-copy">Add your first pet to get started.</p>
                    )}
                  </div>
                </div>

                <div style={{ display: 'grid', gap: '1.5rem' }}>
                  <div className="panel task-panel">
                    <div className="panel-heading">
                      <div>
                        <p className="eyebrow">UP NEXT</p>
                        <h2>Care reminders</h2>
                      </div>
                      <button className="text-button" type="button" onClick={() => openReminderModal()}>
                        Add reminder <span>→</span>
                      </button>
                    </div>
                    <div className="tasks">
                      <ReminderList reminders={reminders} onToggle={toggleReminder} onDelete={deleteReminder} />
                    </div>
                  </div>

                  <div className="panel">
                    <div className="panel-heading">
                      <div>
                        <p className="eyebrow">HEALTH LOG</p>
                        <h2>Health records</h2>
                      </div>
                      <button className="text-button" type="button" onClick={() => openRecordModal()}>
                        Add record <span>→</span>
                      </button>
                    </div>
                    <div className="tasks">
                      <HealthRecordList records={allRecords} onEdit={openRecordEditor} onDelete={deleteRecord} />
                    </div>
                  </div>
                </div>
              </section>
            </>
          )}
        />
        <Route path="/documents" element={<DocumentsPage />} />
        <Route
          path="/pets/:petId"
          element={(
            <PetPage
              pets={pets}
              reminders={reminders}
              records={records}
              onRemovePet={removePet}
              onOpenReminder={openReminderModal}
              onOpenRecord={openRecordModal}
              onToggleReminder={toggleReminder}
              onDeleteReminder={deleteReminder}
              onEditRecord={openRecordEditor}
              onDeleteRecord={deleteRecord}
            />
          )}
        />
      </Routes>

      {modal === 'pet' && (
        <div className="modal-backdrop" onMouseDown={() => setModal(null)}>
          <form className="modal-card" onSubmit={savePet} onMouseDown={(e) => e.stopPropagation()}>
            <div className="modal-heading">
              <h2>Add a pet</h2>
              <button type="button" className="close-button" onClick={() => setModal(null)}>×</button>
            </div>
            <label>
              Name
              <input required value={petForm.name} onChange={(e) => setPetForm({ ...petForm, name: e.target.value })} />
            </label>
            <label>
              Species
              <select value={petForm.species} onChange={(e) => setPetForm({ ...petForm, species: e.target.value })}>
                <option>Dog</option>
                <option>Cat</option>
                <option>Bird</option>
              </select>
            </label>
            <label>
              Breed
              <input value={petForm.breed} onChange={(e) => setPetForm({ ...petForm, breed: e.target.value })} />
            </label>
            <label>
              Age
              <input value={petForm.age} onChange={(e) => setPetForm({ ...petForm, age: e.target.value })} />
            </label>
            <button className="add-button" type="submit">Save pet</button>
          </form>
        </div>
      )}

      {modal === 'reminder' && (
        <ReminderForm
          key={reminderDraft?.id || reminderDraft?.petId || 'new-reminder'}
          reminder={reminderDraft || undefined}
          pets={pets}
          onSubmit={saveReminder}
          onCancel={() => { setModal(null); setReminderDraft(null) }}
        />
      )}

      {modal === 'record' && (
        <HealthRecordForm
          key={recordDraft?.id || recordDraft?.petId || 'new-record'}
          record={recordDraft || undefined}
          pets={pets}
          onSubmit={saveRecord}
          onCancel={() => { setModal(null); setRecordDraft(null) }}
        />
      )}
    </main>
  )
}

export default App
