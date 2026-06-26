// --- Advanced File & Image Tools (30+ Tools) ---

const ADV_FILE_TOOLS = [
    // 1. PDF Merge
    {
        id: 'adv-pdf-merge',
        name: 'PDF Merge',
        category: 'adv-file',
        icon: '<i class="fa-solid fa-object-group"></i>',
        description: 'Combine multiple PDF documents into a single PDF file locally.',
        tags: ['pdf', 'merge', 'combine', 'join', 'concat'],
        render() {
            return `
                <div class="tool-grid-2col">
                    <div>
                        <div class="input-group">
                            <label>Upload PDF Files</label>
                            <div class="uploader-box" id="pdfmerge-dropzone" style="height:120px;">
                                <i class="fa-solid fa-file-pdf uploader-icon" style="color:var(--accent-primary);"></i>
                                <div class="uploader-text">Select or drop PDFs here</div>
                                <input type="file" id="pdfmerge-input" multiple accept="application/pdf" style="display:none;">
                            </div>
                        </div>
                        <div class="input-group">
                            <label>Merge Order</label>
                            <div id="pdfmerge-list" style="background:rgba(0,0,0,0.2); border:1px solid rgba(255,255,255,0.05); border-radius:8px; padding:10px; max-height:180px; overflow-y:auto; display:flex; flex-direction:column; gap:6px;">
                                <div style="font-size:12px; color:var(--text-muted); text-align:center; padding:10px;">No PDFs uploaded</div>
                            </div>
                        </div>
                        <button class="app-btn primary" id="pdfmerge-btn" style="width:100%; margin-top:15px; border-radius:20px; gap:8px;">
                            <i class="fa-solid fa-object-group"></i>Merge PDFs
                        </button>
                    </div>
                    <div>
                        <div class="input-group">
                            <label>Merge Status & Console</label>
                            <div class="output-container" style="margin-top:0;">
                                <pre class="output-pre" id="pdfmerge-log" style="min-height:220px; font-size:11px;">[Ready] Waiting for files to merge...</pre>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        },
        init() {
            const dropzone = document.getElementById('pdfmerge-dropzone');
            const fileInput = document.getElementById('pdfmerge-input');
            const mergeList = document.getElementById('pdfmerge-list');
            const mergeBtn = document.getElementById('pdfmerge-btn');
            const logBox = document.getElementById('pdfmerge-log');
            let files = [];

            const updateLog = (msg, clear = false) => {
                const time = new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', second:'2-digit'});
                if (clear) logBox.textContent = `[${time}] ${msg}`;
                else logBox.textContent += `\n[${time}] ${msg}`;
                logBox.scrollTop = logBox.scrollHeight;
            };

            const renderList = () => {
                mergeList.innerHTML = '';
                if (files.length === 0) {
                    mergeList.innerHTML = `<div style="font-size:12px; color:var(--text-muted); text-align:center; padding:10px;">No PDFs uploaded</div>`;
                    return;
                }
                files.forEach((f, idx) => {
                    const row = document.createElement('div');
                    row.style.cssText = "display:flex; justify-content:space-between; align-items:center; padding:6px 10px; background:rgba(255,255,255,0.03); border-radius:4px; font-size:12px;";
                    row.innerHTML = `
                        <span style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:180px;">
                            ${idx+1}. ${f.name} (${utils.formatBytes(f.size)})
                        </span>
                        <div style="display:flex; gap:8px;">
                            <i class="fa-solid fa-arrow-up" style="cursor:pointer; color:var(--accent-secondary);" onclick="window.movePdfMerge(${idx}, -1)"></i>
                            <i class="fa-solid fa-arrow-down" style="cursor:pointer; color:var(--accent-secondary);" onclick="window.movePdfMerge(${idx}, 1)"></i>
                            <i class="fa-solid fa-trash-can" style="cursor:pointer; color:#ef4444;" onclick="window.removePdfMerge(${idx})"></i>
                        </div>
                    `;
                    mergeList.appendChild(row);
                });
            };

            window.movePdfMerge = (idx, dir) => {
                const target = idx + dir;
                if (target >= 0 && target < files.length) {
                    const temp = files[idx];
                    files[idx] = files[target];
                    files[target] = temp;
                    renderList();
                }
            };

            window.removePdfMerge = (idx) => {
                files.splice(idx, 1);
                renderList();
                updateLog(`Removed PDF at index ${idx+1}`);
            };

            const addFiles = (newFiles) => {
                for (let f of newFiles) {
                    if (f.type === 'application/pdf' || f.name.endsWith('.pdf')) {
                        files.push(f);
                        updateLog(`Loaded: ${f.name}`);
                    } else {
                        utils.showToast(`Skipped non-PDF file: ${f.name}`, 'error');
                    }
                }
                renderList();
            };

            dropzone.onclick = () => fileInput.click();
            fileInput.onchange = (e) => addFiles(e.target.files);
            dropzone.ondragover = (e) => { e.preventDefault(); dropzone.style.borderColor = 'var(--accent-secondary)'; };
            dropzone.ondragleave = () => { dropzone.style.borderColor = ''; };
            dropzone.ondrop = (e) => { e.preventDefault(); dropzone.style.borderColor = ''; addFiles(e.dataTransfer.files); };

            mergeBtn.onclick = async () => {
                if (files.length < 2) {
                    utils.showToast('Please add at least 2 PDF files to merge!', 'error');
                    return;
                }
                if (!window.PDFLib) {
                    utils.showToast('PDF-Lib CDN is not loaded yet!', 'error');
                    return;
                }

                mergeBtn.disabled = true;
                updateLog('Starting PDF merge process...', true);

                try {
                    const mergedDoc = await PDFLib.PDFDocument.create();
                    for (let i = 0; i < files.length; i++) {
                        updateLog(`Processing PDF [${i+1}/${files.length}]: ${files[i].name}`);
                        const bytes = await files[i].arrayBuffer();
                        const srcDoc = await PDFLib.PDFDocument.load(bytes);
                        const pageIndices = srcDoc.getPageIndices();
                        const copiedPages = await mergedDoc.copyPages(srcDoc, pageIndices);
                        copiedPages.forEach(page => mergedDoc.addPage(page));
                        updateLog(`Copied ${copiedPages.length} pages from ${files[i].name}`);
                    }

                    updateLog('Finalizing and saving merged PDF...');
                    const mergedPdfBytes = await mergedDoc.save();
                    utils.downloadFile(mergedPdfBytes, 'merged_document.pdf', 'application/pdf');
                    updateLog('PDF merge completed successfully!');
                    window.incrementStatsRun();
                } catch (err) {
                    updateLog(`Merge failed: ${err.message}`);
                    utils.showToast('Merge failed. See status console.', 'error');
                } finally {
                    mergeBtn.disabled = false;
                }
            };
        }
    },

    // 2. PDF Split
    {
        id: 'adv-pdf-split',
        name: 'PDF Split',
        category: 'adv-file',
        icon: '<i class="fa-solid fa-scissors"></i>',
        description: 'Extract specific page ranges or split each page into a separate PDF.',
        tags: ['pdf', 'split', 'scissors', 'extract', 'pages'],
        render() {
            return `
                <div class="tool-grid-2col">
                    <div>
                        <div class="input-group">
                            <label>Upload PDF File</label>
                            <div class="uploader-box" id="pdfsplit-dropzone" style="height:100px;">
                                <i class="fa-solid fa-file-pdf uploader-icon" style="color:var(--accent-secondary);"></i>
                                <div class="uploader-text" id="pdfsplit-text">Choose PDF file</div>
                                <input type="file" id="pdfsplit-input" accept="application/pdf" style="display:none;">
                            </div>
                        </div>
                        <div class="input-group" style="margin-top:10px;">
                            <label>Split Mode</label>
                            <select id="pdfsplit-mode" class="form-select">
                                <option value="range">Extract Page Range</option>
                                <option value="all">Split into Single Pages (ZIP)</option>
                            </select>
                        </div>
                        <div class="input-group" id="pdfsplit-range-group" style="margin-top:10px;">
                            <label>Page Range (e.g. 1-3, 5, 7-10)</label>
                            <input type="text" class="form-input" id="pdfsplit-range" value="1" placeholder="Page indices">
                        </div>
                        <button class="app-btn primary" id="pdfsplit-btn" style="width:100%; margin-top:15px; border-radius:20px;">
                            <i class="fa-solid fa-scissors" style="margin-right:6px;"></i>Split PDF
                        </button>
                    </div>
                    <div>
                        <div class="input-group">
                            <label>Split Status & Log</label>
                            <div class="output-container" style="margin-top:0;">
                                <pre class="output-pre" id="pdfsplit-log" style="min-height:220px; font-size:11px;">[Ready] Upload a PDF file to begin...</pre>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        },
        init() {
            const dropzone = document.getElementById('pdfsplit-dropzone');
            const fileInput = document.getElementById('pdfsplit-input');
            const splitText = document.getElementById('pdfsplit-text');
            const splitMode = document.getElementById('pdfsplit-mode');
            const rangeGroup = document.getElementById('pdfsplit-range-group');
            const rangeInput = document.getElementById('pdfsplit-range');
            const splitBtn = document.getElementById('pdfsplit-btn');
            const logBox = document.getElementById('pdfsplit-log');
            let pdfFile = null;

            const updateLog = (msg, clear = false) => {
                const time = new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', second:'2-digit'});
                if (clear) logBox.textContent = `[${time}] ${msg}`;
                else logBox.textContent += `\n[${time}] ${msg}`;
                logBox.scrollTop = logBox.scrollHeight;
            };

            splitMode.onchange = () => {
                rangeGroup.style.display = splitMode.value === 'range' ? 'block' : 'none';
            };

            dropzone.onclick = () => fileInput.click();
            fileInput.onchange = (e) => {
                pdfFile = e.target.files[0];
                if (pdfFile) {
                    splitText.textContent = `${pdfFile.name} (${utils.formatBytes(pdfFile.size)})`;
                    updateLog(`Loaded file: ${pdfFile.name}`, true);
                }
            };

            splitBtn.onclick = async () => {
                if (!pdfFile) {
                    utils.showToast('Please upload a PDF file first!', 'error');
                    return;
                }
                splitBtn.disabled = true;
                updateLog('Loading PDF document...');

                try {
                    const bytes = await pdfFile.arrayBuffer();
                    const srcDoc = await PDFLib.PDFDocument.load(bytes);
                    const totalPages = srcDoc.getPageCount();
                    updateLog(`Total pages in document: ${totalPages}`);

                    if (splitMode.value === 'range') {
                        // Extract specific range
                        const rangeStr = rangeInput.value.trim();
                        if (!rangeStr) throw new Error('Range specification is empty');
                        
                        // Parse range like "1-3, 5, 7-10"
                        const pageIndices = [];
                        const parts = rangeStr.split(',');
                        for (let part of parts) {
                            part = part.trim();
                            if (part.includes('-')) {
                                const bounds = part.split('-');
                                const start = parseInt(bounds[0]) - 1;
                                const end = parseInt(bounds[1]) - 1;
                                for (let p = start; p <= end; p++) {
                                    if (p >= 0 && p < totalPages) pageIndices.push(p);
                                }
                            } else {
                                const pageIdx = parseInt(part) - 1;
                                if (pageIdx >= 0 && pageIdx < totalPages) pageIndices.push(pageIdx);
                            }
                        }

                        if (pageIndices.length === 0) throw new Error('No valid pages found in range.');

                        updateLog(`Extracting pages: ${pageIndices.map(p => p + 1).join(', ')}`);
                        const splitDoc = await PDFLib.PDFDocument.create();
                        const copiedPages = await splitDoc.copyPages(srcDoc, pageIndices);
                        copiedPages.forEach(p => splitDoc.addPage(p));

                        updateLog('Saving output PDF...');
                        const splitBytes = await splitDoc.save();
                        utils.downloadFile(splitBytes, `extracted_pages_${rangeStr.replace(/\s+/g, '')}.pdf`, 'application/pdf');
                        updateLog('Page range extracted successfully!');
                    } else {
                        // Split into single pages ZIP
                        if (!window.JSZip) throw new Error('JSZip library is missing!');
                        updateLog('Splitting into individual pages... Packaging into ZIP...');
                        const zip = new JSZip();

                        for (let i = 0; i < totalPages; i++) {
                            updateLog(`Extracting page ${i+1}/${totalPages}...`);
                            const singleDoc = await PDFLib.PDFDocument.create();
                            const [copiedPage] = await singleDoc.copyPages(srcDoc, [i]);
                            singleDoc.addPage(copiedPage);
                            const singleBytes = await singleDoc.save();
                            zip.file(`page_${i+1}.pdf`, singleBytes);
                        }

                        updateLog('Generating zip archive...');
                        const zipBlob = await zip.generateAsync({ type: 'blob' });
                        utils.downloadFile(zipBlob, `${pdfFile.name.replace('.pdf', '')}_split_pages.zip`, 'application/zip');
                        updateLog('All pages split and downloaded inside ZIP archive!');
                    }
                    window.incrementStatsRun();
                } catch (err) {
                    updateLog(`Split failed: ${err.message}`);
                    utils.showToast(err.message, 'error');
                } finally {
                    splitBtn.disabled = false;
                }
            };
        }
    },

    // 3. PDF Rotate
    {
        id: 'adv-pdf-rotate',
        name: 'PDF Rotate',
        category: 'adv-file',
        icon: '<i class="fa-solid fa-rotate"></i>',
        description: 'Rotate all pages or specific page indices by 90, 180, or 270 degrees.',
        tags: ['pdf', 'rotate', 'spin', 'orientation'],
        render() {
            return `
                <div class="tool-grid-2col">
                    <div>
                        <div class="input-group">
                            <label>Upload PDF</label>
                            <div class="uploader-box" id="pdfrot-dropzone" style="height:90px;">
                                <i class="fa-solid fa-file-pdf uploader-icon" style="color:var(--accent-secondary);"></i>
                                <div class="uploader-text" id="pdfrot-text">Upload PDF</div>
                                <input type="file" id="pdfrot-input" accept="application/pdf" style="display:none;">
                            </div>
                        </div>
                        <div class="input-group" style="margin-top:10px;">
                            <label>Pages to Rotate</label>
                            <select id="pdfrot-pages" class="form-select">
                                <option value="all">All Pages</option>
                                <option value="specific">Specific Pages</option>
                            </select>
                        </div>
                        <div class="input-group" id="pdfrot-spec-group" style="margin-top:10px; display:none;">
                            <label>Page numbers (e.g. 1, 3, 5)</label>
                            <input type="text" class="form-input" id="pdfrot-spec-pages" value="1">
                        </div>
                        <div class="input-group" style="margin-top:10px;">
                            <label>Rotation Angle</label>
                            <select id="pdfrot-angle" class="form-select">
                                <option value="90">90° Clockwise</option>
                                <option value="180">180° Flip</option>
                                <option value="270">270° Counter-Clockwise</option>
                            </select>
                        </div>
                        <button class="app-btn primary" id="pdfrot-btn" style="width:100%; margin-top:15px; border-radius:20px;">
                            <i class="fa-solid fa-rotate" style="margin-right:6px;"></i>Rotate & Save
                        </button>
                    </div>
                    <div>
                        <div class="input-group">
                            <label>Rotation Logs</label>
                            <div class="output-container" style="margin-top:0;">
                                <pre class="output-pre" id="pdfrot-log" style="min-height:220px; font-size:11px;">[Ready] Select PDF...</pre>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        },
        init() {
            const dropzone = document.getElementById('pdfrot-dropzone');
            const fileInput = document.getElementById('pdfrot-input');
            const rotText = document.getElementById('pdfrot-text');
            const rotPages = document.getElementById('pdfrot-pages');
            const specGroup = document.getElementById('pdfrot-spec-group');
            const specInput = document.getElementById('pdfrot-spec-pages');
            const rotAngle = document.getElementById('pdfrot-angle');
            const rotBtn = document.getElementById('pdfrot-btn');
            const logBox = document.getElementById('pdfrot-log');
            let pdfFile = null;

            const updateLog = (msg, clear = false) => {
                const time = new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', second:'2-digit'});
                if (clear) logBox.textContent = `[${time}] ${msg}`;
                else logBox.textContent += `\n[${time}] ${msg}`;
            };

            rotPages.onchange = () => {
                specGroup.style.display = rotPages.value === 'specific' ? 'block' : 'none';
            };

            dropzone.onclick = () => fileInput.click();
            fileInput.onchange = (e) => {
                pdfFile = e.target.files[0];
                if (pdfFile) {
                    rotText.textContent = pdfFile.name;
                    updateLog(`Loaded file: ${pdfFile.name}`, true);
                }
            };

            rotBtn.onclick = async () => {
                if (!pdfFile) {
                    utils.showToast('Please upload a PDF file!', 'error');
                    return;
                }
                rotBtn.disabled = true;
                updateLog('Loading PDF...');

                try {
                    const bytes = await pdfFile.arrayBuffer();
                    const pdfDoc = await PDFLib.PDFDocument.load(bytes);
                    const pages = pdfDoc.getPages();
                    const angle = parseInt(rotAngle.value);

                    updateLog(`PDF loaded. Total Pages: ${pages.length}`);

                    let targets = [];
                    if (rotPages.value === 'all') {
                        targets = pages.map((_, i) => i);
                    } else {
                        const spec = specInput.value.split(',').map(s => parseInt(s.trim()) - 1);
                        spec.forEach(idx => {
                            if (idx >= 0 && idx < pages.length) targets.push(idx);
                        });
                    }

                    targets.forEach(idx => {
                        const page = pages[idx];
                        const currRot = page.getRotation().angle || 0;
                        const newRot = (currRot + angle) % 360;
                        page.setRotation(PDFLib.degrees(newRot));
                        updateLog(`Page ${idx+1} rotated from ${currRot}° to ${newRot}°`);
                    });

                    updateLog('Writing PDF data...');
                    const outputBytes = await pdfDoc.save();
                    utils.downloadFile(outputBytes, `rotated_${pdfFile.name}`, 'application/pdf');
                    updateLog('PDF pages rotated successfully!');
                    window.incrementStatsRun();
                } catch (err) {
                    updateLog(`Rotation failed: ${err.message}`);
                } finally {
                    rotBtn.disabled = false;
                }
            };
        }
    },

    // 4. PDF Page Reorder
    {
        id: 'adv-pdf-reorder',
        name: 'PDF Page Reorder',
        category: 'adv-file',
        icon: '<i class="fa-solid fa-arrows-up-down-left-right"></i>',
        description: 'Rearrange the pages of a PDF document in any custom order.',
        tags: ['pdf', 'reorder', 'rearrange', 'sort', 'pages'],
        render() {
            return `
                <div class="uploader-box" id="pdfreorder-dropzone" style="height:100px;">
                    <i class="fa-solid fa-file-pdf uploader-icon" style="color:var(--accent-secondary);"></i>
                    <div class="uploader-text" id="pdfreorder-text">Upload PDF to Reorder Pages</div>
                    <input type="file" id="pdfreorder-input" accept="application/pdf" style="display:none;">
                </div>
                <div class="input-group" style="margin-top:15px;">
                    <label>New Page Sequence (1-based comma separated list, e.g. 3, 1, 2, 4)</label>
                    <input type="text" class="form-input" id="pdfreorder-seq" value="" placeholder="1, 2, 3...">
                </div>
                <button class="app-btn primary" id="pdfreorder-btn" style="width:100%; margin-top:15px; border-radius:20px;">
                    <i class="fa-solid fa-arrows-rotate" style="margin-right:6px;"></i>Reorder & Download
                </button>
            `;
        },
        init() {
            const dropzone = document.getElementById('pdfreorder-dropzone');
            const fileInput = document.getElementById('pdfreorder-input');
            const seqInput = document.getElementById('pdfreorder-seq');
            const reorderText = document.getElementById('pdfreorder-text');
            const reorderBtn = document.getElementById('pdfreorder-btn');
            let pdfFile = null;

            dropzone.onclick = () => fileInput.click();
            fileInput.onchange = async (e) => {
                pdfFile = e.target.files[0];
                if (pdfFile) {
                    reorderText.textContent = pdfFile.name;
                    try {
                        const bytes = await pdfFile.arrayBuffer();
                        const pdfDoc = await PDFLib.PDFDocument.load(bytes);
                        const count = pdfDoc.getPageCount();
                        const defaultSeq = Array.from({length: count}, (_, i) => i + 1).join(', ');
                        seqInput.value = defaultSeq;
                        utils.showToast(`PDF loaded. Total Pages: ${count}`);
                    } catch (err) {
                        utils.showToast('Error reading PDF structure', 'error');
                    }
                }
            };

            reorderBtn.onclick = async () => {
                if (!pdfFile) {
                    utils.showToast('Please upload a PDF first!', 'error');
                    return;
                }
                const seqStr = seqInput.value.trim();
                if (!seqStr) return;

                reorderBtn.disabled = true;
                try {
                    const bytes = await pdfFile.arrayBuffer();
                    const srcDoc = await PDFLib.PDFDocument.load(bytes);
                    const totalPages = srcDoc.getPageCount();

                    // Parse indices
                    const order = seqStr.split(',').map(s => parseInt(s.trim()) - 1);
                    const invalid = order.find(idx => isNaN(idx) || idx < 0 || idx >= totalPages);
                    if (invalid !== undefined) {
                        throw new Error(`Invalid page index found: ${invalid + 1}`);
                    }

                    const reorderedDoc = await PDFLib.PDFDocument.create();
                    const copiedPages = await reorderedDoc.copyPages(srcDoc, order);
                    copiedPages.forEach(p => reorderedDoc.addPage(p));

                    const outBytes = await reorderedDoc.save();
                    utils.downloadFile(outBytes, `reordered_${pdfFile.name}`, 'application/pdf');
                    utils.showToast('PDF pages successfully reordered!');
                    window.incrementStatsRun();
                } catch(err) {
                    utils.showToast(err.message, 'error');
                } finally {
                    reorderBtn.disabled = false;
                }
            };
        }
    },

    // 5. PDF Page Deleter
    {
        id: 'adv-pdf-deleter',
        name: 'PDF Page Deleter',
        category: 'adv-file',
        icon: '<i class="fa-solid fa-trash-can"></i>',
        description: 'Remove unwanted pages from a PDF document instantly.',
        tags: ['pdf', 'delete', 'remove', 'strip', 'pages'],
        render() {
            return `
                <div class="uploader-box" id="pdfdel-dropzone" style="height:100px;">
                    <i class="fa-solid fa-file-pdf uploader-icon" style="color:var(--accent-primary);"></i>
                    <div class="uploader-text" id="pdfdel-text">Upload PDF to Remove Pages</div>
                    <input type="file" id="pdfdel-input" accept="application/pdf" style="display:none;">
                </div>
                <div class="input-group" style="margin-top:15px;">
                    <label>Pages to Delete (1-based comma separated list or range, e.g. 2, 4-6)</label>
                    <input type="text" class="form-input" id="pdfdel-seq" value="" placeholder="2, 4, 5">
                </div>
                <button class="app-btn primary" id="pdfdel-btn" style="width:100%; margin-top:15px; border-radius:20px; background:#ef4444; border-color:#ef4444;">
                    <i class="fa-solid fa-trash-can" style="margin-right:6px;"></i>Delete Pages & Download
                </button>
            `;
        },
        init() {
            const dropzone = document.getElementById('pdfdel-dropzone');
            const fileInput = document.getElementById('pdfdel-input');
            const seqInput = document.getElementById('pdfdel-seq');
            const delText = document.getElementById('pdfdel-text');
            const delBtn = document.getElementById('pdfdel-btn');
            let pdfFile = null;

            dropzone.onclick = () => fileInput.click();
            fileInput.onchange = async (e) => {
                pdfFile = e.target.files[0];
                if (pdfFile) {
                    delText.textContent = pdfFile.name;
                    utils.showToast(`PDF file loaded successfully.`);
                }
            };

            delBtn.onclick = async () => {
                if (!pdfFile) {
                    utils.showToast('Please upload a PDF first!', 'error');
                    return;
                }
                const input = seqInput.value.trim();
                if (!input) return;

                delBtn.disabled = true;
                try {
                    const bytes = await pdfFile.arrayBuffer();
                    const pdfDoc = await PDFLib.PDFDocument.load(bytes);
                    const totalPages = pdfDoc.getPageCount();

                    // Parse indices to delete
                    const toDelete = new Set();
                    const parts = input.split(',');
                    for (let part of parts) {
                        part = part.trim();
                        if (part.includes('-')) {
                            const bounds = part.split('-');
                            const start = parseInt(bounds[0]);
                            const end = parseInt(bounds[1]);
                            for (let p = start; p <= end; p++) {
                                toDelete.add(p - 1);
                            }
                        } else {
                            toDelete.add(parseInt(part) - 1);
                        }
                    }

                    // Delete pages starting from back
                    const deleteArray = Array.from(toDelete).sort((a,b) => b - a);
                    for (let idx of deleteArray) {
                        if (idx >= 0 && idx < totalPages) {
                            pdfDoc.removePage(idx);
                        }
                    }

                    if (pdfDoc.getPageCount() === 0) {
                        throw new Error('You cannot delete all pages of a PDF document!');
                    }

                    const outBytes = await pdfDoc.save();
                    utils.downloadFile(outBytes, `deleted_pages_${pdfFile.name}`, 'application/pdf');
                    utils.showToast('Pages deleted successfully!');
                    window.incrementStatsRun();
                } catch(err) {
                    utils.showToast(err.message, 'error');
                } finally {
                    delBtn.disabled = false;
                }
            };
        }
    },

    // 6. PDF Metadata Viewer
    {
        id: 'adv-pdf-metadata',
        name: 'PDF Metadata Tool',
        category: 'adv-file',
        icon: '<i class="fa-solid fa-circle-info"></i>',
        description: 'View and edit title, author, subject, and keywords metadata tags locally.',
        tags: ['pdf', 'metadata', 'tags', 'properties', 'edit'],
        render() {
            return `
                <div class="tool-grid-2col">
                    <div>
                        <div class="input-group">
                            <label>Upload PDF</label>
                            <div class="uploader-box" id="pdfmeta-dropzone" style="height:90px;">
                                <i class="fa-solid fa-file-pdf uploader-icon" style="color:var(--accent-secondary);"></i>
                                <div class="uploader-text" id="pdfmeta-text">Choose PDF File</div>
                                <input type="file" id="pdfmeta-input" accept="application/pdf" style="display:none;">
                            </div>
                        </div>
                        <div class="input-group" style="margin-top:10px;">
                            <label>Title</label>
                            <input type="text" class="form-input" id="pdfmeta-title" value="">
                        </div>
                        <div class="input-group" style="margin-top:10px;">
                            <label>Author</label>
                            <input type="text" class="form-input" id="pdfmeta-author" value="">
                        </div>
                        <div class="input-group" style="margin-top:10px;">
                            <label>Subject</label>
                            <input type="text" class="form-input" id="pdfmeta-subject" value="">
                        </div>
                        <div class="input-group" style="margin-top:10px;">
                            <label>Keywords</label>
                            <input type="text" class="form-input" id="pdfmeta-keywords" value="">
                        </div>
                        <button class="app-btn primary" id="pdfmeta-btn" style="width:100%; margin-top:15px; border-radius:20px;">
                            <i class="fa-solid fa-floppy-disk" style="margin-right:6px;"></i>Save & Download PDF
                        </button>
                    </div>
                    <div>
                        <h3 style="font-size:13px; font-weight:700; color:var(--accent-secondary); margin-bottom:10px;"><i class="fa-solid fa-circle-info" style="margin-right:6px;"></i>Current Properties</h3>
                        <div id="pdfmeta-props" class="output-container" style="margin-top:0; font-size:12px; padding:15px; line-height:1.6; display:flex; flex-direction:column; gap:6px;">
                            <span style="color:var(--text-muted);">No file loaded</span>
                        </div>
                    </div>
                </div>
            `;
        },
        init() {
            const dropzone = document.getElementById('pdfmeta-dropzone');
            const fileInput = document.getElementById('pdfmeta-input');
            const metaText = document.getElementById('pdfmeta-text');
            const titleIn = document.getElementById('pdfmeta-title');
            const authorIn = document.getElementById('pdfmeta-author');
            const subjectIn = document.getElementById('pdfmeta-subject');
            const keywordsIn = document.getElementById('pdfmeta-keywords');
            const btn = document.getElementById('pdfmeta-btn');
            const propsBox = document.getElementById('pdfmeta-props');
            let pdfFile = null;

            dropzone.onclick = () => fileInput.click();
            fileInput.onchange = async (e) => {
                pdfFile = e.target.files[0];
                if (pdfFile) {
                    metaText.textContent = pdfFile.name;
                    try {
                        const bytes = await pdfFile.arrayBuffer();
                        const pdfDoc = await PDFLib.PDFDocument.load(bytes);
                        
                        const title = pdfDoc.getTitle() || '';
                        const author = pdfDoc.getAuthor() || '';
                        const subject = pdfDoc.getSubject() || '';
                        const keywords = pdfDoc.getKeywords() || '';
                        
                        titleIn.value = title;
                        authorIn.value = author;
                        subjectIn.value = subject;
                        keywordsIn.value = keywords;

                        propsBox.innerHTML = `
                            <div><strong>Filename:</strong> ${pdfFile.name}</div>
                            <div><strong>Page Count:</strong> ${pdfDoc.getPageCount()}</div>
                            <div><strong>Title:</strong> ${title || 'N/A'}</div>
                            <div><strong>Author:</strong> ${author || 'N/A'}</div>
                            <div><strong>Subject:</strong> ${subject || 'N/A'}</div>
                            <div><strong>Keywords:</strong> ${keywords || 'N/A'}</div>
                            <div><strong>Creator:</strong> ${pdfDoc.getCreator() || 'N/A'}</div>
                            <div><strong>Producer:</strong> ${pdfDoc.getProducer() || 'N/A'}</div>
                        `;
                    } catch (err) {
                        utils.showToast('Failed to parse metadata: ' + err.message, 'error');
                    }
                }
            };

            btn.onclick = async () => {
                if (!pdfFile) {
                    utils.showToast('Please upload a PDF first!', 'error');
                    return;
                }
                btn.disabled = true;
                try {
                    const bytes = await pdfFile.arrayBuffer();
                    const pdfDoc = await PDFLib.PDFDocument.load(bytes);
                    
                    pdfDoc.setTitle(titleIn.value);
                    pdfDoc.setAuthor(authorIn.value);
                    pdfDoc.setSubject(subjectIn.value);
                    pdfDoc.setKeywords(keywordsIn.value.split(',').map(s => s.trim()));

                    const outBytes = await pdfDoc.save();
                    utils.downloadFile(outBytes, `meta_${pdfFile.name}`, 'application/pdf');
                    utils.showToast('Metadata updated!');
                    window.incrementStatsRun();
                } catch(err) {
                    utils.showToast(err.message, 'error');
                } finally {
                    btn.disabled = false;
                }
            };
        }
    },

    // 7. PDF Watermark
    {
        id: 'adv-pdf-watermark',
        name: 'PDF Watermark',
        category: 'adv-file',
        icon: '<i class="fa-solid fa-stamp"></i>',
        description: 'Overlay custom watermark text onto pages of a PDF document.',
        tags: ['pdf', 'watermark', 'stamp', 'sign', 'overlay'],
        render() {
            return `
                <div class="tool-grid-2col">
                    <div>
                        <div class="input-group">
                            <label>PDF File</label>
                            <div class="uploader-box" id="pdfwm-dropzone" style="height:90px;">
                                <i class="fa-solid fa-file-pdf uploader-icon" style="color:var(--accent-primary);"></i>
                                <div class="uploader-text" id="pdfwm-text">Choose PDF File</div>
                                <input type="file" id="pdfwm-input" accept="application/pdf" style="display:none;">
                            </div>
                        </div>
                        <div class="input-group" style="margin-top:10px;">
                            <label>Watermark Text</label>
                            <input type="text" class="form-input" id="pdfwm-string" value="CONFIDENTIAL">
                        </div>
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:10px;">
                            <div class="input-group">
                                <label>Opacity (0.1 - 1.0)</label>
                                <input type="number" class="form-input" id="pdfwm-opacity" value="0.3" min="0.1" max="1" step="0.1">
                            </div>
                            <div class="input-group">
                                <label>Font Size</label>
                                <input type="number" class="form-input" id="pdfwm-size" value="48">
                            </div>
                        </div>
                        <button class="app-btn primary" id="pdfwm-btn" style="width:100%; margin-top:15px; border-radius:20px;">
                            <i class="fa-solid fa-stamp" style="margin-right:6px;"></i>Add Watermark & Save
                        </button>
                    </div>
                    <div>
                        <div class="input-group">
                            <label>Watermark Status & Progress</label>
                            <div class="output-container" style="margin-top:0;">
                                <pre class="output-pre" id="pdfwm-log" style="min-height:220px; font-size:11px;">[Ready] Select PDF file...</pre>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        },
        init() {
            const dropzone = document.getElementById('pdfwm-dropzone');
            const fileInput = document.getElementById('pdfwm-input');
            const wmText = document.getElementById('pdfwm-text');
            const wmString = document.getElementById('pdfwm-string');
            const wmOpacity = document.getElementById('pdfwm-opacity');
            const wmSize = document.getElementById('pdfwm-size');
            const wmBtn = document.getElementById('pdfwm-btn');
            const logBox = document.getElementById('pdfwm-log');
            let pdfFile = null;

            const updateLog = (msg, clear = false) => {
                const time = new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', second:'2-digit'});
                if (clear) logBox.textContent = `[${time}] ${msg}`;
                else logBox.textContent += `\n[${time}] ${msg}`;
            };

            dropzone.onclick = () => fileInput.click();
            fileInput.onchange = (e) => {
                pdfFile = e.target.files[0];
                if (pdfFile) {
                    wmText.textContent = pdfFile.name;
                    updateLog(`Loaded file: ${pdfFile.name}`, true);
                }
            };

            wmBtn.onclick = async () => {
                if (!pdfFile) {
                    utils.showToast('Please upload a PDF first!', 'error');
                    return;
                }
                wmBtn.disabled = true;
                updateLog('Loading PDF...');

                try {
                    const bytes = await pdfFile.arrayBuffer();
                    const pdfDoc = await PDFLib.PDFDocument.load(bytes);
                    const pages = pdfDoc.getPages();
                    const text = wmString.value || 'CONFIDENTIAL';
                    const size = parseInt(wmSize.value) || 40;
                    const opacity = parseFloat(wmOpacity.value) || 0.3;

                    updateLog(`Processing watermark on ${pages.length} pages...`);

                    const standardFont = await pdfDoc.embedFont(PDFLib.StandardFonts.HelveticaBold);

                    pages.forEach((page, idx) => {
                        const { width, height } = page.getSize();
                        
                        // Render rotated text in the center
                        page.drawText(text, {
                            x: width / 2 - (text.length * size * 0.25),
                            y: height / 2,
                            size: size,
                            font: standardFont,
                            color: PDFLib.rgb(0.7, 0, 0), // Dark Red
                            opacity: opacity,
                            rotate: PDFLib.degrees(45),
                        });
                        updateLog(`Stamped page ${idx+1}`);
                    });

                    updateLog('Saving watermarked PDF...');
                    const outputBytes = await pdfDoc.save();
                    utils.downloadFile(outputBytes, `watermarked_${pdfFile.name}`, 'application/pdf');
                    updateLog('PDF Watermark applied successfully!');
                    window.incrementStatsRun();
                } catch(err) {
                    updateLog(`Failed: ${err.message}`);
                } finally {
                    wmBtn.disabled = false;
                }
            };
        }
    },

    // 8. PDF Password Unlocker
    {
        id: 'adv-pdf-unlock',
        name: 'PDF Password Unlock',
        category: 'adv-file',
        icon: '<i class="fa-solid fa-lock-open"></i>',
        description: 'Remove password protection/encryption from PDF files locally.',
        tags: ['pdf', 'unlock', 'decrypt', 'password', 'security'],
        render() {
            return `
                <div class="uploader-box" id="pdfun-dropzone" style="height:100px;">
                    <i class="fa-solid fa-file-shield uploader-icon" style="color:var(--accent-secondary);"></i>
                    <div class="uploader-text" id="pdfun-text">Upload Locked PDF</div>
                    <input type="file" id="pdfun-input" accept="application/pdf" style="display:none;">
                </div>
                <div class="input-group" style="margin-top:15px;">
                    <label>PDF Password</label>
                    <input type="password" class="form-input" id="pdfun-pass" placeholder="Type password here...">
                </div>
                <button class="app-btn primary" id="pdfun-btn" style="width:100%; margin-top:15px; border-radius:20px;">
                    <i class="fa-solid fa-lock-open" style="margin-right:6px;"></i>Decrypt & Download PDF
                </button>
            `;
        },
        init() {
            const dropzone = document.getElementById('pdfun-dropzone');
            const fileInput = document.getElementById('pdfun-input');
            const textEl = document.getElementById('pdfun-text');
            const passEl = document.getElementById('pdfun-pass');
            const btn = document.getElementById('pdfun-btn');
            let pdfFile = null;

            dropzone.onclick = () => fileInput.click();
            fileInput.onchange = (e) => {
                pdfFile = e.target.files[0];
                if (pdfFile) {
                    textEl.textContent = pdfFile.name;
                }
            };

            btn.onclick = async () => {
                if (!pdfFile) {
                    utils.showToast('Please upload a PDF first!', 'error');
                    return;
                }
                const password = passEl.value;
                if (!password) {
                    utils.showToast('Please enter the PDF password!', 'error');
                    return;
                }

                btn.disabled = true;
                try {
                    const bytes = await pdfFile.arrayBuffer();
                    // Load encrypted PDF with user password
                    const pdfDoc = await PDFLib.PDFDocument.load(bytes, { password });
                    
                    // Saving creates a decrypted/unencrypted copy
                    const outBytes = await pdfDoc.save();
                    utils.downloadFile(outBytes, `unlocked_${pdfFile.name}`, 'application/pdf');
                    utils.showToast('PDF unlocked and saved successfully!');
                    window.incrementStatsRun();
                } catch(err) {
                    utils.showToast('Unlock failed! Double check password.', 'error');
                } finally {
                    btn.disabled = false;
                }
            };
        }
    },

    // 9. PDF to Image Extractor
    {
        id: 'adv-pdf-to-img',
        name: 'PDF to Image Extractor',
        category: 'adv-file',
        icon: '<i class="fa-solid fa-images"></i>',
        description: 'Extract and download all pages of a PDF document as images in a ZIP.',
        tags: ['pdf', 'images', 'jpg', 'png', 'pages', 'unpack'],
        render() {
            return `
                <div class="tool-grid-2col">
                    <div>
                        <div class="input-group">
                            <label>PDF Document</label>
                            <div class="uploader-box" id="pdfimg-dropzone" style="height:90px;">
                                <i class="fa-solid fa-file-pdf uploader-icon" style="color:var(--accent-primary);"></i>
                                <div class="uploader-text" id="pdfimg-text">Choose PDF File</div>
                                <input type="file" id="pdfimg-input" accept="application/pdf" style="display:none;">
                            </div>
                        </div>
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:10px;">
                            <div class="input-group">
                                <label>Image Format</label>
                                <select id="pdfimg-format" class="form-select">
                                    <option value="image/png">PNG</option>
                                    <option value="image/jpeg">JPEG</option>
                                </select>
                            </div>
                            <div class="input-group">
                                <label>Render Quality (DPI Scale)</label>
                                <select id="pdfimg-scale" class="form-select">
                                    <option value="1.0">Standard (1.0x)</option>
                                    <option value="1.5">Medium (1.5x)</option>
                                    <option value="2.0">High (2.0x)</option>
                                </select>
                            </div>
                        </div>
                        <button class="app-btn primary" id="pdfimg-btn" style="width:100%; margin-top:15px; border-radius:20px;">
                            <i class="fa-solid fa-images" style="margin-right:6px;"></i>Extract Images (ZIP)
                        </button>
                    </div>
                    <div>
                        <div class="input-group">
                            <label>Extraction Logs</label>
                            <div class="output-container" style="margin-top:0;">
                                <pre class="output-pre" id="pdfimg-log" style="min-height:220px; font-size:11px;">[Ready] Select PDF file...</pre>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        },
        init() {
            const dropzone = document.getElementById('pdfimg-dropzone');
            const fileInput = document.getElementById('pdfimg-input');
            const labelText = document.getElementById('pdfimg-text');
            const formatEl = document.getElementById('pdfimg-format');
            const scaleEl = document.getElementById('pdfimg-scale');
            const btn = document.getElementById('pdfimg-btn');
            const logBox = document.getElementById('pdfimg-log');
            let pdfFile = null;

            const updateLog = (msg, clear = false) => {
                const time = new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', second:'2-digit'});
                if (clear) logBox.textContent = `[${time}] ${msg}`;
                else logBox.textContent += `\n[${time}] ${msg}`;
                logBox.scrollTop = logBox.scrollHeight;
            };

            dropzone.onclick = () => fileInput.click();
            fileInput.onchange = (e) => {
                pdfFile = e.target.files[0];
                if (pdfFile) {
                    labelText.textContent = pdfFile.name;
                    updateLog(`Loaded file: ${pdfFile.name}`, true);
                }
            };

            btn.onclick = async () => {
                if (!pdfFile) {
                    utils.showToast('Please upload a PDF first!', 'error');
                    return;
                }
                const pdfjsLib = window.pdfjsLib;
                if (!pdfjsLib) {
                    utils.showToast('PDF.js not loaded. Check internet connection.', 'error');
                    return;
                }
                if (!window.JSZip) {
                    utils.showToast('JSZip not loaded. Check internet connection.', 'error');
                    return;
                }

                btn.disabled = true;
                updateLog('Extracting PDF pages... Initializing renderer.');

                try {
                    const bytes = new Uint8Array(await pdfFile.arrayBuffer());
                    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
                    const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
                    const zip = new JSZip();
                    const fmt = formatEl.value;
                    const ext = fmt === 'image/png' ? 'png' : 'jpg';
                    const scaleVal = parseFloat(scaleEl.value);

                    updateLog(`Total pages: ${pdf.numPages}. Starting render loop.`);

                    for (let i = 1; i <= pdf.numPages; i++) {
                        updateLog(`Rendering page ${i}/${pdf.numPages}...`);
                        const page = await pdf.getPage(i);
                        const viewport = page.getViewport({ scale: scaleVal });

                        const canvas = document.createElement('canvas');
                        canvas.width = viewport.width;
                        canvas.height = viewport.height;
                        const context = canvas.getContext('2d');

                        await page.render({ canvasContext: context, viewport: viewport }).promise;
                        
                        // Extract base64
                        const dataUrl = canvas.toDataURL(fmt);
                        const b64Data = dataUrl.split(',')[1];
                        zip.file(`page_${i}.${ext}`, b64Data, { base64: true });
                    }

                    updateLog('Creating ZIP file...');
                    const zipBlob = await zip.generateAsync({ type: 'blob' });
                    utils.downloadFile(zipBlob, `${pdfFile.name.replace('.pdf', '')}_images.zip`, 'application/zip');
                    updateLog('All pages extracted successfully.');
                    window.incrementStatsRun();
                } catch(err) {
                    updateLog(`Extraction failed: ${err.message}`);
                    utils.showToast('Extraction failed.', 'error');
                } finally {
                    btn.disabled = false;
                }
            };
        }
    },

    // 10. Text to PDF
    {
        id: 'adv-txt-pdf',
        name: 'Text to PDF',
        category: 'adv-file',
        icon: '<i class="fa-solid fa-file-pdf"></i>',
        description: 'Convert plain text articles or scripts into neatly paginated PDF reports.',
        tags: ['txt', 'pdf', 'converter', 'convert'],
        render() {
            return `
                <div class="input-group">
                    <label>Input Text Content</label>
                    <textarea class="form-textarea" id="txtpdf-input" style="min-height:180px;" placeholder="Type or paste text here..."></textarea>
                </div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:10px;">
                    <div class="input-group">
                        <label>Font Family</label>
                        <select id="txtpdf-font" class="form-select">
                            <option value="helvetica">Helvetica (Sans-Serif)</option>
                            <option value="times">Times New Roman (Serif)</option>
                            <option value="courier">Courier (Monospace)</option>
                        </select>
                    </div>
                    <div class="input-group">
                        <label>Filename</label>
                        <input type="text" class="form-input" id="txtpdf-name" value="text_document.pdf">
                    </div>
                </div>
                <button class="app-btn primary" id="txtpdf-btn" style="width:100%; margin-top:15px; border-radius:20px;">
                    <i class="fa-solid fa-file-arrow-down" style="margin-right:6px;"></i>Generate PDF
                </button>
            `;
        },
        init() {
            const btn = document.getElementById('txtpdf-btn');
            btn.onclick = () => {
                const text = document.getElementById('txtpdf-input').value;
                if (!text.trim()) {
                    utils.showToast('Please type some text first!', 'error');
                    return;
                }
                if (!window.jspdf) {
                    utils.showToast('jsPDF library not loaded.', 'error');
                    return;
                }

                btn.disabled = true;
                try {
                    const { jsPDF } = window.jspdf;
                    const doc = new jsPDF();
                    const font = document.getElementById('txtpdf-font').value;
                    const filename = document.getElementById('txtpdf-name').value || 'document.pdf';

                    doc.setFont(font, 'normal');
                    doc.setFontSize(11);
                    
                    const lines = doc.splitTextToSize(text, 180);
                    let y = 15;
                    lines.forEach(line => {
                        if (y > 280) {
                            doc.addPage();
                            y = 15;
                        }
                        doc.text(line, 15, y);
                        y += 6;
                    });

                    doc.save(filename.endsWith('.pdf') ? filename : filename + '.pdf');
                    utils.showToast('PDF compiled successfully!');
                    window.incrementStatsRun();
                } catch(err) {
                    utils.showToast(err.message, 'error');
                } finally {
                    btn.disabled = false;
                }
            };
        }
    },

    // 11. JSON to PDF
    {
        id: 'adv-json-pdf',
        name: 'JSON to PDF',
        category: 'adv-file',
        icon: '<i class="fa-solid fa-code"></i>',
        description: 'Format raw JSON payloads into structured, syntax-highlighted PDF documents.',
        tags: ['json', 'pdf', 'code', 'format', 'convert'],
        render() {
            return `
                <div class="input-group">
                    <label>JSON Content</label>
                    <textarea class="form-textarea" id="jsonpdf-input" style="min-height:180px; font-family:monospace;" placeholder='{"name": "MeyTool", "status": "Ready"}'></textarea>
                </div>
                <button class="app-btn primary" id="jsonpdf-btn" style="width:100%; margin-top:15px; border-radius:20px;">
                    <i class="fa-solid fa-code" style="margin-right:6px;"></i>Format JSON to PDF
                </button>
            `;
        },
        init() {
            const btn = document.getElementById('jsonpdf-btn');
            btn.onclick = () => {
                const jsonText = document.getElementById('jsonpdf-input').value;
                if (!jsonText.trim()) return;
                try {
                    const parsed = JSON.parse(jsonText);
                    const formatted = JSON.stringify(parsed, null, 2);
                    
                    const { jsPDF } = window.jspdf;
                    const doc = new jsPDF();
                    doc.setFont('courier', 'normal');
                    doc.setFontSize(10);
                    
                    const lines = doc.splitTextToSize(formatted, 180);
                    let y = 15;
                    lines.forEach(line => {
                        if (y > 280) {
                            doc.addPage();
                            y = 15;
                        }
                        doc.text(line, 15, y);
                        y += 5;
                    });
                    
                    doc.save('formatted_json.pdf');
                    utils.showToast('JSON PDF downloaded!');
                    window.incrementStatsRun();
                } catch(err) {
                    utils.showToast('Invalid JSON structure: ' + err.message, 'error');
                }
            };
        }
    },

    // 12. CSV to PDF
    {
        id: 'adv-csv-pdf',
        name: 'CSV to PDF Table',
        category: 'adv-file',
        icon: '<i class="fa-solid fa-table"></i>',
        description: 'Convert comma-separated tables (CSV) into clean tabular PDF grid reports.',
        tags: ['csv', 'pdf', 'table', 'sheet', 'converter'],
        render() {
            return `
                <div class="input-group">
                    <label>CSV Table Content (First line is header)</label>
                    <textarea class="form-textarea" id="csvpdf-input" style="min-height:150px;" placeholder="Name, Age, Role\nJohn, 30, Developer\nSarah, 28, Designer"></textarea>
                </div>
                <button class="app-btn primary" id="csvpdf-btn" style="width:100%; margin-top:15px; border-radius:20px;">
                    <i class="fa-solid fa-table-list" style="margin-right:6px;"></i>Generate PDF Grid Table
                </button>
            `;
        },
        init() {
            const btn = document.getElementById('csvpdf-btn');
            btn.onclick = () => {
                const csv = document.getElementById('csvpdf-input').value;
                if (!csv.trim()) return;

                try {
                    const rows = csv.split('\n')
                        .map(line => line.split(','))
                        .filter(row => row.length > 0 && row[0].trim() !== '');

                    if (rows.length === 0) throw new Error('CSV is empty');
                    const headers = rows[0];
                    const bodyRows = rows.slice(1);

                    const { jsPDF } = window.jspdf;
                    const doc = new jsPDF();

                    if (typeof doc.autoTable === 'function') {
                        doc.autoTable({
                            head: [headers],
                            body: bodyRows,
                            startY: 15
                        });
                    } else {
                        // fallback plain text rendering
                        let y = 15;
                        rows.forEach(r => {
                            doc.text(r.join(' | '), 15, y);
                            y += 8;
                        });
                    }

                    doc.save('csv_table_report.pdf');
                    utils.showToast('CSV PDF report downloaded!');
                    window.incrementStatsRun();
                } catch(err) {
                    utils.showToast(err.message, 'error');
                }
            };
        }
    },

    // 13. HTML to PDF
    {
        id: 'adv-html-pdf',
        name: 'HTML to PDF Converter',
        category: 'adv-file',
        icon: '<i class="fa-solid fa-file-code"></i>',
        description: 'Render custom HTML code blocks offline and download as PDF reports.',
        tags: ['html', 'pdf', 'markup', 'render'],
        render() {
            return `
                <div class="input-group">
                    <label>HTML Code block</label>
                    <textarea class="form-textarea" id="htmlpdf-input" style="min-height:180px; font-family:monospace;" placeholder="<h1>Hello World</h1><p>MeyTool PDF Engine rendering locally.</p>"></textarea>
                </div>
                <button class="app-btn primary" id="htmlpdf-btn" style="width:100%; margin-top:15px; border-radius:20px;">
                    <i class="fa-solid fa-file-pdf" style="margin-right:6px;"></i>Render HTML to PDF
                </button>
            `;
        },
        init() {
            const btn = document.getElementById('htmlpdf-btn');
            btn.onclick = async () => {
                const html = document.getElementById('htmlpdf-input').value;
                if (!html.trim()) return;

                btn.disabled = true;
                const tempDiv = document.createElement('div');
                tempDiv.style.cssText = 'position:absolute; left:-9999px; width:180mm; padding:15px; font-family:sans-serif; background:#fff; color:#000;';
                tempDiv.innerHTML = html;
                document.body.appendChild(tempDiv);

                try {
                    const canvas = await html2canvas(tempDiv);
                    const imgData = canvas.toDataURL('image/png');
                    
                    const { jsPDF } = window.jspdf;
                    const doc = new jsPDF();
                    
                    const w = 180;
                    const h = (canvas.height / canvas.width) * w;
                    doc.addImage(imgData, 'PNG', 15, 15, w, h);
                    doc.save('rendered_html.pdf');
                    utils.showToast('HTML PDF report downloaded!');
                    window.incrementStatsRun();
                } catch(err) {
                    utils.showToast(err.message, 'error');
                } finally {
                    document.body.removeChild(tempDiv);
                    btn.disabled = false;
                }
            };
        }
    },

    // 14. Image to PDF
    {
        id: 'adv-img-pdf',
        name: 'Image to PDF Creator',
        category: 'adv-file',
        icon: '<i class="fa-solid fa-file-image"></i>',
        description: 'Pack standard photos (JPG/PNG/WEBP) into a single PDF document page list.',
        tags: ['image', 'pdf', 'images to pdf', 'photo', 'album'],
        render() {
            return `
                <div class="uploader-box" id="imgpdf-dropzone" style="height:100px;">
                    <i class="fa-solid fa-images uploader-icon" style="color:var(--accent-secondary);"></i>
                    <div class="uploader-text" id="imgpdf-text">Upload Photos</div>
                    <input type="file" id="imgpdf-input" multiple accept="image/*" style="display:none;">
                </div>
                <div id="imgpdf-preview" style="display:flex; flex-wrap:wrap; gap:10px; margin-top:15px;"></div>
                <button class="app-btn primary" id="imgpdf-btn" style="width:100%; margin-top:15px; border-radius:20px; display:none;">
                    <i class="fa-solid fa-file-pdf" style="margin-right:6px;"></i>Create PDF Document
                </button>
            `;
        },
        init() {
            const dropzone = document.getElementById('imgpdf-dropzone');
            const fileInput = document.getElementById('imgpdf-input');
            const preview = document.getElementById('imgpdf-preview');
            const convertBtn = document.getElementById('imgpdf-btn');
            let imgList = [];

            dropzone.onclick = () => fileInput.click();
            fileInput.onchange = (e) => handleImages(e.target.files);

            const handleImages = (files) => {
                for (let file of files) {
                    const reader = new FileReader();
                    reader.onload = (evt) => {
                        imgList.push({ name: file.name, data: evt.target.result });
                        renderPreviews();
                    };
                    reader.readAsDataURL(file);
                }
            };

            const renderPreviews = () => {
                preview.innerHTML = '';
                imgList.forEach((img, idx) => {
                    const wrap = document.createElement('div');
                    wrap.style.cssText = "position:relative; width:80px; height:80px; border-radius:8px; overflow:hidden; border:1px solid rgba(255,255,255,0.1);";
                    wrap.innerHTML = `
                        <img src="${img.data}" style="width:100%; height:100%; object-fit:cover;">
                        <i class="fa-solid fa-circle-xmark" style="position:absolute; top:4px; right:4px; color:#ef4444; cursor:pointer;" onclick="window.removeImgPdf(${idx})"></i>
                    `;
                    preview.appendChild(wrap);
                });
                convertBtn.style.display = imgList.length > 0 ? 'block' : 'none';
            };

            window.removeImgPdf = (idx) => {
                imgList.splice(idx, 1);
                renderPreviews();
            };

            convertBtn.onclick = () => {
                if (imgList.length === 0) return;
                convertBtn.disabled = true;

                try {
                    const { jsPDF } = window.jspdf;
                    const doc = new jsPDF();
                    
                    imgList.forEach((img, idx) => {
                        if (idx > 0) doc.addPage();
                        doc.addImage(img.data, 'JPEG', 15, 15, 180, 260);
                    });

                    doc.save('image_document.pdf');
                    utils.showToast('Images successfully packed to PDF!');
                    window.incrementStatsRun();
                } catch(err) {
                    utils.showToast(err.message, 'error');
                } finally {
                    convertBtn.disabled = false;
                }
            };
        }
    },

    // 15. Markdown to PDF/HTML
    {
        id: 'adv-md-pdf',
        name: 'Markdown to PDF',
        category: 'adv-file',
        icon: '<i class="fa-brands fa-markdown"></i>',
        description: 'Write or load raw Markdown formatting and export clean PDF documents.',
        tags: ['markdown', 'md', 'pdf', 'compiler', 'writer'],
        render() {
            return `
                <div class="tool-grid-2col">
                    <div>
                        <div class="input-group">
                            <label>Markdown Editor</label>
                            <textarea class="form-textarea" id="mdpdf-input" style="min-height:180px; font-family:monospace;" placeholder="# Document Title\n\n**Bold Text** or *italicized text*.\n\n- Bullet points\n- Second point"></textarea>
                        </div>
                        <button class="app-btn primary" id="mdpdf-btn" style="width:100%; margin-top:15px; border-radius:20px;">
                            <i class="fa-solid fa-file-pdf" style="margin-right:6px;"></i>Compile Markdown to PDF
                        </button>
                    </div>
                    <div>
                        <h3 style="font-size:13px; font-weight:700; color:var(--accent-secondary); margin-bottom:10px;">HTML Visual Preview</h3>
                        <div class="output-container" id="mdpdf-preview" style="margin-top:0; min-height:220px; font-size:12px; padding:15px; background:rgba(0,0,0,0.25); overflow-y:auto; line-height:1.5;">
                            <span style="color:var(--text-muted);">Visual live preview...</span>
                        </div>
                    </div>
                </div>
            `;
        },
        init() {
            const editor = document.getElementById('mdpdf-input');
            const preview = document.getElementById('mdpdf-preview');
            const btn = document.getElementById('mdpdf-btn');

            const parseMD = (mdText) => {
                let html = mdText
                    .replace(/^#\s+(.*$)/gim, '<h1>$1</h1>')
                    .replace(/^##\s+(.*$)/gim, '<h2>$1</h2>')
                    .replace(/^###\s+(.*$)/gim, '<h3>$1</h3>')
                    .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
                    .replace(/\*(.*)\*/gim, '<em>$1</em>')
                    .replace(/^\-\s+(.*$)/gim, '<li>$1</li>')
                    .replace(/\n$/gim, '<br>');
                return html;
            };

            editor.oninput = () => {
                const text = editor.value;
                preview.innerHTML = text.trim() ? parseMD(text) : '<span style="color:var(--text-muted);">Visual live preview...</span>';
            };

            btn.onclick = async () => {
                const text = editor.value;
                if (!text.trim()) return;

                btn.disabled = true;
                const tempDiv = document.createElement('div');
                tempDiv.style.cssText = 'position:absolute; left:-9999px; width:180mm; padding:15px; font-family:sans-serif; background:#fff; color:#000;';
                tempDiv.innerHTML = parseMD(text);
                document.body.appendChild(tempDiv);

                try {
                    const canvas = await html2canvas(tempDiv);
                    const imgData = canvas.toDataURL('image/png');
                    const { jsPDF } = window.jspdf;
                    const doc = new jsPDF();
                    const w = 180;
                    const h = (canvas.height / canvas.width) * w;
                    doc.addImage(imgData, 'PNG', 15, 15, w, h);
                    doc.save('markdown_document.pdf');
                    utils.showToast('Markdown compiled to PDF!');
                    window.incrementStatsRun();
                } catch(err) {
                    utils.showToast(err.message, 'error');
                } finally {
                    document.body.removeChild(tempDiv);
                    btn.disabled = false;
                }
            };
        }
    },

    // 16. JSON to CSV
    {
        id: 'adv-json-csv',
        name: 'JSON to CSV',
        category: 'adv-file',
        icon: '<i class="fa-solid fa-right-left"></i>',
        description: 'Parse raw array lists of JSON objects into formatted CSV table formats.',
        tags: ['json', 'csv', 'converter', 'tabular'],
        render() {
            return `
                <div class="tool-grid-2col">
                    <div>
                        <div class="input-group">
                            <label>Input JSON Payload (Array of Objects)</label>
                            <textarea class="form-textarea" id="jcsv-input" style="min-height:180px; font-family:monospace;" placeholder='[{"name":"John", "age":30}, {"name":"Alice", "age":25}]'></textarea>
                        </div>
                        <button class="app-btn primary" id="jcsv-btn" style="width:100%; margin-top:15px; border-radius:20px;">
                            <i class="fa-solid fa-arrow-right-long" style="margin-right:6px;"></i>Convert to CSV
                        </button>
                    </div>
                    <div>
                        <div class="input-group">
                            <label>Output CSV Content</label>
                            <div class="output-container" style="margin-top:0;">
                                <button class="copy-badge-btn" id="jcsv-copy">Copy CSV</button>
                                <textarea class="form-textarea" id="jcsv-output" style="min-height:180px; font-family:monospace; background:transparent; border:none; color:#10b981;" readonly></textarea>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        },
        init() {
            const input = document.getElementById('jcsv-input');
            const output = document.getElementById('jcsv-output');
            const btn = document.getElementById('jcsv-btn');
            const copy = document.getElementById('jcsv-copy');

            btn.onclick = () => {
                try {
                    const parsed = JSON.parse(input.value);
                    const arr = Array.isArray(parsed) ? parsed : [parsed];
                    if (arr.length === 0) throw new Error('Array is empty');
                    
                    const headers = Object.keys(arr[0]);
                    const csvRows = [headers.join(',')];
                    
                    for (let row of arr) {
                        const values = headers.map(header => {
                            const val = row[header];
                            return typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val;
                        });
                        csvRows.push(values.join(','));
                    }

                    output.value = csvRows.join('\n');
                    utils.showToast('JSON converted to CSV!');
                    window.incrementStatsRun();
                } catch(err) {
                    utils.showToast(err.message, 'error');
                }
            };
            copy.onclick = () => utils.copyText(output.value);
        }
    },

    // 17. CSV to JSON
    {
        id: 'adv-csv-json',
        name: 'CSV to JSON',
        category: 'adv-file',
        icon: '<i class="fa-solid fa-right-left"></i>',
        description: 'Read delimited CSV tables and serialize them into standard array JSON format.',
        tags: ['csv', 'json', 'converter', 'serialize'],
        render() {
            return `
                <div class="tool-grid-2col">
                    <div>
                        <div class="input-group">
                            <label>Input CSV text</label>
                            <textarea class="form-textarea" id="csvj-input" style="min-height:180px;" placeholder="name,age\nJohn,30\nAlice,25"></textarea>
                        </div>
                        <button class="app-btn primary" id="csvj-btn" style="width:100%; margin-top:15px; border-radius:20px;">
                            <i class="fa-solid fa-arrow-right-long" style="margin-right:6px;"></i>Convert to JSON
                        </button>
                    </div>
                    <div>
                        <div class="input-group">
                            <label>Output JSON List</label>
                            <div class="output-container" style="margin-top:0;">
                                <button class="copy-badge-btn" id="csvj-copy">Copy JSON</button>
                                <textarea class="form-textarea" id="csvj-output" style="min-height:180px; font-family:monospace; background:transparent; border:none; color:#38bdf8;" readonly></textarea>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        },
        init() {
            const input = document.getElementById('csvj-input');
            const output = document.getElementById('csvj-output');
            const btn = document.getElementById('csvj-btn');
            const copy = document.getElementById('csvj-copy');

            btn.onclick = () => {
                const lines = input.value.trim().split('\n');
                if (lines.length < 2) {
                    utils.showToast('CSV requires headers and at least one data row!', 'error');
                    return;
                }
                try {
                    const headers = lines[0].split(',').map(h => h.trim());
                    const list = [];
                    for (let i = 1; i < lines.length; i++) {
                        const cols = lines[i].split(',').map(c => c.trim());
                        if (cols.length === headers.length) {
                            const obj = {};
                            headers.forEach((h, idx) => {
                                const val = cols[idx];
                                obj[h] = isNaN(val) ? val : parseFloat(val);
                            });
                            list.push(obj);
                        }
                    }
                    output.value = JSON.stringify(list, null, 2);
                    utils.showToast('CSV converted to JSON!');
                    window.incrementStatsRun();
                } catch(err) {
                    utils.showToast(err.message, 'error');
                }
            };
            copy.onclick = () => utils.copyText(output.value);
        }
    },

    // 18. Image Cropper
    {
        id: 'adv-img-crop',
        name: 'Image Cropper',
        category: 'image',
        icon: '<i class="fa-solid fa-crop"></i>',
        description: 'Crop images client-side with aspect ratio presets using Canvas API.',
        tags: ['image', 'crop', 'trim', 'editor', 'photo'],
        render() {
            return `
                <div class="tool-grid-2col">
                    <div>
                        <div class="input-group">
                            <label>Source Image</label>
                            <div class="uploader-box" id="imgcrop-dropzone" style="height:90px;">
                                <i class="fa-solid fa-image uploader-icon" style="color:var(--accent-secondary);"></i>
                                <div class="uploader-text" id="imgcrop-text">Upload Image</div>
                                <input type="file" id="imgcrop-input" accept="image/*" style="display:none;">
                            </div>
                        </div>
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:10px;">
                            <div class="input-group">
                                <label>Aspect Ratio</label>
                                <select id="imgcrop-ratio" class="form-select">
                                    <option value="free">Free Form</option>
                                    <option value="1:1">Square (1:1)</option>
                                    <option value="16:9">Widescreen (16:9)</option>
                                    <option value="4:3">Standard (4:3)</option>
                                </select>
                            </div>
                            <div class="input-group">
                                <label>Crop Coordinates</label>
                                <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px;">
                                    <input type="number" class="form-input" id="imgcrop-x" placeholder="X" value="10">
                                    <input type="number" class="form-input" id="imgcrop-y" placeholder="Y" value="10">
                                </div>
                            </div>
                        </div>
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:10px;">
                            <div class="input-group">
                                <label>Crop Width (px)</label>
                                <input type="number" class="form-input" id="imgcrop-w" placeholder="Width" value="200">
                            </div>
                            <div class="input-group">
                                <label>Crop Height (px)</label>
                                <input type="number" class="form-input" id="imgcrop-h" placeholder="Height" value="200">
                            </div>
                        </div>
                        <button class="app-btn primary" id="imgcrop-btn" style="width:100%; margin-top:15px; border-radius:20px;">
                            <i class="fa-solid fa-crop" style="margin-right:6px;"></i>Crop & Download Image
                        </button>
                    </div>
                    <div>
                        <h3 style="font-size:13px; font-weight:700; color:var(--accent-secondary); margin-bottom:10px;">Cropping Preview Frame</h3>
                        <div class="output-container" style="margin-top:0; min-height:220px; display:flex; justify-content:center; align-items:center; background:rgba(0,0,0,0.25);">
                            <canvas id="imgcrop-canvas" style="max-width:100%; max-height:300px; border:1px dashed rgba(255,255,255,0.1);"></canvas>
                        </div>
                    </div>
                </div>
            `;
        },
        init() {
            const dropzone = document.getElementById('imgcrop-dropzone');
            const fileInput = document.getElementById('imgcrop-input');
            const labelText = document.getElementById('imgcrop-text');
            const ratioSelect = document.getElementById('imgcrop-ratio');
            const cx = document.getElementById('imgcrop-x');
            const cy = document.getElementById('imgcrop-y');
            const cw = document.getElementById('imgcrop-w');
            const ch = document.getElementById('imgcrop-h');
            const btn = document.getElementById('imgcrop-btn');
            const canvas = document.getElementById('imgcrop-canvas');
            const ctx = canvas.getContext('2d');
            let img = new Image();

            dropzone.onclick = () => fileInput.click();
            fileInput.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                    labelText.textContent = file.name;
                    const r = new FileReader();
                    r.onload = (evt) => {
                        img.src = evt.target.result;
                    };
                    r.readAsDataURL(file);
                }
            };

            img.onload = () => {
                // scale canvas to fit image
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);

                // Set defaults based on dimensions
                cx.value = 0;
                cy.value = 0;
                cw.value = Math.floor(img.width * 0.8);
                ch.value = Math.floor(img.height * 0.8);
                drawOverlay();
            };

            const drawOverlay = () => {
                ctx.clearRect(0,0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0);
                // Draw crop rectangle overlay
                const x = parseInt(cx.value) || 0;
                const y = parseInt(cy.value) || 0;
                const w = parseInt(cw.value) || 100;
                const h = parseInt(ch.value) || 100;

                ctx.strokeStyle = '#ff00ff';
                ctx.lineWidth = 4;
                ctx.strokeRect(x, y, w, h);
                ctx.fillStyle = 'rgba(0,0,0,0.4)';
                // cover outside crop
                ctx.fillRect(0,0, canvas.width, y); // top
                ctx.fillRect(0, y+h, canvas.width, canvas.height-y-h); // bottom
                ctx.fillRect(0, y, x, h); // left
                ctx.fillRect(x+w, y, canvas.width-x-w, h); // right
            };

            ratioSelect.onchange = () => {
                const val = ratioSelect.value;
                const w = parseInt(cw.value) || 200;
                if (val === '1:1') ch.value = w;
                else if (val === '16:9') ch.value = Math.floor(w * (9/16));
                else if (val === '4:3') ch.value = Math.floor(w * (3/4));
                drawOverlay();
            };

            [cx, cy, cw, ch].forEach(el => {
                el.oninput = drawOverlay;
            });

            btn.onclick = () => {
                if (!img.src) return;
                const x = parseInt(cx.value) || 0;
                const y = parseInt(cy.value) || 0;
                const w = parseInt(cw.value) || 100;
                const h = parseInt(ch.value) || 100;

                const outCanvas = document.createElement('canvas');
                outCanvas.width = w;
                outCanvas.height = h;
                const outCtx = outCanvas.getContext('2d');
                outCtx.drawImage(img, x, y, w, h, 0, 0, w, h);

                const dataUrl = outCanvas.toDataURL('image/png');
                utils.downloadFile(dataUrl.split(',')[1], 'cropped_image.png', 'image/png');
                utils.showToast('Image cropped and saved!');
                window.incrementStatsRun();
            };
        }
    },

    // 19. Image Resizer
    {
        id: 'adv-img-resize',
        name: 'Image Resizer',
        category: 'image',
        icon: '<i class="fa-solid fa-expand"></i>',
        description: 'Resize image dimensions to custom pixel dimensions client-side.',
        tags: ['image', 'resize', 'scale', 'dimensions', 'resolution'],
        render() {
            return `
                <div class="tool-grid-2col">
                    <div>
                        <div class="input-group">
                            <label>Select Image</label>
                            <div class="uploader-box" id="imgsz-dropzone" style="height:90px;">
                                <i class="fa-solid fa-image uploader-icon" style="color:var(--accent-primary);"></i>
                                <div class="uploader-text" id="imgsz-text">Upload Image</div>
                                <input type="file" id="imgsz-input" accept="image/*" style="display:none;">
                            </div>
                        </div>
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:10px;">
                            <div class="input-group">
                                <label>Width (px)</label>
                                <input type="number" class="form-input" id="imgsz-w" value="800">
                            </div>
                            <div class="input-group">
                                <label>Height (px)</label>
                                <input type="number" class="form-input" id="imgsz-h" value="600">
                            </div>
                        </div>
                        <button class="app-btn primary" id="imgsz-btn" style="width:100%; margin-top:15px; border-radius:20px;">
                            <i class="fa-solid fa-expand" style="margin-right:6px;"></i>Resize & Download
                        </button>
                    </div>
                    <div>
                        <h3 style="font-size:13px; font-weight:700; color:var(--accent-secondary); margin-bottom:10px;">Target Dimensions</h3>
                        <div class="output-container" id="imgsz-info" style="margin-top:0; min-height:180px; padding:15px; font-size:12px; line-height:1.6;">
                            <span style="color:var(--text-muted);">No image loaded. Upload to resize.</span>
                        </div>
                    </div>
                </div>
            `;
        },
        init() {
            const dropzone = document.getElementById('imgsz-dropzone');
            const fileInput = document.getElementById('imgsz-input');
            const textEl = document.getElementById('imgsz-text');
            const wInput = document.getElementById('imgsz-w');
            const hInput = document.getElementById('imgsz-h');
            const btn = document.getElementById('imgsz-btn');
            const info = document.getElementById('imgsz-info');
            let img = new Image();
            let aspect = 1;

            dropzone.onclick = () => fileInput.click();
            fileInput.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                    textEl.textContent = file.name;
                    const r = new FileReader();
                    r.onload = (evt) => { img.src = evt.target.result; };
                    r.readAsDataURL(file);
                }
            };

            img.onload = () => {
                wInput.value = img.width;
                hInput.value = img.height;
                aspect = img.width / img.height;
                info.innerHTML = `
                    <div><strong>Original Resolution:</strong> ${img.width} x ${img.height} px</div>
                    <div><strong>File Size:</strong> ${utils.formatBytes(img.src.length * 0.75)}</div>
                `;
            };

            wInput.oninput = () => {
                hInput.value = Math.round(wInput.value / aspect);
            };

            btn.onclick = () => {
                if (!img.src) return;
                const w = parseInt(wInput.value);
                const h = parseInt(hInput.value);

                const canvas = document.createElement('canvas');
                canvas.width = w;
                canvas.height = h;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, w, h);

                const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
                utils.downloadFile(dataUrl.split(',')[1], `resized_${w}x${h}.jpg`, 'image/jpeg');
                utils.showToast('Image successfully resized!');
                window.incrementStatsRun();
            };
        }
    },

    // 20. Image Format Converter
    {
        id: 'adv-img-convert',
        name: 'Image Converter',
        category: 'image',
        icon: '<i class="fa-solid fa-image"></i>',
        description: 'Convert between PNG, JPEG, WEBP, and BMP formats instantly.',
        tags: ['image', 'convert', 'png', 'jpg', 'webp', 'bmp', 'format'],
        render() {
            return `
                <div class="tool-grid-2col">
                    <div>
                        <div class="input-group">
                            <label>Select Photo</label>
                            <div class="uploader-box" id="imgconv-dropzone" style="height:90px;">
                                <i class="fa-solid fa-images uploader-icon" style="color:var(--accent-secondary);"></i>
                                <div class="uploader-text" id="imgconv-text">Upload Image</div>
                                <input type="file" id="imgconv-input" accept="image/*" style="display:none;">
                            </div>
                        </div>
                        <div class="input-group" style="margin-top:10px;">
                            <label>Convert To</label>
                            <select id="imgconv-target" class="form-select">
                                <option value="image/png">PNG Format</option>
                                <option value="image/jpeg">JPEG Format</option>
                                <option value="image/webp">WEBP Format</option>
                            </select>
                        </div>
                        <button class="app-btn primary" id="imgconv-btn" style="width:100%; margin-top:15px; border-radius:20px;">
                            <i class="fa-solid fa-shuffle" style="margin-right:6px;"></i>Convert Format
                        </button>
                    </div>
                    <div>
                        <h3 style="font-size:13px; font-weight:700; color:var(--accent-secondary); margin-bottom:10px;">Visual Preview</h3>
                        <div class="output-container" style="margin-top:0; min-height:180px; display:flex; justify-content:center; align-items:center;">
                            <img id="imgconv-preview" style="max-width:100%; max-height:150px; border-radius:8px; display:none;">
                            <span id="imgconv-hint" style="color:var(--text-muted);">No image uploaded</span>
                        </div>
                    </div>
                </div>
            `;
        },
        init() {
            const dropzone = document.getElementById('imgconv-dropzone');
            const fileInput = document.getElementById('imgconv-input');
            const textEl = document.getElementById('imgconv-text');
            const targetEl = document.getElementById('imgconv-target');
            const btn = document.getElementById('imgconv-btn');
            const preview = document.getElementById('imgconv-preview');
            const hint = document.getElementById('imgconv-hint');
            let img = new Image();

            dropzone.onclick = () => fileInput.click();
            fileInput.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                    textEl.textContent = file.name;
                    const r = new FileReader();
                    r.onload = (evt) => {
                        img.src = evt.target.result;
                        preview.src = evt.target.result;
                        preview.style.display = 'block';
                        hint.style.display = 'none';
                    };
                    r.readAsDataURL(file);
                }
            };

            btn.onclick = () => {
                if (!img.src) return;
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);

                const format = targetEl.value;
                const ext = format.split('/')[1];
                const dataUrl = canvas.toDataURL(format);
                
                utils.downloadFile(dataUrl.split(',')[1], `converted_image.${ext}`, format);
                utils.showToast(`Converted successfully to ${ext.toUpperCase()}`);
                window.incrementStatsRun();
            };
        }
    },

    // 21. Image Compressor
    {
        id: 'adv-img-compress',
        name: 'Image Compressor',
        category: 'image',
        icon: '<i class="fa-solid fa-compress"></i>',
        description: 'Compress image file sizes client-side by configuring output quality.',
        tags: ['image', 'compress', 'minify', 'jpeg', 'optimizier'],
        render() {
            return `
                <div class="tool-grid-2col">
                    <div>
                        <div class="input-group">
                            <label>Upload Image</label>
                            <div class="uploader-box" id="imgcomp-dropzone" style="height:90px;">
                                <i class="fa-solid fa-image uploader-icon" style="color:var(--accent-primary);"></i>
                                <div class="uploader-text" id="imgcomp-text">Choose Image</div>
                                <input type="file" id="imgcomp-input" accept="image/jpeg,image/png,image/webp" style="display:none;">
                            </div>
                        </div>
                        <div class="input-group" style="margin-top:10px;">
                            <label>Compression Quality: <strong id="imgcomp-val">70%</strong></label>
                            <input type="range" class="form-range" id="imgcomp-quality" min="10" max="95" value="70" style="width:100%;">
                        </div>
                        <button class="app-btn primary" id="imgcomp-btn" style="width:100%; margin-top:15px; border-radius:20px;">
                            <i class="fa-solid fa-compress" style="margin-right:6px;"></i>Compress & Download
                        </button>
                    </div>
                    <div>
                        <h3 style="font-size:13px; font-weight:700; color:var(--accent-secondary); margin-bottom:10px;">File Savings Report</h3>
                        <div class="output-container" id="imgcomp-report" style="margin-top:0; min-height:180px; padding:15px; font-size:12px; line-height:1.6;">
                            <span style="color:var(--text-muted);">No image loaded. Upload to compare file savings.</span>
                        </div>
                    </div>
                </div>
            `;
        },
        init() {
            const dropzone = document.getElementById('imgcomp-dropzone');
            const fileInput = document.getElementById('imgcomp-input');
            const textEl = document.getElementById('imgcomp-text');
            const qSlider = document.getElementById('imgcomp-quality');
            const qVal = document.getElementById('imgcomp-val');
            const btn = document.getElementById('imgcomp-btn');
            const report = document.getElementById('imgcomp-report');
            let img = new Image();
            let originalSize = 0;

            dropzone.onclick = () => fileInput.click();
            fileInput.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                    originalSize = file.size;
                    textEl.textContent = file.name;
                    const r = new FileReader();
                    r.onload = (evt) => { img.src = evt.target.result; };
                    r.readAsDataURL(file);
                }
            };

            qSlider.oninput = () => { qVal.textContent = qSlider.value + '%'; if (img.src) updateReport(); };
            img.onload = () => updateReport();

            const updateReport = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);

                const q = parseInt(qSlider.value) / 100;
                const dataUrl = canvas.toDataURL('image/jpeg', q);
                const compressedSize = Math.round(dataUrl.length * 0.75);
                const savings = Math.round(((originalSize - compressedSize) / originalSize) * 100);

                report.innerHTML = `
                    <div><strong>Original Size:</strong> ${utils.formatBytes(originalSize)}</div>
                    <div><strong>Compressed Size:</strong> ${utils.formatBytes(compressedSize)}</div>
                    <div><strong>Total Space Saved:</strong> ${savings > 0 ? savings + '%' : '0%'}</div>
                    <div style="margin-top:10px; color:${savings > 0 ? '#10b981' : '#ef4444'}; font-weight:700;">
                        ${savings > 0 ? '✓ Ready for optimization download' : 'Image is already fully optimized!'}
                    </div>
                `;
            };

            btn.onclick = () => {
                if (!img.src) return;
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);

                const q = parseInt(qSlider.value) / 100;
                const dataUrl = canvas.toDataURL('image/jpeg', q);
                utils.downloadFile(dataUrl.split(',')[1], 'compressed_photo.jpg', 'image/jpeg');
                utils.showToast('Compressed image saved!');
                window.incrementStatsRun();
            };
        }
    },

    // 22. OCR Image to Text (Tesseract.js)
    {
        id: 'adv-img-ocr',
        name: 'OCR Image to Text',
        category: 'image',
        icon: '<i class="fa-solid fa-eye"></i>',
        description: 'Scan and extract textual strings from images offline using Tesseract OCR.',
        tags: ['ocr', 'scan', 'text extraction', 'read image', 'tesseract'],
        render() {
            return `
                <div class="tool-grid-2col">
                    <div>
                        <div class="input-group">
                            <label>Choose Image</label>
                            <div class="uploader-box" id="ocr-dropzone" style="height:90px;">
                                <i class="fa-solid fa-camera uploader-icon" style="color:var(--accent-secondary);"></i>
                                <div class="uploader-text" id="ocr-text">Select Image</div>
                                <input type="file" id="ocr-input" accept="image/*" style="display:none;">
                            </div>
                        </div>
                        <div class="input-group" style="margin-top:10px;">
                            <label>Language Engine</label>
                            <select id="ocr-lang" class="form-select">
                                <option value="eng">English (Latin)</option>
                                <option value="khm">Khmer (ខ្មែរ)</option>
                                <option value="eng+khm">English + Khmer</option>
                            </select>
                        </div>
                        <button class="app-btn primary" id="ocr-btn" style="width:100%; margin-top:15px; border-radius:20px;">
                            <i class="fa-solid fa-eye" style="margin-right:6px;"></i>Perform OCR Scan
                        </button>
                    </div>
                    <div>
                        <div class="input-group">
                            <label>Extracted Text Output</label>
                            <div class="output-container" style="margin-top:0;">
                                <button class="copy-badge-btn" id="ocr-copy">Copy Text</button>
                                <textarea class="form-textarea" id="ocr-output" style="min-height:180px; background:transparent; border:none; color:#e2e8f0; font-size:12px;"></textarea>
                            </div>
                        </div>
                        <div class="progress-bar-container" id="ocr-progress" style="margin-top:10px;">
                            <div class="progress-bar-fill" id="ocr-fill"></div>
                        </div>
                    </div>
                </div>
            `;
        },
        init() {
            const dropzone = document.getElementById('ocr-dropzone');
            const fileInput = document.getElementById('ocr-input');
            const labelText = document.getElementById('ocr-text');
            const langSelect = document.getElementById('ocr-lang');
            const btn = document.getElementById('ocr-btn');
            const output = document.getElementById('ocr-output');
            const copy = document.getElementById('ocr-copy');
            const progressBar = document.getElementById('ocr-progress');
            const progressFill = document.getElementById('ocr-fill');
            let imgData = null;

            dropzone.onclick = () => fileInput.click();
            fileInput.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                    labelText.textContent = file.name;
                    const r = new FileReader();
                    r.onload = (evt) => { imgData = evt.target.result; };
                    r.readAsDataURL(file);
                }
            };

            btn.onclick = async () => {
                if (!imgData) {
                    utils.showToast('Please upload an image first!', 'error');
                    return;
                }
                const Tesseract = window.Tesseract;
                if (!Tesseract) {
                    utils.showToast('OCR engine not loaded. Check internet.', 'error');
                    return;
                }

                btn.disabled = true;
                output.value = 'Running Tesseract OCR engine client-side...\nLoading language trained data files...';
                progressBar.style.display = 'block';
                progressFill.style.width = '10%';

                try {
                    const lang = langSelect.value;
                    const result = await Tesseract.recognize(
                        imgData,
                        lang,
                        {
                            logger: m => {
                                if (m.status === 'recognizing text') {
                                    const pct = Math.round(m.progress * 100);
                                    progressFill.style.width = `${pct}%`;
                                    output.value = `Recognizing text elements: ${pct}%...`;
                                }
                            }
                        }
                    );
                    progressBar.style.display = 'none';
                    output.value = result.data.text || 'No text elements detected in image.';
                    utils.showToast('OCR scanning finished!');
                    window.incrementStatsRun();
                } catch(err) {
                    output.value = `OCR Error: ${err.message}`;
                    progressBar.style.display = 'none';
                } finally {
                    btn.disabled = false;
                }
            };

            copy.onclick = () => utils.copyText(output.value);
        }
    },

    // 23. Color Palette Extractor
    {
        id: 'adv-img-palette',
        name: 'Color Palette Extractor',
        category: 'image',
        icon: '<i class="fa-solid fa-palette"></i>',
        description: 'Extract dominant color palette swatches from uploaded images.',
        tags: ['image', 'palette', 'colors', 'swatches', 'hex'],
        render() {
            return `
                <div class="tool-grid-2col">
                    <div>
                        <div class="input-group">
                            <label>Source Image</label>
                            <div class="uploader-box" id="palette-dropzone" style="height:120px;">
                                <i class="fa-solid fa-image uploader-icon" style="color:var(--accent-secondary);"></i>
                                <div class="uploader-text" id="palette-text">Choose Image</div>
                                <input type="file" id="palette-input" accept="image/*" style="display:none;">
                            </div>
                        </div>
                        <button class="app-btn primary" id="palette-btn" style="width:100%; margin-top:15px; border-radius:20px;">
                            <i class="fa-solid fa-palette" style="margin-right:6px;"></i>Extract Color Palette
                        </button>
                    </div>
                    <div>
                        <h3 style="font-size:13px; font-weight:700; color:var(--accent-secondary); margin-bottom:10px;">Extracted Swatches</h3>
                        <div id="palette-swatches" style="display:flex; flex-direction:column; gap:8px;">
                            <div style="font-size:12px; color:var(--text-muted); text-align:center; padding:20px;">No image loaded</div>
                        </div>
                    </div>
                </div>
            `;
        },
        init() {
            const dropzone = document.getElementById('palette-dropzone');
            const fileInput = document.getElementById('palette-input');
            const labelText = document.getElementById('palette-text');
            const btn = document.getElementById('palette-btn');
            const swatches = document.getElementById('palette-swatches');
            let img = new Image();

            dropzone.onclick = () => fileInput.click();
            fileInput.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                    labelText.textContent = file.name;
                    const r = new FileReader();
                    r.onload = (evt) => { img.src = evt.target.result; };
                    r.readAsDataURL(file);
                }
            };

            btn.onclick = () => {
                if (!img.src) return;
                const canvas = document.createElement('canvas');
                canvas.width = 100;
                canvas.height = 100;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, 100, 100);

                const data = ctx.getImageData(0,0, 100, 100).data;
                const colors = [];
                // Sample pixel colors (step of 10 pixels to avoid lag)
                for (let i = 0; i < data.length; i += 40) {
                    const r = data[i];
                    const g = data[i+1];
                    const b = data[i+2];
                    const hex = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
                    colors.push(hex);
                }

                // Simple clustering: get unique colors
                const uniq = Array.from(new Set(colors)).slice(0, 5);

                swatches.innerHTML = '';
                uniq.forEach(color => {
                    const row = document.createElement('div');
                    row.style.cssText = "display:flex; align-items:center; gap:12px; padding:8px; background:rgba(255,255,255,0.03); border-radius:6px;";
                    row.innerHTML = `
                        <div style="width:30px; height:30px; border-radius:4px; background:${color}; border:1px solid rgba(255,255,255,0.15);"></div>
                        <span style="font-family:monospace; font-size:13px; color:var(--text-primary); font-weight:600;">${color.toUpperCase()}</span>
                        <button class="app-btn secondary" style="margin-left:auto; padding:4px 8px; font-size:10px; border-radius:4px;" onclick="utils.copyText('${color}')">Copy</button>
                    `;
                    swatches.appendChild(row);
                });
                utils.showToast('Color palette swatches extracted!');
                window.incrementStatsRun();
            };
        }
    },

    // 24. ZIP Creator
    {
        id: 'adv-zip-create',
        name: 'ZIP Creator',
        category: 'adv-file',
        icon: '<i class="fa-solid fa-file-zipper"></i>',
        description: 'Compress multiple files into a standard ZIP archive client-side.',
        tags: ['zip', 'compress', 'archive', 'pack', 'folder'],
        render() {
            return `
                <div class="tool-grid-2col">
                    <div>
                        <div class="input-group">
                            <label>Upload Files</label>
                            <div class="uploader-box" id="zipc-dropzone" style="height:90px;">
                                <i class="fa-solid fa-file-zipper uploader-icon" style="color:var(--accent-secondary);"></i>
                                <div class="uploader-text">Drop files to ZIP</div>
                                <input type="file" id="zipc-input" multiple style="display:none;">
                            </div>
                        </div>
                        <div class="input-group">
                            <label>ZIP Filename</label>
                            <input type="text" class="form-input" id="zipc-name" value="archive.zip">
                        </div>
                        <button class="app-btn primary" id="zipc-btn" style="width:100%; margin-top:15px; border-radius:20px;">
                            <i class="fa-solid fa-file-zipper" style="margin-right:6px;"></i>Create ZIP Archive
                        </button>
                    </div>
                    <div>
                        <h3 style="font-size:13px; font-weight:700; color:var(--accent-secondary); margin-bottom:10px;">Queue Files</h3>
                        <div id="zipc-list" style="background:rgba(0,0,0,0.2); border:1px solid rgba(255,255,255,0.05); border-radius:8px; padding:10px; max-height:180px; overflow-y:auto; display:flex; flex-direction:column; gap:6px;">
                            <div style="font-size:12px; color:var(--text-muted); text-align:center; padding:10px;">No files selected</div>
                        </div>
                    </div>
                </div>
            `;
        },
        init() {
            const dropzone = document.getElementById('zipc-dropzone');
            const fileInput = document.getElementById('zipc-input');
            const nameEl = document.getElementById('zipc-name');
            const list = document.getElementById('zipc-list');
            const btn = document.getElementById('zipc-btn');
            let queue = [];

            const renderQueue = () => {
                list.innerHTML = '';
                if (queue.length === 0) {
                    list.innerHTML = `<div style="font-size:12px; color:var(--text-muted); text-align:center; padding:10px;">No files selected</div>`;
                    return;
                }
                queue.forEach((f, idx) => {
                    const row = document.createElement('div');
                    row.style.cssText = "display:flex; justify-content:space-between; align-items:center; padding:6px 10px; background:rgba(255,255,255,0.03); border-radius:4px; font-size:12px;";
                    row.innerHTML = `
                        <span>${f.name} (${utils.formatBytes(f.size)})</span>
                        <i class="fa-solid fa-trash-can" style="color:#ef4444; cursor:pointer;" onclick="window.removeZipQueue(${idx})"></i>
                    `;
                    list.appendChild(row);
                });
            };

            window.removeZipQueue = (idx) => {
                queue.splice(idx, 1);
                renderQueue();
            };

            dropzone.onclick = () => fileInput.click();
            fileInput.onchange = (e) => {
                for (let f of e.target.files) queue.push(f);
                renderQueue();
            };

            btn.onclick = async () => {
                if (queue.length === 0) {
                    utils.showToast('Please add files first!', 'error');
                    return;
                }
                if (!window.JSZip) {
                    utils.showToast('JSZip not loaded!', 'error');
                    return;
                }

                btn.disabled = true;
                try {
                    const zip = new JSZip();
                    queue.forEach(f => zip.file(f.name, f));
                    const blob = await zip.generateAsync({ type: 'blob' });
                    
                    let outName = nameEl.value.trim();
                    if (!outName.endsWith('.zip')) outName += '.zip';
                    utils.downloadFile(blob, outName, 'application/zip');
                    utils.showToast('ZIP archive created!');
                    window.incrementStatsRun();
                } catch(err) {
                    utils.showToast(err.message, 'error');
                } finally {
                    btn.disabled = false;
                }
            };
        }
    },

    // 25. ZIP Extractor
    {
        id: 'adv-zip-extract',
        name: 'ZIP Extractor',
        category: 'adv-file',
        icon: '<i class="fa-solid fa-folder-open"></i>',
        description: 'Unpack zipped files and download individual documents locally.',
        tags: ['zip', 'unzip', 'extract', 'unpack', 'archive'],
        render() {
            return `
                <div class="tool-grid-2col">
                    <div>
                        <div class="input-group">
                            <label>Zipped Archive (.zip)</label>
                            <div class="uploader-box" id="zipe-dropzone" style="height:120px;">
                                <i class="fa-solid fa-folder-open uploader-icon" style="color:var(--accent-primary);"></i>
                                <div class="uploader-text" id="zipe-text">Upload ZIP file</div>
                                <input type="file" id="zipe-input" accept=".zip,application/zip" style="display:none;">
                            </div>
                        </div>
                    </div>
                    <div>
                        <h3 style="font-size:13px; font-weight:700; color:var(--accent-secondary); margin-bottom:10px;">Unpacked Contents</h3>
                        <div id="zipe-list" style="background:rgba(0,0,0,0.2); border:1px solid rgba(255,255,255,0.05); border-radius:8px; padding:10px; max-height:220px; overflow-y:auto; display:flex; flex-direction:column; gap:6px;">
                            <div style="font-size:12px; color:var(--text-muted); text-align:center; padding:10px;">No archive loaded</div>
                        </div>
                    </div>
                </div>
            `;
        },
        init() {
            const dropzone = document.getElementById('zipe-dropzone');
            const fileInput = document.getElementById('zipe-input');
            const labelText = document.getElementById('zipe-text');
            const list = document.getElementById('zipe-list');

            dropzone.onclick = () => fileInput.click();
            fileInput.onchange = async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                labelText.textContent = file.name;

                if (!window.JSZip) {
                    utils.showToast('JSZip not loaded!', 'error');
                    return;
                }

                try {
                    const zip = await JSZip.loadAsync(file);
                    list.innerHTML = '';
                    
                    const files = Object.keys(zip.files);
                    if (files.length === 0) {
                        list.innerHTML = `<div style="font-size:12px; color:var(--text-muted); text-align:center; padding:10px;">ZIP is empty</div>`;
                        return;
                    }

                    files.forEach(filename => {
                        const fileObj = zip.files[filename];
                        if (fileObj.dir) return; // skip dirs

                        const row = document.createElement('div');
                        row.style.cssText = "display:flex; justify-content:space-between; align-items:center; padding:6px 10px; background:rgba(255,255,255,0.03); border-radius:4px; font-size:12px;";
                        row.innerHTML = `
                            <span>${filename}</span>
                            <button class="app-btn secondary" style="padding:4px 8px; font-size:10px; border-radius:4px;">Download</button>
                        `;

                        row.querySelector('button').onclick = async () => {
                            const blob = await fileObj.async('blob');
                            utils.downloadFile(blob, filename, blob.type || 'application/octet-stream');
                        };

                        list.appendChild(row);
                    });

                    utils.showToast('ZIP archive successfully unpacked!');
                    window.incrementStatsRun();
                } catch(err) {
                    utils.showToast('Extract failed: ' + err.message, 'error');
                }
            };
        }
    },

    // 26. Bulk Rename Files
    {
        id: 'adv-bulk-rename',
        name: 'Bulk Rename Files',
        category: 'adv-file',
        icon: '<i class="fa-solid fa-pen-nib"></i>',
        description: 'Rename multiple files at once with custom prefixes, suffixes, or numbering patterns.',
        tags: ['rename', 'bulk', 'batch', 'files', 'naming'],
        render() {
            return `
                <div class="tool-grid-2col">
                    <div>
                        <div class="input-group">
                            <label>Add Files</label>
                            <div class="uploader-box" id="rename-dropzone" style="height:90px;">
                                <i class="fa-solid fa-file uploader-icon" style="color:var(--accent-secondary);"></i>
                                <div class="uploader-text">Upload files</div>
                                <input type="file" id="rename-input" multiple style="display:none;">
                            </div>
                        </div>
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:10px;">
                            <div class="input-group">
                                <label>Prefix</label>
                                <input type="text" class="form-input" id="rename-prefix" value="document_">
                            </div>
                            <div class="input-group">
                                <label>Suffix</label>
                                <input type="text" class="form-input" id="rename-suffix" value="">
                            </div>
                        </div>
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:10px;">
                            <div class="input-group">
                                <label>Starting Index</label>
                                <input type="number" class="form-input" id="rename-index" value="1">
                            </div>
                            <div class="input-group">
                                <label>Format Output</label>
                                <select id="rename-case" class="form-select">
                                    <option value="none">Keep Original Case</option>
                                    <option value="lower">lowercase</option>
                                    <option value="upper">UPPERCASE</option>
                                </select>
                            </div>
                        </div>
                        <button class="app-btn primary" id="rename-btn" style="width:100%; margin-top:15px; border-radius:20px;">
                            <i class="fa-solid fa-check" style="margin-right:6px;"></i>Apply Rename & Download (ZIP)
                        </button>
                    </div>
                    <div>
                        <h3 style="font-size:13px; font-weight:700; color:var(--accent-secondary); margin-bottom:10px;">Rename Previews</h3>
                        <div id="rename-list" style="background:rgba(0,0,0,0.2); border:1px solid rgba(255,255,255,0.05); border-radius:8px; padding:10px; max-height:220px; overflow-y:auto; display:flex; flex-direction:column; gap:6px;">
                            <div style="font-size:12px; color:var(--text-muted); text-align:center; padding:10px;">No files selected</div>
                        </div>
                    </div>
                </div>
            `;
        },
        init() {
            const dropzone = document.getElementById('rename-dropzone');
            const fileInput = document.getElementById('rename-input');
            const prefix = document.getElementById('rename-prefix');
            const suffix = document.getElementById('rename-suffix');
            const startIdx = document.getElementById('rename-index');
            const caseSelect = document.getElementById('rename-case');
            const list = document.getElementById('rename-list');
            const btn = document.getElementById('rename-btn');
            let queue = [];

            const renderPreviews = () => {
                list.innerHTML = '';
                if (queue.length === 0) {
                    list.innerHTML = `<div style="font-size:12px; color:var(--text-muted); text-align:center; padding:10px;">No files selected</div>`;
                    return;
                }

                const pref = prefix.value;
                const suff = suffix.value;
                let idx = parseInt(startIdx.value) || 1;
                const caseVal = caseSelect.value;

                queue.forEach(f => {
                    const ext = f.name.includes('.') ? f.name.split('.').pop() : '';
                    let base = f.name.includes('.') ? f.name.substring(0, f.name.lastIndexOf('.')) : f.name;

                    if (caseVal === 'lower') base = base.toLowerCase();
                    if (caseVal === 'upper') base = base.toUpperCase();

                    const newName = `${pref}${base}${idx}${suff}.${ext}`;
                    idx++;

                    const row = document.createElement('div');
                    row.style.cssText = "display:flex; justify-content:space-between; align-items:center; padding:6px 10px; background:rgba(255,255,255,0.03); border-radius:4px; font-size:11px;";
                    row.innerHTML = `
                        <span style="color:var(--text-muted); text-decoration:line-through; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:140px;">${f.name}</span>
                        <span style="color:var(--accent-secondary); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:140px;">${newName}</span>
                    `;
                    list.appendChild(row);
                });
            };

            dropzone.onclick = () => fileInput.click();
            fileInput.onchange = (e) => {
                for (let f of e.target.files) queue.push(f);
                renderPreviews();
            };

            [prefix, suffix, startIdx, caseSelect].forEach(el => {
                el.oninput = renderPreviews;
                el.onchange = renderPreviews;
            });

            btn.onclick = async () => {
                if (queue.length === 0) return;
                btn.disabled = true;

                try {
                    const zip = new JSZip();
                    const pref = prefix.value;
                    const suff = suffix.value;
                    let idx = parseInt(startIdx.value) || 1;
                    const caseVal = caseSelect.value;

                    queue.forEach(f => {
                        const ext = f.name.includes('.') ? f.name.split('.').pop() : '';
                        let base = f.name.includes('.') ? f.name.substring(0, f.name.lastIndexOf('.')) : f.name;

                        if (caseVal === 'lower') base = base.toLowerCase();
                        if (caseVal === 'upper') base = base.toUpperCase();

                        const newName = `${pref}${base}${idx}${suff}.${ext}`;
                        idx++;
                        zip.file(newName, f);
                    });

                    const blob = await zip.generateAsync({ type: 'blob' });
                    utils.downloadFile(blob, 'renamed_files.zip', 'application/zip');
                    utils.showToast('Files renamed and packed inside ZIP!');
                    window.incrementStatsRun();
                } catch(err) {
                    utils.showToast(err.message, 'error');
                } finally {
                    btn.disabled = false;
                }
            };
        }
    },

    // 27. Bulk Convert to PDF
    {
        id: 'adv-bulk-pdf',
        name: 'Bulk Convert to PDF',
        category: 'adv-file',
        icon: '<i class="fa-solid fa-file-pdf"></i>',
        description: 'Batch convert images and documents to individual PDF files in a ZIP.',
        tags: ['pdf', 'convert', 'batch', 'bulk', 'multiple'],
        render() {
            return `
                <div class="tool-grid-2col">
                    <div>
                        <div class="input-group">
                            <label>Add Files</label>
                            <div class="uploader-box" id="bulkpdf-dropzone" style="height:100px;">
                                <i class="fa-solid fa-cloud-arrow-up uploader-icon" style="color:var(--accent-primary);"></i>
                                <div class="uploader-text">Drop multiple documents</div>
                                <input type="file" id="bulkpdf-input" multiple style="display:none;">
                            </div>
                        </div>
                        <button class="app-btn primary" id="bulkpdf-btn" style="width:100%; margin-top:15px; border-radius:20px;">
                            <i class="fa-solid fa-file-pdf" style="margin-right:6px;"></i>Batch Convert (ZIP)
                        </button>
                    </div>
                    <div>
                        <h3 style="font-size:13px; font-weight:700; color:var(--accent-secondary); margin-bottom:10px;">Uploaded Queue</h3>
                        <div id="bulkpdf-list" style="background:rgba(0,0,0,0.2); border:1px solid rgba(255,255,255,0.05); border-radius:8px; padding:10px; max-height:200px; overflow-y:auto; display:flex; flex-direction:column; gap:6px;">
                            <div style="font-size:12px; color:var(--text-muted); text-align:center; padding:10px;">No files queued</div>
                        </div>
                    </div>
                </div>
            `;
        },
        init() {
            const dropzone = document.getElementById('bulkpdf-dropzone');
            const fileInput = document.getElementById('bulkpdf-input');
            const list = document.getElementById('bulkpdf-list');
            const btn = document.getElementById('bulkpdf-btn');
            let queue = [];

            const renderQueue = () => {
                list.innerHTML = '';
                if (queue.length === 0) {
                    list.innerHTML = `<div style="font-size:12px; color:var(--text-muted); text-align:center; padding:10px;">No files queued</div>`;
                    return;
                }
                queue.forEach((f, idx) => {
                    const row = document.createElement('div');
                    row.style.cssText = "display:flex; justify-content:space-between; align-items:center; padding:6px 10px; background:rgba(255,255,255,0.03); border-radius:4px; font-size:12px;";
                    row.innerHTML = `
                        <span>${f.name}</span>
                        <i class="fa-solid fa-circle-xmark" style="color:#ef4444; cursor:pointer;" onclick="window.removeBulkPdf(${idx})"></i>
                    `;
                    list.appendChild(row);
                });
            };

            window.removeBulkPdf = (idx) => { queue.splice(idx, 1); renderQueue(); };

            dropzone.onclick = () => fileInput.click();
            fileInput.onchange = (e) => {
                for (let f of e.target.files) queue.push(f);
                renderQueue();
            };

            btn.onclick = async () => {
                if (queue.length === 0) return;
                btn.disabled = true;
                
                try {
                    const zip = new JSZip();
                    const { jsPDF } = window.jspdf;

                    for (let file of queue) {
                        const doc = new jsPDF();
                        const isImg = file.type.startsWith('image/');
                        const textContent = await new Promise(resolve => {
                            const r = new FileReader();
                            if (isImg) r.readAsDataURL(file);
                            else r.readAsText(file);
                            r.onload = (evt) => resolve(evt.target.result);
                        });

                        if (isImg) {
                            doc.addImage(textContent, 'JPEG', 10, 10, 190, 270);
                        } else {
                            const lines = doc.splitTextToSize(textContent, 180);
                            let y = 15;
                            lines.forEach(line => {
                                if (y > 280) { doc.addPage(); y = 15; }
                                doc.text(line, 15, y);
                                y += 6;
                            });
                        }

                        const outBytes = doc.output('arraybuffer');
                        const pdfName = file.name.substring(0, file.name.lastIndexOf('.')) + '.pdf';
                        zip.file(pdfName, outBytes);
                    }

                    const blob = await zip.generateAsync({ type: 'blob' });
                    utils.downloadFile(blob, 'batch_converted_pdfs.zip', 'application/zip');
                    utils.showToast('Batch PDF compilation success!');
                    window.incrementStatsRun();
                } catch(err) {
                    utils.showToast(err.message, 'error');
                } finally {
                    btn.disabled = false;
                }
            };
        }
    },

    // 28. File Hash Generator
    {
        id: 'adv-file-hash',
        name: 'File Hash Generator',
        category: 'adv-file',
        icon: '<i class="fa-solid fa-fingerprint"></i>',
        description: 'Verify document integrity by generating MD5, SHA-256, or SHA-512 hashes.',
        tags: ['hash', 'sha256', 'md5', 'fingerprint', 'integrity', 'crypto'],
        render() {
            return `
                <div class="uploader-box" id="fhash-dropzone" style="height:100px;">
                    <i class="fa-solid fa-fingerprint uploader-icon" style="color:var(--accent-secondary);"></i>
                    <div class="uploader-text" id="fhash-text">Choose File for Hashing</div>
                    <input type="file" id="fhash-input" style="display:none;">
                </div>
                <div class="input-group" style="margin-top:10px;">
                    <label>Hashing Algorithm</label>
                    <select id="fhash-algo" class="form-select">
                        <option value="SHA256">SHA-256</option>
                        <option value="MD5">MD5</option>
                        <option value="SHA1">SHA-1</option>
                        <option value="SHA512">SHA-512</option>
                    </select>
                </div>
                <div class="output-container" id="fhash-result-box" style="display:none; margin-top:15px;">
                    <button class="copy-badge-btn" id="fhash-copy">Copy Hash</button>
                    <pre class="output-pre" id="fhash-output" style="word-break:break-all; font-family:monospace; font-size:12px; font-weight:700; color:var(--accent-secondary);"></pre>
                </div>
            `;
        },
        init() {
            const dropzone = document.getElementById('fhash-dropzone');
            const fileInput = document.getElementById('fhash-input');
            const textEl = document.getElementById('fhash-text');
            const algoSelect = document.getElementById('fhash-algo');
            const resultBox = document.getElementById('fhash-result-box');
            const output = document.getElementById('fhash-output');
            const copy = document.getElementById('fhash-copy');
            let arrayBuffer = null;

            dropzone.onclick = () => fileInput.click();
            fileInput.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                    textEl.textContent = file.name;
                    const r = new FileReader();
                    r.onload = (evt) => {
                        arrayBuffer = evt.target.result;
                        generateHash();
                    };
                    r.readAsArrayBuffer(file);
                }
            };

            algoSelect.onchange = () => { if (arrayBuffer) generateHash(); };

            const generateHash = () => {
                if (!arrayBuffer) return;
                const CryptoJS = window.CryptoJS;
                if (!CryptoJS) {
                    utils.showToast('CryptoJS library not loaded!', 'error');
                    return;
                }

                const wordArray = CryptoJS.lib.WordArray.create(arrayBuffer);
                const algo = algoSelect.value;
                let hash = '';

                if (algo === 'SHA256') hash = CryptoJS.SHA256(wordArray).toString();
                else if (algo === 'MD5') hash = CryptoJS.MD5(wordArray).toString();
                else if (algo === 'SHA1') hash = CryptoJS.SHA1(wordArray).toString();
                else if (algo === 'SHA512') hash = CryptoJS.SHA512(wordArray).toString();

                output.textContent = hash;
                resultBox.style.display = 'block';
                utils.showToast(`Hash calculated successfully!`);
                window.incrementStatsRun();
            };

            copy.onclick = () => utils.copyText(output.textContent);
        }
    },

    // 29. File Splitter
    {
        id: 'adv-file-splitter',
        name: 'Large File Splitter',
        category: 'adv-file',
        icon: '<i class="fa-solid fa-arrows-split-up-and-left"></i>',
        description: 'Slice extremely large files into smaller partitioned chunks in a ZIP.',
        tags: ['split', 'slice', 'large file', 'divide', 'zip'],
        render() {
            return `
                <div class="tool-grid-2col">
                    <div>
                        <div class="input-group">
                            <label>File to Split</label>
                            <div class="uploader-box" id="fsplit-dropzone" style="height:90px;">
                                <i class="fa-solid fa-file uploader-icon" style="color:var(--accent-primary);"></i>
                                <div class="uploader-text" id="fsplit-text">Choose File</div>
                                <input type="file" id="fsplit-input" style="display:none;">
                            </div>
                        </div>
                        <div class="input-group" style="margin-top:10px;">
                            <label>Chunk Size (MB)</label>
                            <input type="number" class="form-input" id="fsplit-size" value="5" min="1">
                        </div>
                        <button class="app-btn primary" id="fsplit-btn" style="width:100%; margin-top:15px; border-radius:20px;">
                            <i class="fa-solid fa-circle-nodes" style="margin-right:6px;"></i>Split & Download ZIP
                        </button>
                    </div>
                    <div>
                        <h3 style="font-size:13px; font-weight:700; color:var(--accent-secondary); margin-bottom:10px;">Split Status Report</h3>
                        <div class="output-container" id="fsplit-report" style="margin-top:0; min-height:180px; padding:15px; font-size:12px; line-height:1.6;">
                            <span style="color:var(--text-muted);">No file loaded</span>
                        </div>
                    </div>
                </div>
            `;
        },
        init() {
            const dropzone = document.getElementById('fsplit-dropzone');
            const fileInput = document.getElementById('fsplit-input');
            const textEl = document.getElementById('fsplit-text');
            const sizeInput = document.getElementById('fsplit-size');
            const btn = document.getElementById('fsplit-btn');
            const report = document.getElementById('fsplit-report');
            let file = null;

            dropzone.onclick = () => fileInput.click();
            fileInput.onchange = (e) => {
                file = e.target.files[0];
                if (file) {
                    textEl.textContent = file.name;
                    updateReport();
                }
            };

            sizeInput.oninput = updateReport;

            function updateReport() {
                if (!file) return;
                const chunkSize = (parseInt(sizeInput.value) || 5) * 1024 * 1024;
                const count = Math.ceil(file.size / chunkSize);
                report.innerHTML = `
                    <div><strong>File Name:</strong> ${file.name}</div>
                    <div><strong>Total Size:</strong> ${utils.formatBytes(file.size)}</div>
                    <div><strong>Target Chunk Size:</strong> ${sizeInput.value} MB</div>
                    <div><strong>Estimated Chunks:</strong> ${count} partition files</div>
                `;
            }

            btn.onclick = async () => {
                if (!file) return;
                btn.disabled = true;

                try {
                    const chunkSize = (parseInt(sizeInput.value) || 5) * 1024 * 1024;
                    const zip = new JSZip();
                    let offset = 0;
                    let index = 1;

                    while (offset < file.size) {
                        const slice = file.slice(offset, offset + chunkSize);
                        zip.file(`${file.name}.part${index}`, slice);
                        offset += chunkSize;
                        index++;
                    }

                    const zipBlob = await zip.generateAsync({ type: 'blob' });
                    utils.downloadFile(zipBlob, `${file.name}_split.zip`, 'application/zip');
                    utils.showToast('Large file successfully split into ZIP archive!');
                    window.incrementStatsRun();
                } catch(err) {
                    utils.showToast(err.message, 'error');
                } finally {
                    btn.disabled = false;
                }
            };
        }
    },

    // 30. Large File Joiner
    {
        id: 'adv-file-joiner',
        name: 'File Joiner',
        category: 'adv-file',
        icon: '<i class="fa-solid fa-arrows-spin"></i>',
        description: 'Reassemble split partition files back into the original intact file.',
        tags: ['join', 'merge', 'chunks', 'parts', 'reassemble'],
        render() {
            return `
                <div class="tool-grid-2col">
                    <div>
                        <div class="input-group">
                            <label>Add Chunk Files (.part1, .part2...)</label>
                            <div class="uploader-box" id="fjoin-dropzone" style="height:90px;">
                                <i class="fa-solid fa-plus uploader-icon" style="color:var(--accent-secondary);"></i>
                                <div class="uploader-text">Upload Chunks</div>
                                <input type="file" id="fjoin-input" multiple style="display:none;">
                            </div>
                        </div>
                        <div class="input-group">
                            <label>Merged Output Name</label>
                            <input type="text" class="form-input" id="fjoin-name" value="reconstructed_file.bin">
                        </div>
                        <button class="app-btn primary" id="fjoin-btn" style="width:100%; margin-top:15px; border-radius:20px;">
                            <i class="fa-solid fa-compress" style="margin-right:6px;"></i>Join Files
                        </button>
                    </div>
                    <div>
                        <h3 style="font-size:13px; font-weight:700; color:var(--accent-secondary); margin-bottom:10px;">Chunks Registry List</h3>
                        <div id="fjoin-list" style="background:rgba(0,0,0,0.2); border:1px solid rgba(255,255,255,0.05); border-radius:8px; padding:10px; max-height:200px; overflow-y:auto; display:flex; flex-direction:column; gap:6px;">
                            <div style="font-size:12px; color:var(--text-muted); text-align:center; padding:10px;">No chunks loaded</div>
                        </div>
                    </div>
                </div>
            `;
        },
        init() {
            const dropzone = document.getElementById('fjoin-dropzone');
            const fileInput = document.getElementById('fjoin-input');
            const nameInput = document.getElementById('fjoin-name');
            const list = document.getElementById('fjoin-list');
            const btn = document.getElementById('fjoin-btn');
            let chunks = [];

            const renderChunks = () => {
                list.innerHTML = '';
                if (chunks.length === 0) {
                    list.innerHTML = `<div style="font-size:12px; color:var(--text-muted); text-align:center; padding:10px;">No chunks loaded</div>`;
                    return;
                }

                // Sort chunks by name suffix
                chunks.sort((a,b) => a.name.localeCompare(b.name, undefined, {numeric: true}));

                chunks.forEach(c => {
                    const row = document.createElement('div');
                    row.style.cssText = "display:flex; justify-content:space-between; align-items:center; padding:6px 10px; background:rgba(255,255,255,0.03); border-radius:4px; font-size:12px;";
                    row.innerHTML = `<span>${c.name}</span><span>${utils.formatBytes(c.size)}</span>`;
                    list.appendChild(row);
                });

                // Guess original name
                if (chunks.length > 0) {
                    let first = chunks[0].name;
                    if (first.includes('.part')) {
                        nameInput.value = first.substring(0, first.lastIndexOf('.part'));
                    }
                }
            };

            dropzone.onclick = () => fileInput.click();
            fileInput.onchange = (e) => {
                for (let f of e.target.files) chunks.push(f);
                renderChunks();
            };

            btn.onclick = async () => {
                if (chunks.length === 0) return;
                btn.disabled = true;

                try {
                    // re-sort
                    chunks.sort((a,b) => a.name.localeCompare(b.name, undefined, {numeric: true}));
                    
                    const blobs = [];
                    for (let chunk of chunks) {
                        blobs.push(chunk);
                    }

                    const joinedBlob = new Blob(blobs);
                    utils.downloadFile(joinedBlob, nameInput.value || 'joined_file.bin', joinedBlob.type);
                    utils.showToast('Files successfully joined!');
                    window.incrementStatsRun();
                } catch(err) {
                    utils.showToast(err.message, 'error');
                } finally {
                    btn.disabled = false;
                }
            };
        }
    },

    // 31. PDF Bates/Page Numberer
    {
        id: 'adv-pdf-bates',
        name: 'PDF Page Numberer',
        category: 'adv-file',
        icon: '<i class="fa-solid fa-list-ol"></i>',
        description: 'Stamp custom page numbering ranges (e.g. Bates stamps) onto PDF pages.',
        tags: ['pdf', 'bates', 'page number', 'stamp', 'paginate'],
        render() {
            return `
                <div class="tool-grid-2col">
                    <div>
                        <div class="input-group">
                            <label>PDF File</label>
                            <div class="uploader-box" id="pdfb-dropzone" style="height:90px;">
                                <i class="fa-solid fa-file-pdf uploader-icon" style="color:var(--accent-primary);"></i>
                                <div class="uploader-text" id="pdfb-text">Choose PDF File</div>
                                <input type="file" id="pdfb-input" accept="application/pdf" style="display:none;">
                            </div>
                        </div>
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:10px;">
                            <div class="input-group">
                                <label>Stamping Format</label>
                                <input type="text" class="form-input" id="pdfb-format" value="Page {num} of {total}">
                            </div>
                            <div class="input-group">
                                <label>Starting Page</label>
                                <input type="number" class="form-input" id="pdfb-start" value="1">
                            </div>
                        </div>
                        <div class="input-group" style="margin-top:10px;">
                            <label>Number Placement</label>
                            <select id="pdfb-placement" class="form-select">
                                <option value="bottom-right">Bottom Right</option>
                                <option value="bottom-center">Bottom Center</option>
                                <option value="top-right">Top Right</option>
                            </select>
                        </div>
                        <button class="app-btn primary" id="pdfb-btn" style="width:100%; margin-top:15px; border-radius:20px;">
                            <i class="fa-solid fa-list-ol" style="margin-right:6px;"></i>Stamp Numbers & Save
                        </button>
                    </div>
                    <div>
                        <div class="input-group">
                            <label>Stamping Status logs</label>
                            <div class="output-container" style="margin-top:0;">
                                <pre class="output-pre" id="pdfb-log" style="min-height:220px; font-size:11px;">[Ready] Select PDF...</pre>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        },
        init() {
            const dropzone = document.getElementById('pdfb-dropzone');
            const fileInput = document.getElementById('pdfb-input');
            const labelText = document.getElementById('pdfb-text');
            const formatInput = document.getElementById('pdfb-format');
            const startInput = document.getElementById('pdfb-start');
            const placeSelect = document.getElementById('pdfb-placement');
            const btn = document.getElementById('pdfb-btn');
            const logBox = document.getElementById('pdfb-log');
            let pdfFile = null;

            const updateLog = (msg, clear = false) => {
                const time = new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', second:'2-digit'});
                if (clear) logBox.textContent = `[${time}] ${msg}`;
                else logBox.textContent += `\n[${time}] ${msg}`;
            };

            dropzone.onclick = () => fileInput.click();
            fileInput.onchange = (e) => {
                pdfFile = e.target.files[0];
                if (pdfFile) {
                    labelText.textContent = pdfFile.name;
                    updateLog(`Loaded file: ${pdfFile.name}`, true);
                }
            };

            btn.onclick = async () => {
                if (!pdfFile) {
                    utils.showToast('Please upload a PDF first!', 'error');
                    return;
                }
                btn.disabled = true;
                updateLog('Stamping page numbering...');

                try {
                    const bytes = await pdfFile.arrayBuffer();
                    const pdfDoc = await PDFLib.PDFDocument.load(bytes);
                    const pages = pdfDoc.getPages();
                    const total = pages.length;
                    const format = formatInput.value || 'Page {num}';
                    const startNum = parseInt(startInput.value) || 1;
                    const placement = placeSelect.value;

                    const standardFont = await pdfDoc.embedFont(PDFLib.StandardFonts.Helvetica);

                    pages.forEach((page, idx) => {
                        const { width, height } = page.getSize();
                        const pageNum = startNum + idx;
                        const label = format.replace('{num}', pageNum).replace('{total}', total);

                        let x = width - 80;
                        let y = 30;

                        if (placement === 'bottom-center') {
                            x = width / 2 - (label.length * 3);
                            y = 30;
                        } else if (placement === 'top-right') {
                            x = width - 80;
                            y = height - 30;
                        }

                        page.drawText(label, {
                            x: x,
                            y: y,
                            size: 10,
                            font: standardFont,
                            color: PDFLib.rgb(0.4, 0.4, 0.4)
                        });
                        updateLog(`Stamped: ${label}`);
                    });

                    const outBytes = await pdfDoc.save();
                    utils.downloadFile(outBytes, `numbered_${pdfFile.name}`, 'application/pdf');
                    updateLog('PDF successfully page numbered!');
                    window.incrementStatsRun();
                } catch(err) {
updateLog(`Failed: ${err.message}`);
                } finally {
                    btn.disabled = false;
                }
            };
        }
    },
    {
        id: 'creator-cv-builder',
        name: 'CV Builder Pro',
        category: 'creator',
        popular: true,
        fitViewport: true,
        icon: '<i class="fa-solid fa-file-invoice"></i>',
        description: 'Create ATS-friendly resumes, edit profile photos, build cover letter emails, and scan CV scores instantly.',
        tags: ['cv', 'resume', 'builder', 'jobs', 'careers', 'pdf', 'creator', 'cover-letter', 'ats'],
        render() {
            return `
                <div class="cv-builder-container" style="display:flex; flex-direction:column; height:100%; width:100%; overflow:hidden; background:rgba(0,0,0,0.15); border-radius:12px; border:1px solid rgba(255,255,255,0.05);">
                    <style>
                        .cv-builder-container * {
                            box-sizing: border-box;
                        }
                        /* Tabs Header Styling */
                        .cv-builder-tabs {
                            display: flex;
                            background: rgba(0, 0, 0, 0.3);
                            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                            padding: 10px 15px;
                            gap: 8px;
                            align-items: center;
                        }
                        .cv-builder-tabs .tab-btn {
                            background: rgba(255, 255, 255, 0.02);
                            border: 1px solid rgba(255, 255, 255, 0.08);
                            color: var(--text-secondary);
                            padding: 8px 16px;
                            font-size: 11px;
                            font-weight: 600;
                            border-radius: 20px;
                            cursor: pointer;
                            transition: all 0.2s ease;
                            display: flex;
                            align-items: center;
                            gap: 6px;
                        }
                        .cv-builder-tabs .tab-btn:hover {
                            background: rgba(255, 255, 255, 0.08);
                            color: white;
                        }
                        .cv-builder-tabs .tab-btn.active {
                            background: linear-gradient(135deg, #ff00ff, #00ffff);
                            border-color: transparent;
                            color: black;
                            font-weight: 700;
                        }
                        
                        /* Workspace layout */
                        .cv-tab-panel {
                            display: none;
                            height: calc(100% - 50px);
                            width: 100%;
                            overflow: hidden;
                        }
                        .cv-tab-panel.active {
                            display: block;
                        }
                        
                        /* Paper CV Split Layout */
                        .cv-layout-split {
                            display: grid;
                            grid-template-columns: 240px 380px 1fr;
                            height: 100%;
                            width: 100%;
                            overflow: hidden;
                        }
                        
                        /* Sidebar Template selector */
                        .cv-template-sidebar {
                            background: rgba(0, 0, 0, 0.3);
                            border-right: 1px solid rgba(255,255,255,0.05);
                            display: flex;
                            flex-direction: column;
                            padding: 15px;
                            gap: 12px;
                            height: 100%;
                            overflow-y: auto;
                        }
                        .cv-template-cat {
                            font-size: 9px;
                            font-weight: 800;
                            color: var(--accent-primary);
                            text-transform: uppercase;
                            letter-spacing: 1px;
                            margin: 10px 0 5px;
                        }
                        .cv-tpl-thumb {
                            background: rgba(255,255,255,0.02);
                            border: 1px solid rgba(255,255,255,0.08);
                            border-radius: 8px;
                            cursor: pointer;
                            display: flex;
                            align-items: center;
                            gap: 10px;
                            padding: 8px 12px;
                            color: var(--text-secondary);
                            transition: all 0.2s ease;
                            font-size: 10px;
                            text-align: left;
                        }
                        .cv-tpl-thumb i {
                            font-size: 14px;
                        }
                        .cv-tpl-thumb:hover, .cv-tpl-thumb.active {
                            border-color: var(--accent-primary);
                            background: rgba(255, 0, 255, 0.08);
                            color: white;
                        }
                        
                        /* Form Pane */
                        .cv-form-pane {
                            background: rgba(0, 0, 0, 0.2);
                            border-right: 1px solid rgba(255,255,255,0.05);
                            overflow-y: auto;
                            padding: 20px;
                            display: flex;
                            flex-direction: column;
                            gap: 18px;
                            height: 100%;
                        }
                        .cv-form-pane label {
                            font-size: 10px;
                            font-weight: 700;
                            color: var(--text-secondary);
                            text-transform: uppercase;
                            margin-bottom: 4px;
                            display: block;
                        }
                        .cv-form-pane input, .cv-form-pane textarea, .cv-form-pane select {
                            background: rgba(255,255,255,0.03) !important;
                            border: 1px solid rgba(255,255,255,0.08) !important;
                            color: white !important;
                            padding: 8px 10px !important;
                            border-radius: 6px !important;
                            font-size: 12px !important;
                            width: 100%;
                        }
                        .cv-form-pane input:focus, .cv-form-pane textarea:focus, .cv-form-pane select:focus {
                            border-color: var(--accent-secondary) !important;
                            outline: none;
                        }
                        
                        /* Accordion details */
                        .cv-accordion {
                            border: 1px solid rgba(255,255,255,0.05);
                            border-radius: 8px;
                            background: rgba(255,255,255,0.01);
                            overflow: hidden;
                        }
                        .cv-accordion-header {
                            background: rgba(0,0,0,0.15);
                            padding: 10px 14px;
                            font-size: 11px;
                            font-weight: 700;
                            color: var(--accent-primary);
                            cursor: pointer;
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                        }
                        .cv-accordion-content {
                            padding: 14px;
                            display: none;
                            flex-direction: column;
                            gap: 12px;
                            border-top: 1px solid rgba(255,255,255,0.05);
                        }
                        .cv-accordion.open .cv-accordion-content {
                            display: flex;
                        }
                        
                        .cv-dynamic-item {
                            padding: 12px;
                            background: rgba(255,255,255,0.02);
                            border: 1px solid rgba(255,255,255,0.05);
                            border-radius: 8px;
                            position: relative;
                            margin-bottom: 10px;
                        }
                        .cv-remove-btn {
                            position: absolute;
                            top: 8px;
                            right: 8px;
                            color: #ef4444;
                            cursor: pointer;
                            opacity: 0.7;
                            font-size: 12px;
                        }
                        .cv-remove-btn:hover {
                            opacity: 1;
                        }
                        
                        /* A4 Preview Container */
                        .cv-preview-pane {
                            background: rgba(10, 10, 20, 0.5);
                            overflow-y: auto;
                            padding: 20px;
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            justify-content: flex-start;
                            height: 100%;
                            position: relative;
                        }
                        .cv-resume-paper {
                            width: 210mm;
                            min-height: 297mm;
                            background: white;
                            color: black;
                            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                            padding: 15mm;
                            transform-origin: top center;
                            transition: transform 0.2s ease;
                            border-radius: 2px;
                            font-family: 'Inter', sans-serif;
                            font-size: 11px;
                        }
                        
                        /* Hide drag indicators during capture */
                        .pdf-export-mode .cv-photo-dropzone {
                            border: none !important;
                            padding: 0 !important;
                            margin: 0 !important;
                            min-width: 0 !important;
                            min-height: 0 !important;
                        }
                        .pdf-export-mode .cv-photo-dropzone:empty {
                            display: none !important;
                        }
                        .pdf-export-mode .cv-photo-dropzone:not(:has(.cv-photo-wrapper)) {
                            display: none !important;
                        }
                        
                        /* Profile photo styling on preview paper */
                        .cv-photo-wrapper {
                            display: inline-block;
                            user-select: none;
                        }
                        .cv-photo-dropzone {
                            transition: all 0.2s ease;
                        }
                        
                        /* 20 CV Templates Scoped CSS Classes */
                        /* Student */
                        .tpl-minimal-ats { color: #1a1a1a; }
                        .tpl-minimal-ats h1 { font-size: 22px; text-transform: uppercase; font-weight: 800; margin-bottom: 2px; }
                        .tpl-minimal-ats .cv-paper-header { border-bottom: 2px solid #000; padding-bottom: 6px; margin-bottom: 12px; }
                        .tpl-minimal-ats h3 { border-bottom: 1px solid #111; text-transform: uppercase; font-size: 11px; margin-top: 14px; margin-bottom: 6px; font-weight: 700; }
                        
                        .tpl-academic-basic { font-family: 'Georgia', serif; color: #111; }
                        .tpl-academic-basic h1 { font-size: 24px; text-align: center; }
                        .tpl-academic-basic .cv-paper-header { border-bottom: 1px solid #777; padding-bottom: 10px; text-align: center; }
                        .tpl-academic-basic h3 { border-bottom: 1px solid #444; font-size: 12px; margin-top: 15px; text-transform: uppercase; font-weight: 600; }
                        
                        .tpl-fresh-graduate { border-top: 6px solid #4f46e5; }
                        .tpl-fresh-graduate h1 { color: #4f46e5; font-size: 24px; }
                        .tpl-fresh-graduate h3 { color: #4f46e5; border-bottom: 2px solid #e0e7ff; font-size: 12px; margin-top: 14px; }
                        
                        .tpl-mis-student { border-top: 6px solid #0891b2; }
                        .tpl-mis-student h1 { color: #0891b2; font-size: 24px; }
                        .tpl-mis-student h3 { color: #0891b2; border-bottom: 2px solid #cffafe; font-size: 12px; margin-top: 14px; }
                        
                        .tpl-internship { border-left: 6px solid #10b981; padding-left: 12mm; }
                        .tpl-internship h1 { color: #065f46; font-size: 24px; }
                        .tpl-internship h3 { color: #065f46; background: #ecfdf5; padding: 4px 8px; font-size: 11px; margin-top: 12px; border-radius: 4px; }
                        
                        /* Business */
                        .tpl-corporate-blue { display: grid; grid-template-columns: 200px 1fr; gap: 15px; padding: 0 !important; min-height: 297mm; }
                        .tpl-corporate-blue .cv-paper-header { grid-column: 1 / -1; background: #1e3a8a; color: white; padding: 20px 15mm; }
                        .tpl-corporate-blue .cv-paper-header h1 { color: white; }
                        .tpl-corporate-blue .cv-sidebar { background: #f0f4f8; padding: 15px 15px 15px 15mm; border-right: 1px solid #d1d5db; }
                        .tpl-corporate-blue .cv-main { padding: 15px 15mm 15px 15px; }
                        .tpl-corporate-blue h3 { color: #1e3a8a; border-bottom: 2px solid #1e3a8a; font-size: 12px; margin-top: 14px; }
                        
                        .tpl-executive-professional { font-family: 'Georgia', serif; color: #1e293b; text-align: center; }
                        .tpl-executive-professional .cv-paper-header { border-bottom: 2px double #1e293b; padding-bottom: 12px; margin-bottom: 16px; }
                        .tpl-executive-professional h1 { font-size: 26px; font-weight: normal; }
                        .tpl-executive-professional h3 { text-align: center; border-bottom: 1px solid #1e293b; text-transform: uppercase; font-size: 11px; margin-top: 16px; }
                        .tpl-executive-professional .cv-section-body { text-align: left; }
                        
                        .tpl-finance-accounting { border-left: 8px solid #047857; }
                        .tpl-finance-accounting h1 { color: #047857; font-size: 24px; }
                        .tpl-finance-accounting h3 { color: #047857; border-bottom: 1px solid #047857; font-size: 12px; margin-top: 14px; }
                        
                        /* Developer */
                        .tpl-software-developer { font-family: 'JetBrains Mono', monospace; background: #fafafa; }
                        .tpl-software-developer h1::before { content: '> '; color: #10b981; }
                        .tpl-software-developer h3 { background: #1e293b; color: #10b981; padding: 4px 8px; font-size: 11px; margin-top: 14px; display: inline-block; }
                        
                        .tpl-fullstack-developer { display: grid; grid-template-columns: 210px 1fr; gap: 15px; padding: 0 !important; }
                        .tpl-fullstack-developer .cv-paper-header { grid-column: 1 / -1; background: #0f172a; color: white; padding: 20px 15mm; }
                        .tpl-fullstack-developer .cv-paper-header h1 { color: white; }
                        .tpl-fullstack-developer .cv-sidebar { background: #1e293b; color: white; padding: 15px 15px 15px 15mm; }
                        .tpl-fullstack-developer .cv-sidebar h3 { color: #38bdf8; border-bottom: 1px solid #38bdf8; }
                        .tpl-fullstack-developer .cv-sidebar p, .tpl-fullstack-developer .cv-sidebar span { color: #cbd5e1 !important; }
                        .tpl-fullstack-developer .cv-main { padding: 15px 15mm 15px 15px; }
                        .tpl-fullstack-developer h3 { color: #0f172a; border-bottom: 2px solid #0f172a; font-size: 12px; margin-top: 14px; }
                        
                        .tpl-frontend-developer { border-top: 6px solid #06b6d4; }
                        .tpl-frontend-developer h1 { color: #06b6d4; font-size: 24px; }
                        .tpl-frontend-developer h3 { color: #06b6d4; font-size: 12px; border-bottom: 1px solid #06b6d4; margin-top: 14px; }
                        
                        .tpl-backend-developer { border-top: 6px solid #6366f1; }
                        .tpl-backend-developer h1 { color: #6366f1; font-size: 24px; }
                        .tpl-backend-developer h3 { color: #6366f1; font-size: 12px; border-bottom: 1px solid #6366f1; margin-top: 14px; }
                        
                        .tpl-cybersecurity-specialist { font-family: 'Courier New', monospace; background: #000; color: #00ff00; }
                        .tpl-cybersecurity-specialist * { color: #00ff00 !important; }
                        .tpl-cybersecurity-specialist h3 { border: 1px solid #00ff00; padding: 3px 6px; font-size: 11px; margin-top: 14px; display: inline-block; }
                        
                        .tpl-data-analyst { border-top: 6px solid #8b5cf6; }
                        .tpl-data-analyst h1 { color: #8b5cf6; font-size: 24px; }
                        .tpl-data-analyst h3 { color: #8b5cf6; border-bottom: 2px solid #ddd; font-size: 12px; margin-top: 14px; }
                        
                        /* Creative */
                        .tpl-graphic-designer { display: grid; grid-template-columns: 200px 1fr; gap: 15px; padding: 0 !important; background: #fffdf5; }
                        .tpl-graphic-designer .cv-paper-header { grid-column: 1 / -1; background: #ff7e5f; color: white; padding: 20px 15mm; }
                        .tpl-graphic-designer .cv-paper-header h1 { color: white; }
                        .tpl-graphic-designer .cv-sidebar { background: #fef9e7; padding: 15px 15px 15px 15mm; }
                        .tpl-graphic-designer .cv-main { padding: 15px 15mm 15px 15px; }
                        .tpl-graphic-designer h3 { color: #ff7e5f; border-bottom: 2px solid #ff7e5f; font-size: 12px; margin-top: 14px; }
                        
                        .tpl-uiux-designer { border-top: 6px solid #ec4899; }
                        .tpl-uiux-designer h1 { color: #ec4899; }
                        .tpl-uiux-designer h3 { color: #ec4899; border-bottom: 2px solid #fbcfe8; font-size: 12px; margin-top: 14px; }
                        
                        .tpl-content-creator { border-top: 6px solid #f97316; }
                        .tpl-content-creator h1 { color: #f97316; }
                        .tpl-content-creator h3 { color: #f97316; border-bottom: 2px solid #ffedd5; font-size: 12px; margin-top: 14px; }
                        
                        /* Premium */
                        .tpl-glassmorphism { background: linear-gradient(135deg, #0f172a, #1e293b); color: white; }
                        .tpl-glassmorphism * { color: white !important; }
                        .tpl-glassmorphism .cv-paper-header { background: rgba(255,255,255,0.05); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.1); padding: 15px; border-radius: 12px; }
                        .tpl-glassmorphism h3 { border-bottom: 1px solid rgba(255,255,255,0.2); color: #38bdf8 !important; font-size: 12px; margin-top: 14px; }
                        
                        .tpl-cyberpunk { background: #0a0a16; color: #e2e8f0; border: 2px solid #ff00ff; box-shadow: 0 0 15px rgba(255,0,255,0.2); }
                        .tpl-cyberpunk * { color: #e2e8f0 !important; }
                        .tpl-cyberpunk .cv-paper-header h1 { color: #00ffff !important; text-shadow: 0 0 8px rgba(0,255,255,0.5); }
                        .tpl-cyberpunk h3 { color: #ff00ff !important; border-bottom: 2px solid #ff00ff; text-shadow: 0 0 8px rgba(255,0,255,0.5); font-size: 12px; margin-top: 14px; }
                        
                        .tpl-dark-professional { background: #18181b; color: #f4f4f5; }
                        .tpl-dark-professional * { color: #f4f4f5 !important; }
                        .tpl-dark-professional .cv-paper-header h1 { color: #fbbf24 !important; }
                        .tpl-dark-professional h3 { color: #fbbf24 !important; border-bottom: 1px solid #fbbf24; font-size: 12px; margin-top: 14px; }
                        
                        .tpl-portfolio-resume { display: grid; grid-template-columns: 200px 1fr; gap: 15px; padding: 0 !important; background: #fafafa; }
                        .tpl-portfolio-resume .cv-sidebar { background: #27272a; color: white; padding: 15px 15px 15px 15mm; }
                        .tpl-portfolio-resume .cv-sidebar * { color: white !important; }
                        .tpl-portfolio-resume .cv-main { padding: 15px 15mm 15px 15px; }
                        .tpl-portfolio-resume h3 { color: #3f3f46; border-bottom: 2px solid #3f3f46; font-size: 12px; margin-top: 14px; }
                        
                        /* General CV structure layout */
                        .cv-paper-header { margin-bottom: 15px; }
                        .cv-section { margin-bottom: 14px; }
                        .cv-section-title { font-weight: 700; text-transform: uppercase; margin-bottom: 6px; padding-bottom: 2px; }
                        .cv-item { margin-bottom: 8px; }
                        .cv-item-header { display: flex; justify-content: space-between; font-weight: 700; font-size: 11px; }
                        .cv-item-sub { color: #4b5563; font-size: 10px; margin-bottom: 2px; font-weight: 500; }
                        
                        /* Photo Editor styling */
                        .pe-container {
                            display: grid;
                            grid-template-columns: 350px 1fr;
                            height: 100%;
                            width: 100%;
                        }
                        .pe-form {
                            background: rgba(0,0,0,0.2);
                            border-right: 1px solid rgba(255,255,255,0.05);
                            padding: 20px;
                            display: flex;
                            flex-direction: column;
                            gap: 15px;
                            overflow-y: auto;
                        }
                        .pe-form label {
                            font-size: 10px;
                            font-weight: 700;
                            color: var(--text-secondary);
                            text-transform: uppercase;
                            margin-bottom: 4px;
                            display: block;
                        }
                        .pe-form input, .pe-form select, .pe-form textarea {
                            background: rgba(255,255,255,0.03) !important;
                            border: 1px solid rgba(255,255,255,0.08) !important;
                            color: white !important;
                            padding: 8px 10px !important;
                            border-radius: 6px !important;
                            font-size: 12px !important;
                            width: 100%;
                        }
                        .pe-form input:focus, .pe-form select:focus, .pe-form textarea:focus {
                            border-color: var(--accent-secondary) !important;
                            outline: none;
                        }
                        .pe-canvas-area {
                            background: rgba(10,10,20,0.4);
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            padding: 20px;
                            overflow: auto;
                        }
                        
                        /* Radial progress circle styling */
                        .ats-radial-meter {
                            position: relative;
                            width: 120px;
                            height: 120px;
                            margin: 0 auto;
                        }
                        
                        /* Responsive layout override */
                        @media (max-width: 1024px) {
                            .cv-builder-container {
                                height: auto !important;
                                overflow: visible !important;
                            }
                            .cv-tab-panel {
                                height: auto !important;
                                overflow: visible !important;
                                display: none;
                            }
                            .cv-tab-panel.active {
                                display: flex !important;
                                flex-direction: column !important;
                            }
                            .cv-layout-split {
                                grid-template-columns: 1fr !important;
                                height: auto !important;
                                overflow: visible !important;
                            }
                            .cv-template-sidebar {
                                flex-direction: row !important;
                                height: auto !important;
                                width: 100% !important;
                                overflow-x: auto !important;
                                padding: 10px !important;
                            }
                            .cv-template-sidebar * {
                                flex-shrink: 0 !important;
                            }
                            .cv-template-cat {
                                margin: 0 10px !important;
                                align-self: center !important;
                            }
                            .cv-form-pane {
                                height: auto !important;
                                overflow: visible !important;
                            }
                            .cv-preview-pane {
                                height: auto !important;
                                overflow-x: hidden !important;
                                overflow-y: visible !important;
                                width: 100% !important;
                                display: flex !important;
                                flex-direction: column !important;
                                align-items: center !important;
                                padding: 10px !important;
                            }
                            .cv-resume-paper {
                                transform-origin: top center !important;
                                margin-bottom: -580px !important; /* Compensate for transform height collapse */
                            }
                            .pe-container {
                                grid-template-columns: 1fr !important;
                                height: auto !important;
                            }
                            .pe-form {
                                height: auto !important;
                                overflow: visible !important;
                                border-right: none !important;
                                border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                            }
                            .pe-canvas-area {
                                height: auto !important;
                                overflow: visible !important;
                                padding: 10px !important;
                            }
                        }
                    </style>
                    
                    <!-- Tabs Bar -->
                    <div class="cv-builder-tabs">
                        <button class="tab-btn active" data-tab="paper-cv"><i class="fa-solid fa-file-invoice"></i>📄 Paper CV</button>
                        <button class="tab-btn" data-tab="photo-editor"><i class="fa-solid fa-crop-simple"></i>🖼️ Photo Editor</button>
                        <button class="tab-btn" data-tab="email-cv"><i class="fa-solid fa-envelope-open-text"></i>✉️ Email CV</button>
                        <button class="tab-btn" data-tab="ats-scanner"><i class="fa-solid fa-circle-nodes"></i>🚀 ATS Scanner & AI</button>
                    </div>
                    
                    <!-- PANEL 1: Paper CV -->
                    <div class="cv-tab-panel active" id="panel-paper-cv">
                        <div class="cv-layout-split">
                            <!-- Template Selector -->
                            <div class="cv-template-sidebar">
                                <div class="cv-template-cat">Student</div>
                                <div class="cv-tpl-thumb active" data-tpl="minimal-ats"><i class="fa-solid fa-file-alt"></i>Minimal ATS</div>
                                <div class="cv-tpl-thumb" data-tpl="academic-basic"><i class="fa-solid fa-graduation-cap"></i>Academic Basic</div>
                                <div class="cv-tpl-thumb" data-tpl="fresh-graduate"><i class="fa-solid fa-user-graduate"></i>Fresh Graduate</div>
                                <div class="cv-tpl-thumb" data-tpl="mis-student"><i class="fa-solid fa-school"></i>MIS Student</div>
                                <div class="cv-tpl-thumb" data-tpl="internship"><i class="fa-solid fa-id-card"></i>Internship CV</div>
                                
                                <div class="cv-template-cat">Business</div>
                                <div class="cv-tpl-thumb" data-tpl="corporate-blue"><i class="fa-solid fa-building"></i>Corporate Blue</div>
                                <div class="cv-tpl-thumb" data-tpl="executive-professional"><i class="fa-solid fa-user-tie"></i>Executive Pro</div>
                                <div class="cv-tpl-thumb" data-tpl="finance-accounting"><i class="fa-solid fa-calculator"></i>Finance & Account</div>
                                
                                <div class="cv-template-cat">Developer</div>
                                <div class="cv-tpl-thumb" data-tpl="software-developer"><i class="fa-solid fa-terminal"></i>Software Dev</div>
                                <div class="cv-tpl-thumb" data-tpl="fullstack-developer"><i class="fa-solid fa-database"></i>Full Stack Dev</div>
                                <div class="cv-tpl-thumb" data-tpl="frontend-developer"><i class="fa-solid fa-code"></i>Frontend Dev</div>
                                <div class="cv-tpl-thumb" data-tpl="backend-developer"><i class="fa-solid fa-server"></i>Backend Dev</div>
                                <div class="cv-tpl-thumb" data-tpl="cybersecurity-specialist"><i class="fa-solid fa-shield-halved"></i>Cyber Security</div>
                                <div class="cv-tpl-thumb" data-tpl="data-analyst"><i class="fa-solid fa-chart-line"></i>Data Analyst</div>
                                
                                <div class="cv-template-cat">Creative</div>
                                <div class="cv-tpl-thumb" data-tpl="graphic-designer"><i class="fa-solid fa-palette"></i>Graphic Designer</div>
                                <div class="cv-tpl-thumb" data-tpl="uiux-designer"><i class="fa-solid fa-compass-drafting"></i>UI/UX Designer</div>
                                <div class="cv-tpl-thumb" data-tpl="content-creator"><i class="fa-solid fa-video"></i>Content Creator</div>
                                
                                <div class="cv-template-cat">Premium</div>
                                <div class="cv-tpl-thumb" data-tpl="glassmorphism"><i class="fa-solid fa-braille"></i>Glassmorphism</div>
                                <div class="cv-tpl-thumb" data-tpl="cyberpunk"><i class="fa-solid fa-bolt"></i>Cyberpunk Neon</div>
                                <div class="cv-tpl-thumb" data-tpl="dark-professional"><i class="fa-solid fa-moon"></i>Dark Professional</div>
                                <div class="cv-tpl-thumb" data-tpl="portfolio-resume"><i class="fa-solid fa-folder-open"></i>Portfolio Resume</div>
                            </div>
                            
                            <!-- Form Inputs -->
                            <div class="cv-form-pane">
                                <div style="display:flex; flex-direction:column; gap:8px;">
                                    <div style="display:flex; gap:6px;">
                                        <button class="app-btn primary" id="cv-export-pdf" style="flex:1; font-size:11px; padding:8px; border-radius:20px;"><i class="fa-solid fa-download"></i>PDF</button>
                                        <button class="app-btn secondary" id="cv-export-html" style="font-size:11px; padding:8px; border-radius:20px;" title="Export HTML"><i class="fa-solid fa-file-code"></i>HTML</button>
                                        <button class="app-btn secondary" id="cv-export-png" style="font-size:11px; padding:8px; border-radius:20px;" title="Export PNG"><i class="fa-solid fa-file-image"></i>PNG</button>
                                        <button class="app-btn secondary" id="cv-print" style="font-size:11px; padding:8px; border-radius:20px;" title="Print"><i class="fa-solid fa-print"></i>Print</button>
                                    </div>
                                    <div style="display:flex; gap:6px;">
                                        <button class="app-btn secondary" id="cv-save" style="flex:1; font-size:10px; padding:6px; border-radius:20px;"><i class="fa-solid fa-floppy-disk"></i>Save Draft</button>
                                        <button class="app-btn secondary" id="cv-import-json" style="flex:1; font-size:10px; padding:6px; border-radius:20px;"><i class="fa-solid fa-file-import"></i>Import JSON</button>
                                        <button class="app-btn secondary" id="cv-clear" style="font-size:10px; padding:6px; border-radius:20px; color:#ef4444;"><i class="fa-solid fa-trash"></i>Clear</button>
                                    </div>
                                    <input type="file" id="cv-json-input" style="display:none;" accept=".json">
                                </div>
                                
                                <!-- Accordion 1: Personal details -->
                                <div class="cv-accordion open">
                                    <div class="cv-accordion-header">Personal Information <i class="fa-solid fa-chevron-down"></i></div>
                                    <div class="cv-accordion-content">
                                        <div class="form-group">
                                            <label>Full Name</label>
                                            <input type="text" id="cv-name" placeholder="John Doe">
                                        </div>
                                        <div class="form-group">
                                            <label>Job Title</label>
                                            <input type="text" id="cv-title" placeholder="Software Engineer">
                                        </div>
                                        <div class="form-group">
                                            <label>Email</label>
                                            <input type="email" id="cv-email" placeholder="john@example.com">
                                        </div>
                                        <div class="form-group">
                                            <label>Phone</label>
                                            <input type="text" id="cv-phone" placeholder="+1 234 567 890">
                                        </div>
                                        <div class="form-group">
                                            <label>Location</label>
                                            <input type="text" id="cv-location" placeholder="New York, USA">
                                        </div>
                                        <div class="form-group">
                                            <label>LinkedIn</label>
                                            <input type="text" id="cv-linkedin" placeholder="linkedin.com/in/johndoe">
                                        </div>
                                        <div class="form-group">
                                            <label>GitHub</label>
                                            <input type="text" id="cv-github" placeholder="github.com/johndoe">
                                        </div>
                                        <div class="form-group">
                                            <label>Portfolio / Site</label>
                                            <input type="text" id="cv-portfolio" placeholder="johndoe.dev">
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Accordion 2: Photo Options -->
                                <div class="cv-accordion">
                                    <div class="cv-accordion-header">Profile Photo Settings <i class="fa-solid fa-chevron-down"></i></div>
                                    <div class="cv-accordion-content">
                                        <div class="form-group">
                                            <label>Profile Photo</label>
                                            <input type="file" id="cv-photo-file" accept="image/*">
                                            <button class="app-btn secondary" id="cv-jump-editor" style="width:100%; margin-top:8px; font-size:10px;"><i class="fa-solid fa-crop"></i> Open Photo Editor</button>
                                        </div>
                                        <div class="form-group">
                                            <label>Photo Shape</label>
                                            <select id="cv-photo-shape">
                                                <option value="circle">Circle Photo</option>
                                                <option value="square">Square Photo</option>
                                                <option value="rounded">Rounded Photo</option>
                                                <option value="none">No Photo (ATS Mode)</option>
                                            </select>
                                        </div>
                                        <div class="form-group">
                                            <label>Photo Placement</label>
                                            <select id="cv-photo-pos">
                                                <option value="left-sidebar">Left Sidebar Photo</option>
                                                <option value="top-header">Top Header Photo</option>
                                                <option value="right-corner">Right Corner Photo</option>
                                            </select>
                                            <span style="font-size:9px; color:var(--text-secondary); display:block; margin-top:4px;">*Tip: You can also drag & drop the photo directly on the paper CV to position it!</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Accordion 3: Summary -->
                                <div class="cv-accordion">
                                    <div class="cv-accordion-header">Professional Summary <i class="fa-solid fa-chevron-down"></i></div>
                                    <div class="cv-accordion-content">
                                        <textarea id="cv-summary" rows="4" placeholder="Briefly describe your career background..."></textarea>
                                    </div>
                                </div>
                                
                                <!-- Accordion 4: Skills -->
                                <div class="cv-accordion">
                                    <div class="cv-accordion-header">Skills <i class="fa-solid fa-chevron-down"></i></div>
                                    <div class="cv-accordion-content">
                                        <label>Comma separated skills</label>
                                        <textarea id="cv-skills" rows="3" placeholder="React, Node.js, Python, Project Management..."></textarea>
                                    </div>
                                </div>
                                
                                <!-- Accordion 5: Work Experience -->
                                <div class="cv-accordion">
                                    <div class="cv-accordion-header">Work History <i class="fa-solid fa-chevron-down"></i></div>
                                    <div class="cv-accordion-content">
                                        <div id="cv-exp-list"></div>
                                        <button class="app-btn secondary" id="cv-add-exp" style="width:100%; font-size:10px;"><i class="fa-solid fa-plus"></i> Add Work</button>
                                    </div>
                                </div>
                                
                                <!-- Accordion 6: Education -->
                                <div class="cv-accordion">
                                    <div class="cv-accordion-header">Education <i class="fa-solid fa-chevron-down"></i></div>
                                    <div class="cv-accordion-content">
                                        <div id="cv-edu-list"></div>
                                        <button class="app-btn secondary" id="cv-add-edu" style="width:100%; font-size:10px;"><i class="fa-solid fa-plus"></i> Add Education</button>
                                    </div>
                                </div>
                                
                                <!-- Accordion 7: Projects -->
                                <div class="cv-accordion">
                                    <div class="cv-accordion-header">Projects <i class="fa-solid fa-chevron-down"></i></div>
                                    <div class="cv-accordion-content">
                                        <div id="cv-proj-list"></div>
                                        <button class="app-btn secondary" id="cv-add-proj" style="width:100%; font-size:10px;"><i class="fa-solid fa-plus"></i> Add Project</button>
                                    </div>
                                </div>
                                
                                <!-- Accordion 8: Certifications -->
                                <div class="cv-accordion">
                                    <div class="cv-accordion-header">Certifications <i class="fa-solid fa-chevron-down"></i></div>
                                    <div class="cv-accordion-content">
                                        <div id="cv-cert-list"></div>
                                        <button class="app-btn secondary" id="cv-add-cert" style="width:100%; font-size:10px;"><i class="fa-solid fa-plus"></i> Add Certification</button>
                                    </div>
                                </div>
                                
                                <!-- Accordion 9: Languages -->
                                <div class="cv-accordion">
                                    <div class="cv-accordion-header">Languages <i class="fa-solid fa-chevron-down"></i></div>
                                    <div class="cv-accordion-content">
                                        <div id="cv-lang-list"></div>
                                        <button class="app-btn secondary" id="cv-add-lang" style="width:100%; font-size:10px;"><i class="fa-solid fa-plus"></i> Add Language</button>
                                    </div>
                                </div>
                                
                                <!-- Accordion 10: References -->
                                <div class="cv-accordion">
                                    <div class="cv-accordion-header">References <i class="fa-solid fa-chevron-down"></i></div>
                                    <div class="cv-accordion-content">
                                        <div id="cv-ref-list"></div>
                                        <button class="app-btn secondary" id="cv-add-ref" style="width:100%; font-size:10px;"><i class="fa-solid fa-plus"></i> Add Reference</button>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- A4 Paper Preview -->
                            <div class="cv-preview-pane">
                                <div style="position:absolute; bottom:15px; right:15px; display:flex; align-items:center; gap:8px; z-index:10; background:rgba(0,0,0,0.6); padding:4px 8px; border-radius:20px; border:1px solid rgba(255,255,255,0.1);">
                                    <button class="app-btn secondary" id="cv-zoom-out" style="padding:4px 8px; font-size:10px; border-radius:50%;"><i class="fa-solid fa-minus"></i></button>
                                    <span id="cv-zoom-level" style="font-size:10px; font-weight:700; color:white; min-width:30px; text-align:center;">75%</span>
                                    <button class="app-btn secondary" id="cv-zoom-in" style="padding:4px 8px; font-size:10px; border-radius:50%;"><i class="fa-solid fa-plus"></i></button>
                                </div>
                                <div class="cv-resume-paper tpl-minimal-ats" id="resume-preview" style="transform: scale(0.75);">
                                    <!-- Dynamic HTML output -->
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- PANEL 2: Photo Editor -->
                    <div class="cv-tab-panel" id="panel-photo-editor">
                        <div class="pe-container">
                            <div class="pe-form">
                                <h4 style="color:var(--accent-primary); font-size:12px; font-weight:800; margin:0;"><i class="fa-solid fa-crop-simple" style="margin-right:6px;"></i>Photo Editor Workspace</h4>
                                <div class="form-group">
                                    <label>Upload Profile Photo</label>
                                    <input type="file" id="pe-file-input" accept="image/*">
                                </div>
                                <div class="form-group">
                                    <label>Brightness</label>
                                    <input type="range" id="pe-brightness" min="-100" max="100" value="0" style="background:transparent !important; border:none !important; padding:0 !important;">
                                </div>
                                <div class="form-group">
                                    <label>Contrast</label>
                                    <input type="range" id="pe-contrast" min="-100" max="100" value="0" style="background:transparent !important; border:none !important; padding:0 !important;">
                                </div>
                                <div class="form-group">
                                    <label>Recommended Sizes / Crop Preset</label>
                                    <select id="pe-crop-preset">
                                        <option value="square-300">Square Style (300 x 300 px)</option>
                                        <option value="square-500">Square Style (500 x 500 px)</option>
                                        <option value="passport">Passport Photo (2:3 aspect ratio)</option>
                                        <option value="linkedin">LinkedIn Style (1:1 crop)</option>
                                    </select>
                                </div>
                                <div style="display:flex; flex-direction:column; gap:8px; margin-top:10px;">
                                    <button class="app-btn primary" id="pe-apply-btn" style="border-radius:20px; font-size:11px; padding:10px;"><i class="fa-solid fa-circle-check"></i> Apply Crop & Insert to CV</button>
                                    <button class="app-btn secondary" id="pe-reset-btn" style="border-radius:20px; font-size:11px; padding:8px;"><i class="fa-solid fa-arrow-rotate-left"></i> Reset Photo</button>
                                </div>
                            </div>
                            <div class="pe-canvas-area">
                                <canvas id="pe-canvas" style="background:rgba(0,0,0,0.5); border:1px dashed rgba(255,255,255,0.2); max-width:100%; max-height:80%; object-fit:contain;"></canvas>
                            </div>
                        </div>
                    </div>
                    
                    <!-- PANEL 3: Email CV -->
                    <div class="cv-tab-panel" id="panel-email-cv">
                        <div class="pe-container">
                            <div class="pe-form">
                                <h4 style="color:var(--accent-primary); font-size:12px; font-weight:800; margin:0;"><i class="fa-solid fa-envelope-open-text" style="margin-right:6px;"></i>Cover Letter Email Variables</h4>
                                <div class="form-group">
                                    <label>Company Name</label>
                                    <input type="text" id="el-company" placeholder="E.g. Tesla Inc.">
                                </div>
                                <div class="form-group">
                                    <label>HR Manager Name</label>
                                    <input type="text" id="el-hr-manager" placeholder="E.g. Mr. John Smith">
                                </div>
                                <div class="form-group">
                                    <label>Target Job Title</label>
                                    <input type="text" id="el-job-title" placeholder="E.g. Frontend Engineer">
                                </div>
                                <div class="form-group">
                                    <label>Select Template Type</label>
                                    <select id="el-template-type">
                                        <option value="professional">Professional Job Application</option>
                                        <option value="internship">Internship Application</option>
                                        <option value="fresh-grad">Fresh Graduate Application</option>
                                        <option value="follow-up">Follow-Up Email</option>
                                        <option value="thank-you">Thank You Email</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Tone of Writing</label>
                                    <select id="el-tone">
                                        <option value="formal">Formal & Polite</option>
                                        <option value="friendly">Confident & Warm</option>
                                        <option value="direct">Direct & Professional</option>
                                    </select>
                                </div>
                                <div style="display:flex; flex-direction:column; gap:8px; margin-top:10px;">
                                    <button class="app-btn primary" id="el-copy-btn" style="border-radius:20px; font-size:11px; padding:10px;"><i class="fa-solid fa-copy"></i> Copy Email & Subject</button>
                                    <button class="app-btn secondary" id="el-export-pdf" style="border-radius:20px; font-size:11px; padding:8px;"><i class="fa-solid fa-file-pdf"></i> Download Cover Letter PDF</button>
                                </div>
                            </div>
                            <div class="pe-canvas-area" style="flex-direction:column; align-items:stretch; justify-content:flex-start; padding:30px; overflow-y:auto;">
                                <div style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:25px; max-width:800px; margin:0 auto; width:100%; box-shadow:0 10px 30px rgba(0,0,0,0.3);">
                                    <div style="border-bottom:1px solid rgba(255,255,255,0.08); padding-bottom:12px; margin-bottom:15px;">
                                        <span style="font-size:10px; font-weight:700; color:var(--text-secondary); text-transform:uppercase; display:block; margin-bottom:4px;">Subject Line:</span>
                                        <div id="el-preview-subject" style="font-size:13px; font-weight:700; color:white;">Subject Line will auto-generate...</div>
                                    </div>
                                    <div id="el-preview-body" style="font-size:12px; line-height:1.6; color:#cbd5e1; white-space:pre-wrap; font-family:'Inter', sans-serif;">Email body will build...</div>
                                    <div id="el-cv-warning" style="margin-top:25px; padding:10px; background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.2); border-radius:6px; font-size:10px; color:#f87171; display:flex; align-items:center; gap:8px;">
                                        <i class="fa-solid fa-paperclip"></i>
                                        <span>Reminder: Don't forget to attach your exported CV PDF file when sending this email!</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- PANEL 4: ATS Scanner -->
                    <div class="cv-tab-panel" id="panel-ats-scanner">
                        <div class="pe-container">
                            <div class="pe-form">
                                <h4 style="color:var(--accent-primary); font-size:12px; font-weight:800; margin:0;"><i class="fa-solid fa-circle-nodes" style="margin-right:6px;"></i>Resume ATS scanner</h4>
                                <div class="form-group">
                                    <label>Select Target Job Role</label>
                                    <select id="ats-job-role">
                                        <option value="software-engineer">Software Engineer</option>
                                        <option value="frontend">Frontend Developer</option>
                                        <option value="backend">Backend Developer</option>
                                        <option value="uiux">UI/UX Designer</option>
                                        <option value="data-analyst">Data Analyst</option>
                                        <option value="finance">Finance & Accountant</option>
                                    </select>
                                </div>
                                <button class="app-btn primary" id="ats-scan-btn" style="border-radius:20px; font-size:11px; padding:10px; margin-top:5px;"><i class="fa-solid fa-expand"></i> Scan Resume Score</button>
                                
                                <div style="border-top:1px solid rgba(255,255,255,0.05); padding-top:15px; margin-top:10px; display:flex; flex-direction:column; gap:10px;">
                                    <label>AI Resume Optimizer Suggestions</label>
                                    <button class="app-btn secondary" id="ai-improve-summary" style="font-size:10px; text-align:left; justify-content:flex-start; padding:8px;"><i class="fa-solid fa-wand-magic-sparkles"></i> Improve Summary</button>
                                    <button class="app-btn secondary" id="ai-improve-exp" style="font-size:10px; text-align:left; justify-content:flex-start; padding:8px;"><i class="fa-solid fa-wand-magic-sparkles"></i> Improve Experience Bullets</button>
                                    <button class="app-btn secondary" id="ai-improve-skills" style="font-size:10px; text-align:left; justify-content:flex-start; padding:8px;"><i class="fa-solid fa-wand-magic-sparkles"></i> Auto-Fill Missing Skills</button>
                                </div>
                            </div>
                            
                            <div class="pe-canvas-area" style="flex-direction:column; padding:30px; overflow-y:auto; justify-content:flex-start; gap:20px;">
                                <div style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:25px; max-width:600px; width:100%; box-shadow:0 10px 30px rgba(0,0,0,0.3); text-align:center;">
                                    
                                    <!-- Radial gauge meter -->
                                    <div class="ats-radial-meter">
                                        <svg width="120" height="120" viewBox="0 0 120 120">
                                            <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="10"></circle>
                                            <circle id="ats-progress-circle" cx="60" cy="60" r="50" fill="none" stroke="url(#ats-neon-gradient)" stroke-width="10" stroke-dasharray="314.16" stroke-dashoffset="314.16" stroke-linecap="round" style="transition: stroke-dashoffset 0.8s ease-in-out; transform: rotate(-90deg); transform-origin: 50% 50%;"></circle>
                                            <defs>
                                                <linearGradient id="ats-neon-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                    <stop offset="0%" stop-color="#ff00ff"></stop>
                                                    <stop offset="100%" stop-color="#00ffff"></stop>
                                                </linearGradient>
                                            </defs>
                                        </svg>
                                        <div id="ats-score-text" style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); font-size:24px; font-weight:800; color:white;">0%</div>
                                    </div>
                                    <h3 id="ats-verdict" style="margin:15px 0 5px; color:white; font-size:16px;">Scan Resume to see score</h3>
                                    <p id="ats-verdict-desc" style="font-size:11px; color:var(--text-secondary); max-width:400px; margin:0 auto 20px;">We check section completion, contact details, social links, resume length, and keyword matches.</p>
                                    
                                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px; text-align:left;">
                                        <!-- Matched keywords -->
                                        <div style="background:rgba(16,185,129,0.05); border:1px solid rgba(16,185,129,0.15); border-radius:8px; padding:15px;">
                                            <h4 style="font-size:11px; color:#34d399; margin:0 0 10px 0;"><i class="fa-solid fa-circle-check"></i> Matched Keywords</h4>
                                            <div id="ats-matched-keys" style="display:flex; flex-wrap:wrap; gap:6px;">
                                                <span style="font-size:9px; color:var(--text-secondary);">No matched keywords.</span>
                                            </div>
                                        </div>
                                        <!-- Missing keywords -->
                                        <div style="background:rgba(239,68,68,0.05); border:1px solid rgba(239,68,68,0.15); border-radius:8px; padding:15px;">
                                            <h4 style="font-size:11px; color:#f87171; margin:0 0 10px 0;"><i class="fa-solid fa-circle-xmark"></i> Missing Keywords</h4>
                                            <div id="ats-missing-keys" style="display:flex; flex-wrap:wrap; gap:6px;">
                                                <span style="font-size:9px; color:var(--text-secondary);">Select role and click scan.</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <!-- Detailed checklist reports -->
                                    <div id="ats-checklist" style="text-align:left; margin-top:20px; display:flex; flex-direction:column; gap:8px; border-top:1px solid rgba(255,255,255,0.05); padding-top:15px;"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        },
        init() {
            let resumeData = {
                template: 'minimal-ats',
                fullName: '',
                jobTitle: '',
                email: '',
                phone: '',
                location: '',
                linkedin: '',
                github: '',
                portfolio: '',
                summary: '',
                skills: '',
                profilePhoto: '', // base64 data URL
                photoShape: 'circle', // 'circle', 'square', 'rounded', 'none'
                photoPosition: 'left-sidebar', // 'left-sidebar', 'top-header', 'right-corner'
                experience: [],
                education: [],
                projects: [],
                certifications: [],
                languages: [],
                references: []
            };

            const preview = document.getElementById('resume-preview');
            
            // Paper CV Elements
            const fullNameIn = document.getElementById('cv-name');
            const jobTitleIn = document.getElementById('cv-title');
            const emailIn = document.getElementById('cv-email');
            const phoneIn = document.getElementById('cv-phone');
            const locationIn = document.getElementById('cv-location');
            const linkedinIn = document.getElementById('cv-linkedin');
            const githubIn = document.getElementById('cv-github');
            const portfolioIn = document.getElementById('cv-portfolio');
            const summaryIn = document.getElementById('cv-summary');
            const skillsIn = document.getElementById('cv-skills');
            const shapeSel = document.getElementById('cv-photo-shape');
            const posSel = document.getElementById('cv-photo-pos');
            
            const expContainer = document.getElementById('cv-exp-list');
            const eduContainer = document.getElementById('cv-edu-list');
            const projContainer = document.getElementById('cv-proj-list');
            const certContainer = document.getElementById('cv-cert-list');
            const langContainer = document.getElementById('cv-lang-list');
            const refContainer = document.getElementById('cv-ref-list');

            // --- TAB NAVIGATION SYSTEM ---
            document.querySelectorAll('.cv-builder-tabs .tab-btn').forEach(btn => {
                btn.onclick = () => {
                    document.querySelectorAll('.cv-builder-tabs .tab-btn').forEach(b => b.classList.remove('active'));
                    document.querySelectorAll('.cv-tab-panel').forEach(p => p.classList.remove('active'));
                    
                    btn.classList.add('active');
                    const tabId = btn.getAttribute('data-tab');
                    document.getElementById(`panel-${tabId}`).classList.add('active');
                    
                    if (tabId === 'email-cv') {
                        updateEmailPreview();
                    } else if (tabId === 'ats-scanner') {
                        runATSScan();
                    }
                };
            });

            // Jump to editor shortcut
            document.getElementById('cv-jump-editor').onclick = () => {
                document.querySelector('.tab-btn[data-tab="photo-editor"]').click();
            };

            // Accordion toggle logic
            document.querySelectorAll('.cv-accordion-header').forEach(header => {
                header.onclick = () => {
                    header.parentElement.classList.toggle('open');
                };
            });

            const getPlaceholder = (key) => {
                const placeholders = {
                    fullName: 'YOUR NAME',
                    jobTitle: 'Professional Title',
                    email: 'email@example.com',
                    phone: '+1 234 567 890',
                    location: 'Location, City',
                    linkedin: 'linkedin.com/in/username',
                    github: 'github.com/username',
                    portfolio: 'portfolio.dev',
                    summary: 'Describe your professional summary here. Introduce your expertise, years of experience, and main specialities.',
                    skills: 'React, Node.js, HTML, CSS, JavaScript, Git'
                };
                return placeholders[key] || '';
            };

            // Drag and drop photo position handlers
            const bindDragEvents = () => {
                const wrapper = preview.querySelector('.cv-photo-wrapper');
                if (!wrapper) return;
                
                wrapper.ondragstart = (e) => {
                    e.dataTransfer.setData('text/plain', 'photo');
                };

                preview.querySelectorAll('.cv-photo-dropzone').forEach(zone => {
                    zone.ondragover = (e) => {
                        e.preventDefault();
                        zone.style.background = 'rgba(79, 70, 229, 0.1)';
                        zone.style.border = '2px dashed var(--accent-primary)';
                    };
                    zone.ondragleave = () => {
                        zone.style.background = '';
                        zone.style.border = '';
                    };
                    zone.ondrop = (e) => {
                        e.preventDefault();
                        zone.style.background = '';
                        zone.style.border = '';
                        const data = e.dataTransfer.getData('text/plain');
                        if (data === 'photo') {
                            const newPos = zone.getAttribute('data-position');
                            resumeData.photoPosition = newPos;
                            posSel.value = newPos;
                            updatePreview();
                            utils.showToast(`Photo moved to ${newPos}`);
                        }
                    };
                });
            };

            const renderDropzone = (position) => {
                const isCurrent = resumeData.photoPosition === position;
                if (isCurrent && resumeData.photoShape !== 'none' && resumeData.profilePhoto) {
                    let borderRadius = '50%';
                    if (resumeData.photoShape === 'square') borderRadius = '0';
                    if (resumeData.photoShape === 'rounded') borderRadius = '12px';
                    return `
                        <div class="cv-photo-wrapper" draggable="true" style="display:block; cursor:grab; margin:0 auto 10px; width:100px; height:100px;">
                            <img src="${resumeData.profilePhoto}" style="width:100px; height:100px; object-fit:cover; border-radius:${borderRadius}; border:2px solid var(--accent-primary, #4f46e5); display:block;" />
                        </div>
                    `;
                }
                return `
                    <div class="cv-photo-dropzone" data-position="${position}" style="border:1px dashed rgba(0,0,0,0.1); border-radius:6px; padding:4px; min-width:100px; min-height:100px; display:flex; align-items:center; justify-content:center; font-size:8px; color:#94a3b8; margin:10px 0;">
                        Drop Photo
                    </div>
                `;
            };

            const updatePreview = () => {
                const isTwoColumn = ['corporate-blue', 'fullstack-developer', 'graphic-designer', 'glassmorphism', 'cyberpunk', 'dark-professional', 'portfolio-resume'].includes(resumeData.template);
                
                // Helper to render repeatable items
                const renderExperience = () => {
                    if (resumeData.experience.length === 0) return '';
                    return `
                        <div class="cv-section">
                            <h3 class="cv-section-title">Work History</h3>
                            ${resumeData.experience.map(exp => `
                                <div class="cv-item">
                                    <div class="cv-item-header">
                                        <span>${exp.title || 'Position'}</span>
                                        <span>${exp.startDate || ''} - ${exp.endDate || 'Present'}</span>
                                    </div>
                                    <div class="cv-item-sub">${exp.company || 'Company'}</div>
                                    <p style="font-size: 9px; margin-top: 2px; white-space: pre-wrap;">${exp.description || ''}</p>
                                </div>
                            `).join('')}
                        </div>
                    `;
                };

                const renderEducation = () => {
                    if (resumeData.education.length === 0) return '';
                    return `
                        <div class="cv-section">
                            <h3 class="cv-section-title">Education</h3>
                            ${resumeData.education.map(edu => `
                                <div class="cv-item">
                                    <div class="cv-item-header">
                                        <span>${edu.degree || 'Degree'}</span>
                                        <span>${edu.startDate || ''} - ${edu.endDate || ''}</span>
                                    </div>
                                    <div class="cv-item-sub">${edu.school || 'University'}</div>
                                </div>
                            `).join('')}
                        </div>
                    `;
                };

                const renderProjects = () => {
                    if (resumeData.projects.length === 0) return '';
                    return `
                        <div class="cv-section">
                            <h3 class="cv-section-title">Projects</h3>
                            ${resumeData.projects.map(proj => `
                                <div class="cv-item">
                                    <div class="cv-item-header">
                                        <span>${proj.name || 'Project Name'}</span>
                                        <span>${proj.date || ''}</span>
                                    </div>
                                    ${proj.link ? `<div class="cv-item-sub" style="font-size:8px;"><i class="fa-solid fa-link"></i> ${proj.link}</div>` : ''}
                                    <p style="font-size: 9px; margin-top: 2px; white-space: pre-wrap;">${proj.description || ''}</p>
                                </div>
                            `).join('')}
                        </div>
                    `;
                };

                const renderCertifications = () => {
                    if (resumeData.certifications.length === 0) return '';
                    return `
                        <div class="cv-section">
                            <h3 class="cv-section-title">Certifications</h3>
                            ${resumeData.certifications.map(cert => `
                                <div class="cv-item" style="margin-bottom:6px;">
                                    <div class="cv-item-header">
                                        <span>${cert.name || 'Certification'}</span>
                                        <span>${cert.date || ''}</span>
                                    </div>
                                    <div class="cv-item-sub">${cert.authority || 'Issuer'}</div>
                                </div>
                            `).join('')}
                        </div>
                    `;
                };

                const renderLanguages = () => {
                    if (resumeData.languages.length === 0) return '';
                    return `
                        <div class="cv-section">
                            <h3 class="cv-section-title">Languages</h3>
                            <div style="display:flex; flex-wrap:wrap; gap:6px; font-size:10px;">
                                ${resumeData.languages.map(lang => `
                                    <span style="background:rgba(0,0,0,0.05); padding:2px 6px; border-radius:4px; font-weight:600;">${lang.name} (${lang.level || 'Native'})</span>
                                `).join('')}
                            </div>
                        </div>
                    `;
                };

                const renderReferences = () => {
                    if (resumeData.references.length === 0) return '';
                    return `
                        <div class="cv-section">
                            <h3 class="cv-section-title">References</h3>
                            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                                ${resumeData.references.map(ref => `
                                    <div style="font-size: 9px;">
                                        <div style="font-weight:700;">${ref.name || 'Reference Name'}</div>
                                        <div style="color:#555;">${ref.company || 'Company'}</div>
                                        <div><i class="fa-solid fa-envelope" style="font-size:8px;"></i> ${ref.email || ''}</div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `;
                };

                const renderContactsList = () => {
                    return `
                        <div style="display:flex; flex-direction:column; gap:4px; font-size:10px; word-break:break-all;">
                            <span><i class="fa-solid fa-envelope" style="margin-right:6px; color:var(--accent-primary);"></i>${resumeData.email || getPlaceholder('email')}</span>
                            <span><i class="fa-solid fa-phone" style="margin-right:6px; color:var(--accent-primary);"></i>${resumeData.phone || getPlaceholder('phone')}</span>
                            <span><i class="fa-solid fa-location-dot" style="margin-right:6px; color:var(--accent-primary);"></i>${resumeData.location || getPlaceholder('location')}</span>
                            ${resumeData.linkedin ? `<span><i class="fa-brands fa-linkedin" style="margin-right:6px; color:var(--accent-primary);"></i>${resumeData.linkedin}</span>` : ''}
                            ${resumeData.github ? `<span><i class="fa-brands fa-github" style="margin-right:6px; color:var(--accent-primary);"></i>${resumeData.github}</span>` : ''}
                            ${resumeData.portfolio ? `<span><i class="fa-solid fa-earth-americas" style="margin-right:6px; color:var(--accent-primary);"></i>${resumeData.portfolio}</span>` : ''}
                        </div>
                    `;
                };

                const renderSkillsBadgeList = () => {
                    const sk = resumeData.skills || getPlaceholder('skills');
                    return `
                        <div style="display:flex; flex-wrap:wrap; gap:4px; margin-top:5px;">
                            ${sk.split(',').map(s => s.trim()).filter(Boolean).map(s => `
                                <span style="background:rgba(0,0,0,0.06); color:#333; padding:2px 6px; border-radius:4px; font-size:9px; font-weight:600;">${s}</span>
                            `).join('')}
                        </div>
                    `;
                };

                if (isTwoColumn) {
                    preview.innerHTML = `
                        <div class="cv-sidebar">
                            ${renderDropzone('left-sidebar')}
                            
                            <div class="cv-section">
                                <h3 class="cv-section-title">Contact</h3>
                                ${renderContactsList()}
                            </div>
                            
                            <div class="cv-section">
                                <h3 class="cv-section-title">Skills</h3>
                                ${renderSkillsBadgeList()}
                            </div>
                            
                            ${renderLanguages()}
                            ${renderReferences()}
                        </div>
                        <div class="cv-main">
                            <div class="cv-paper-header">
                                ${renderDropzone('top-header')}
                                <h1 style="margin:0; font-size:26px; font-weight:800; text-transform:uppercase; letter-spacing:0.5px;">${resumeData.fullName || getPlaceholder('fullName')}</h1>
                                <p style="margin:4px 0 0; font-size:13px; font-weight:600; color:#555;">${resumeData.jobTitle || getPlaceholder('jobTitle')}</p>
                                ${renderDropzone('right-corner')}
                            </div>
                            
                            <div class="cv-section">
                                <h3 class="cv-section-title">Profile Summary</h3>
                                <p style="font-size: 10px; line-height:1.5; white-space:pre-wrap;">${resumeData.summary || getPlaceholder('summary')}</p>
                            </div>
                            
                            ${renderExperience()}
                            ${renderEducation()}
                            ${renderProjects()}
                            ${renderCertifications()}
                        </div>
                    `;
                } else {
                    // Single Column layout
                    preview.innerHTML = `
                        <div class="cv-paper-header" style="position:relative; display:flex; justify-content:space-between; align-items:center;">
                            <div style="flex:1;">
                                ${renderDropzone('top-header')}
                                <h1 style="margin:0; font-size:28px; font-weight:800; text-transform:uppercase;">${resumeData.fullName || getPlaceholder('fullName')}</h1>
                                <p style="margin:4px 0 8px; font-size:14px; font-weight:600; color:#555;">${resumeData.jobTitle || getPlaceholder('jobTitle')}</p>
                                <div style="display:flex; flex-wrap:wrap; gap:12px; font-size:9px; color:#555;">
                                    <span><i class="fa-solid fa-envelope"></i> ${resumeData.email || getPlaceholder('email')}</span>
                                    <span><i class="fa-solid fa-phone"></i> ${resumeData.phone || getPlaceholder('phone')}</span>
                                    <span><i class="fa-solid fa-location-dot"></i> ${resumeData.location || getPlaceholder('location')}</span>
                                    ${resumeData.linkedin ? `<span><i class="fa-brands fa-linkedin"></i> ${resumeData.linkedin}</span>` : ''}
                                    ${resumeData.github ? `<span><i class="fa-brands fa-github"></i> ${resumeData.github}</span>` : ''}
                                    ${resumeData.portfolio ? `<span><i class="fa-solid fa-earth-americas"></i> ${resumeData.portfolio}</span>` : ''}
                                </div>
                            </div>
                            ${renderDropzone('right-corner')}
                        </div>
                        
                        <div class="cv-section">
                            <h3 class="cv-section-title">Professional Summary</h3>
                            <p style="font-size: 10px; line-height:1.5; white-space:pre-wrap;">${resumeData.summary || getPlaceholder('summary')}</p>
                        </div>
                        
                        <div style="display:grid; grid-template-columns: 2fr 1fr; gap:20px;">
                            <div>
                                ${renderExperience()}
                                ${renderProjects()}
                            </div>
                            <div>
                                <div class="cv-section">
                                    <h3 class="cv-section-title">Skills</h3>
                                    ${renderSkillsBadgeList()}
                                </div>
                                ${renderEducation()}
                                ${renderCertifications()}
                                ${renderLanguages()}
                            </div>
                        </div>
                        
                        ${renderReferences()}
                    `;
                }

                bindDragEvents();
            };

            const syncInputs = () => {
                resumeData.fullName = fullNameIn.value;
                resumeData.jobTitle = jobTitleIn.value;
                resumeData.email = emailIn.value;
                resumeData.phone = phoneIn.value;
                resumeData.location = locationIn.value;
                resumeData.linkedin = linkedinIn.value;
                resumeData.github = githubIn.value;
                resumeData.portfolio = portfolioIn.value;
                resumeData.summary = summaryIn.value;
                resumeData.skills = skillsIn.value;
                resumeData.photoShape = shapeSel.value;
                resumeData.photoPosition = posSel.value;
                updatePreview();
            };

            [fullNameIn, jobTitleIn, emailIn, phoneIn, locationIn, linkedinIn, githubIn, portfolioIn, summaryIn, skillsIn, shapeSel, posSel].forEach(el => {
                el.oninput = syncInputs;
                el.onchange = syncInputs;
            });

            // Template selector trigger
            document.querySelectorAll('.cv-tpl-thumb').forEach(thumb => {
                thumb.onclick = () => {
                    document.querySelectorAll('.cv-tpl-thumb').forEach(t => t.classList.remove('active'));
                    thumb.classList.add('active');
                    const tpl = thumb.getAttribute('data-tpl');
                    resumeData.template = tpl;
                    
                    const classes = preview.className.split(' ').filter(c => !c.startsWith('tpl-'));
                    preview.className = [...classes, `tpl-${tpl}`].join(' ');
                    updatePreview();
                };
            });

            // Profile photo input change
            document.getElementById('cv-photo-file').onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (evt) => {
                        resumeData.profilePhoto = evt.target.result;
                        updatePreview();
                    };
                    reader.readAsDataURL(file);
                }
            };

            // Experience dynamic items list logic
            window.cvAddExpItem = (id, title = '', company = '', start = '', end = '', desc = '') => {
                const item = document.createElement('div');
                item.className = 'cv-dynamic-item';
                item.id = `cvexp-${id}`;
                item.innerHTML = `
                    <i class="fa-solid fa-times cv-remove-btn" onclick="window.cvRemoveExp(${id})"></i>
                    <div class="form-group" style="margin-bottom:6px;">
                        <label>Job Title</label>
                        <input type="text" value="${title}" oninput="window.cvUpdateExp(${id}, 'title', this.value)" placeholder="Senior Developer">
                    </div>
                    <div class="form-group" style="margin-bottom:6px;">
                        <label>Company</label>
                        <input type="text" value="${company}" oninput="window.cvUpdateExp(${id}, 'company', this.value)" placeholder="Tech Corp">
                    </div>
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; margin-bottom:6px;">
                        <div class="form-group">
                            <label>Start Date</label>
                            <input type="text" value="${start}" oninput="window.cvUpdateExp(${id}, 'startDate', this.value)" placeholder="Jan 2020">
                        </div>
                        <div class="form-group">
                            <label>End Date</label>
                            <input type="text" value="${end}" oninput="window.cvUpdateExp(${id}, 'endDate', this.value)" placeholder="Present">
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Description</label>
                        <textarea oninput="window.cvUpdateExp(${id}, 'description', this.value)" rows="2" placeholder="Responsibilities...">${desc}</textarea>
                    </div>
                `;
                expContainer.appendChild(item);
            };

            window.cvUpdateExp = (id, field, value) => {
                const exp = resumeData.experience.find(e => e.id === id);
                if (exp) {
                    exp[field] = value;
                    updatePreview();
                }
            };

            window.cvRemoveExp = (id) => {
                resumeData.experience = resumeData.experience.filter(e => e.id !== id);
                const el = document.getElementById(`cvexp-${id}`);
                if (el) el.remove();
                updatePreview();
            };

            document.getElementById('cv-add-exp').onclick = () => {
                const id = Date.now();
                resumeData.experience.push({ id, title: '', company: '', startDate: '', endDate: '', description: '' });
                window.cvAddExpItem(id);
                updatePreview();
            };

            // Education repeatables
            window.cvAddEduItem = (id, degree = '', school = '', start = '', end = '') => {
                const item = document.createElement('div');
                item.className = 'cv-dynamic-item';
                item.id = `cvedu-${id}`;
                item.innerHTML = `
                    <i class="fa-solid fa-times cv-remove-btn" onclick="window.cvRemoveEdu(${id})"></i>
                    <div class="form-group" style="margin-bottom:6px;">
                        <label>Degree / Major</label>
                        <input type="text" value="${degree}" oninput="window.cvUpdateEdu(${id}, 'degree', this.value)" placeholder="B.S. Computer Science">
                    </div>
                    <div class="form-group" style="margin-bottom:6px;">
                        <label>School / University</label>
                        <input type="text" value="${school}" oninput="window.cvUpdateEdu(${id}, 'school', this.value)" placeholder="Harvard University">
                    </div>
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px;">
                        <div class="form-group">
                            <label>Start Date</label>
                            <input type="text" value="${start}" oninput="window.cvUpdateEdu(${id}, 'startDate', this.value)" placeholder="2016">
                        </div>
                        <div class="form-group">
                            <label>End Date</label>
                            <input type="text" value="${end}" oninput="window.cvUpdateEdu(${id}, 'endDate', this.value)" placeholder="2020">
                        </div>
                    </div>
                `;
                eduContainer.appendChild(item);
            };

            window.cvUpdateEdu = (id, field, value) => {
                const edu = resumeData.education.find(e => e.id === id);
                if (edu) {
                    edu[field] = value;
                    updatePreview();
                }
            };

            window.cvRemoveEdu = (id) => {
                resumeData.education = resumeData.education.filter(e => e.id !== id);
                const el = document.getElementById(`cvedu-${id}`);
                if (el) el.remove();
                updatePreview();
            };

            document.getElementById('cv-add-edu').onclick = () => {
                const id = Date.now();
                resumeData.education.push({ id, degree: '', school: '', startDate: '', endDate: '' });
                window.cvAddEduItem(id);
                updatePreview();
            };

            // Projects repeatables
            window.cvAddProjItem = (id, name = '', link = '', date = '', desc = '') => {
                const item = document.createElement('div');
                item.className = 'cv-dynamic-item';
                item.id = `cvproj-${id}`;
                item.innerHTML = `
                    <i class="fa-solid fa-times cv-remove-btn" onclick="window.cvRemoveProj(${id})"></i>
                    <div class="form-group" style="margin-bottom:6px;">
                        <label>Project Name</label>
                        <input type="text" value="${name}" oninput="window.cvUpdateProj(${id}, 'name', this.value)" placeholder="E-Commerce System">
                    </div>
                    <div class="form-group" style="margin-bottom:6px;">
                        <label>Project Link</label>
                        <input type="text" value="${link}" oninput="window.cvUpdateProj(${id}, 'link', this.value)" placeholder="github.com/my-project">
                    </div>
                    <div class="form-group" style="margin-bottom:6px;">
                        <label>Completion Date</label>
                        <input type="text" value="${date}" oninput="window.cvUpdateProj(${id}, 'date', this.value)" placeholder="Dec 2021">
                    </div>
                    <div class="form-group">
                        <label>Description</label>
                        <textarea oninput="window.cvUpdateProj(${id}, 'description', this.value)" rows="2" placeholder="Describe project achievements...">${desc}</textarea>
                    </div>
                `;
                projContainer.appendChild(item);
            };

            window.cvUpdateProj = (id, field, value) => {
                const proj = resumeData.projects.find(p => p.id === id);
                if (proj) {
                    proj[field] = value;
                    updatePreview();
                }
            };

            window.cvRemoveProj = (id) => {
                resumeData.projects = resumeData.projects.filter(p => p.id !== id);
                const el = document.getElementById(`cvproj-${id}`);
                if (el) el.remove();
                updatePreview();
            };

            document.getElementById('cv-add-proj').onclick = () => {
                const id = Date.now();
                resumeData.projects.push({ id, name: '', link: '', date: '', description: '' });
                window.cvAddProjItem(id);
                updatePreview();
            };

            // Certifications repeatables
            window.cvAddCertItem = (id, name = '', authority = '', date = '') => {
                const item = document.createElement('div');
                item.className = 'cv-dynamic-item';
                item.id = `cvcert-${id}`;
                item.innerHTML = `
                    <i class="fa-solid fa-times cv-remove-btn" onclick="window.cvRemoveCert(${id})"></i>
                    <div class="form-group" style="margin-bottom:6px;">
                        <label>Certification Name</label>
                        <input type="text" value="${name}" oninput="window.cvUpdateCert(${id}, 'name', this.value)" placeholder="AWS Certified Architect">
                    </div>
                    <div class="form-group" style="margin-bottom:6px;">
                        <label>Issuing Authority</label>
                        <input type="text" value="${authority}" oninput="window.cvUpdateCert(${id}, 'authority', this.value)" placeholder="Amazon Web Services">
                    </div>
                    <div class="form-group">
                        <label>Date Earned</label>
                        <input type="text" value="${date}" oninput="window.cvUpdateCert(${id}, 'date', this.value)" placeholder="2021">
                    </div>
                `;
                certContainer.appendChild(item);
            };

            window.cvUpdateCert = (id, field, value) => {
                const cert = resumeData.certifications.find(c => c.id === id);
                if (cert) {
                    cert[field] = value;
                    updatePreview();
                }
            };

            window.cvRemoveCert = (id) => {
                resumeData.certifications = resumeData.certifications.filter(c => c.id !== id);
                const el = document.getElementById(`cvcert-${id}`);
                if (el) el.remove();
                updatePreview();
            };

            document.getElementById('cv-add-cert').onclick = () => {
                const id = Date.now();
                resumeData.certifications.push({ id, name: '', authority: '', date: '' });
                window.cvAddCertItem(id);
                updatePreview();
            };

            // Languages repeatables
            window.cvAddLangItem = (id, name = '', level = 'Native') => {
                const item = document.createElement('div');
                item.className = 'cv-dynamic-item';
                item.id = `cvlang-${id}`;
                item.innerHTML = `
                    <i class="fa-solid fa-times cv-remove-btn" onclick="window.cvRemoveLang(${id})"></i>
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px;">
                        <div class="form-group">
                            <label>Language</label>
                            <input type="text" value="${name}" oninput="window.cvUpdateLang(${id}, 'name', this.value)" placeholder="English">
                        </div>
                        <div class="form-group">
                            <label>Level</label>
                            <input type="text" value="${level}" oninput="window.cvUpdateLang(${id}, 'level', this.value)" placeholder="Native / Fluent">
                        </div>
                    </div>
                `;
                langContainer.appendChild(item);
            };

            window.cvUpdateLang = (id, field, value) => {
                const lang = resumeData.languages.find(l => l.id === id);
                if (lang) {
                    lang[field] = value;
                    updatePreview();
                }
            };

            window.cvRemoveLang = (id) => {
                resumeData.languages = resumeData.languages.filter(l => l.id !== id);
                const el = document.getElementById(`cvlang-${id}`);
                if (el) el.remove();
                updatePreview();
            };

            document.getElementById('cv-add-lang').onclick = () => {
                const id = Date.now();
                resumeData.languages.push({ id, name: '', level: 'Native' });
                window.cvAddLangItem(id);
                updatePreview();
            };

            // References repeatables
            window.cvAddRefItem = (id, name = '', company = '', email = '') => {
                const item = document.createElement('div');
                item.className = 'cv-dynamic-item';
                item.id = `cvref-${id}`;
                item.innerHTML = `
                    <i class="fa-solid fa-times cv-remove-btn" onclick="window.cvRemoveRef(${id})"></i>
                    <div class="form-group" style="margin-bottom:6px;">
                        <label>Reference Name</label>
                        <input type="text" value="${name}" oninput="window.cvUpdateRef(${id}, 'name', this.value)" placeholder="Dr. Jane Smith">
                    </div>
                    <div class="form-group" style="margin-bottom:6px;">
                        <label>Company / Title</label>
                        <input type="text" value="${company}" oninput="window.cvUpdateRef(${id}, 'company', this.value)" placeholder="Professor at MIT">
                    </div>
                    <div class="form-group">
                        <label>Contact Email/Phone</label>
                        <input type="text" value="${email}" oninput="window.cvUpdateRef(${id}, 'email', this.value)" placeholder="jane.smith@mit.edu">
                    </div>
                `;
                refContainer.appendChild(item);
            };

            window.cvUpdateRef = (id, field, value) => {
                const ref = resumeData.references.find(r => r.id === id);
                if (ref) {
                    ref[field] = value;
                    updatePreview();
                }
            };

            window.cvRemoveRef = (id) => {
                resumeData.references = resumeData.references.filter(r => r.id !== id);
                const el = document.getElementById(`cvref-${id}`);
                if (el) el.remove();
                updatePreview();
            };

            document.getElementById('cv-add-ref').onclick = () => {
                const id = Date.now();
                resumeData.references.push({ id, name: '', company: '', email: '' });
                window.cvAddRefItem(id);
                updatePreview();
            };

            // Zoom controls based on screen width
            let isMobile = window.innerWidth <= 1024;
            let zoom = isMobile ? 0.45 : 0.75;
            const zoomValEl = document.getElementById('cv-zoom-level');
            preview.style.transform = `scale(${zoom})`;
            zoomValEl.textContent = `${Math.round(zoom * 100)}%`;

            document.getElementById('cv-zoom-in').onclick = () => {
                zoom = Math.min(zoom + 0.1, 1.3);
                preview.style.transform = `scale(${zoom})`;
                zoomValEl.textContent = `${Math.round(zoom * 100)}%`;
            };
            document.getElementById('cv-zoom-out').onclick = () => {
                zoom = Math.max(zoom - 0.1, 0.4);
                preview.style.transform = `scale(${zoom})`;
                zoomValEl.textContent = `${Math.round(zoom * 100)}%`;
            };

            // --- PHOTO EDITOR LOGIC ---
            const peCanvas = document.getElementById('pe-canvas');
            const peCtx = peCanvas.getContext('2d');
            const peBrightness = document.getElementById('pe-brightness');
            const peContrast = document.getElementById('pe-contrast');
            const peCropPreset = document.getElementById('pe-crop-preset');
            const peFileIn = document.getElementById('pe-file-input');
            let peImageObj = null;

            const drawEditorImage = () => {
                if (!peImageObj) return;
                peCanvas.width = peImageObj.width;
                peCanvas.height = peImageObj.height;
                peCtx.clearRect(0, 0, peCanvas.width, peCanvas.height);
                peCtx.drawImage(peImageObj, 0, 0);

                // Pixel operations for filters
                const imgData = peCtx.getImageData(0, 0, peCanvas.width, peCanvas.height);
                const data = imgData.data;
                const b = parseInt(peBrightness.value);
                const c = parseInt(peContrast.value);

                const factor = (259 * (c + 255)) / (255 * (259 - c));

                for (let i = 0; i < data.length; i += 4) {
                    let r = data[i] + b;
                    let g = data[i+1] + b;
                    let bl = data[i+2] + b;

                    r = factor * (r - 128) + 128;
                    g = factor * (g - 128) + 128;
                    bl = factor * (bl - 128) + 128;

                    data[i] = Math.min(255, Math.max(0, r));
                    data[i+1] = Math.min(255, Math.max(0, g));
                    data[i+2] = Math.min(255, Math.max(0, bl));
                }
                peCtx.putImageData(imgData, 0, 0);
            };

            const loadEditorPhoto = (file) => {
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (evt) => {
                    peImageObj = new Image();
                    peImageObj.onload = () => {
                        drawEditorImage();
                    };
                    peImageObj.src = evt.target.result;
                };
                reader.readAsDataURL(file);
            };

            peFileIn.onchange = (e) => loadEditorPhoto(e.target.files[0]);
            peBrightness.oninput = drawEditorImage;
            peContrast.oninput = drawEditorImage;

            document.getElementById('pe-reset-btn').onclick = () => {
                peBrightness.value = 0;
                peContrast.value = 0;
                drawEditorImage();
                utils.showToast('Adjustments reset');
            };

            document.getElementById('pe-apply-btn').onclick = () => {
                if (!peImageObj) {
                    utils.showToast('Please upload an image first!', 'error');
                    return;
                }

                // Aspect ratio crop parameters
                const preset = peCropPreset.value;
                let cropW = peCanvas.width;
                let cropH = peCanvas.height;
                let targetW = 300;
                let targetH = 300;

                if (preset === 'square-300') {
                    cropW = Math.min(peCanvas.width, peCanvas.height);
                    cropH = cropW;
                    targetW = 300;
                    targetH = 300;
                } else if (preset === 'square-500') {
                    cropW = Math.min(peCanvas.width, peCanvas.height);
                    cropH = cropW;
                    targetW = 500;
                    targetH = 500;
                } else if (preset === 'passport') {
                    if (peCanvas.width / peCanvas.height > 2/3) {
                        cropH = peCanvas.height;
                        cropW = cropH * (2/3);
                    } else {
                        cropW = peCanvas.width;
                        cropH = cropW * (3/2);
                    }
                    targetW = 300;
                    targetH = 450;
                } else if (preset === 'linkedin') {
                    cropW = Math.min(peCanvas.width, peCanvas.height);
                    cropH = cropW;
                    targetW = 400;
                    targetH = 400;
                }

                const cropX = (peCanvas.width - cropW) / 2;
                const cropY = (peCanvas.height - cropH) / 2;

                const cropCanvas = document.createElement('canvas');
                cropCanvas.width = targetW;
                cropCanvas.height = targetH;
                const cropCtx = cropCanvas.getContext('2d');

                cropCtx.drawImage(peCanvas, cropX, cropY, cropW, cropH, 0, 0, targetW, targetH);
                
                const croppedDataURL = cropCanvas.toDataURL('image/jpeg', 0.9);
                resumeData.profilePhoto = croppedDataURL;
                updatePreview();

                utils.showToast('Photo cropped and applied to CV!');
                // Switch back to CV panel
                document.querySelector('.tab-btn[data-tab="paper-cv"]').click();
            };

            // --- EMAIL COVER LETTER BUILDER ---
            const elCompany = document.getElementById('el-company');
            const elHrManager = document.getElementById('el-hr-manager');
            const elJobTitle = document.getElementById('el-job-title');
            const elTemplateType = document.getElementById('el-template-type');
            const elTone = document.getElementById('el-tone');
            
            const elSubject = document.getElementById('el-preview-subject');
            const elBody = document.getElementById('el-preview-body');

            const updateEmailPreview = () => {
                const comp = elCompany.value || '[Company Name]';
                const hr = elHrManager.value || 'Hiring Manager';
                const job = elJobTitle.value || '[Target Job Title]';
                const myName = resumeData.fullName || '[Your Name]';
                const myTitle = resumeData.jobTitle || '[Your Professional Title]';
                const mySkills = resumeData.skills || '[Your Key Skills]';
                const tone = elTone.value;
                const type = elTemplateType.value;

                let subject = '';
                let body = '';

                if (type === 'professional') {
                    subject = `Application for ${job} - ${myName}`;
                    body = tone === 'formal' ? 
                        `Dear ${hr},\n\nI am writing to express my enthusiastic interest in the ${job} position at ${comp}. As a dedicated ${myTitle} with expertise in ${mySkills}, I believe my background matches the needs of your engineering team.\n\nOver the course of my career, I have focused on delivering optimized performance and clean implementations. I would welcome the opportunity to discuss how my qualifications align with your company goals.\n\nPlease find attached my CV for your review.\n\nSincerely,\n${myName}\n${myTitle}` :
                        `Hi ${hr},\n\nI wanted to reach out regarding the ${job} role at ${comp}. I am a passionate ${myTitle} with hands-on experience in ${mySkills}, and I would love to bring my drive for innovation to your team.\n\nMy focus has always been on solving complex challenges and creating valuable products. Please see my attached CV for detail on my projects.\n\nBest,\n${myName}\n${myTitle}`;
                } else if (type === 'internship') {
                    subject = `Internship Application: ${job} - ${myName}`;
                    body = `Dear ${hr},\n\nI am writing to apply for the ${job} internship opportunity at ${comp}. I am currently pursuing my career path as a ${myTitle} and have spent extensive time developing skills in ${mySkills}.\n\nI am eager to learn from your team while contributing to active projects. My academic and personal work has prepared me to quickly adapt to your environment.\n\nMy resume is attached to this email.\n\nBest regards,\n${myName}`;
                } else if (type === 'fresh-grad') {
                    subject = `Job Application: ${job} (Fresh Graduate) - ${myName}`;
                    body = `Dear ${hr},\n\nAs a recent graduate in this field, I am eager to apply for the ${job} opening at ${comp}. Throughout my educational studies, I built strong fundamentals in ${mySkills} and completed several notable practical projects.\n\nI am eager to launch my career with ${comp} and contribute with my fresh perspective and dedication.\n\nPlease review my attached CV. Thank you for your time.\n\nKind regards,\n${myName}`;
                } else if (type === 'follow-up') {
                    subject = `Follow-Up: Application for ${job} - ${myName}`;
                    body = `Dear ${hr},\n\nI hope you are having a productive week.\n\nI am writing to briefly check in on the status of my application for the ${job} position at ${comp} that I submitted recently.\n\nI remain highly interested in joining the team and would love to know if there are any next steps or additional information I can provide.\n\nThank you again for your time and consideration.\n\nBest regards,\n${myName}`;
                } else if (type === 'thank-you') {
                    subject = `Thank You: Interview for ${job} - ${myName}`;
                    body = `Dear ${hr},\n\nThank you for taking the time to speak with me today about the ${job} position at ${comp}. I thoroughly enjoyed learning more about your goals and the projects ahead.\n\nOur conversation confirmed my enthusiasm for the role. Please feel free to reach out if you need any further references or portfolio samples.\n\nBest regards,\n${myName}`;
                }

                elSubject.textContent = subject;
                elBody.textContent = body;
            };

            [elCompany, elHrManager, elJobTitle, elTemplateType, elTone].forEach(el => {
                el.oninput = updateEmailPreview;
                el.onchange = updateEmailPreview;
            });

            document.getElementById('el-copy-btn').onclick = () => {
                const fullText = `Subject: ${elSubject.textContent}\n\n${elBody.textContent}`;
                utils.copyText(fullText);
                window.incrementStatsRun();
            };

            document.getElementById('el-export-pdf').onclick = () => {
                const comp = elCompany.value || 'Company';
                const { jsPDF } = window.jspdf;
                const pdf = new jsPDF('p', 'mm', 'a4');
                pdf.setFont('helvetica');
                pdf.setFontSize(11);
                
                pdf.text(`Subject: ${elSubject.textContent}`, 20, 25);
                pdf.line(20, 28, 190, 28);
                
                const splitText = pdf.splitTextToSize(elBody.textContent, 170);
                pdf.text(splitText, 20, 38);
                
                pdf.save(`cover_letter_${comp.toLowerCase().replace(/\s+/g, '_')}.pdf`);
                utils.showToast('Cover Letter PDF downloaded!');
                window.incrementStatsRun();
            };

            // --- ATS & KEYWORD SCANNER ---
            const runATSScan = () => {
                const role = document.getElementById('ats-job-role').value;
                
                // Score calculations
                let score = 20; // Base score
                const feedback = [];
                
                if (resumeData.fullName) { score += 10; feedback.push('✅ Full Name is included.'); }
                else { feedback.push('❌ Missing Full Name.'); }
                
                if (resumeData.jobTitle) { score += 10; feedback.push('✅ Job Title is defined.'); }
                else { feedback.push('❌ Missing Job Title.'); }
                
                if (resumeData.email && resumeData.phone) { score += 15; feedback.push('✅ Complete contact details present.'); }
                else { score += 5; feedback.push('⚠️ Missing either Email or Phone Number.'); }
                
                if (resumeData.linkedin || resumeData.github) { score += 10; feedback.push('✅ Online professional profiles included.'); }
                else { feedback.push('⚠️ No LinkedIn or GitHub profile link.'); }
                
                if (resumeData.summary && resumeData.summary.length > 50) { score += 15; feedback.push('✅ Detailed professional summary provided.'); }
                else { score += 5; feedback.push('⚠️ Professional summary is too short or missing.'); }
                
                if (resumeData.experience.length >= 2) { score += 15; feedback.push('✅ Solid work history checklist (2+ items).'); }
                else if (resumeData.experience.length === 1) { score += 10; feedback.push('⚠️ Only one work history item listed.'); }
                else { feedback.push('❌ No work history listed. ATS scores heavily on experience.'); }
                
                if (resumeData.education.length >= 1) { score += 10; feedback.push('✅ Education history provided.'); }
                else { feedback.push('❌ Education details missing.'); }
                
                // Safely convert skills to string representation
                let skillsString = '';
                if (Array.isArray(resumeData.skills)) {
                    skillsString = resumeData.skills.map(s => {
                        if (s && typeof s === 'object') return s.name || '';
                        return s || '';
                    }).filter(Boolean).join(', ');
                } else if (typeof resumeData.skills === 'string') {
                    skillsString = resumeData.skills;
                }

                if (skillsString.split(',').length >= 4) { score += 5; }

                // Keywords dictionary
                const roleKeywords = {
                    'software-engineer': ['Algorithms', 'Git', 'Data Structures', 'OOP', 'Software Design', 'Architecture'],
                    'frontend': ['React', 'HTML', 'CSS', 'JavaScript', 'TypeScript', 'Webpack', 'Responsive Design'],
                    'backend': ['Node.js', 'Express', 'Python', 'SQL', 'MongoDB', 'REST API', 'Docker'],
                    'uiux': ['Figma', 'Wireframing', 'Prototyping', 'User Research', 'UI Design', 'Usability Testing'],
                    'data-analyst': ['Python', 'R', 'SQL', 'Excel', 'Tableau', 'Data Visualization', 'Statistics'],
                    'finance': ['Excel', 'Auditing', 'Balance Sheet', 'Ledger', 'Taxes', 'QuickBooks', 'Accounting']
                };

                const targetKeywords = roleKeywords[role] || [];
                const skillsText = skillsString.toLowerCase();
                const matched = [];
                const missing = [];

                targetKeywords.forEach(kw => {
                    if (skillsText.includes(kw.toLowerCase())) {
                        matched.push(kw);
                        score += 3; // Add bonus points for matched keywords
                    } else {
                        missing.push(kw);
                    }
                });

                // Cap score
                score = Math.min(score, 100);

                // Update UI elements
                const circle = document.getElementById('ats-progress-circle');
                const scoreText = document.getElementById('ats-score-text');
                const verdict = document.getElementById('ats-verdict');
                
                const matchedContainer = document.getElementById('ats-matched-keys');
                const missingContainer = document.getElementById('ats-missing-keys');
                const checklistContainer = document.getElementById('ats-checklist');

                // Animate SVG circle (radius 50 has circumference of ~314.16)
                const offset = 314.16 - (score / 100) * 314.16;
                circle.style.strokeDashoffset = offset;
                scoreText.textContent = `${score}%`;

                if (score >= 80) {
                    verdict.textContent = 'Excellent ATS Compatibility! 🎉';
                    verdict.style.color = '#34d399';
                } else if (score >= 60) {
                    verdict.textContent = 'Good. Ready for minor improvements 👍';
                    verdict.style.color = '#fbbf24';
                } else {
                    verdict.textContent = 'Low ATS Score. Action required! ⚠️';
                    verdict.style.color = '#f87171';
                }

                // Render keywords
                matchedContainer.innerHTML = matched.length > 0 ? 
                    matched.map(k => `<span style="background:rgba(52,211,153,0.15); color:#34d399; font-size:9px; font-weight:700; padding:2px 6px; border-radius:4px;">${k}</span>`).join('') :
                    '<span style="font-size:9px; color:var(--text-secondary);">No matched keywords.</span>';

                missingContainer.innerHTML = missing.length > 0 ? 
                    missing.map(k => `<span style="background:rgba(248,113,113,0.15); color:#f87171; font-size:9px; font-weight:700; padding:2px 6px; border-radius:4px;">${k}</span>`).join('') :
                    '<span style="font-size:9px; color:var(--text-secondary);">Excellent, you match all core keywords!</span>';

                // Render checklist
                checklistContainer.innerHTML = feedback.map(item => `
                    <div style="font-size:10px; color:${item.startsWith('✅') ? '#a7f3d0' : (item.startsWith('⚠️') ? '#fef3c7' : '#fca5a5')}">${item}</div>
                `).join('');
            };

            document.getElementById('ats-scan-btn').onclick = () => {
                runATSScan();
                utils.showToast('Resume scanned!');
                window.incrementStatsRun();
            };

            // AI suggestions implementation
            document.getElementById('ai-improve-summary').onclick = () => {
                const title = resumeData.jobTitle || 'Professional';
                const improved = `Results-oriented ${title} with a proven track record of designing high-impact solutions, collaborating across cross-functional teams, and driving core product deliveries. Highly skilled in leveraging modern industry tools and methodologies to optimize performance and engineer business success.`;
                resumeData.summary = improved;
                summaryIn.value = improved;
                updatePreview();
                utils.showToast('AI improved summary applied!');
            };

            document.getElementById('ai-improve-exp').onclick = () => {
                if (resumeData.experience.length === 0) {
                    utils.showToast('Please add at least one experience item first!', 'error');
                    return;
                }
                resumeData.experience.forEach(exp => {
                    exp.description = `• Led the design, development, and implementation of scale-critical software systems.\n• Collaborated closely with cross-functional teams to engineer optimized solutions.\n• Improved development processes, cutting cycle load times by approximately 25%.\n• Authored clean, maintainable, and comprehensively documented code.`;
                });
                // Re-render experiences list elements
                expContainer.innerHTML = '';
                resumeData.experience.forEach(exp => {
                    window.cvAddExpItem(exp.id, exp.title, exp.company, exp.startDate, exp.endDate, exp.description);
                });
                updatePreview();
                utils.showToast('AI polished experience bullet points!');
            };

            document.getElementById('ai-improve-skills').onclick = () => {
                const role = document.getElementById('ats-job-role').value;
                const roleKeywords = {
                    'software-engineer': 'Algorithms, Git, Data Structures, OOP, Software Design, Architecture',
                    'frontend': 'React, HTML, CSS, JavaScript, TypeScript, Webpack, Responsive Design',
                    'backend': 'Node.js, Express, Python, SQL, MongoDB, REST API, Docker',
                    'uiux': 'Figma, Wireframing, Prototyping, User Research, UI Design, Usability Testing',
                    'data-analyst': 'Python, R, SQL, Excel, Tableau, Data Visualization, Statistics',
                    'finance': 'Excel, Auditing, Balance Sheet, Ledger, Taxes, QuickBooks, Accounting'
                };
                const newSkills = roleKeywords[role] || 'React, Git, SQL';
                resumeData.skills = newSkills;
                skillsIn.value = newSkills;
                updatePreview();
                utils.showToast('ATS target skills auto-filled!');
            };

            // --- IMPORT & EXPORTS PIPELINES ---
            // Save draft
            document.getElementById('cv-save').onclick = () => {
                localStorage.setItem('meytool_cv_data_premium', JSON.stringify(resumeData));
                utils.showToast('Resume draft saved locally!');
            };

            // Clear form
            document.getElementById('cv-clear').onclick = () => {
                if (confirm('Are you sure you want to clear all resume fields?')) {
                    localStorage.removeItem('meytool_cv_data_premium');
                    resumeData = {
                        template: 'minimal-ats',
                        fullName: '',
                        jobTitle: '',
                        email: '',
                        phone: '',
                        location: '',
                        linkedin: '',
                        github: '',
                        portfolio: '',
                        summary: '',
                        skills: '',
                        profilePhoto: '',
                        photoShape: 'circle',
                        photoPosition: 'left-sidebar',
                        experience: [],
                        education: [],
                        projects: [],
                        certifications: [],
                        languages: [],
                        references: []
                    };
                    fullNameIn.value = '';
                    jobTitleIn.value = '';
                    emailIn.value = '';
                    phoneIn.value = '';
                    locationIn.value = '';
                    linkedinIn.value = '';
                    githubIn.value = '';
                    portfolioIn.value = '';
                    summaryIn.value = '';
                    skillsIn.value = '';
                    shapeSel.value = 'circle';
                    posSel.value = 'left-sidebar';
                    expContainer.innerHTML = '';
                    eduContainer.innerHTML = '';
                    projContainer.innerHTML = '';
                    certContainer.innerHTML = '';
                    langContainer.innerHTML = '';
                    refContainer.innerHTML = '';
                    updatePreview();
                    utils.showToast('Resume fields cleared', 'info');
                }
            };

            // Export PDF
            document.getElementById('cv-export-pdf').onclick = async () => {
                const btn = document.getElementById('cv-export-pdf');
                btn.disabled = true;
                utils.showToast('Compiling high-resolution multi-page PDF...');

                try {
                    const originalTransform = preview.style.transform;
                    preview.style.transform = 'scale(1.0)';
                    preview.classList.add('pdf-export-mode');

                    const canvas = await html2canvas(preview, {
                        scale: 2,
                        useCORS: true
                    });

                    preview.style.transform = originalTransform;
                    preview.classList.remove('pdf-export-mode');

                    const imgWidth = 210;
                    const pageHeight = 297;
                    const imgHeight = (canvas.height * imgWidth) / canvas.width;
                    let heightLeft = imgHeight;

                    const { jsPDF } = window.jspdf;
                    const pdf = new jsPDF('p', 'mm', 'a4');
                    let position = 0;

                    const imgData = canvas.toDataURL('image/jpeg', 0.95);

                    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
                    heightLeft -= pageHeight;

                    while (heightLeft >= 0) {
                        position = heightLeft - imgHeight;
                        pdf.addPage();
                        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
                        heightLeft -= pageHeight;
                    }

                    pdf.save((resumeData.fullName || 'resume').toLowerCase().replace(/\s+/g, '_') + '_cv.pdf');
                    utils.showToast('PDF downloaded successfully!');
                    window.incrementStatsRun();
                } catch (err) {
                    utils.showToast('PDF generation failed: ' + err.message, 'error');
                } finally {
                    btn.disabled = false;
                }
            };

            // Export JSON
            document.getElementById('cv-export-html').onclick = () => {
                const styles = Array.from(document.querySelectorAll('style')).map(s => s.innerHTML).join('\n');
                const htmlContent = `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>${resumeData.fullName || 'Resume'}</title>
                        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
                        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono&display=swap" rel="stylesheet">
                        <style>
                            body { background: #f3f4f6; padding: 20px; display:flex; justify-content:center; }
                            .cv-resume-paper { width: 210mm; min-height: 297mm; background: white; padding: 20mm; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                            ${styles}
                        </style>
                    </head>
                    <body>
                        <div class="cv-resume-paper tpl-${resumeData.template}">
                            ${preview.innerHTML}
                        </div>
                    </body>
                    </html>
                `;
                utils.downloadFile(htmlContent, `${(resumeData.fullName || 'resume').toLowerCase().replace(/\s+/g, '_')}.html`, 'text/html');
                window.incrementStatsRun();
            };

            // Export PNG
            document.getElementById('cv-export-png').onclick = async () => {
                utils.showToast('Generating PNG image...');
                try {
                    const originalTransform = preview.style.transform;
                    preview.style.transform = 'scale(1.0)';
                    preview.classList.add('pdf-export-mode');

                    const canvas = await html2canvas(preview, {
                        scale: 2,
                        useCORS: true
                    });

                    preview.style.transform = originalTransform;
                    preview.classList.remove('pdf-export-mode');

                    const link = document.createElement('a');
                    link.download = `${(resumeData.fullName || 'resume').toLowerCase().replace(/\s+/g, '_')}.png`;
                    link.href = canvas.toDataURL('image/png');
                    link.click();
                    utils.showToast('PNG downloaded!');
                    window.incrementStatsRun();
                } catch (e) {
                    utils.showToast('PNG export failed', 'error');
                }
            };

            // Print CV
            document.getElementById('cv-print').onclick = () => {
                const printWin = window.open('', '', 'width=900,height=700');
                printWin.document.write('<html><head><title>Print Resume</title>');
                printWin.document.write('<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">');
                printWin.document.write('<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono&display=swap" rel="stylesheet">');
                const styles = Array.from(document.querySelectorAll('style')).map(s => s.innerHTML).join('\n');
                printWin.document.write(`<style>${styles}\nbody { margin:0; padding:0; background:white; } .cv-resume-paper { width:100%; box-shadow:none; padding:10mm; }</style>`);
                printWin.document.write('</head><body>');
                printWin.document.write(`<div class="cv-resume-paper tpl-${resumeData.template} pdf-export-mode">${preview.innerHTML}</div>`);
                printWin.document.write('</body></html>');
                printWin.document.close();
                printWin.focus();
                setTimeout(() => {
                    printWin.print();
                    printWin.close();
                }, 600);
            };

            // Import JSON resume
            const fileInputJson = document.getElementById('cv-json-input');
            document.getElementById('cv-import-json').onclick = () => {
                fileInputJson.click();
            };
            fileInputJson.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (evt) => {
                        try {
                            const imported = JSON.parse(evt.target.result);
                            loadData(imported);
                            utils.showToast('JSON resume imported successfully!');
                        } catch (err) {
                            utils.showToast('Failed to parse JSON file', 'error');
                        }
                    };
                    reader.readAsText(file);
                }
            };

            // Load Data helper
            const loadData = (data) => {
                resumeData = { ...resumeData, ...data };
                
                // Normalize skills if imported as array
                if (Array.isArray(resumeData.skills)) {
                    resumeData.skills = resumeData.skills.map(s => {
                        if (s && typeof s === 'object') return s.name || '';
                        return s || '';
                    }).filter(Boolean).join(', ');
                } else if (typeof resumeData.skills !== 'string') {
                    resumeData.skills = '';
                }
                
                fullNameIn.value = resumeData.fullName || '';
                jobTitleIn.value = resumeData.jobTitle || '';
                emailIn.value = resumeData.email || '';
                phoneIn.value = resumeData.phone || '';
                locationIn.value = resumeData.location || '';
                linkedinIn.value = resumeData.linkedin || '';
                githubIn.value = resumeData.github || '';
                portfolioIn.value = resumeData.portfolio || '';
                summaryIn.value = resumeData.summary || '';
                skillsIn.value = resumeData.skills || '';
                shapeSel.value = resumeData.photoShape || 'circle';
                posSel.value = resumeData.photoPosition || 'left-sidebar';

                expContainer.innerHTML = '';
                (resumeData.experience || []).forEach(exp => {
                    window.cvAddExpItem(exp.id, exp.title, exp.company, exp.startDate, exp.endDate, exp.description);
                });

                eduContainer.innerHTML = '';
                (resumeData.education || []).forEach(edu => {
                    window.cvAddEduItem(edu.id, edu.degree, edu.school, edu.startDate, edu.endDate);
                });

                projContainer.innerHTML = '';
                (resumeData.projects || []).forEach(proj => {
                    window.cvAddProjItem(proj.id, proj.name, proj.link, proj.date, proj.description);
                });

                certContainer.innerHTML = '';
                (resumeData.certifications || []).forEach(cert => {
                    window.cvAddCertItem(cert.id, cert.name, cert.authority, cert.date);
                });

                langContainer.innerHTML = '';
                (resumeData.languages || []).forEach(lang => {
                    window.cvAddLangItem(lang.id, lang.name, lang.level);
                });

                refContainer.innerHTML = '';
                (resumeData.references || []).forEach(ref => {
                    window.cvAddRefItem(ref.id, ref.name, ref.company, ref.email);
                });

                // Match thumbnail selection
                document.querySelectorAll('.cv-tpl-thumb').forEach(thumb => {
                    thumb.classList.toggle('active', thumb.getAttribute('data-tpl') === resumeData.template);
                });

                const classes = preview.className.split(' ').filter(c => !c.startsWith('tpl-'));
                preview.className = [...classes, `tpl-${resumeData.template}`].join(' ');

                updatePreview();
            };

            // Draft loading
            const loadDraft = () => {
                const saved = localStorage.getItem('meytool_cv_data_premium');
                if (saved) {
                    try {
                        const parsed = JSON.parse(saved);
                        loadData(parsed);
                    } catch (err) {
                        console.error('Error loading draft', err);
                    }
                } else {
                    updatePreview();
                }
            };

            loadDraft();
        }
    }
];

// Append to global registry
if (typeof TOOLS !== 'undefined') {
    TOOLS.push(...ADV_FILE_TOOLS);
}
