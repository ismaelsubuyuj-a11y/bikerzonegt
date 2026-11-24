/* Presupuesto en PDF con diseño corporativo. Recibe datos ya preparados. */
window.PDF = (function () {
  const BRAND = [47, 109, 181], BRAND_D = [30, 76, 134], LIME = [156, 197, 58], LIME_S = [242, 248, 226];
  const INK = [27, 36, 48], MUT = [102, 112, 133], LINE = [228, 232, 238], SOFT = [246, 248, 251], WHITE = [255, 255, 255];

  /* d = { num, fecha, cliente, dir, email, tel, rows:[{desc,q,pu,pm,total}], may, iva, sub, ivaAmt, tot, obs, emisor:{n,nit,dir,tel,em}, logo:{u,w,h}|null } */
  function build(d) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'mm', format: 'letter' });
    const W = doc.internal.pageSize.getWidth(), H = doc.internal.pageSize.getHeight(), M = 16;
    const money = n => 'Q ' + (+n || 0).toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    /* Banda superior con degradado simulado */
    doc.setFillColor(...BRAND); doc.rect(0, 0, W, 46, 'F');
    doc.setFillColor(...LIME); doc.rect(0, 46, W, 2.5, 'F');

    /* Logo en caja blanca */
    if (d.logo) {
      const h = 20, w = h * d.logo.w / d.logo.h;
      doc.setFillColor(...WHITE); doc.roundedRect(M - 3, 11, w + 6, h + 6, 2.5, 2.5, 'F');
      doc.addImage(d.logo.u, 'PNG', M, 14, w, h);
    } else {
      doc.setFont('helvetica', 'bold').setFontSize(16).setTextColor(...WHITE).text(d.emisor.n || 'SICAP', M, 24);
    }

    doc.setFont('helvetica', 'bold').setFontSize(26).setTextColor(...WHITE).text('PRESUPUESTO', W - M, 22, { align: 'right' });
    doc.setFont('helvetica', 'normal').setFontSize(9.5).setTextColor(...LIME_S);
    doc.text(d.num, W - M, 30, { align: 'right' });
    doc.text(d.fecha, W - M, 36, { align: 'right' });

    /* Tarjetas de emisor y cliente */
    let y = 60;
    const emp = [d.emisor.n, d.emisor.nit ? 'NIT: ' + d.emisor.nit : '', d.emisor.dir, d.emisor.tel ? 'Tel. ' + d.emisor.tel : '', d.emisor.em].filter(Boolean);
    const cl = [d.cliente || '—', d.dir, d.email, d.tel ? 'Tel. ' + d.tel : ''].filter(Boolean);
    const cw = (W - 2 * M - 6) / 2, cardH = 8 + Math.max(emp.length, cl.length, 1) * 5 + 4;
    [[M, 'EMISOR', emp], [M + cw + 6, 'CLIENTE', cl]].forEach(([x, title, lines]) => {
      doc.setFillColor(...SOFT); doc.setDrawColor(...LINE); doc.roundedRect(x, y, cw, cardH, 2.5, 2.5, 'FD');
      doc.setFillColor(...LIME); doc.rect(x, y, 1.6, cardH, 'F');
      doc.setFont('helvetica', 'bold').setFontSize(8).setTextColor(...BRAND).text(title, x + 5, y + 6);
      doc.setFont('helvetica', 'normal').setFontSize(9.5).setTextColor(...INK);
      lines.forEach((t, i) => doc.text(doc.splitTextToSize(t, cw - 10)[0] || '', x + 5, y + 12 + i * 5));
    });
    y += cardH + 10;

    /* Tabla */
    const head = [['Descripción', 'Cant.', 'P. unitario'].concat(d.may ? ['P. mayorista'] : []).concat(['Total'])];
    const body = d.rows.map(r => [r.desc, String(r.q), money(r.pu)].concat(d.may ? [r.pm > 0 ? money(r.pm) : '—'] : []).concat([money(r.total)]));
    const nc = head[0].length, cols = {};
    for (let i = 1; i < nc; i++) cols[i] = { cellWidth: i == 1 ? 16 : 32, halign: 'right' };
    doc.autoTable({
      startY: y, head, body: body.length ? body : [['—', '', '', '']],
      theme: 'plain', margin: { left: M, right: M, bottom: 30 },
      styles: { font: 'helvetica', fontSize: 9.5, textColor: INK, cellPadding: { top: 3.4, bottom: 3.4, left: 3, right: 3 }, lineColor: LINE, lineWidth: { bottom: .15 }, valign: 'middle', overflow: 'linebreak' },
      headStyles: { fillColor: BRAND, textColor: WHITE, fontStyle: 'bold', fontSize: 8.5 },
      alternateRowStyles: { fillColor: [241, 247, 249] },
      columnStyles: cols
    });

    /* Totales */
    let fy = doc.lastAutoTable.finalY + 10;
    if (fy > H - 100) { doc.addPage(); fy = 24; }
    const bx = W - M - 78, bw = 78;
    const rows = [['Subtotal', money(d.sub)]]; if (d.iva) rows.push(['IVA 12%', money(d.ivaAmt)]);
    doc.setFont('helvetica', 'normal').setFontSize(10);
    rows.forEach(([a, b], i) => {
      doc.setTextColor(...MUT).text(a, bx + 3, fy + i * 7);
      doc.setTextColor(...INK).text(b, W - M - 3, fy + i * 7, { align: 'right' });
    });
    fy += rows.length * 7 + 3;
    doc.setFillColor(...LIME); doc.roundedRect(bx, fy, bw, 15, 2.5, 2.5, 'F');
    doc.setFont('helvetica', 'bold').setFontSize(10).setTextColor(...INK).text('TOTAL', bx + 5, fy + 9.5);
    doc.setFontSize(14).text(money(d.tot), W - M - 5, fy + 9.8, { align: 'right' });
    fy += 24;

    /* Observaciones */
    if (d.obs) {
      const ob = doc.splitTextToSize(d.obs, W - 2 * M - 8);
      const bh = ob.length * 4.8 + 14;
      if (fy + bh > H - 34) { doc.addPage(); fy = 24; }
      doc.setFillColor(...LIME_S); doc.roundedRect(M, fy, W - 2 * M, bh, 2.5, 2.5, 'F');
      doc.setFillColor(...LIME); doc.rect(M, fy, 1.6, bh, 'F');
      doc.setFont('helvetica', 'bold').setFontSize(8).setTextColor(...BRAND).text('OBSERVACIONES', M + 6, fy + 6);
      doc.setFont('helvetica', 'normal').setFontSize(9).setTextColor(...INK).text(ob, M + 6, fy + 11.5);
    }

    /* Pie de página */
    const n = doc.getNumberOfPages();
    for (let i = 1; i <= n; i++) {
      doc.setPage(i);
      doc.setFillColor(...BRAND_D); doc.rect(0, H - 14, W, 14, 'F');
      doc.setFillColor(...LIME); doc.rect(0, H - 14, W, .8, 'F');
      doc.setFont('helvetica', 'normal').setFontSize(8).setTextColor(...WHITE);
      doc.text([d.emisor.n, d.emisor.em, d.emisor.tel].filter(Boolean).join('  ·  '), M, H - 6);
      doc.text(`Página ${i} de ${n}`, W - M, H - 6, { align: 'right' });
    }
    return doc;
  }
  return { build };
})();
