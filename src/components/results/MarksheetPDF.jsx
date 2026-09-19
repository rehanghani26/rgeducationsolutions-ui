/**
 * MarksheetPDF.jsx
 * A beautifully styled marksheet rendered as a hidden DOM element,
 * captured via html2canvas → jsPDF for download.
 *
 * Usage:
 *   <MarksheetPDF ref={marksheetRef} result={result} schoolName="RGES School" />
 *   downloadMarksheetPDF(marksheetRef, `Result_${result.studentName}`);
 */

import React, { forwardRef } from 'react';
import { format } from 'date-fns';

// ─── Grade color ────────────────────────────────────────────────────────────
const gradeColor = (grade) => {
  const map = { 'A+': '#10b981', 'A': '#10b981', 'B+': '#3b82f6', 'B': '#3b82f6', 'C+': '#f59e0b', 'C': '#f59e0b', 'D': '#f97316', 'F': '#ef4444' };
  return map[grade] || '#64748b';
};

// ─── PDF Libraries Loader (Global / CDN / Print fallback) ────────────────────
export const getPdfLibs = async () => {
  if (typeof window === 'undefined') return null;

  // Check if already available on window
  const existingJsPDF = window.jspdf?.jsPDF || window.jsPDF;
  if (window.html2canvas && existingJsPDF) {
    return { html2canvas: window.html2canvas, jsPDF: existingJsPDF };
  }

  // Load from CDN dynamically if not yet on window
  const loadScript = (src) =>
    new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[src="${src}"]`);
      if (existing) {
        if (existing.dataset.loaded === 'true') return resolve();
        existing.addEventListener('load', () => resolve());
        existing.addEventListener('error', reject);
        return;
      }
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = () => {
        script.dataset.loaded = 'true';
        resolve();
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });

  try {
    await Promise.all([
      loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'),
      loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'),
    ]);

    const jsPDF = window.jspdf?.jsPDF || window.jsPDF;
    const html2canvas = window.html2canvas;
    if (jsPDF && html2canvas) {
      return { jsPDF, html2canvas };
    }
  } catch (err) {
    console.warn('Could not load PDF libraries from CDN:', err);
  }

  return null;
};

// ─── Print Fallback ─────────────────────────────────────────────────────────
export const printElement = (element, title = 'Student Marksheet') => {
  if (!element) return;
  const printWindow = window.open('', '_blank', 'width=900,height=800');
  if (!printWindow) {
    window.print();
    return;
  }
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <style>
          @page { size: A4 portrait; margin: 10mm; }
          body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 0; background: #fff; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        </style>
      </head>
      <body>
        ${element.innerHTML}
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 350);
};

// ─── Download helper (exported) ───────────────────────────────────────────────
export const downloadMarksheetPDF = async (ref, filename = 'marksheet') => {
  const el = ref?.current;
  if (!el) return;

  try {
    const libs = await getPdfLibs();
    if (!libs) {
      // Fallback: open print dialog so user can "Save as PDF"
      printElement(el, filename);
      return;
    }

    const { html2canvas, jsPDF } = libs;

    el.style.display = 'block';
    await new Promise((r) => setTimeout(r, 120));

    const canvas = await html2canvas(el, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
    });

    el.style.display = 'none';

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pdfW = pdf.internal.pageSize.getWidth();
    const pdfH = (canvas.height * pdfW) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfW, pdfH);
    pdf.save(`${filename}.pdf`);
  } catch (err) {
    console.error('PDF generation error:', err);
    if (el) printElement(el, filename);
  } finally {
    if (el) el.style.display = 'none';
  }
};

// ─── Marksheet Component ──────────────────────────────────────────────────────
const MarksheetPDF = forwardRef(({ result, schoolName = 'RGES School of Excellence', schoolAddress = 'Main Campus, Education City' }, ref) => {
  if (!result) return null;

  const totalPct = result.percentage ?? 0;
  const passed = result.isPassed;

  return (
    <div
      ref={ref}
      style={{
        display: 'none',
        width: '794px',
        minHeight: '1123px',
        backgroundColor: '#ffffff',
        fontFamily: "'Segoe UI', Arial, sans-serif",
        padding: '40px',
        boxSizing: 'border-box',
        color: '#1e293b',
      }}
    >
      {/* ── Header ── */}
      <div style={{ textAlign: 'center', borderBottom: '3px solid #4f46e5', paddingBottom: '20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '28px', fontWeight: 900 }}>
            🎓
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 900, color: '#1e293b', letterSpacing: '-0.5px' }}>{schoolName}</h1>
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b' }}>{schoolAddress}</p>
          </div>
        </div>
        <div style={{ marginTop: '16px', display: 'inline-block', background: '#4f46e5', color: '#fff', padding: '6px 28px', borderRadius: '999px', fontSize: '13px', fontWeight: 700, letterSpacing: '1px' }}>
          STUDENT REPORT CARD
        </div>
        <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '8px' }}>
          {result.examName} · {result.examTerm} · Session: {result.examSession || '2025-26'}
        </p>
      </div>

      {/* ── Student Info ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '24px', background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
        {[
          ['Student Name', result.studentName || '—'],
          ['Roll No.', result.rollNumber || '—'],
          ['Admission No.', result.admissionNumber || '—'],
          ['Class / Section', `${result.className || '—'} ${result.section ? `(${result.section})` : ''}`],
          ['Student Email', result.studentEmail || '—'],
          ['Class Rank', result.rank ? `#${result.rank}` : '—'],
          ['Exam Date', result.publishedAt ? format(new Date(result.publishedAt), 'MMM d, yyyy') : '—'],
          ['Academic Session', result.examSession || '2025-2026'],
          ['Result Status', result.isPassed ? 'PASSED' : 'FAILED'],
        ].map(([label, value]) => (
          <div key={label} style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</span>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', marginTop: '2px', wordBreak: 'break-all' }}>{value}</span>
          </div>
        ))}
      </div>

      {/* ── Subject Marks Table ── */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px', fontSize: '13px' }}>
        <thead>
          <tr style={{ background: '#4f46e5', color: '#fff' }}>
            {['Subject & Prescribed Book', 'Code', 'Max Marks', 'Obtained', 'Grade', 'Status'].map((h) => (
              <th key={h} style={{ padding: '10px 12px', textAlign: h.startsWith('Subject') ? 'left' : 'center', fontWeight: 700, fontSize: '11px', letterSpacing: '0.5px' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(result.marks || []).map((sub, i) => (
            <tr key={i} style={{ background: i % 2 === 0 ? '#f8fafc' : '#fff', borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '9px 12px', fontWeight: 700, color: '#1e293b' }}>
                <div>{sub.subjectName}</div>
                {sub.bookName && (
                  <div style={{ fontSize: '10px', color: '#6366f1', fontStyle: 'italic', fontWeight: 600, marginTop: '2px' }}>
                    📖 {sub.bookName}
                  </div>
                )}
              </td>
              <td style={{ padding: '9px 12px', textAlign: 'center', color: '#64748b', fontFamily: 'monospace', fontSize: '11px' }}>{sub.subjectCode || '—'}</td>
              <td style={{ padding: '9px 12px', textAlign: 'center', color: '#64748b' }}>{sub.maxMarks}</td>
              <td style={{ padding: '9px 12px', textAlign: 'center', fontWeight: 900, color: '#1e293b', fontSize: '15px' }}>{sub.obtained}</td>
              <td style={{ padding: '9px 12px', textAlign: 'center' }}>
                <span style={{ background: gradeColor(sub.grade) + '20', color: gradeColor(sub.grade), fontWeight: 800, padding: '2px 10px', borderRadius: '6px', fontSize: '12px' }}>
                  {sub.grade || '—'}
                </span>
              </td>
              <td style={{ padding: '9px 12px', textAlign: 'center' }}>
                <span style={{ color: sub.isPassed ? '#10b981' : '#ef4444', fontWeight: 700, fontSize: '11px' }}>
                  {sub.isPassed ? '✓ Pass' : '✗ Fail'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ── Summary ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '28px' }}>
        {[
          { label: 'Total Marks', value: `${result.totalObtained}/${result.totalMaxMarks}`, color: '#4f46e5' },
          { label: 'Percentage', value: `${totalPct}%`, color: '#3b82f6' },
          { label: 'Overall Grade', value: result.grade || '—', color: gradeColor(result.grade) },
          { label: 'GPA', value: result.gpa?.toFixed(1) || '—', color: '#8b5cf6' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ textAlign: 'center', padding: '14px', background: color + '12', border: `1px solid ${color}40`, borderRadius: '10px' }}>
            <p style={{ margin: 0, fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>{label}</p>
            <p style={{ margin: '6px 0 0', fontSize: '22px', fontWeight: 900, color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* ── Result Banner ── */}
      <div style={{ textAlign: 'center', padding: '12px', borderRadius: '10px', background: passed ? '#dcfce7' : '#fee2e2', marginBottom: '28px', border: `1px solid ${passed ? '#86efac' : '#fca5a5'}` }}>
        <span style={{ fontSize: '18px', fontWeight: 900, color: passed ? '#16a34a' : '#dc2626' }}>
          {passed ? '🎉 RESULT: PASS' : '❌ RESULT: FAIL'}
        </span>
        {result.failedSubjects?.length > 0 && (
          <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#dc2626' }}>
            Failed in: {result.failedSubjects.join(', ')}
          </p>
        )}
      </div>

      {/* ── Remarks ── */}
      {result.remarks && (
        <div style={{ padding: '12px 16px', background: '#f1f5f9', borderRadius: '8px', borderLeft: '4px solid #4f46e5', marginBottom: '24px' }}>
          <p style={{ margin: 0, fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Remarks</p>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#1e293b' }}>{result.remarks}</p>
        </div>
      )}

      {/* ── Signatures ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px', marginTop: '40px', paddingTop: '20px', borderTop: '2px solid #e2e8f0' }}>
        {['Class Teacher', 'Principal', 'Parent / Guardian'].map((role) => (
          <div key={role} style={{ textAlign: 'center' }}>
            <div style={{ height: '40px', borderBottom: '1px solid #cbd5e1', marginBottom: '6px' }} />
            <p style={{ margin: 0, fontSize: '11px', color: '#64748b', fontWeight: 700 }}>{role}</p>
          </div>
        ))}
      </div>

      {/* ── Footer ── */}
      <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '10px', color: '#94a3b8' }}>
        <p style={{ margin: 0 }}>Generated by RGES School ERP · {format(new Date(), 'MMMM d, yyyy')} · This is a digitally generated document.</p>
      </div>
    </div>
  );
});

MarksheetPDF.displayName = 'MarksheetPDF';
export default MarksheetPDF;
