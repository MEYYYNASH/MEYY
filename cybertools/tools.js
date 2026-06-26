// Global Utilities & Helper Functions
const utils = {
    showToast(message, type = 'success') {
        const container = document.getElementById('toast-notification-container');
        if (!container) return;
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        let icon = '<i class="fa-solid fa-circle-check"></i>';
        if (type === 'error') icon = '<i class="fa-solid fa-circle-exclamation"></i>';
        if (type === 'info') icon = '<i class="fa-solid fa-circle-info"></i>';
        
        toast.innerHTML = `${icon} <span>${message}</span>`;
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    copyText(text) {
        if (!text) {
            this.showToast('Nothing to copy!', 'error');
            return;
        }
        navigator.clipboard.writeText(text)
            .then(() => this.showToast('Copied to clipboard!'))
            .catch(() => this.showToast('Failed to copy', 'error'));
    },

    downloadFile(content, filename, contentType) {
        const a = document.createElement('a');
        const file = new Blob([content], { type: contentType });
        a.href = URL.createObjectURL(file);
        a.download = filename;
        a.click();
        URL.revokeObjectURL(a.href);
        this.showToast(`Downloaded: ${filename}`);
    },

    formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }
};

// Global Tools Registry
const TOOLS = [
    // --- TEXT TOOLS ---
    {
        id: 'text-case',
        name: 'Case Converter',
        category: 'text',
        icon: '<i class="fa-solid fa-file-word"></i>',
        description: 'Convert text to Uppercase, Lowercase, camelCase, snake_case, or Slug format.',
        tags: ['upper', 'lower', 'case', 'slug', 'camelcase', 'snakecase', 'slugify', 'format'],
        render() {
            return `
                <div class="input-group">
                    <label>Input Text</label>
                    <textarea class="form-textarea" id="tc-input" placeholder="Type or paste your text here..."></textarea>
                </div>
                <div class="btn-container">
                    <button class="app-btn secondary" id="tc-upper">UPPERCASE</button>
                    <button class="app-btn secondary" id="tc-lower">lowercase</button>
                    <button class="app-btn secondary" id="tc-title">Title Case</button>
                    <button class="app-btn secondary" id="tc-camel">camelCase</button>
                    <button class="app-btn secondary" id="tc-snake">snake_case</button>
                    <button class="app-btn secondary" id="tc-slug">text-to-slug</button>
                    <button class="app-btn secondary" id="tc-reverse">Reverse Text</button>
                </div>
                <div class="output-container">
                    <button class="copy-badge-btn" id="tc-copy">Copy Output</button>
                    <pre class="output-pre" id="tc-output">Output will appear here...</pre>
                </div>
            `;
        },
        init() {
            const input = document.getElementById('tc-input');
            const output = document.getElementById('tc-output');
            
            const setOutput = (val) => {
                output.textContent = val || 'Output will appear here...';
                window.incrementStatsRun();
            };

            document.getElementById('tc-upper').onclick = () => setOutput(input.value.toUpperCase());
            document.getElementById('tc-lower').onclick = () => setOutput(input.value.toLowerCase());
            document.getElementById('tc-title').onclick = () => {
                setOutput(input.value.toLowerCase().replace(/\b\w/g, s => s.toUpperCase()));
            };
            document.getElementById('tc-camel').onclick = () => {
                const val = input.value.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase());
                setOutput(val.charAt(0).toLowerCase() + val.slice(1));
            };
            document.getElementById('tc-snake').onclick = () => {
                setOutput(input.value.toLowerCase().trim().replace(/[\s\W-]+/g, '_'));
            };
            document.getElementById('tc-slug').onclick = () => {
                setOutput(input.value.toLowerCase().trim().replace(/[\s\W-]+/g, '-').replace(/^-+|-+$/g, ''));
            };
            document.getElementById('tc-reverse').onclick = () => {
                setOutput(input.value.split('').reverse().join(''));
            };
            document.getElementById('tc-copy').onclick = () => {
                utils.copyText(output.textContent);
            };
        }
    },
    {
        id: 'text-counter',
        name: 'Text Counter & Stats',
        category: 'text',
        icon: '<i class="fa-solid fa-chart-line"></i>',
        description: 'Live counter for words, characters, sentences, lines, and reading time.',
        tags: ['word', 'character', 'line', 'counter', 'statistics', 'length', 'size'],
        render() {
            return `
                <div class="input-group">
                    <label>Analyze Text</label>
                    <textarea class="form-textarea" id="tcount-input" placeholder="Type or paste here for live count..."></textarea>
                </div>
                <div class="stats-summary" style="margin-bottom: 0;">
                    <div class="stats-card" style="padding:12px;">
                        <div class="stats-info">
                            <span class="stats-val" id="tcount-chars">0</span>
                            <span class="stats-lbl">Characters</span>
                        </div>
                    </div>
                    <div class="stats-card" style="padding:12px;">
                        <div class="stats-info">
                            <span class="stats-val" id="tcount-words">0</span>
                            <span class="stats-lbl">Words</span>
                        </div>
                    </div>
                    <div class="stats-card" style="padding:12px;">
                        <div class="stats-info">
                            <span class="stats-val" id="tcount-sentences">0</span>
                            <span class="stats-lbl">Sentences</span>
                        </div>
                    </div>
                    <div class="stats-card" style="padding:12px;">
                        <div class="stats-info">
                            <span class="stats-val" id="tcount-lines">0</span>
                            <span class="stats-lbl">Lines</span>
                        </div>
                    </div>
                    <div class="stats-card" style="padding:12px;">
                        <div class="stats-info">
                            <span class="stats-val" id="tcount-readtime">0m</span>
                            <span class="stats-lbl">Est. Read Time</span>
                        </div>
                    </div>
                </div>
            `;
        },
        init() {
            const input = document.getElementById('tcount-input');
            const charsVal = document.getElementById('tcount-chars');
            const wordsVal = document.getElementById('tcount-words');
            const sentencesVal = document.getElementById('tcount-sentences');
            const linesVal = document.getElementById('tcount-lines');
            const readVal = document.getElementById('tcount-readtime');

            input.oninput = () => {
                const text = input.value;
                charsVal.textContent = text.length;
                
                const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
                wordsVal.textContent = words;
                
                const sentences = text.trim() === '' ? 0 : text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
                sentencesVal.textContent = sentences;
                
                const lines = text.trim() === '' ? 0 : text.split('\n').length;
                linesVal.textContent = lines;

                const readTime = Math.ceil(words / 200); // 200 words per minute average
                readVal.textContent = readTime + 'm';
            };
        }
    },

    // --- ENCODE/DECODE TOOLS ---
    {
        id: 'encode-base64',
        name: 'Base64 Tool',
        category: 'encode',
        icon: '<i class="fa-solid fa-lock-open"></i>',
        description: 'Encode/decode text or files to/from Base64 strings with live previews.',
        tags: ['base64', 'encode', 'decode', 'image to base64', 'text to base64', 'crypt'],
        render() {
            return `
                <div class="tool-grid-2col">
                    <div>
                        <div class="input-group">
                            <label>Text Operations</label>
                            <textarea class="form-textarea" id="b64-text-input" placeholder="Type normal text to encode or Base64 to decode..."></textarea>
                        </div>
                        <div class="btn-container">
                            <button class="app-btn primary" id="b64-encode-btn">Encode Text</button>
                            <button class="app-btn secondary" id="b64-decode-btn">Decode Text</button>
                        </div>
                    </div>
                    <div>
                        <div class="input-group">
                            <label>File to Base64 Converter</label>
                            <div class="uploader-box" id="b64-uploader">
                                <i class="fa-solid fa-file-arrow-up uploader-icon"></i>
                                <div class="uploader-text">Select any file (Image, PDF, etc.)</div>
                                <div class="uploader-hint">Will convert directly to base64 data URL</div>
                                <input type="file" id="b64-file-field" style="display: none;">
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="output-container">
                    <button class="copy-badge-btn" id="b64-copy">Copy Output</button>
                    <pre class="output-pre" id="b64-output" style="max-height: 200px; overflow-y: auto;">Output will appear here...</pre>
                </div>
                
                <div class="image-preview-box" id="b64-img-preview-box">
                    <label style="font-size:12px; color:var(--text-secondary);">Image Preview from Base64 Output</label>
                    <div style="margin-top: 10px;">
                        <img id="b64-img-preview" src="">
                    </div>
                    <div class="btn-container" style="justify-content:center;">
                        <button class="app-btn primary" id="b64-download-img">Download Image</button>
                    </div>
                </div>
            `;
        },
        init() {
            const txtInput = document.getElementById('b64-text-input');
            const txtOutput = document.getElementById('b64-output');
            const fileField = document.getElementById('b64-file-field');
            const uploader = document.getElementById('b64-uploader');
            const imgBox = document.getElementById('b64-img-preview-box');
            const imgPreview = document.getElementById('b64-img-preview');

            const setOutput = (val) => {
                txtOutput.textContent = val;
                
                // If output looks like base64 image, show preview
                if (val.startsWith('data:image/')) {
                    imgBox.style.display = 'block';
                    imgPreview.src = val;
                } else if (val.match(/^[a-zA-Z0-9+/=]+$/) && val.length > 50) {
                    // Test if raw base64 could be image
                    imgBox.style.display = 'block';
                    imgPreview.src = `data:image/png;base64,${val}`;
                } else {
                    imgBox.style.display = 'none';
                }
                window.incrementStatsRun();
            };

            document.getElementById('b64-encode-btn').onclick = () => {
                setOutput(btoa(unescape(encodeURIComponent(txtInput.value))));
            };

            document.getElementById('b64-decode-btn').onclick = () => {
                try {
                    setOutput(decodeURIComponent(escape(atob(txtInput.value))));
                } catch(e) {
                    utils.showToast('Invalid Base64 string for decoding!', 'error');
                }
            };

            uploader.onclick = () => fileField.click();
            fileField.onchange = (e) => {
                const file = e.target.files[0];
                if (!file) return;
                
                const reader = new FileReader();
                reader.onload = (evt) => {
                    setOutput(evt.target.result);
                };
                reader.readAsDataURL(file);
            };

            document.getElementById('b64-copy').onclick = () => utils.copyText(txtOutput.textContent);
            document.getElementById('b64-download-img').onclick = () => {
                const link = document.createElement('a');
                link.href = imgPreview.src;
                link.download = 'decoded_base64_image.png';
                link.click();
            };
        }
    },

    // --- FILE TOOLS ---
    {
        id: 'file-pdf-to-txt',
        name: 'PDF to Text Extractor',
        category: 'file',
        icon: '<i class="fa-solid fa-file-pdf"></i>',
        description: 'Upload a PDF file and extract all text content from it locally.',
        tags: ['pdf', 'txt', 'convert', 'pdf to txt', 'extractor', 'read pdf'],
        render() {
            return `
                <div class="uploader-box" id="pdftxt-uploader">
                    <i class="fa-solid fa-file-pdf uploader-icon" style="color:#ff4a4a;"></i>
                    <div class="uploader-text">Click to choose or drop PDF file here</div>
                    <div class="uploader-hint">Processing is done client-side. Your file remains private.</div>
                    <input type="file" id="pdftxt-file-input" accept="application/pdf" style="display: none;">
                </div>
                
                <div class="progress-bar-container" id="pdftxt-progress-bar">
                    <div class="progress-bar-fill" id="pdftxt-progress-fill"></div>
                </div>
                
                <div class="output-container" style="display: none;" id="pdftxt-output-box">
                    <button class="copy-badge-btn" id="pdftxt-copy">Copy Content</button>
                    <textarea class="form-textarea" id="pdftxt-output-text" style="min-height: 250px; background:transparent; border:none; color:#e2e8f0;"></textarea>
                    <div class="btn-container">
                        <button class="app-btn primary" id="pdftxt-download">Download as .txt</button>
                    </div>
                </div>
            `;
        },
        init() {
            const uploader = document.getElementById('pdftxt-uploader');
            const fileInput = document.getElementById('pdftxt-file-input');
            const progressBar = document.getElementById('pdftxt-progress-bar');
            const progressFill = document.getElementById('pdftxt-progress-fill');
            const outputBox = document.getElementById('pdftxt-output-box');
            const outputText = document.getElementById('pdftxt-output-text');

            uploader.onclick = () => fileInput.click();
            
            fileInput.onchange = async (e) => {
                const file = e.target.files[0];
                if (!file || file.type !== 'application/pdf') {
                    utils.showToast('Please select a valid PDF file!', 'error');
                    return;
                }
                
                progressBar.style.display = 'block';
                progressFill.style.width = '10%';
                
                try {
                    const reader = new FileReader();
                    reader.onload = async function() {
                        try {
                            const typedArray = new Uint8Array(this.result);
                            
                            // Load pdfjsLib — CDN exposes it as window.pdfjsLib
                            const pdfjsLib = window.pdfjsLib;
                            if (!pdfjsLib) {
                                utils.showToast('PDF.js library not loaded. Check your internet connection.', 'error');
                                progressBar.style.display = 'none';
                                return;
                            }
                            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
                            
                            const pdf = await pdfjsLib.getDocument(typedArray).promise;
                            let fullText = '';
                            
                            progressFill.style.width = '30%';
                            
                            for (let i = 1; i <= pdf.numPages; i++) {
                                const page = await pdf.getPage(i);
                                const textContent = await page.getTextContent();
                                const pageText = textContent.items.map(item => item.str).join(' ');
                                fullText += `--- Page ${i} ---\n${pageText}\n\n`;
                                
                                const progressPct = 30 + Math.floor((i / pdf.numPages) * 70);
                                progressFill.style.width = `${progressPct}%`;
                            }
                            
                            outputText.value = fullText;
                            progressBar.style.display = 'none';
                            outputBox.style.display = 'block';
                            utils.showToast('PDF text successfully extracted!');
                            window.incrementStatsRun();
                        } catch(err) {
                            progressBar.style.display = 'none';
                            utils.showToast('Failed to parse PDF pages: ' + err.message, 'error');
                        }
                    };
                    reader.readAsArrayBuffer(file);
                } catch(err) {
                    progressBar.style.display = 'none';
                    utils.showToast('Error reading file!', 'error');
                }
            };

            document.getElementById('pdftxt-copy').onclick = () => utils.copyText(outputText.value);
            document.getElementById('pdftxt-download').onclick = () => {
                utils.downloadFile(outputText.value, 'extracted_pdf_text.txt', 'text/plain');
            };
        }
    },
    {
        id: 'file-txt-to-pdf',
        name: 'Text to PDF Generator',
        category: 'file',
        icon: '<i class="fa-solid fa-file-export"></i>',
        description: 'Type text and convert it into a neat downloadable PDF file.',
        tags: ['pdf', 'txt', 'convert', 'txt to pdf', 'make pdf', 'write document'],
        render() {
            return `
                <div class="input-group">
                    <label>PDF Text Content</label>
                    <textarea class="form-textarea" id="txtpdf-input" placeholder="Type or paste content you want to generate in a PDF..."></textarea>
                </div>
                <div class="input-group">
                    <label>PDF Filename</label>
                    <input type="text" class="form-input" id="txtpdf-name" value="meytool_document.pdf">
                </div>
                <div class="btn-container">
                    <button class="app-btn primary" id="txtpdf-generate">Generate & Download PDF</button>
                </div>
            `;
        },
        init() {
            document.getElementById('txtpdf-generate').onclick = () => {
                const text = document.getElementById('txtpdf-input').value;
                let filename = document.getElementById('txtpdf-name').value;
                if (!text.trim()) {
                    utils.showToast('Please insert text to put into PDF!', 'error');
                    return;
                }
                if (!filename.endsWith('.pdf')) filename += '.pdf';
                
                if (!window.jspdf) {
                    utils.showToast('PDF library not loaded. Check your internet connection.', 'error');
                    return;
                }
                const { jsPDF } = window.jspdf;
                const doc = new jsPDF();
                
                // Handle text wrapping
                const margin = 15;
                const pageHeight = doc.internal.pageSize.height;
                const splitText = doc.splitTextToSize(text, 180);
                let y = 20;
                
                for (let i = 0; i < splitText.length; i++) {
                    if (y > pageHeight - margin) {
                        doc.addPage();
                        y = 20;
                    }
                    doc.text(splitText[i], margin, y);
                    y += 8;
                }
                
                doc.save(filename);
                utils.showToast('PDF downloaded successfully!');
                window.incrementStatsRun();
            };
        }
    },
    {
        id: 'file-json-csv',
        name: 'JSON ↔ CSV Converter',
        category: 'file',
        icon: '<i class="fa-solid fa-right-left"></i>',
        description: 'Convert JSON arrays to structured CSV and vice versa with validation.',
        tags: ['json', 'csv', 'converter', 'data conversion', 'comma separated', 'parse'],
        render() {
            return `
                <div class="tool-grid-2col">
                    <div>
                        <div class="input-group">
                            <label>JSON Input / Output</label>
                            <textarea class="form-textarea" id="jc-json" placeholder='[\n  {"name": "Alice", "age": 28},\n  {"name": "Bob", "age": 34}\n]'></textarea>
                        </div>
                        <div class="btn-container">
                            <button class="app-btn primary" id="jc-json-to-csv">JSON ➔ CSV</button>
                            <button class="app-btn secondary" id="jc-copy-json">Copy JSON</button>
                        </div>
                    </div>
                    <div>
                        <div class="input-group">
                            <label>CSV Input / Output</label>
                            <textarea class="form-textarea" id="jc-csv" placeholder="name,age\nAlice,28\nBob,34"></textarea>
                        </div>
                        <div class="btn-container">
                            <button class="app-btn primary" id="jc-csv-to-json">CSV ➔ JSON</button>
                            <button class="app-btn secondary" id="jc-copy-csv">Copy CSV</button>
                        </div>
                    </div>
                </div>
            `;
        },
        init() {
            const jsonField = document.getElementById('jc-json');
            const csvField = document.getElementById('jc-csv');

            document.getElementById('jc-json-to-csv').onclick = () => {
                try {
                    const rawJson = jsonField.value.trim();
                    if (!rawJson) return;
                    const arr = JSON.parse(rawJson);
                    if (!Array.isArray(arr)) {
                        utils.showToast('JSON must be an array of objects!', 'error');
                        return;
                    }
                    
                    const headers = Object.keys(arr[0]);
                    const csvRows = [headers.join(',')];
                    
                    for (const obj of arr) {
                        const values = headers.map(header => {
                            const val = obj[header];
                            // Escape commas
                            const strVal = (val === null || val === undefined) ? '' : String(val);
                            return strVal.includes(',') ? `"${strVal.replace(/"/g, '""')}"` : strVal;
                        });
                        csvRows.push(values.join(','));
                    }
                    
                    csvField.value = csvRows.join('\n');
                    utils.showToast('Converted to CSV!');
                    window.incrementStatsRun();
                } catch(e) {
                    utils.showToast('Invalid JSON input!', 'error');
                }
            };

            document.getElementById('jc-csv-to-json').onclick = () => {
                try {
                    const rawCsv = csvField.value.trim();
                    if (!rawCsv) return;
                    
                    const lines = rawCsv.split('\n');
                    if (lines.length < 2) {
                        utils.showToast('CSV must have headers and at least one row!', 'error');
                        return;
                    }
                    
                    const headers = lines[0].split(',');
                    const result = [];
                    
                    for (let i = 1; i < lines.length; i++) {
                        const currentline = lines[i].split(',');
                        if (currentline.length !== headers.length) continue;
                        
                        const obj = {};
                        for (let j = 0; j < headers.length; j++) {
                            let val = currentline[j].trim();
                            // Attempt to parse number
                            if (!isNaN(val) && val !== '') val = Number(val);
                            obj[headers[j].trim()] = val;
                        }
                        result.push(obj);
                    }
                    
                    jsonField.value = JSON.stringify(result, null, 2);
                    utils.showToast('Converted to JSON!');
                    window.incrementStatsRun();
                } catch(e) {
                    utils.showToast('Error parsing CSV!', 'error');
                }
            };

            document.getElementById('jc-copy-json').onclick = () => utils.copyText(jsonField.value);
            document.getElementById('jc-copy-csv').onclick = () => utils.copyText(csvField.value);
        }
    },

    // --- IMAGE TOOLS ---
    {
        id: 'image-compress',
        name: 'Image Resizer & Compressor',
        category: 'image',
        icon: '<i class="fa-solid fa-images"></i>',
        description: 'Compress, resize, and convert image formats directly in canvas.',
        tags: ['image', 'resize', 'compress', 'jpg', 'png', 'webp', 'watermark', 'photo'],
        render() {
            return `
                <div class="tool-grid-2col">
                    <div>
                        <div class="input-group">
                            <label>Upload Image</label>
                            <div class="uploader-box" id="imgcomp-uploader">
                                <i class="fa-solid fa-file-image uploader-icon" style="color:var(--accent-secondary);"></i>
                                <div class="uploader-text">Select JPG, PNG, or WEBP image</div>
                                <input type="file" id="imgcomp-file-field" accept="image/*" style="display: none;">
                            </div>
                        </div>
                        
                        <div class="input-group">
                            <label>Compress Quality (<span id="imgcomp-qual-val">80</span>%)</label>
                            <input type="range" class="form-slider" id="imgcomp-qual-slider" min="10" max="100" value="80">
                        </div>

                        <div class="interactive-slider-group">
                            <div class="slider-label-val">
                                <span>Target Width (px)</span>
                                <input type="number" class="form-input" style="width: 100px; padding: 4px 8px;" id="imgcomp-width" placeholder="Auto">
                            </div>
                            <div class="slider-label-val">
                                <span>Target Height (px)</span>
                                <input type="number" class="form-input" style="width: 100px; padding: 4px 8px;" id="imgcomp-height" placeholder="Auto">
                            </div>
                        </div>

                        <div class="input-group">
                            <label>Output Format</label>
                            <select class="form-select" id="imgcomp-format">
                                <option value="image/jpeg">JPEG</option>
                                <option value="image/png">PNG</option>
                                <option value="image/webp">WEBP</option>
                            </select>
                        </div>
                        
                        <div class="input-group">
                            <label>Add Text Watermark</label>
                            <input type="text" class="form-input" id="imgcomp-watermark" placeholder="Watermark text (optional)">
                        </div>

                        <button class="app-btn primary" id="imgcomp-process-btn" style="width:100%;">Process Image</button>
                    </div>
                    
                    <div style="display:flex; flex-direction:column; justify-content:center; align-items:center;">
                        <div class="image-preview-box" id="imgcomp-preview-container" style="display:none; width: 100%;">
                            <label style="font-size:12px; color:var(--text-secondary);">Processed Image Preview</label>
                            <div style="margin: 15px 0;">
                                <img id="imgcomp-preview" src="">
                            </div>
                            <div style="font-size:12px; margin-bottom:15px; color:var(--text-secondary);">
                                Original: <span id="imgcomp-size-orig" style="color:var(--text-primary); font-weight:600;"></span> 
                                ➔ Compressed: <span id="imgcomp-size-new" style="color:var(--accent-secondary); font-weight:600;"></span>
                            </div>
                            <button class="app-btn primary" id="imgcomp-download">Download Image</button>
                        </div>
                    </div>
                </div>
            `;
        },
        init() {
            const uploader = document.getElementById('imgcomp-uploader');
            const fileField = document.getElementById('imgcomp-file-field');
            const qualitySlider = document.getElementById('imgcomp-qual-slider');
            const qualityVal = document.getElementById('imgcomp-qual-val');
            const targetWidth = document.getElementById('imgcomp-width');
            const targetHeight = document.getElementById('imgcomp-height');
            const formatSelect = document.getElementById('imgcomp-format');
            const watermarkField = document.getElementById('imgcomp-watermark');
            const processBtn = document.getElementById('imgcomp-process-btn');
            
            const previewContainer = document.getElementById('imgcomp-preview-container');
            const previewImg = document.getElementById('imgcomp-preview');
            const sizeOrig = document.getElementById('imgcomp-size-orig');
            const sizeNew = document.getElementById('imgcomp-size-new');
            const downloadBtn = document.getElementById('imgcomp-download');
            
            let uploadedImage = null;
            let originalSizeBytes = 0;

            uploader.onclick = () => fileField.click();
            qualitySlider.oninput = (e) => qualityVal.textContent = e.target.value;

            fileField.onchange = (e) => {
                const file = e.target.files[0];
                if (!file) return;
                originalSizeBytes = file.size;
                
                const reader = new FileReader();
                reader.onload = (event) => {
                    const img = new Image();
                    img.onload = () => {
                        uploadedImage = img;
                        targetWidth.value = img.width;
                        targetHeight.value = img.height;
                        utils.showToast('Image uploaded successfully!');
                    };
                    img.src = event.target.result;
                };
                reader.readAsDataURL(file);
            };

            processBtn.onclick = () => {
                if (!uploadedImage) {
                    utils.showToast('Please upload an image first!', 'error');
                    return;
                }
                
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                const w = parseInt(targetWidth.value) || uploadedImage.width;
                const h = parseInt(targetHeight.value) || uploadedImage.height;
                
                canvas.width = w;
                canvas.height = h;
                
                // Draw image
                ctx.drawImage(uploadedImage, 0, 0, w, h);
                
                // Draw watermark
                const wmText = watermarkField.value.trim();
                if (wmText) {
                    ctx.font = `${Math.max(w * 0.03, 14)}px sans-serif`;
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
                    ctx.textAlign = 'right';
                    ctx.fillText(wmText, w - 20, h - 20);
                }
                
                const mime = formatSelect.value;
                const quality = parseFloat(qualitySlider.value) / 100;
                
                const dataUrl = canvas.toDataURL(mime, quality);
                
                previewImg.src = dataUrl;
                previewContainer.style.display = 'flex';
                
                // Calculate compressed size
                const base64Len = dataUrl.split(',')[1].length;
                const compressedSize = Math.floor(base64Len * 0.75);
                
                sizeOrig.textContent = utils.formatBytes(originalSizeBytes);
                sizeNew.textContent = utils.formatBytes(compressedSize);
                
                utils.showToast('Image processed!');
                window.incrementStatsRun();
            };

            downloadBtn.onclick = () => {
                const link = document.createElement('a');
                link.href = previewImg.src;
                const ext = formatSelect.value.split('/')[1];
                link.download = `compressed_image.${ext}`;
                link.click();
            };
        }
    },

    // --- DEVELOPER TOOLS ---
    {
        id: 'dev-json-format',
        name: 'JSON Formatter & Validator',
        category: 'developer',
        icon: '<i class="fa-solid fa-code"></i>',
        description: 'Validate raw JSON data and format with custom nesting indentation.',
        tags: ['json', 'pretty', 'minify', 'validate', 'syntax', 'beautifier'],
        render() {
            return `
                <div class="input-group">
                    <label>JSON Data Input</label>
                    <textarea class="form-textarea" id="jsf-input" placeholder='{"user":{"id":1,"profile":{"name":"Neo","hobbies":["coding","netrunner"]}}}'></textarea>
                </div>
                <div class="btn-container">
                    <button class="app-btn primary" id="jsf-format">Pretty Print (2 Spaces)</button>
                    <button class="app-btn secondary" id="jsf-format4">Pretty Print (4 Spaces)</button>
                    <button class="app-btn secondary" id="jsf-minify">Minify JSON</button>
                </div>
                
                <div class="output-container">
                    <button class="copy-badge-btn" id="jsf-copy">Copy Output</button>
                    <pre class="output-pre" id="jsf-output" style="max-height: 300px; overflow-y: auto;">Output will appear here...</pre>
                </div>
            `;
        },
        init() {
            const input = document.getElementById('jsf-input');
            const output = document.getElementById('jsf-output');

            const parseAndFormat = (spaces) => {
                try {
                    const raw = input.value.trim();
                    if (!raw) return;
                    const parsed = JSON.parse(raw);
                    output.textContent = JSON.stringify(parsed, null, spaces);
                    output.style.color = '#e2e8f0';
                    utils.showToast('JSON Validated & Formatted!');
                    window.incrementStatsRun();
                } catch(e) {
                    output.textContent = `JSON Invalid:\n${e.message}`;
                    output.style.color = '#ef4444';
                    utils.showToast('JSON parsing failed!', 'error');
                }
            };

            document.getElementById('jsf-format').onclick = () => parseAndFormat(2);
            document.getElementById('jsf-format4').onclick = () => parseAndFormat(4);
            document.getElementById('jsf-minify').onclick = () => {
                try {
                    const raw = input.value.trim();
                    if (!raw) return;
                    const parsed = JSON.parse(raw);
                    output.textContent = JSON.stringify(parsed);
                    output.style.color = '#e2e8f0';
                    utils.showToast('JSON Minified!');
                    window.incrementStatsRun();
                } catch(e) {
                    output.textContent = `JSON Invalid:\n${e.message}`;
                    output.style.color = '#ef4444';
                    utils.showToast('JSON parsing failed!', 'error');
                }
            };
            document.getElementById('jsf-copy').onclick = () => utils.copyText(output.textContent);
        }
    },
    {
        id: 'dev-uuid',
        name: 'UUID v4 Generator',
        category: 'developer',
        icon: '<i class="fa-solid fa-fingerprint"></i>',
        description: 'Generate standard Version 4 Universally Unique Identifiers (UUIDs).',
        tags: ['uuid', 'guid', 'random id', 'generator', 'uuidv4'],
        render() {
            return `
                <div class="input-group">
                    <label>Number of UUIDs to Generate</label>
                    <select class="form-select" id="uuid-count">
                        <option value="1">1</option>
                        <option value="5">5</option>
                        <option value="10">10</option>
                        <option value="50">50</option>
                    </select>
                </div>
                <div class="btn-container">
                    <button class="app-btn primary" id="uuid-gen-btn">Generate UUIDs</button>
                </div>
                
                <div class="output-container">
                    <button class="copy-badge-btn" id="uuid-copy">Copy All</button>
                    <pre class="output-pre" id="uuid-output">Output will appear here...</pre>
                </div>
            `;
        },
        init() {
            const countSelect = document.getElementById('uuid-count');
            const output = document.getElementById('uuid-output');

            const generateUUID = () => {
                // Cryptographically secure UUID generator
                return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
                    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
                );
            };

            document.getElementById('uuid-gen-btn').onclick = () => {
                const count = parseInt(countSelect.value);
                const list = [];
                for (let i = 0; i < count; i++) {
                    list.push(generateUUID());
                }
                output.textContent = list.join('\n');
                utils.showToast(`Generated ${count} UUID(s)`);
                window.incrementStatsRun();
            };

            document.getElementById('uuid-copy').onclick = () => utils.copyText(output.textContent);
        }
    },
    {
        id: 'dev-hash',
        name: 'Hash Generator',
        category: 'developer',
        icon: '<i class="fa-solid fa-key"></i>',
        description: 'Generate SHA-256, MD5, and SHA-1 hashes of text instantly.',
        tags: ['hash', 'crypto', 'md5', 'sha256', 'sha1', 'encryption', 'hashing'],
        render() {
            return `
                <div class="input-group">
                    <label>Raw String Input</label>
                    <textarea class="form-textarea" id="hash-input" placeholder="Type text to hash..."></textarea>
                </div>
                
                <div class="input-group">
                    <label>MD5 Hash</label>
                    <div style="position:relative;">
                        <input type="text" class="form-input" id="hash-md5" readonly>
                        <button class="copy-badge-btn" id="hash-md5-copy">Copy</button>
                    </div>
                </div>
                
                <div class="input-group">
                    <label>SHA-256 Hash</label>
                    <div style="position:relative;">
                        <input type="text" class="form-input" id="hash-sha256" readonly>
                        <button class="copy-badge-btn" id="hash-sha256-copy">Copy</button>
                    </div>
                </div>

                <div class="input-group">
                    <label>SHA-1 Hash</label>
                    <div style="position:relative;">
                        <input type="text" class="form-input" id="hash-sha1" readonly>
                        <button class="copy-badge-btn" id="hash-sha1-copy">Copy</button>
                    </div>
                </div>
            `;
        },
        init() {
            const input = document.getElementById('hash-input');
            const md5Field = document.getElementById('hash-md5');
            const sha256Field = document.getElementById('hash-sha256');
            const sha1Field = document.getElementById('hash-sha1');

            input.oninput = () => {
                const text = input.value;
                if (!text) {
                    md5Field.value = '';
                    sha256Field.value = '';
                    sha1Field.value = '';
                    return;
                }
                
                // Using CryptoJS loaded from CDN
                md5Field.value = CryptoJS.MD5(text).toString();
                sha256Field.value = CryptoJS.SHA256(text).toString();
                sha1Field.value = CryptoJS.SHA1(text).toString();
            };

            document.getElementById('hash-md5-copy').onclick = () => {
                utils.copyText(md5Field.value);
                window.incrementStatsRun();
            };
            document.getElementById('hash-sha256-copy').onclick = () => {
                utils.copyText(sha256Field.value);
                window.incrementStatsRun();
            };
            document.getElementById('hash-sha1-copy').onclick = () => {
                utils.copyText(sha1Field.value);
                window.incrementStatsRun();
            };
        }
    },
    {
        id: 'dev-api-tester',
        name: 'Mini API Tester',
        category: 'developer',
        icon: '<i class="fa-solid fa-network-wired"></i>',
        description: 'Send simple fetch requests (GET/POST/PUT/DELETE) to test APIs with header inputs.',
        tags: ['api', 'postman', 'http', 'fetch', 'headers', 'request', 'rest'],
        render() {
            return `
                <div class="tool-grid-2col">
                    <div>
                        <div class="input-group">
                            <label>Request Method & URL</label>
                            <div style="display:flex; gap:10px;">
                                <select class="form-select" id="api-method" style="width:110px;">
                                    <option value="GET">GET</option>
                                    <option value="POST">POST</option>
                                    <option value="PUT">PUT</option>
                                    <option value="DELETE">DELETE</option>
                                </select>
                                <input type="text" class="form-input" id="api-url" value="https://jsonplaceholder.typicode.com/posts/1">
                            </div>
                        </div>
                        
                        <div class="input-group">
                            <label>Request Headers (JSON format)</label>
                            <textarea class="form-textarea" id="api-headers" style="min-height:80px;" placeholder='{\n  "Content-Type": "application/json"\n}'></textarea>
                        </div>
                        
                        <div class="input-group">
                            <label>Request Body (for POST/PUT)</label>
                            <textarea class="form-textarea" id="api-body" style="min-height:100px;" placeholder='{\n  "title": "foo",\n  "body": "bar",\n  "userId": 1\n}'></textarea>
                        </div>
                        
                        <button class="app-btn primary" id="api-send-btn">Send Request</button>
                        <button class="app-btn secondary" id="api-mock-btn">Try Mock Request</button>
                    </div>
                    
                    <div>
                        <div class="input-group">
                            <label>Response Status</label>
                            <input type="text" class="form-input" id="api-status" readonly placeholder="Status: N/A">
                        </div>
                        
                        <div class="output-container">
                            <button class="copy-badge-btn" id="api-copy-res">Copy Response</button>
                            <pre class="output-pre" id="api-output" style="max-height:250px; overflow-y:auto;">Response body will appear here...</pre>
                        </div>
                        <div style="font-size:11px; color:var(--text-muted); margin-top:8px;">
                            Note: Some endpoints may block client-side fetch requests due to browser CORS policies. Use the 'Try Mock Request' button to see how it operates.
                        </div>
                    </div>
                </div>
            `;
        },
        init() {
            const methodField = document.getElementById('api-method');
            const urlField = document.getElementById('api-url');
            const headersField = document.getElementById('api-headers');
            const bodyField = document.getElementById('api-body');
            const statusField = document.getElementById('api-status');
            const output = document.getElementById('api-output');

            const triggerFetch = async (useMock = false) => {
                if (useMock) {
                    statusField.value = '200 OK (MOCK RESPONSE)';
                    output.textContent = JSON.stringify({
                        success: true,
                        message: "This is a simulated request mock response.",
                        timestamp: Date.now(),
                        headers_received: {
                            "Content-Type": "application/json",
                            "Server": "MeyTool-Mock"
                        },
                        data: {
                            id: 42,
                            name: "Mock Item",
                            description: "Successfully processed request locally."
                        }
                    }, null, 2);
                    utils.showToast('Loaded mock response');
                    return;
                }

                const method = methodField.value;
                const url = urlField.value.trim();
                
                if (!url) {
                    utils.showToast('API URL is required!', 'error');
                    return;
                }

                output.textContent = 'Sending request...';
                statusField.value = 'Connecting...';

                try {
                    let headers = {};
                    if (headersField.value.trim()) {
                        headers = JSON.parse(headersField.value);
                    }
                    
                    const options = { method, headers };
                    if (method === 'POST' || method === 'PUT') {
                        options.body = bodyField.value;
                    }
                    
                    const res = await fetch(url, options);
                    statusField.value = `${res.status} ${res.statusText}`;
                    
                    const text = await res.text();
                    try {
                        const json = JSON.parse(text);
                        output.textContent = JSON.stringify(json, null, 2);
                    } catch(e) {
                        output.textContent = text;
                    }
                    utils.showToast('API response received!');
                    window.incrementStatsRun();
                } catch(err) {
                    statusField.value = 'Failed';
                    output.textContent = `Network Error: ${err.message}\nThis might be caused by CORS restrictions on the endpoint.`;
                    utils.showToast('API request failed!', 'error');
                }
            };

            document.getElementById('api-send-btn').onclick = () => triggerFetch(false);
            document.getElementById('api-mock-btn').onclick = () => triggerFetch(true);
            document.getElementById('api-copy-res').onclick = () => utils.copyText(output.textContent);
        }
    },

    // --- UTILITIES ---
    {
        id: 'util-qrcode',
        popular: true,
        name: 'QR Code Generator',
        category: 'utilities',
        icon: '<i class="fa-solid fa-qrcode"></i>',
        description: 'Convert text, URLs, WiFi, emails, or phone numbers into beautiful customizable QR codes.',
        tags: ['qr', 'qrcode', 'barcode', 'link', 'generator', 'wifi', 'email', 'phone', 'presets', 'template'],
        render() {
            return `
                <div class="tool-grid-2col">
                    <div>
                        <!-- Type Tabs -->
                        <div class="input-group">
                            <label>QR Code Type</label>
                            <div class="qr-tabs" style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 10px;">
                                <button class="app-btn secondary qr-tab active" data-type="text" style="flex: 1; min-width: 70px; padding: 8px 12px; font-size: 12px;">
                                    <i class="fa-solid fa-file-lines" style="margin-right: 6px;"></i>Text
                                </button>
                                <button class="app-btn secondary qr-tab" data-type="url" style="flex: 1; min-width: 70px; padding: 8px 12px; font-size: 12px;">
                                    <i class="fa-solid fa-link" style="margin-right: 6px;"></i>URL
                                </button>
                                <button class="app-btn secondary qr-tab" data-type="wifi" style="flex: 1; min-width: 70px; padding: 8px 12px; font-size: 12px;">
                                    <i class="fa-solid fa-wifi" style="margin-right: 6px;"></i>WiFi
                                </button>
                                <button class="app-btn secondary qr-tab" data-type="email" style="flex: 1; min-width: 70px; padding: 8px 12px; font-size: 12px;">
                                    <i class="fa-solid fa-envelope" style="margin-right: 6px;"></i>Email
                                </button>
                                <button class="app-btn secondary qr-tab" data-type="phone" style="flex: 1; min-width: 70px; padding: 8px 12px; font-size: 12px;">
                                    <i class="fa-solid fa-phone" style="margin-right: 6px;"></i>Phone
                                </button>
                            </div>
                        </div>

                        <!-- Dynamic inputs area -->
                        <div id="qr-dynamic-inputs" style="margin-bottom: 15px;">
                            <textarea id="qr-data-input" class="form-textarea" placeholder="Type text to encode..."></textarea>
                        </div>

                        <!-- Customize Style Accordion Toggle -->
                        <div class="customize-wrap" style="margin-bottom: 15px; border: var(--border-glass); border-radius: 8px; overflow: hidden;">
                            <button class="form-input" id="qr-cust-toggle" style="width:100%; border:none; display:flex; justify-content:space-between; align-items:center; cursor:pointer; font-weight:600; text-align:left; background:var(--bg-glass-hover);">
                                <span><i class="fa-solid fa-palette" style="margin-right:8px; color:var(--accent-secondary);"></i>Customize Style</span>
                                <i class="fa-solid fa-chevron-down" id="qr-cust-chevron"></i>
                            </button>
                            <div id="qr-cust-body" style="display:none; padding:15px; background:rgba(0,0,0,0.15); border-top:var(--border-glass);">
                                <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
                                    
                                    <!-- Style Presets Section -->
                                    <div class="input-group" style="grid-column: span 2; margin-bottom: 12px;">
                                        <label>Style Presets</label>
                                        <div class="qr-presets" style="display: flex; gap: 6px; flex-wrap: wrap; margin-top: 6px;">
                                            <button class="app-btn secondary qr-preset-btn" data-preset="cyber" style="padding: 6px 10px; font-size: 10px; flex: 1; min-width: 60px;">Cyber</button>
                                            <button class="app-btn secondary qr-preset-btn" data-preset="emerald" style="padding: 6px 10px; font-size: 10px; flex: 1; min-width: 60px;">Emerald</button>
                                            <button class="app-btn secondary qr-preset-btn" data-preset="violet" style="padding: 6px 10px; font-size: 10px; flex: 1; min-width: 60px;">Violet</button>
                                            <button class="app-btn secondary qr-preset-btn" data-preset="dark" style="padding: 6px 10px; font-size: 10px; flex: 1; min-width: 60px;">Dark</button>
                                            <button class="app-btn secondary qr-preset-btn" data-preset="minimal" style="padding: 6px 10px; font-size: 10px; flex: 1; min-width: 60px;">Minimal</button>
                                        </div>
                                    </div>

                                    <div class="input-group">
                                        <label>Gradient Start</label>
                                        <input type="color" id="qr-dot-color-1" value="#00ffff" style="height:38px; padding:2px;" class="form-input">
                                    </div>
                                    <div class="input-group">
                                        <label>Gradient End</label>
                                        <input type="color" id="qr-dot-color-2" value="#ff00ff" style="height:38px; padding:2px;" class="form-input">
                                    </div>
                                    <div class="input-group">
                                        <label>Background</label>
                                        <input type="color" id="qr-bg-color" value="#ffffff" style="height:38px; padding:2px;" class="form-input">
                                    </div>
                                    <div class="input-group">
                                        <label>Dot Style</label>
                                        <select id="qr-dot-style" class="form-select">
                                            <option value="rounded">Rounded</option>
                                            <option value="dots">Dots</option>
                                            <option value="classy">Classy</option>
                                            <option value="classy-rounded">Classy Rounded</option>
                                            <option value="square">Square</option>
                                            <option value="extra-rounded">Extra Rounded</option>
                                        </select>
                                    </div>
                                    <div class="input-group">
                                        <label>Corner Style</label>
                                        <select id="qr-corner-style" class="form-select">
                                            <option value="extra-rounded">Extra Rounded</option>
                                            <option value="dot">Dot</option>
                                            <option value="square">Square</option>
                                        </select>
                                    </div>
                                    <div class="input-group">
                                        <label>Center Logo</label>
                                        <div style="display:flex; gap:6px;">
                                            <input type="file" id="qr-logo-upload" accept="image/*" style="display:none;">
                                            <button class="app-btn secondary" id="qr-logo-btn" style="flex:1; font-size:11px; padding:8px 10px;">Upload</button>
                                            <button class="app-btn secondary" id="qr-logo-remove" style="font-size:11px; padding:8px 10px; color:#ef4444;">Clear</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button class="app-btn primary" id="qr-generate-btn" style="width:100%;">
                            <i class="fa-solid fa-bolt" style="margin-right:6px;"></i>Generate QR Code
                        </button>
                    </div>
                    
                    <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; gap:15px;">
                        <div id="qr-canvas-container" style="background:#fff; padding:15px; border-radius:12px; display:flex; align-items:center; justify-content:center; box-shadow:var(--shadow-card); min-width:200px; min-height:200px;">
                            <!-- Canvas appended by qr-code-styling -->
                        </div>
                        
                        <div class="btn-container" id="qr-action-grid" style="display:flex; justify-content:center; gap:8px;">
                            <button class="app-btn secondary" id="qr-dl-png" style="font-size:11px; padding:6px 12px;"><i class="fa-solid fa-image"></i> PNG</button>
                            <button class="app-btn secondary" id="qr-dl-svg" style="font-size:11px; padding:6px 12px;"><i class="fa-solid fa-file-code"></i> SVG</button>
                            <button class="app-btn secondary" id="qr-copy-img" style="font-size:11px; padding:6px 12px;"><i class="fa-solid fa-copy"></i> Copy</button>
                            <button class="app-btn secondary" id="qr-share-btn" style="font-size:11px; padding:6px 12px;"><i class="fa-solid fa-share-nodes"></i> Share</button>
                        </div>
                    </div>
                </div>
            `;
        },
        init() {
            let qrType = 'text';
            let qrLogo = null;

            const canvasContainer = document.getElementById('qr-canvas-container');
            const dynamicInputs = document.getElementById('qr-dynamic-inputs');
            
            const dotColor1 = document.getElementById('qr-dot-color-1');
            const dotColor2 = document.getElementById('qr-dot-color-2');
            const bgColor = document.getElementById('qr-bg-color');
            const dotStyle = document.getElementById('qr-dot-style');
            const cornerStyle = document.getElementById('qr-corner-style');
            
            const logoUpload = document.getElementById('qr-logo-upload');
            const logoBtn = document.getElementById('qr-logo-btn');
            const logoRemove = document.getElementById('qr-logo-remove');
            
            const generateBtn = document.getElementById('qr-generate-btn');
            const custToggle = document.getElementById('qr-cust-toggle');
            const custBody = document.getElementById('qr-cust-body');
            const custChevron = document.getElementById('qr-cust-chevron');
            
            const dlPng = document.getElementById('qr-dl-png');
            const dlSvg = document.getElementById('qr-dl-svg');
            const copyImg = document.getElementById('qr-copy-img');
            const shareBtn = document.getElementById('qr-share-btn');

            if (typeof QRCodeStyling === 'undefined') {
                canvasContainer.innerHTML = '<p style="color:#ef4444;font-weight:700;text-align:center"><i class="fa-solid fa-triangle-exclamation"></i> QR Library failed to load.</p>';
                return;
            }

            // Initialize qr-code-styling instance
            const qrCode = new QRCodeStyling({
                width: 200,
                height: 200,
                type: 'canvas',
                data: 'MeyTool QR',
                dotsOptions: {
                    type: 'rounded',
                    gradient: {
                        type: 'linear',
                        rotation: 0,
                        colorStops: [{ offset: 0, color: '#00ffff' }, { offset: 1, color: '#ff00ff' }]
                    }
                },
                backgroundOptions: { color: '#ffffff' },
                imageOptions: { crossOrigin: 'anonymous', margin: 6 },
                cornersSquareOptions: { type: 'extra-rounded', color: '#00ffff' },
                cornersDotOptions: { type: 'dot', color: '#ff00ff' }
            });

            canvasContainer.innerHTML = '';
            qrCode.append(canvasContainer);

            // Accordion toggle
            custToggle.onclick = () => {
                const isOpen = custBody.style.display === 'block';
                custBody.style.display = isOpen ? 'none' : 'block';
                custChevron.className = isOpen ? 'fa-solid fa-chevron-down' : 'fa-solid fa-chevron-up';
            };

            // Preset styles configurations
            const presets = {
                cyber: { c1: '#ff00ff', c2: '#00ffff', bg: '#ffffff', dot: 'rounded', corner: 'extra-rounded' },
                emerald: { c1: '#10b981', c2: '#059669', bg: '#ffffff', dot: 'dots', corner: 'dot' },
                violet: { c1: '#7c3aed', c2: '#db2777', bg: '#ffffff', dot: 'classy-rounded', corner: 'extra-rounded' },
                dark: { c1: '#00ffff', c2: '#8b5cf6', bg: '#121214', dot: 'rounded', corner: 'extra-rounded' },
                minimal: { c1: '#1e293b', c2: '#0f172a', bg: '#ffffff', dot: 'square', corner: 'square' }
            };

            document.querySelectorAll('.qr-preset-btn').forEach(btn => {
                btn.onclick = () => {
                    const preset = presets[btn.getAttribute('data-preset')];
                    if (!preset) return;
                    
                    dotColor1.value = preset.c1;
                    dotColor2.value = preset.c2;
                    bgColor.value = preset.bg;
                    dotStyle.value = preset.dot;
                    cornerStyle.value = preset.corner;
                    
                    utils.showToast(`Applied ${btn.textContent} preset!`);
                    
                    // Highlight active button
                    document.querySelectorAll('.qr-preset-btn').forEach(b => b.classList.remove('primary'));
                    btn.classList.add('primary');

                    updateQR();
                };
            });

            // Render input templates
            const renderInputs = () => {
                const templates = {
                    wifi: `
                        <div style="display:flex; flex-direction:column; gap:8px;">
                            <div class="input-group" style="margin-bottom:8px;">
                                <label style="font-size:10px;">Network Name (SSID)</label>
                                <input type="text" id="wifi-ssid" placeholder="My Home WiFi" class="form-input">
                            </div>
                            <div class="input-group" style="margin-bottom:8px;">
                                <label style="font-size:10px;">Password</label>
                                <input type="password" id="wifi-pass" placeholder="Network password" class="form-input">
                            </div>
                            <div class="input-group" style="margin-bottom:0;">
                                <label style="font-size:10px;">Encryption</label>
                                <select id="wifi-enc" class="form-select">
                                    <option value="WPA">WPA/WPA2</option>
                                    <option value="WEP">WEP</option>
                                    <option value="nopass">None</option>
                                </select>
                            </div>
                        </div>`,
                    email: `
                        <div style="display:flex; flex-direction:column; gap:8px;">
                            <div class="input-group" style="margin-bottom:8px;">
                                <label style="font-size:10px;">Recipient Email</label>
                                <input type="email" id="email-address" placeholder="user@example.com" class="form-input">
                            </div>
                            <div class="input-group" style="margin-bottom:8px;">
                                <label style="font-size:10px;">Subject</label>
                                <input type="text" id="email-subject" placeholder="Hello from MeyTool!" class="form-input">
                            </div>
                            <div class="input-group" style="margin-bottom:0;">
                                <label style="font-size:10px;">Message</label>
                                <input type="text" id="email-body" placeholder="Your message here..." class="form-input">
                            </div>
                        </div>`,
                    phone: `
                        <div class="input-group" style="margin-bottom:0;">
                            <label style="font-size:10px;">Phone Number</label>
                            <input type="tel" id="phone-number" placeholder="+1 234 567 8900" class="form-input">
                        </div>`,
                    url: `<textarea id="qr-data-input" placeholder="https://example.com" class="form-textarea" style="min-height:90px;"></textarea>`,
                    text: `<textarea id="qr-data-input" placeholder="Type text here..." class="form-textarea" style="min-height:90px;"></textarea>`
                };
                dynamicInputs.innerHTML = templates[qrType] || templates.text;
            };

            // Switch tab event handlers
            document.querySelectorAll('.qr-tab').forEach(tab => {
                tab.onclick = () => {
                    document.querySelectorAll('.qr-tab').forEach(t => t.classList.remove('active'));
                    tab.classList.add('active');
                    qrType = tab.getAttribute('data-type');
                    renderInputs();
                };
            });

            // Logo file uploads
            logoBtn.onclick = () => logoUpload.click();
            logoUpload.onchange = (e) => {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (ev) => {
                    qrLogo = ev.target.result;
                    utils.showToast('Logo uploaded!');
                };
                reader.readAsDataURL(file);
            };

            logoRemove.onclick = () => {
                qrLogo = null;
                logoUpload.value = '';
                utils.showToast('Logo cleared!', 'info');
            };

            // Main Generator Function
            const updateQR = () => {
                let data = '';

                if (qrType === 'wifi') {
                    const ssid = document.getElementById('wifi-ssid')?.value || '';
                    const pass = document.getElementById('wifi-pass')?.value || '';
                    const enc  = document.getElementById('wifi-enc')?.value || 'WPA';
                    data = `WIFI:S:${ssid};T:${enc};P:${pass};;`;
                } else if (qrType === 'email') {
                    const addr = document.getElementById('email-address')?.value || '';
                    const sub  = document.getElementById('email-subject')?.value || '';
                    const body = document.getElementById('email-body')?.value || '';
                    data = `mailto:${addr}?subject=${encodeURIComponent(sub)}&body=${encodeURIComponent(body)}`;
                } else if (qrType === 'phone') {
                    const num = document.getElementById('phone-number')?.value || '';
                    data = `tel:${num}`;
                } else {
                    const el = document.getElementById('qr-data-input');
                    data = el ? el.value.trim() : '';
                }

                if (!data) {
                    utils.showToast('Please type input data first!', 'error');
                    return;
                }

                const c1 = dotColor1.value;
                const c2 = dotColor2.value;

                qrCode.update({
                    data: data,
                    image: qrLogo,
                    dotsOptions: {
                        color: c1,
                        type: dotStyle.value,
                        gradient: {
                            type: 'linear',
                            rotation: 0,
                            colorStops: [{ offset: 0, color: c1 }, { offset: 1, color: c2 }]
                        }
                    },
                    backgroundOptions: { color: bgColor.value },
                    cornersSquareOptions: { type: cornerStyle.value, color: c1 },
                    cornersDotOptions: { type: 'dot', color: c2 }
                });

                utils.showToast('QR Code generated!');
                window.incrementStatsRun();
            };

            generateBtn.onclick = updateQR;

            // Download actions
            dlPng.onclick = () => {
                qrCode.download({ name: 'meytool_qr', extension: 'png' });
                utils.showToast('PNG QR code downloaded!');
            };
            dlSvg.onclick = () => {
                qrCode.download({ name: 'meytool_qr', extension: 'svg' });
                utils.showToast('SVG QR code downloaded!');
            };

            // Copy to Clipboard
            copyImg.onclick = async () => {
                try {
                    const canvas = canvasContainer.querySelector('canvas');
                    if (!canvas) {
                        utils.showToast('Generate a QR Code first!', 'error');
                        return;
                    }
                    canvas.toBlob(async (blob) => {
                        const item = new ClipboardItem({ 'image/png': blob });
                        await navigator.clipboard.write([item]);
                        utils.showToast('QR Image copied to clipboard!');
                    });
                } catch(e) {
                    utils.showToast('Copy failed. Try downloading instead.', 'error');
                }
            };

            // Web Share API support
            shareBtn.onclick = async () => {
                if (!navigator.share) {
                    utils.showToast('Web sharing is not supported by your browser.', 'error');
                    return;
                }
                try {
                    const canvas = canvasContainer.querySelector('canvas');
                    if (!canvas) {
                        utils.showToast('Generate a QR Code first!', 'error');
                        return;
                    }
                    canvas.toBlob(async (blob) => {
                        const file = new File([blob], 'meytool_qr.png', { type: 'image/png' });
                        await navigator.share({
                            files: [file],
                            title: 'MeyTool QR Code',
                            text: 'Sleek custom QR code generated instantly!'
                        });
                    });
                } catch(e) {
                    if (e.name !== 'AbortError') utils.showToast('Sharing failed.', 'error');
                }
            };

            // Initial render template
            renderInputs();
        }
    },
    {
        id: 'util-password',
        name: 'Password Strength Analyzer',
        category: 'utilities',
        icon: '<i class="fa-solid fa-shield-halved"></i>',
        description: 'Verify your passwords entropy, character variance, and potential leak status.',
        tags: ['password', 'entropy', 'security', 'leak', 'strength', 'random password'],
        render() {
            return `
                <div class="tool-grid-2col">
                    <div>
                        <div class="input-group">
                            <label>Test Password</label>
                            <div style="position:relative;">
                                <input type="password" class="form-input" id="pass-input" placeholder="Type a password...">
                                <button class="copy-badge-btn" id="pass-toggle" style="right:10px;">Show</button>
                            </div>
                        </div>
                        
                        <div class="input-group">
                            <label>Password Entropy Rating</label>
                            <div id="pass-strength-label" style="font-weight:700; font-size:16px; margin: 5px 0;">Empty</div>
                            <div class="progress-bar-container" style="display:block;">
                                <div class="progress-bar-fill" id="pass-strength-fill" style="width:0%;"></div>
                            </div>
                        </div>

                        <div class="btn-container">
                            <button class="app-btn primary" id="pass-gen-btn">Generate Random Secure Password</button>
                        </div>
                    </div>
                    
                    <div style="background:rgba(255,255,255,0.02); border-radius:8px; padding:15px; border:var(--border-glass);">
                        <h4 style="margin-bottom:10px; color:var(--accent-secondary);">Security Evaluation Checklist</h4>
                        <ul id="pass-checklist" style="list-style:none; display:flex; flex-direction:column; gap:8px; font-size:12px;">
                            <li><i class="fa-solid fa-circle-xmark" style="color:#ef4444; margin-right:8px;"></i> Length (8+ characters)</li>
                            <li><i class="fa-solid fa-circle-xmark" style="color:#ef4444; margin-right:8px;"></i> Contains uppercase letters</li>
                            <li><i class="fa-solid fa-circle-xmark" style="color:#ef4444; margin-right:8px;"></i> Contains lowercase letters</li>
                            <li><i class="fa-solid fa-circle-xmark" style="color:#ef4444; margin-right:8px;"></i> Contains numbers</li>
                            <li><i class="fa-solid fa-circle-xmark" style="color:#ef4444; margin-right:8px;"></i> Contains special characters</li>
                        </ul>
                    </div>
                </div>
            `;
        },
        init() {
            const input = document.getElementById('pass-input');
            const toggle = document.getElementById('pass-toggle');
            const label = document.getElementById('pass-strength-label');
            const fill = document.getElementById('pass-strength-fill');
            const checklist = document.getElementById('pass-checklist');

            toggle.onclick = () => {
                if (input.type === 'password') {
                    input.type = 'text';
                    toggle.textContent = 'Hide';
                } else {
                    input.type = 'password';
                    toggle.textContent = 'Show';
                }
            };

            const evaluateStrength = () => {
                const pass = input.value;
                if (!pass) {
                    label.textContent = 'Empty';
                    label.style.color = 'var(--text-secondary)';
                    fill.style.width = '0%';
                    fill.style.background = 'var(--text-muted)';
                    return;
                }

                let score = 0;
                const criteria = {
                    length: pass.length >= 8,
                    upper: /[A-Z]/.test(pass),
                    lower: /[a-z]/.test(pass),
                    number: /[0-9]/.test(pass),
                    special: /[^A-Za-z0-9]/.test(pass)
                };

                if (criteria.length) score++;
                if (criteria.upper) score++;
                if (criteria.lower) score++;
                if (criteria.number) score++;
                if (criteria.special) score++;

                const listItems = checklist.querySelectorAll('li');
                const updateCheck = (index, met) => {
                    listItems[index].innerHTML = met 
                        ? `<i class="fa-solid fa-circle-check" style="color:#10b981; margin-right:8px;"></i> ${listItems[index].textContent.trim()}`
                        : `<i class="fa-solid fa-circle-xmark" style="color:#ef4444; margin-right:8px;"></i> ${listItems[index].textContent.trim()}`;
                };

                updateCheck(0, criteria.length);
                updateCheck(1, criteria.upper);
                updateCheck(2, criteria.lower);
                updateCheck(3, criteria.number);
                updateCheck(4, criteria.special);

                fill.style.width = `${(score / 5) * 100}%`;

                if (score <= 2) {
                    label.textContent = 'WEAK (Easy to crack)';
                    label.style.color = '#ef4444';
                    fill.style.background = '#ef4444';
                } else if (score <= 4) {
                    label.textContent = 'MEDIUM (Average security)';
                    label.style.color = '#f59e0b';
                    fill.style.background = '#f59e0b';
                } else {
                    label.textContent = 'STRONG (Cryptographically Secure)';
                    label.style.color = '#10b981';
                    fill.style.background = '#10b981';
                }
            };

            input.oninput = evaluateStrength;

            document.getElementById('pass-gen-btn').onclick = () => {
                const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=";
                let password = "";
                for (let i = 0; i < 16; i++) {
                    const rnd = crypto.getRandomValues(new Uint32Array(1))[0];
                    password += chars.charAt(rnd % chars.length);
                }
                input.value = password;
                evaluateStrength();
                utils.copyText(password);
                utils.showToast('Copied generated password!');
                window.incrementStatsRun();
            };
        }
    },
    {
        id: 'util-color',
        name: 'Color Picker & Palette',
        category: 'utilities',
        icon: '<i class="fa-solid fa-palette"></i>',
        description: 'Interactive color picker that generates matching analogous, monochromatic, and triadic palettes.',
        tags: ['color', 'palette', 'hex', 'rgb', 'picker', 'complementary', 'design'],
        render() {
            return `
                <div class="tool-grid-2col">
                    <div>
                        <div class="input-group">
                            <label>Base Color Picker</label>
                            <input type="color" class="form-input" id="cp-picker" value="#ff00ff" style="height:60px; padding:2px;">
                        </div>
                        <div class="input-group">
                            <label>HEX Code</label>
                            <input type="text" class="form-input" id="cp-hex" value="#ff00ff">
                        </div>
                        <div class="btn-container">
                            <button class="app-btn primary" id="cp-copy-btn">Copy HEX</button>
                        </div>
                    </div>
                    <div>
                        <label style="font-size:12px; font-weight:600; color:var(--text-secondary); text-transform:uppercase;">Generated Palettes</label>
                        
                        <div style="margin-top:10px;">
                            <span style="font-size:11px; color:var(--text-secondary);">Complementary:</span>
                            <div class="color-palette-grid" id="cp-complementary"></div>
                        </div>
                        
                        <div style="margin-top:10px;">
                            <span style="font-size:11px; color:var(--text-secondary);">Monochromatic:</span>
                            <div class="color-palette-grid" id="cp-monochromatic"></div>
                        </div>
                    </div>
                </div>
            `;
        },
        init() {
            const picker = document.getElementById('cp-picker');
            const hexField = document.getElementById('cp-hex');
            
            const compGrid = document.getElementById('cp-complementary');
            const monoGrid = document.getElementById('cp-monochromatic');

            const hexToRgb = (hex) => {
                const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                return result ? {
                    r: parseInt(result[1], 16),
                    g: parseInt(result[2], 16),
                    b: parseInt(result[3], 16)
                } : null;
            };

            const rgbToHex = (r, g, b) => {
                return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
            };

            const generatePaletteSwatches = () => {
                const hex = hexField.value;
                picker.value = hex;
                
                const rgb = hexToRgb(hex);
                if (!rgb) return;
                
                // Complementary color
                const compR = 255 - rgb.r;
                const compG = 255 - rgb.g;
                const compB = 255 - rgb.b;
                const compHex = rgbToHex(compR, compG, compB);
                
                compGrid.innerHTML = `
                    <div class="color-palette-card" style="background:${hex};" onclick="utils.copyText('${hex}')"></div>
                    <div class="color-palette-card" style="background:${compHex};" onclick="utils.copyText('${compHex}')"></div>
                `;
                
                // Monochromatic colors (lighter/darker shades)
                monoGrid.innerHTML = '';
                const steps = [-40, -20, 0, 20, 40];
                for (const step of steps) {
                    const adjust = (c) => Math.max(0, Math.min(255, c + step));
                    const shadeHex = rgbToHex(adjust(rgb.r), adjust(rgb.g), adjust(rgb.b));
                    
                    const swatch = document.createElement('div');
                    swatch.className = 'color-palette-card';
                    swatch.style.background = shadeHex;
                    swatch.onclick = () => {
                        utils.copyText(shadeHex);
                        window.incrementStatsRun();
                    };
                    monoGrid.appendChild(swatch);
                }
            };

            picker.oninput = (e) => {
                hexField.value = e.target.value;
                generatePaletteSwatches();
            };

            hexField.oninput = () => {
                if (hexField.value.match(/^#[0-9A-Fa-f]{6}$/)) {
                    generatePaletteSwatches();
                }
            };

            document.getElementById('cp-copy-btn').onclick = () => {
                utils.copyText(hexField.value);
                window.incrementStatsRun();
            };

            generatePaletteSwatches();
        }
    },

    // --- CREATOR TOOLS ---
    {
        id: 'creator-glass',
        name: 'Glassmorphism CSS Generator',
        category: 'creator',
        icon: '<i class="fa-solid fa-wand-magic-sparkles"></i>',
        description: 'Generate glassmorphism styling parameters and copy the custom CSS rules.',
        tags: ['glass', 'glassmorphism', 'blur', 'css', 'shadow', 'design', 'ui'],
        render() {
            return `
                <div class="tool-grid-2col">
                    <div>
                        <div class="input-group">
                            <label>Blur Intensity (<span id="glass-blur-val">12</span>px)</label>
                            <input type="range" class="form-slider" id="glass-blur" min="0" max="40" value="12">
                        </div>
                        
                        <div class="input-group">
                            <label>Background Transparency (<span id="glass-trans-val">40</span>%)</label>
                            <input type="range" class="form-slider" id="glass-trans" min="0" max="100" value="40">
                        </div>

                        <div class="input-group">
                            <label>Border Opacity (<span id="glass-border-val">10</span>%)</label>
                            <input type="range" class="form-slider" id="glass-border" min="0" max="100" value="10">
                        </div>
                        
                        <div class="input-group">
                            <label>Base Accent Color</label>
                            <input type="color" class="form-input" id="glass-color" value="#ffffff">
                        </div>
                    </div>
                    
                    <div style="display:flex; flex-direction:column; justify-content:center; align-items:center;">
                        <div class="glass-preview-container" style="background:#0a0a0f;">
                            <div class="glass-preview-box" id="glass-preview-box">Preview Box</div>
                        </div>
                    </div>
                </div>
                
                <div class="output-container">
                    <button class="copy-badge-btn" id="glass-copy">Copy CSS</button>
                    <pre class="output-pre" id="glass-css-output"></pre>
                </div>
            `;
        },
        init() {
            const blurSlider = document.getElementById('glass-blur');
            const transSlider = document.getElementById('glass-trans');
            const borderSlider = document.getElementById('glass-border');
            const colorPicker = document.getElementById('glass-color');
            
            const blurVal = document.getElementById('glass-blur-val');
            const transVal = document.getElementById('glass-trans-val');
            const borderVal = document.getElementById('glass-border-val');
            
            const previewBox = document.getElementById('glass-preview-box');
            const cssOutput = document.getElementById('glass-css-output');

            const hexToRgb = (hex) => {
                const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '255, 255, 255';
            };

            const updateGlassStyle = () => {
                const blur = blurSlider.value;
                const trans = transSlider.value / 100;
                const border = borderSlider.value / 100;
                const rgb = hexToRgb(colorPicker.value);
                
                blurVal.textContent = blur;
                transVal.textContent = transSlider.value;
                borderVal.textContent = borderSlider.value;

                const cssStyle = `background: rgba(${rgb}, ${trans});\nbackdrop-filter: blur(${blur}px);\n-webkit-backdrop-filter: blur(${blur}px);\nborder: 1px solid rgba(255, 255, 255, ${border});\nborder-radius: 12px;`;
                
                previewBox.style.background = `rgba(${rgb}, ${trans})`;
                previewBox.style.backdropFilter = `blur(${blur}px)`;
                previewBox.style.webkitBackdropFilter = `blur(${blur}px)`;
                previewBox.style.border = `1px solid rgba(255, 255, 255, ${border})`;
                
                cssOutput.textContent = cssStyle;
            };

            blurSlider.oninput = updateGlassStyle;
            transSlider.oninput = updateGlassStyle;
            borderSlider.oninput = updateGlassStyle;
            colorPicker.oninput = updateGlassStyle;

            document.getElementById('glass-copy').onclick = () => {
                utils.copyText(cssOutput.textContent);
                window.incrementStatsRun();
            };

            updateGlassStyle();
        }
    },
    {
        id: 'creator-gradient',
        name: 'CSS Gradient Generator',
        category: 'creator',
        icon: '<i class="fa-solid fa-sliders"></i>',
        description: 'Design dynamic linear gradients and copy the CSS background rules.',
        tags: ['gradient', 'css', 'color', 'linear', 'background', 'design', 'generator'],
        render() {
            return `
                <div class="tool-grid-2col">
                    <div>
                        <div class="input-group">
                            <label>Start Color</label>
                            <input type="color" class="form-input" id="grad-col1" value="#ff00ff" style="height:40px; padding:2px;">
                        </div>
                        
                        <div class="input-group">
                            <label>End Color</label>
                            <input type="color" class="form-input" id="grad-col2" value="#00ffff" style="height:40px; padding:2px;">
                        </div>

                        <div class="input-group">
                            <label>Angle Direction (<span id="grad-angle-val">135</span>°)</label>
                            <input type="range" class="form-slider" id="grad-angle" min="0" max="360" value="135">
                        </div>
                    </div>
                    
                    <div style="display:flex; flex-direction:column; justify-content:center; align-items:center; width:100%;">
                        <div class="glass-preview-container" id="grad-preview" style="background: linear-gradient(135deg, #ff00ff 0%, #00ffff 100%);">
                        </div>
                    </div>
                </div>
                
                <div class="output-container">
                    <button class="copy-badge-btn" id="grad-copy">Copy CSS</button>
                    <pre class="output-pre" id="grad-css-output"></pre>
                </div>
            `;
        },
        init() {
            const col1 = document.getElementById('grad-col1');
            const col2 = document.getElementById('grad-col2');
            const angleSlider = document.getElementById('grad-angle');
            
            const angleVal = document.getElementById('grad-angle-val');
            const preview = document.getElementById('grad-preview');
            const cssOutput = document.getElementById('grad-css-output');

            const updateGradient = () => {
                const color1 = col1.value;
                const color2 = col2.value;
                const angle = angleSlider.value;
                
                angleVal.textContent = angle;
                
                const gradStyle = `background: linear-gradient(${angle}deg, ${color1} 0%, ${color2} 100%);`;
                preview.style.background = `linear-gradient(${angle}deg, ${color1}, ${color2})`;
                cssOutput.textContent = gradStyle;
            };

            col1.oninput = updateGradient;
            col2.oninput = updateGradient;
            angleSlider.oninput = updateGradient;

            document.getElementById('grad-copy').onclick = () => {
                utils.copyText(cssOutput.textContent);
                window.incrementStatsRun();
            };

            updateGradient();
        }
    },
    {
        id: 'file-universal-pdf',
        popular: true,
        name: 'Universal PDF Converter',
        category: 'file',
        icon: '<i class="fa-solid fa-file-pdf"></i>',
        description: 'Convert any file (TXT, JSON, CSV table, Images, HTML, Markdown, or Base64) into a beautifully formatted PDF report.',
        tags: ['pdf', 'convert', 'csv to pdf', 'image to pdf', 'html to pdf', 'markdown to pdf', 'batch pdf', 'merge', 'universal'],
        render() {
            return `
                <div class="tool-grid-2col">
                    <div>
                        <!-- File Upload -->
                        <div class="input-group">
                            <label>Upload Input Files</label>
                            <div class="uploader-box" id="updf-dropzone">
                                <i class="fa-solid fa-cloud-arrow-up uploader-icon" style="color:var(--accent-secondary);"></i>
                                <div class="uploader-text">Select or drop multiple files here</div>
                                <div class="uploader-hint">Supports .txt, .json, .csv, .md, images, .html, and base64 text files</div>
                                <input type="file" id="updf-file-input" multiple style="display: none;">
                            </div>
                        </div>

                        <!-- Selected Files List -->
                        <div class="input-group">
                            <label>Files to Process</label>
                            <div id="updf-files-list" style="background:rgba(0,0,0,0.2); border:1px solid rgba(255,255,255,0.05); border-radius:8px; padding:10px; max-height:150px; overflow-y:auto; display:flex; flex-direction:column; gap:6px;">
                                <div style="font-size:12px; color:var(--text-muted); text-align:center; padding:10px;">No files selected</div>
                            </div>
                        </div>

                        <!-- Cover Page Options -->
                        <div style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.05); border-radius:8px; padding:12px; margin-top:10px;">
                            <div class="input-group" style="flex-direction:row; gap:10px; align-items:center; margin-bottom:0;">
                                <input type="checkbox" id="updf-cover-page" style="width:16px; height:16px; cursor:pointer;">
                                <label for="updf-cover-page" style="cursor:pointer; font-size:12px; font-weight:700; color:var(--accent-secondary);">Add Premium Cover Page</label>
                            </div>
                            <div id="updf-cover-inputs" style="display:none; margin-top:10px; gap:8px; flex-direction:column;">
                                <input type="text" class="form-input" id="updf-cover-title" placeholder="Document Title" value="Universal Compilation Report" style="font-size:12px; padding:6px 10px;">
                                <input type="text" class="form-input" id="updf-cover-subtitle" placeholder="Document Subtitle" value="An All-in-One MeyTool Generation" style="font-size:12px; padding:6px 10px;">
                                <input type="text" class="form-input" id="updf-cover-author" placeholder="Author / Organization" value="Developer User" style="font-size:12px; padding:6px 10px;">
                            </div>
                        </div>

                        <!-- Document Configuration -->
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-top:15px;">
                            <div class="input-group">
                                <label>Page Style Template</label>
                                <select id="updf-template" class="form-select">
                                    <option value="minimal">Minimal Report</option>
                                    <option value="developer">Developer Dark</option>
                                    <option value="table">Data Table</option>
                                    <option value="presentation">Presentation</option>
                                </select>
                            </div>
                            <div class="input-group">
                                <label>PDF Filename</label>
                                <input type="text" class="form-input" id="updf-name" value="meytool_universal_report.pdf">
                            </div>
                        </div>

                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-top:12px;">
                            <div class="input-group" style="flex-direction:row; gap:10px; align-items:center;">
                                <input type="checkbox" id="updf-page-num" checked style="width:16px; height:16px; cursor:pointer;">
                                <label for="updf-page-num" style="cursor:pointer; font-size:12px;">Auto Page Numbering</label>
                            </div>
                            <div class="input-group" style="flex-direction:row; gap:10px; align-items:center;">
                                <input type="checkbox" id="updf-auto-download" checked style="width:16px; height:16px; cursor:pointer;">
                                <label for="updf-auto-download" style="cursor:pointer; font-size:12px;">Auto-Download PDF</label>
                            </div>
                        </div>

                        <button class="app-btn primary" id="updf-convert-btn" style="width:100%; margin-top:15px;">
                            <i class="fa-solid fa-file-pdf" style="margin-right:6px;"></i>Generate PDF Report
                        </button>
                    </div>

                    <div>
                        <div class="input-group">
                            <label>Compiler Console Log</label>
                            <div class="output-container" style="margin-top:0;">
                                <pre class="output-pre" id="updf-log" style="min-height:250px; max-height:350px; overflow-y:auto; font-size:11px;">[Ready] Waiting for files to compile...</pre>
                            </div>
                        </div>
                        
                        <div class="progress-bar-container" id="updf-progress-bar" style="margin-top:15px;">
                            <div class="progress-bar-fill" id="updf-progress-fill"></div>
                        </div>
                    </div>
                </div>
            `;
        },
        init() {
            const dropzone = document.getElementById('updf-dropzone');
            const fileInput = document.getElementById('updf-file-input');
            const filesList = document.getElementById('updf-files-list');
            const styleTemplate = document.getElementById('updf-template');
            const pdfName = document.getElementById('updf-name');
            const pageNumCheckbox = document.getElementById('updf-page-num');
            const coverCheckbox = document.getElementById('updf-cover-page');
            const coverInputs = document.getElementById('updf-cover-inputs');
            const autoDownloadCheckbox = document.getElementById('updf-auto-download');
            const convertBtn = document.getElementById('updf-convert-btn');
            const logBox = document.getElementById('updf-log');
            
            const progressBar = document.getElementById('updf-progress-bar');
            const progressFill = document.getElementById('updf-progress-fill');

            let queueFiles = [];

            coverCheckbox.onchange = () => {
                coverInputs.style.display = coverCheckbox.checked ? 'flex' : 'none';
            };

            const updateLog = (msg, append = true) => {
                const prefix = `[${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}] `;
                if (append) {
                    logBox.textContent += `\n${prefix}${msg}`;
                } else {
                    logBox.textContent = `${prefix}${msg}`;
                }
                logBox.scrollTop = logBox.scrollHeight;
            };

            const renderFilesList = () => {
                filesList.innerHTML = '';
                if (queueFiles.length === 0) {
                    filesList.innerHTML = `<div style="font-size:12px; color:var(--text-muted); text-align:center; padding:10px;">No files selected</div>`;
                    return;
                }

                queueFiles.forEach((file, index) => {
                    const row = document.createElement('div');
                    row.style.cssText = "display:flex; justify-content:space-between; align-items:center; padding:6px 10px; background:rgba(255,255,255,0.03); border-radius:4px; font-size:12px;";
                    
                    let icon = 'fa-file-lines';
                    if (file.name.endsWith('.json')) icon = 'fa-code';
                    else if (file.name.endsWith('.csv')) icon = 'fa-table';
                    else if (file.name.endsWith('.md')) icon = 'fa-brands fa-markdown';
                    else if (file.type.startsWith('image/')) icon = 'fa-image';
                    else if (file.name.endsWith('.html')) icon = 'fa-file-code';

                    row.innerHTML = `
                        <span style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:200px;">
                            <i class="fa-solid ${icon}" style="margin-right:8px; color:var(--accent-secondary);"></i>${file.name} (${utils.formatBytes(file.size)})
                        </span>
                        <i class="fa-solid fa-trash-can" style="color:#ef4444; cursor:pointer;" onclick="window.removePdfQueueFile(${index})"></i>
                    `;
                    filesList.appendChild(row);
                });
            };

            // Expose globally so inline delete works
            window.removePdfQueueFile = (index) => {
                queueFiles.splice(index, 1);
                renderFilesList();
                updateLog(`Removed file index ${index}`);
            };

            const handleFiles = (files) => {
                for (const file of files) {
                    queueFiles.push(file);
                    updateLog(`Added file: ${file.name} (${file.type || 'unknown type'})`);
                }
                renderFilesList();
            };

            dropzone.onclick = () => fileInput.click();
            fileInput.onchange = (e) => handleFiles(e.target.files);

            dropzone.ondragover = (e) => {
                e.preventDefault();
                dropzone.classList.add('drag-over');
            };
            dropzone.ondragleave = () => dropzone.classList.remove('drag-over');
            dropzone.ondrop = (e) => {
                e.preventDefault();
                dropzone.classList.remove('drag-over');
                handleFiles(e.dataTransfer.files);
            };

            // Main Compiler Engine
            convertBtn.onclick = async () => {
                if (queueFiles.length === 0) {
                    utils.showToast('Please upload files to convert!', 'error');
                    return;
                }

                convertBtn.disabled = true;
                progressBar.style.display = 'block';
                progressFill.style.width = '5%';
                updateLog('Compiler started. Initializing document...', false);

                // Guard: ensure jsPDF library is loaded
                if (!window.jspdf) {
                    utils.showToast('PDF library not loaded. Check your internet connection.', 'error');
                    convertBtn.disabled = false;
                    progressBar.style.display = 'none';
                    return;
                }

                const { jsPDF } = window.jspdf;
                const templateMode = styleTemplate.value;
                const orientation = templateMode === 'presentation' ? 'l' : 'p';
                
                const doc = new jsPDF({
                    orientation: orientation,
                    unit: 'mm',
                    format: 'a4'
                });

                const pageWidth = doc.internal.pageSize.width;
                const pageHeight = doc.internal.pageSize.height;
                const margin = 15;

                let pageIdx = 0;

                // Cover Page Generator
                const showCover = coverCheckbox.checked;
                if (showCover) {
                    updateLog('Adding Premium cover page to document...');
                    const coverTitle = document.getElementById('updf-cover-title').value || 'Report';
                    const coverSubtitle = document.getElementById('updf-cover-subtitle').value || '';
                    const coverAuthor = document.getElementById('updf-cover-author').value || 'MeyTool';
                    const coverDate = new Date().toLocaleDateString();

                    if (templateMode === 'developer') {
                        doc.setFillColor(15, 23, 42);
                        doc.rect(0, 0, pageWidth, pageHeight, 'F');
                        
                        doc.setTextColor(56, 189, 248);
                        doc.setFont('courier', 'bold');
                        doc.setFontSize(28);
                        doc.text(coverTitle, margin, pageHeight / 3);
                        
                        doc.setTextColor(244, 63, 94);
                        doc.setFont('courier', 'normal');
                        doc.setFontSize(14);
                        doc.text(coverSubtitle, margin, pageHeight / 3 + 15);
                        
                        doc.setTextColor(148, 163, 184);
                        doc.setFontSize(10);
                        doc.text(`Author: ${coverAuthor}`, margin, pageHeight - 40);
                        doc.text(`Date: ${coverDate}`, margin, pageHeight - 32);
                    } else if (templateMode === 'presentation') {
                        doc.setFillColor(245, 245, 250);
                        doc.rect(0, 0, pageWidth, pageHeight, 'F');
                        doc.setDrawColor(255, 0, 255);
                        doc.setLineWidth(2);
                        doc.rect(10, 10, pageWidth - 20, pageHeight - 20);
                        
                        doc.setTextColor(15, 23, 42);
                        doc.setFont('helvetica', 'bold');
                        doc.setFontSize(32);
                        doc.text(coverTitle, pageWidth / 2, pageHeight / 2 - 10, { align: 'center' });
                        
                        doc.setTextColor(100, 100, 100);
                        doc.setFont('helvetica', 'normal');
                        doc.setFontSize(16);
                        doc.text(coverSubtitle, pageWidth / 2, pageHeight / 2 + 10, { align: 'center' });
                        
                        doc.setFontSize(12);
                        doc.text(`Author: ${coverAuthor} | Date: ${coverDate}`, pageWidth / 2, pageHeight - 30, { align: 'center' });
                    } else {
                        doc.setTextColor(15, 23, 42);
                        doc.setFont('helvetica', 'bold');
                        doc.setFontSize(36);
                        doc.text(coverTitle, margin, pageHeight / 2 - 20);
                        
                        doc.setDrawColor(15, 23, 42);
                        doc.setLineWidth(1);
                        doc.line(margin, pageHeight / 2 - 10, pageWidth - margin, pageHeight / 2 - 10);
                        
                        doc.setTextColor(100, 100, 100);
                        doc.setFont('helvetica', 'normal');
                        doc.setFontSize(16);
                        doc.text(coverSubtitle, margin, pageHeight / 2 + 10);
                        
                        doc.setFontSize(12);
                        doc.text(`Prepared by: ${coverAuthor}`, margin, pageHeight - 40);
                        doc.text(`Date: ${coverDate}`, margin, pageHeight - 30);
                    }
                    pageIdx++;
                }

                for (let i = 0; i < queueFiles.length; i++) {
                    const file = queueFiles[i];
                    updateLog(`Processing file [${i + 1}/${queueFiles.length}]: ${file.name}...`);
                    
                    const progressPct = 5 + Math.floor((i / queueFiles.length) * 85);
                    progressFill.style.width = `${progressPct}%`;

                    // Add page if not the first file
                    if (pageIdx > 0) {
                        doc.addPage();
                    }
                    pageIdx++;

                    let posY = 20;

                    // Apply template styling
                    if (templateMode === 'developer') {
                        doc.setFillColor(30, 41, 59);
                        doc.rect(0, 0, pageWidth, pageHeight, 'F');
                        doc.setTextColor(56, 189, 248); // Cyan text
                        doc.setFont('courier', 'normal');
                    } else if (templateMode === 'presentation') {
                        doc.setFillColor(250, 250, 250);
                        doc.rect(0, 0, pageWidth, pageHeight, 'F');
                        doc.setDrawColor(255, 0, 255); // Neon pink border frame
                        doc.setLineWidth(1);
                        doc.rect(5, 5, pageWidth - 10, pageHeight - 10);
                        doc.setTextColor(15, 23, 42);
                        doc.setFont('helvetica', 'normal');
                    } else {
                        doc.setTextColor(0, 0, 0);
                        doc.setFont('helvetica', 'normal');
                    }

                    // Section Title
                    doc.setFontSize(12);
                    doc.setFont(undefined, 'bold');
                    doc.text(`[FILE] ${file.name.toUpperCase()}`, margin, posY);
                    
                    if (templateMode === 'presentation') {
                        doc.setDrawColor(0, 255, 255);
                        doc.setLineWidth(0.5);
                        doc.line(margin, posY + 2, pageWidth - margin, posY + 2);
                    }
                    posY += 10;
                    doc.setFont(undefined, 'normal');
                    doc.setFontSize(10);

                    // Read content
                    const fileContent = await new Promise((resolve) => {
                        const reader = new FileReader();
                        if (file.type.startsWith('image/')) {
                            reader.readAsDataURL(file);
                        } else {
                            reader.readAsText(file);
                        }
                        reader.onload = (evt) => resolve(evt.target.result);
                    });

                    // Determine format and render
                    const isJson = file.name.endsWith('.json');
                    const isCsv = file.name.endsWith('.csv');
                    const isImage = file.type.startsWith('image/');
                    const isHtml = file.name.endsWith('.html') || file.name.endsWith('.htm');
                    const isMarkdown = file.name.endsWith('.md') || file.name.endsWith('.markdown');
                    const isBase64 = file.name.endsWith('.base64') || (!isImage && !isMarkdown && fileContent.startsWith('data:'));

                    if (isImage) {
                        updateLog(`Rendering image: ${file.name}`);
                        const img = await new Promise((resolve) => {
                            const imgEl = new Image();
                            imgEl.src = fileContent;
                            imgEl.onload = () => resolve(imgEl);
                        });

                        const maxWidth = pageWidth - (margin * 2);
                        const maxHeight = pageHeight - posY - margin;
                        
                        let w = img.width;
                        let h = img.height;
                        
                        const ratio = Math.min(maxWidth / w, maxHeight / h);
                        w = w * ratio;
                        h = h * ratio;

                        doc.addImage(fileContent, 'PNG', margin, posY, w, h);
                        posY += h + 10;
                    } 
                    else if (isJson) {
                        updateLog(`Structuring JSON data pretty print`);
                        try {
                            const formattedStr = JSON.stringify(JSON.parse(fileContent), null, 2);
                            doc.setFont('courier', 'normal');
                            const lines = doc.splitTextToSize(formattedStr, pageWidth - (margin * 2));
                            lines.forEach(line => {
                                if (posY > pageHeight - margin) {
                                    doc.addPage();
                                    pageIdx++;
                                    posY = 20;
                                    if (templateMode === 'developer') {
                                        doc.setFillColor(30, 41, 59); doc.rect(0, 0, pageWidth, pageHeight, 'F');
                                        doc.setTextColor(56, 189, 248); doc.setFont('courier');
                                    }
                                }
                                doc.text(line, margin, posY);
                                posY += 5;
                            });
                        } catch(e) {
                            doc.text(`Error parsing JSON: ${e.message}`, margin, posY);
                        }
                    } 
                    else if (isCsv) {
                        updateLog(`Formatting CSV spreadsheet table`);
                        const rows = fileContent.split('\n')
                            .map(line => line.split(','))
                            .filter(row => row.length > 0 && row[0].trim() !== '');

                        if (rows.length > 0) {
                            const headers = rows[0];
                            const bodyRows = rows.slice(1);
                            
                            if (typeof doc.autoTable === 'function') {
                                doc.autoTable({
                                    head: [headers],
                                    body: bodyRows,
                                    startY: posY,
                                    margin: { left: margin, right: margin },
                                    theme: templateMode === 'developer' ? 'grid' : 'striped',
                                    styles: {
                                        font: templateMode === 'developer' ? 'courier' : 'helvetica',
                                        fillColor: templateMode === 'developer' ? [30, 41, 59] : undefined,
                                        textColor: templateMode === 'developer' ? [255, 255, 255] : undefined
                                    },
                                    headStyles: {
                                        fillColor: templateMode === 'developer' ? [15, 23, 42] : [79, 70, 229]
                                    }
                                });
                                posY = doc.lastAutoTable.finalY + 10;
                            } else {
                                updateLog('autoTable plugin not loaded — rendering CSV as text', true);
                                const plainText = rows.map(r => r.join('  |  ')).join('\n');
                                const lines = doc.splitTextToSize(plainText, pageWidth - (margin * 2));
                                lines.forEach(line => {
                                    if (posY > pageHeight - margin) { doc.addPage(); pageIdx++; posY = 20; }
                                    doc.text(line, margin, posY);
                                    posY += 5;
                                });
                            }
                        } else {
                            doc.text("Empty CSV file content", margin, posY);
                        }
                    } 
                    else if (isHtml) {
                        updateLog(`Rendering HTML layout via html2canvas`);
                        const tempDiv = document.createElement('div');
                        tempDiv.style.cssText = `position:absolute; left:-9999px; width:${pageWidth - (margin * 2)}mm; padding:15px; font-family:sans-serif; font-size:12px; line-height:1.4; color:#000; background:#fff;`;
                        tempDiv.innerHTML = fileContent;
                        document.body.appendChild(tempDiv);
                        
                        try {
                            const canvas = await html2canvas(tempDiv);
                            const imgData = canvas.toDataURL('image/png');
                            const w = pageWidth - (margin * 2);
                            const h = (canvas.height / canvas.width) * w;
                            
                            doc.addImage(imgData, 'PNG', margin, posY, w, h);
                            posY += h + 10;
                        } catch(err) {
                            updateLog(`HTML render error: ${err.message}`, true);
                            doc.text(`HTML rendering failed: ${err.message}`, margin, posY);
                        } finally {
                            if (document.body.contains(tempDiv)) {
                                document.body.removeChild(tempDiv);
                            }
                        }
                    }
                    else if (isMarkdown) {
                        updateLog(`Parsing Markdown document`);
                        const lines = fileContent.split('\n');
                        lines.forEach(line => {
                            let textLine = line.trim();
                            let isHeader = false;
                            let isListItem = false;
                            
                            if (textLine.startsWith('# ')) {
                                doc.setFontSize(16);
                                doc.setFont(undefined, 'bold');
                                textLine = textLine.replace('# ', '');
                                isHeader = true;
                            } else if (textLine.startsWith('## ')) {
                                doc.setFontSize(14);
                                doc.setFont(undefined, 'bold');
                                textLine = textLine.replace('## ', '');
                                isHeader = true;
                            } else if (textLine.startsWith('### ')) {
                                doc.setFontSize(12);
                                doc.setFont(undefined, 'bold');
                                textLine = textLine.replace('### ', '');
                                isHeader = true;
                            } else if (textLine.startsWith('- ') || textLine.startsWith('* ')) {
                                doc.setFontSize(10);
                                doc.setFont(undefined, 'normal');
                                textLine = '• ' + textLine.substring(2);
                                isListItem = true;
                            } else {
                                doc.setFontSize(10);
                                doc.setFont(undefined, 'normal');
                            }

                            // Bold parsing: **bold** -> bold
                            textLine = textLine.replace(/\*\*(.*?)\*\*/g, '$1');

                            const splitLines = doc.splitTextToSize(textLine, pageWidth - (margin * 2));
                            splitLines.forEach(l => {
                                if (posY > pageHeight - margin) {
                                    doc.addPage();
                                    pageIdx++;
                                    posY = 20;
                                    if (templateMode === 'developer') {
                                        doc.setFillColor(30, 41, 59); doc.rect(0, 0, pageWidth, pageHeight, 'F');
                                        doc.setTextColor(56, 189, 248); doc.setFont('courier');
                                    }
                                }
                                doc.text(l, margin, posY);
                                posY += isHeader ? 8 : 5;
                            });
                            
                            if (isHeader || isListItem) {
                                posY += 2;
                            } else {
                                posY += 3;
                            }
                        });
                    }
                    else if (isBase64) {
                        updateLog(`Decoding Base64 stream`);
                        let rawText = '';
                        try {
                            let cleanB64 = fileContent;
                            if (fileContent.includes(';base64,')) {
                                cleanB64 = fileContent.split(';base64,')[1];
                            }
                            rawText = atob(cleanB64.replace(/\s/g, ''));
                        } catch(e) {
                            rawText = fileContent;
                        }
                        
                        const lines = doc.splitTextToSize(rawText, pageWidth - (margin * 2));
                        lines.forEach(line => {
                            if (posY > pageHeight - margin) {
                                doc.addPage();
                                pageIdx++;
                                posY = 20;
                                if (templateMode === 'developer') {
                                    doc.setFillColor(30, 41, 59); doc.rect(0, 0, pageWidth, pageHeight, 'F');
                                    doc.setTextColor(56, 189, 248); doc.setFont('courier');
                                }
                            }
                            doc.text(line, margin, posY);
                            posY += 5;
                        });
                    } 
                    else {
                        updateLog(`Adding plain text contents`);
                        const lines = doc.splitTextToSize(fileContent, pageWidth - (margin * 2));
                        lines.forEach(line => {
                            if (posY > pageHeight - margin) {
                                doc.addPage();
                                pageIdx++;
                                posY = 20;
                                if (templateMode === 'developer') {
                                    doc.setFillColor(30, 41, 59); doc.rect(0, 0, pageWidth, pageHeight, 'F');
                                    doc.setTextColor(56, 189, 248); doc.setFont('courier');
                                }
                            }
                            doc.text(line, margin, posY);
                            posY += 5;
                        });
                    }
                }

                // Header & Footer styling for page numbers
                updateLog('Compiling headers, footers, and page numbers...');
                const totalPages = doc.internal.getNumberOfPages();
                const showPageNum = pageNumCheckbox.checked;

                for (let i = 1; i <= totalPages; i++) {
                    doc.setPage(i);
                    doc.setFontSize(8);
                    
                    // Skip page numbering on cover page if cover page is shown
                    if (showCover && i === 1) continue;

                    if (templateMode === 'developer') {
                        doc.setTextColor(98, 98, 128);
                        doc.setFont('courier', 'normal');
                        doc.text("MeyTool Compiler Report v1.0", margin, 10);
                        if (showPageNum) {
                            const pgNum = showCover ? i - 1 : i;
                            const pgTotal = showCover ? totalPages - 1 : totalPages;
                            doc.text(`[PAGE ${pgNum} OF ${pgTotal}]`, pageWidth - margin - 25, pageHeight - 8);
                        }
                    } else if (templateMode === 'presentation') {
                        doc.setTextColor(100, 100, 100);
                        doc.setFont('helvetica', 'normal');
                        doc.text("MeyTool Presentation Export", margin, 10);
                        if (showPageNum) {
                            const pgNum = showCover ? i - 1 : i;
                            const pgTotal = showCover ? totalPages - 1 : totalPages;
                            doc.text(`Slide ${pgNum} of ${pgTotal}`, pageWidth - margin - 20, pageHeight - 8);
                        }
                    } else {
                        doc.setTextColor(120, 120, 120);
                        doc.setFont('helvetica', 'normal');
                        doc.text("MeyTool Export Document", margin, 10);
                        if (showPageNum) {
                            const pgNum = showCover ? i - 1 : i;
                            const pgTotal = showCover ? totalPages - 1 : totalPages;
                            doc.text(`Page ${pgNum} of ${pgTotal}`, pageWidth - margin - 20, pageHeight - 10);
                        }
                    }
                }

                updateLog('PDF compile success. Saving file...');
                progressFill.style.width = '100%';
                
                let filename = pdfName.value.trim();
                if (!filename) filename = 'meytool_universal_report.pdf';
                if (!filename.endsWith('.pdf')) filename += '.pdf';

                if (autoDownloadCheckbox.checked) {
                    doc.save(filename);
                    utils.showToast('Universal PDF generated & downloaded!');
                } else {
                    // Just save and update log, then show download button
                    const pdfData = doc.output('blob');
                    const downloadBtn = document.createElement('button');
                    downloadBtn.className = 'app-btn secondary';
                    downloadBtn.style.marginTop = '10px';
                    downloadBtn.innerHTML = '<i class="fa-solid fa-download"></i> Download Completed PDF';
                    downloadBtn.onclick = () => {
                        doc.save(filename);
                    };
                    logBox.parentNode.appendChild(downloadBtn);
                    utils.showToast('Universal PDF generated! Click below to download.');
                }
                window.incrementStatsRun();
            };

            // Wrap the async onclick in try/catch so convertBtn always gets re-enabled
            const originalOnclick = convertBtn.onclick;
            convertBtn.onclick = async () => {
                try {
                    await originalOnclick();
                } catch (err) {
                    updateLog(`Fatal error: ${err.message}`, true);
                    utils.showToast('PDF generation failed! See log.', 'error');
                } finally {
                    convertBtn.disabled = false;
                    progressBar.style.display = 'none';
                }
            };
        }
    }
];

// Helper to make stats updating accessible across modules
window.incrementStatsRun = () => {
    const statsRun = document.getElementById('stats-session-runs');
    if (statsRun) {
        let current = parseInt(statsRun.textContent) || 0;
        statsRun.textContent = current + 1;
    }
};
