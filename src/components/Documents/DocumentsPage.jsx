import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { selectPets } from '../../features/petsSlice'
import { createDocument, deleteDocument, loadDocuments, selectDocuments, selectDocumentsError, selectDocumentsStatus } from '../../features/documentSlice'
import { formatDate } from '../../utils/helpers'

const emptyForm = {
  petId: '',
  title: '',
  category: 'certificate',
  expiresOn: '',
  notes: '',
  fileName: '',
  mimeType: '',
  fileData: '',
}

const categoryLabels = {
  certificate: 'Certificate',
  prescription: 'Prescription',
  report: 'Medical report',
  other: 'Other',
}

const categoryIcons = {
  certificate: '📄',
  prescription: '💊',
  report: '🧾',
  other: '📁',
}

export default function DocumentsPage() {
  const dispatch = useDispatch()
  const pets = useSelector(selectPets)
  const documents = useSelector(selectDocuments)
  const status = useSelector(selectDocumentsStatus)
  const error = useSelector(selectDocumentsError)
  const [form, setForm] = useState(emptyForm)
  const [localError, setLocalError] = useState('')

  useEffect(() => {
    dispatch(loadDocuments())
  }, [dispatch])

  const sortedDocuments = useMemo(
    () => [...documents].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)),
    [documents],
  )

  const handleFileChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) {
      setForm((current) => ({ ...current, fileName: '', mimeType: '', fileData: '' }))
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setForm((current) => ({
        ...current,
        fileName: file.name,
        mimeType: file.type || 'application/octet-stream',
        fileData: String(reader.result || ''),
      }))
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLocalError('')

    if (!form.petId) {
      setLocalError('Choose a pet for the document.')
      return
    }
    if (!form.title.trim()) {
      setLocalError('Add a document title.')
      return
    }
    if (!form.fileData) {
      setLocalError('Choose a file to upload.')
      return
    }

    try {
      await dispatch(createDocument({
        petId: form.petId,
        title: form.title.trim(),
        category: form.category,
        expiresOn: form.expiresOn || null,
        notes: form.notes.trim(),
        fileName: form.fileName,
        mimeType: form.mimeType,
        fileData: form.fileData,
      })).unwrap()
      setForm(emptyForm)
    } catch {
      setLocalError('Could not save the document right now.')
    }
  }

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteDocument(id)).unwrap()
    } catch {
      setLocalError('Could not delete the document right now.')
    }
  }

  const openDocument = (document) => {
    const link = window.document.createElement('a')
    link.href = document.fileData
    link.download = document.fileName || document.title || 'document'
    link.target = '_blank'
    link.rel = 'noreferrer'
    link.click()
  }

  const petNameById = (petId) => pets.find((pet) => pet.id === petId)?.name || 'Unknown pet'

  return (
    <section className="documents-page">
      <div className="documents-hero panel">
        <div>
          <p className="eyebrow">DOCUMENT STORAGE</p>
          <h2>Keep certificates, prescriptions, and reports together</h2>
          <p className="documents-copy">
            Upload pet documents once and keep them attached to the right pet for quick access later.
          </p>
        </div>
        <div className="documents-stats">
          <span className="documents-stat">
            <strong>{documents.length}</strong>
            <small>Stored files</small>
          </span>
          <span className="documents-stat">
            <strong>{pets.length}</strong>
            <small>Pets available</small>
          </span>
        </div>
      </div>

      <div className="documents-grid">
        <form className="panel documents-form" onSubmit={handleSubmit}>
          <div className="panel-heading">
            <div>
              <p className="eyebrow">NEW FILE</p>
              <h3>Upload a document</h3>
            </div>
          </div>

          {!pets.length && (
            <p className="documents-empty-note">Add at least one pet before uploading documents.</p>
          )}

          <label>
            Pet
            <select value={form.petId} onChange={(e) => setForm({ ...form, petId: e.target.value })} required>
              <option value="">Select a pet</option>
              {pets.map((pet) => (
                <option key={pet.id} value={pet.id}>{pet.name}</option>
              ))}
            </select>
          </label>

          <label>
            Document type
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              <option value="certificate">Certificate</option>
              <option value="prescription">Prescription</option>
              <option value="report">Medical report</option>
              <option value="other">Other</option>
            </select>
          </label>

          <label>
            Title
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Rabies vaccination certificate"
              required
            />
          </label>

          <label>
            File
            <input type="file" onChange={handleFileChange} required />
          </label>

          <label>
            Expires on
            <input
              type="date"
              value={form.expiresOn}
              onChange={(e) => setForm({ ...form, expiresOn: e.target.value })}
            />
          </label>

          <label>
            Notes
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Anything useful about this document"
              rows={4}
            />
          </label>

          {localError && <p className="auth-error">{localError}</p>}
          {error && <p className="auth-error">{error}</p>}

          <button className="add-button auth-submit" type="submit" disabled={status === 'saving'}>
            {status === 'saving' ? 'Saving…' : 'Save document'}
          </button>
        </form>

        <div className="panel documents-list-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">SAVED FILES</p>
              <h3>Your documents</h3>
            </div>
          </div>

          {status === 'loading' && sortedDocuments.length === 0 ? (
            <p className="documents-empty-note">Loading documents…</p>
          ) : sortedDocuments.length === 0 ? (
            <div className="empty-state">
              <span style={{ fontSize: '4rem' }}>📁</span>
              <h3>No documents yet</h3>
              <p>Upload vaccination certificates, prescriptions, or medical reports here.</p>
            </div>
          ) : (
            <div className="document-list">
              {sortedDocuments.map((document) => (
                <article key={document.id} className="document-card">
                  <div className="document-card-header">
                    <span className="document-icon">{categoryIcons[document.category] || '📁'}</span>
                    <div>
                      <h4>{document.title}</h4>
                      <p>{categoryLabels[document.category] || document.category} · {petNameById(document.petId)}</p>
                    </div>
                  </div>

                  <div className="document-meta">
                    <span>File: {document.fileName}</span>
                    <span>Uploaded: {formatDate(document.createdAt)}</span>
                    {document.expiresOn && <span>Expires: {formatDate(document.expiresOn)}</span>}
                  </div>

                  {document.notes && <p className="document-notes">{document.notes}</p>}

                  <div className="document-actions">
                    <button type="button" className="text-button" onClick={() => openDocument(document)}>
                      Download
                    </button>
                    <button type="button" className="delete-button" onClick={() => handleDelete(document.id)}>
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
