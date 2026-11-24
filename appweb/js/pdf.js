/* Generación de presupuesto en PDF. Recibe datos ya saneados. */
window.PDF = (function () {
  const NAVY = [29, 63, 120], GREEN = [143, 182, 15], INK = [30, 41, 59], MUT = [100, 116, 139], LINE = [226, 232, 240], SOFT = [248, 250, 252];

  /* d = { num, fecha, cliente, dir, email, tel, rows:[{desc,q,pu,pm,total}], may, iva, sub, ivaAmt, tot, obs, emisor:{n,nit,dir,tel,em}, logo:{u,w,h}|null } */
  function build(d) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'mm', format: 'letter' });
    const W = doc.internal.pageSize.getWidth(), H = doc.internal.pageSize.getHeight(), M = 18;
    const money = n => 'Q ' + (+n || 0).toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    doc.setFillColor(...NAVY); doc.rect(0, 0, W, 6, 'F');
    doc.setFillColor(...GREEN); doc.rect(0, 6, W, 1.2, 'F');

    let y = 20;
    if (d.logo) { const h = 14; doc.addImage(d.logo.u, 'PNG', M, y - 4, h * d.logo.w / d.logo.h, h); }
    doc.setFont('helvetica', 'bold').setFontSize(24).setTextColor(...NAVY).text('PRESUPUESTO', W - M, y + 2, { align: 'right' });
    doc.setFont('helvetica', 'normal').setFontSize(9).setTextColor(...MUT);
    doc.text(d.num, W - M, y + 9, { align: 'right' });
    doc.text(d.fecha, W - M, y + 14, { align: 'right' });

    y = 44;
    const emp = [d.emisor.n, d.emisor.nit ? 'NIT: ' + d.emisor.nit : '', d.emisor.dir, d.emisor.tel ? 'Tel. ' + d.emisor.tel : '', d.emisor.em].filter(Boolean);
    const cl = [d.cliente || '—', d.dir, d.email, d.tel ? 'Tel. ' + d.tel : ''].filter(Boolean);
    const colR = W / 2 + 6, colW = W / 2 - M - 6;
    doc.setFont('helvetica', 'bold').setFontSize(8).setTextColor(...GREEN).text('EMISOR', M, y).text('CLIENTE', colR, y);
    doc.setFont('helvetica', 'normal').setFontSize(9.5).setTextColor(...INK);
    emp.forEach((t, i) => doc.text(doc.splitTextToSize(t, colW), M, y + 6 + i * 4.8));
    cl.forEach((t, i) => doc.text(doc.splitTextToSize(t, colW), colR, y + 6 + i * 4.8));
    y += 6 + Math.max(emp.length, cl.length) * 4.8 + 8;

    const head = ['Descripción', 'Cant.', 'P. unitario'].concat(d.may ? ['P. mayorista'] : []).concat(['Total']);
    const body = d.rows.map(r => [r.desc, String(r.q), money(r.pu)].concat(d.may ? [r.pm > 0 ? money(r.pm) : '—'] : []).concat([money(r.total)]));
    const nc = head.length;
    const cw = d.may ? { 1: { cellWidth: 16 }, 2: { cellWidth: 30 }, 3: { cellWidth: 30 }, 4: { cellWidth: 30 } } : { 1: { cellWidth: 16 }, 2: { cellWidth: 32 }, 3: { cellWidth: 32 } };
    const cols = {};
    for (let i = 1; i < nc; i++) cols[i] = { ...cw[i], halign: 'right' };
    doc.autoTable({
      startY: y, head: [head], body,
      theme: 'plain', margin: { left: M, right: M, bottom: 28 },
      styles: { font: 'helvetica', fontSize: 9.5, textColor: INK, cellPadding: { top: 3.2, bottom: 3.2, left: 2.5, right: 2.5 }, lineColor: LINE, lineWidth: { bottom: .2 }, valign: 'middle', overflow: 'linebreak' },
      headStyles: { fillColor: NAVY, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
      alternateRowStyles: { fillColor: SOFT },
      columnStyles: cols
    });

    let fy = doc.lastAutoTable.finalY + 8;
    if (fy > H - 95) { doc.addPage(); fy = 24; }
    const bx = W - M - 72, bw = 72;
    const rows = [['Subtotal', money(d.sub)]]; if (d.iva) rows.push(['IVA 12%', money(d.ivaAmt)]);
    doc.setFont('helvetica', 'normal').setFontSize(10);
    rows.forEach(([a, b], i) => {
      doc.setTextColor(...MUT).text(a, bx + 4, fy + i * 7);
      doc.setTextColor(...INK).text(b, W - M - 4, fy + i * 7, { align: 'right' });
    });
    fy += rows.length * 7 + 2;
    doc.setFillColor(...NAVY); doc.roundedRect(bx, fy, bw, 13, 2, 2, 'F');
    doc.setFont('helvetica', 'bold').setFontSize(11).setTextColor(255, 255, 255).text('TOTAL', bx + 5, fy + 8.5);
    doc.setFontSize(13).text(money(d.tot), W - M - 5, fy + 8.5, { align: 'right' });
    fy += 20;

    if (d.obs) {
      const ob = doc.splitTextToSize(d.obs, W - 2 * M);
      if (fy + ob.length * 4.6 + 12 > H - 30) { doc.addPage(); fy = 24; }
      doc.setFillColor(...SOFT); doc.setDrawColor(...LINE);
      doc.roundedRect(M, fy, W - 2 * M, ob.length * 4.6 + 12, 2, 2, 'FD');
      doc.setFont('helvetica', 'bold').setFontSize(8).setTextColor(...NAVY).text('OBSERVACIONES', M + 4, fy + 5.5);
      doc.setFont('helvetica', 'normal').setFontSize(9).setTextColor(...INK).text(ob, M + 4, fy + 10.5);
    }

    const n = doc.getNumberOfPages();
    for (let i = 1; i <= n; i++) {
      doc.setPage(i);
      doc.setDrawColor(...LINE).setLineWidth(.3).line(M, H - 18, W - M, H - 18);
      doc.setFont('helvetica', 'normal').setFontSize(8).setTextColor(...MUT);
      doc.text([d.emisor.n, d.emisor.em, d.emisor.tel].filter(Boolean).join(' · '), M, H - 12);
      doc.text(`Página ${i} de ${n}`, W - M, H - 12, { align: 'right' });
    }
    return doc;
  }
  return { build };
})();
