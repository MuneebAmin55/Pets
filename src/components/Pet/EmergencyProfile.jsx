import { QRCodeSVG } from 'qrcode.react'
import './EmergencyProfile.css'

export default function EmergencyProfile({ pet }) {
  // In a real app, this URL would point to a public emergency page for this specific pet ID
  const emergencyUrl = `${window.location.origin}/emergency/${pet.id}`;
  
  // Mock data that would normally come from the pet object
  const allergies = pet.allergies || 'None known';
  const bloodType = pet.bloodType || 'Unknown';
  const vetContact = pet.vetContact || '555-0199';

  return (
    <div className="emergency-profile">
      <div className="emergency-header">
        <div>
          <h3><span className="alert-icon">🚨</span> Emergency Information</h3>
          <p style={{ margin: '0.25rem 0 0 0', opacity: 0.8 }}>Scan QR code for vital info</p>
        </div>
        <div className="qr-code-container">
          <QRCodeSVG value={emergencyUrl} size={80} />
        </div>
      </div>
      
      <div className="emergency-info-grid">
        <div className="info-group">
          <span className="label">Allergies</span>
          <span className="value">{allergies}</span>
        </div>
        <div className="info-group">
          <span className="label">Blood Type</span>
          <span className="value">{bloodType}</span>
        </div>
        <div className="info-group">
          <span className="label">Vet Contact</span>
          <span className="value">{vetContact}</span>
        </div>
      </div>

      <div className="emergency-actions">
        <button type="button" onClick={() => window.open(`tel:${vetContact}`)}>Call Vet</button>
        <button type="button">Share Info</button>
      </div>
    </div>
  )
}
