import { jsPDF } from 'jspdf'
import { autoTable } from 'jspdf-autotable'

export const generateHealthReport = (pet, records, reminders) => {
  const doc = new jsPDF()
  
  // Header
  doc.setFontSize(22)
  doc.text('PawPal Health Report', 14, 20)
  
  doc.setFontSize(14)
  doc.text(`Pet: ${pet.name}`, 14, 30)
  doc.setFontSize(10)
  doc.text(`Species: ${pet.species} | Breed: ${pet.breed} | Age: ${pet.age}`, 14, 36)
  
  // Health Records Table
  doc.setFontSize(14)
  doc.text('Health Records', 14, 48)
  
  const recordsBody = records.map(record => [
    record.date,
    record.type ? record.type.charAt(0).toUpperCase() + record.type.slice(1) : '',
    record.title,
    record.veterinarian || '-',
    record.notes || '-'
  ])

  autoTable(doc, {
    startY: 52,
    head: [['Date', 'Type', 'Title', 'Vet', 'Notes']],
    body: recordsBody.length ? recordsBody : [['No records found', '', '', '', '']],
    theme: 'striped',
    headStyles: { fillColor: [136, 212, 180] } // Mint color
  })

  // Upcoming Reminders Table
  const finalY = doc.lastAutoTable?.finalY || 52
  doc.setFontSize(14)
  doc.text('Upcoming Reminders', 14, finalY + 14)
  
  const remindersBody = reminders.filter(r => !r.completed).map(rem => [
    rem.dueDate,
    rem.title,
    rem.type ? rem.type.charAt(0).toUpperCase() + rem.type.slice(1) : ''
  ])

  autoTable(doc, {
    startY: finalY + 18,
    head: [['Due Date', 'Task', 'Type']],
    body: remindersBody.length ? remindersBody : [['No upcoming reminders', '', '']],
    theme: 'striped',
    headStyles: { fillColor: [188, 164, 237] } // Lavender color
  })

  // Save the PDF
  doc.save(`${pet.name}_Health_Report.pdf`)
}
