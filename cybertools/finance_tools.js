// --- Schema-Driven Accounting & Finance Tools ---

function createCalculatorTool({ id, name, icon, description, tags, fields, calculate, results }) {
    return {
        id,
        name,
        category: 'finance',
        icon,
        description,
        tags,
        render() {
            let fieldsHTML = '';
            fields.forEach(f => {
                if (f.type === 'number') {
                    fieldsHTML += `
                        <div class="input-group" style="margin-bottom: 12px;">
                            <label style="font-size:12px; font-weight:600; color:var(--text-secondary); margin-bottom:4px; display:block;">${f.label}</label>
                            <input type="number" class="form-input" id="calc-${id}-${f.id}" value="${f.default}" style="width:100%;">
                        </div>
                    `;
                } else if (f.type === 'select') {
                    fieldsHTML += `
                        <div class="input-group" style="margin-bottom: 12px;">
                            <label style="font-size:12px; font-weight:600; color:var(--text-secondary); margin-bottom:4px; display:block;">${f.label}</label>
                            <select class="form-select" id="calc-${id}-${f.id}" style="width:100%;">
                                ${f.options.map(o => `<option value="${o.value}">${o.label}</option>`).join('')}
                            </select>
                        </div>
                    `;
                }
            });

            let resultsHTML = '';
            results.forEach(r => {
                resultsHTML += `
                    <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid rgba(255,255,255,0.05);">
                        <span style="font-size:13px; color:var(--text-secondary);">${r.label}</span>
                        <strong style="font-size:16px; color:var(--accent-secondary);" id="calc-res-${id}-${r.id}">-</strong>
                    </div>
                `;
            });

            return `
                <div class="tool-grid-2col">
                    <div>
                        <h3 style="font-size:14px; font-weight:700; color:var(--accent-primary); margin-bottom:15px;"><i class="fa-solid fa-calculator" style="margin-right:6px;"></i>Calculation Inputs</h3>
                        <div style="display:flex; flex-direction:column; gap:6px;">
                            ${fieldsHTML}
                        </div>
                        <button class="app-btn primary" id="calc-btn-${id}" style="width:100%; margin-top:20px; border-radius:20px; gap:8px;">
                            <i class="fa-solid fa-file-pdf"></i>Export PDF Statement
                        </button>
                    </div>
                    <div>
                        <h3 style="font-size:14px; font-weight:700; color:var(--accent-secondary); margin-bottom:15px;"><i class="fa-solid fa-chart-line" style="margin-right:6px;"></i>Calculated Results</h3>
                        <div class="output-container" style="margin-top:0; padding:20px; min-height:220px; display:flex; flex-direction:column; justify-content:center; gap:8px; border-radius:12px;">
                            ${resultsHTML}
                        </div>
                    </div>
                </div>
            `;
        },
        init() {
            const inputs = {};
            const update = () => {
                fields.forEach(f => {
                    const el = document.getElementById(`calc-${id}-${f.id}`);
                    if (el) {
                        inputs[f.id] = f.type === 'number' ? parseFloat(el.value) || 0 : el.value;
                    }
                });

                const outputs = calculate(inputs);

                results.forEach(r => {
                    const el = document.getElementById(`calc-res-${id}-${r.id}`);
                    if (el && outputs[r.id] !== undefined) {
                        let val = outputs[r.id];
                        if (r.format === 'currency') {
                            val = '$' + (typeof val === 'number' ? val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : val);
                        } else if (r.format === 'percentage') {
                            val = (typeof val === 'number' ? val.toFixed(2) : val) + '%';
                        }
                        el.textContent = val;
                    }
                });
            };

            // Bind inputs change
            fields.forEach(f => {
                const el = document.getElementById(`calc-${id}-${f.id}`);
                if (el) {
                    el.oninput = update;
                    el.onchange = update;
                }
            });

            // Initial calculation
            update();

            // Export to PDF
            const pdfBtn = document.getElementById(`calc-btn-${id}`);
            if (pdfBtn) {
                pdfBtn.onclick = () => {
                    window.incrementStatsRun();
                    const { jsPDF } = window.jspdf;
                    const doc = new jsPDF();
                    
                    // Header band
                    doc.setFillColor(14, 12, 30);
                    doc.rect(0, 0, 210, 30, 'F');
                    
                    doc.setTextColor(255, 255, 255);
                    doc.setFontSize(20);
                    doc.setFont("helvetica", "bold");
                    doc.text("MeyTool Financial Summary", 15, 20);
                    
                    doc.setFontSize(10);
                    doc.setTextColor(176, 168, 216);
                    doc.text("100% Client-Side Private Statement • Runs Locally", 125, 20);
                    
                    // Document body title
                    doc.setTextColor(14, 12, 30);
                    doc.setFontSize(16);
                    doc.text(name, 15, 45);
                    
                    doc.setFontSize(9);
                    doc.setTextColor(120, 120, 120);
                    doc.text(`Generated on: ${new Date().toLocaleString()}`, 15, 52);
                    
                    doc.setLineWidth(0.5);
                    doc.setDrawColor(220, 220, 225);
                    doc.line(15, 57, 195, 57);
                    
                    // Input parameters block
                    doc.setFontSize(12);
                    doc.setTextColor(14, 12, 30);
                    doc.text("Calculation Parameters", 15, 68);
                    
                    let y = 78;
                    doc.setFont("helvetica", "normal");
                    doc.setFontSize(10);
                    fields.forEach(f => {
                        const val = inputs[f.id];
                        let valStr = String(val);
                        if (f.type === 'select') {
                            const option = f.options.find(o => o.value === val);
                            if (option) valStr = option.label;
                        }
                        doc.setTextColor(100, 100, 110);
                        doc.text(f.label, 15, y);
                        doc.setTextColor(40, 40, 50);
                        doc.setFont("helvetica", "bold");
                        doc.text(valStr, 120, y);
                        doc.setFont("helvetica", "normal");
                        y += 8;
                    });
                    
                    y += 4;
                    doc.line(15, y, 195, y);
                    y += 10;
                    
                    // Output block
                    doc.setFontSize(12);
                    doc.setTextColor(14, 12, 30);
                    doc.text("Calculated Outcomes", 15, y);
                    y += 10;
                    
                    const outputs = calculate(inputs);
                    results.forEach(r => {
                        let val = outputs[r.id];
                        if (r.format === 'currency') {
                            val = '$' + (typeof val === 'number' ? val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : val);
                        } else if (r.format === 'percentage') {
                            val = (typeof val === 'number' ? val.toFixed(2) : val) + '%';
                        }
                        
                        doc.setTextColor(100, 100, 110);
                        doc.text(r.label, 15, y);
                        doc.setTextColor(124, 58, 237); // Branded purple result
                        doc.setFont("helvetica", "bold");
                        doc.text(String(val), 120, y);
                        doc.setFont("helvetica", "normal");
                        y += 8;
                    });
                    
                    y += 12;
                    doc.setFillColor(245, 245, 250);
                    doc.rect(15, y, 180, 25, 'F');
                    doc.setFontSize(9);
                    doc.setTextColor(120, 120, 130);
                    doc.text("Security & Privacy Note: All calculations and PDF generation occurred entirely on your local browser.", 20, y + 10);
                    doc.text("No data was transmitted over the network or to external servers.", 20, y + 16);
                    
                    doc.save(`${id}_report_${Date.now()}.pdf`);
                    utils.showToast("Financial Report PDF Exported!");
                };
            }
        }
    };
}

const FINANCE_TOOLS = [
    // --- PROFIT & REVENUE ---
    createCalculatorTool({
        id: 'fin-profit-loss',
        name: 'Profit & Loss Calculator',
        icon: '<i class="fa-solid fa-chart-pie"></i>',
        description: 'Analyze net margins by calculating gross profits, operating margins, and final net earnings.',
        tags: ['profit', 'loss', 'revenue', 'expenses', 'margins'],
        fields: [
            { id: 'revenue', label: 'Total Revenue ($)', type: 'number', default: 50000 },
            { id: 'cogs', label: 'Cost of Goods Sold (COGS) ($)', type: 'number', default: 20000 },
            { id: 'opex', label: 'Operating Expenses ($)', type: 'number', default: 12000 }
        ],
        calculate: (i) => {
            const gross = i.revenue - i.cogs;
            const net = gross - i.opex;
            const grossMargin = i.revenue > 0 ? (gross / i.revenue) * 100 : 0;
            const netMargin = i.revenue > 0 ? (net / i.revenue) * 100 : 0;
            return { gross, net, grossMargin, netMargin };
        },
        results: [
            { id: 'gross', label: 'Gross Profit', format: 'currency' },
            { id: 'net', label: 'Net Profit', format: 'currency' },
            { id: 'grossMargin', label: 'Gross Margin', format: 'percentage' },
            { id: 'netMargin', label: 'Net Margin', format: 'percentage' }
        ]
    }),
    createCalculatorTool({
        id: 'fin-revenue',
        name: 'Revenue Calculator',
        icon: '<i class="fa-solid fa-sack-dollar"></i>',
        description: 'Calculate gross sales revenue and net revenue after refunds or discounts.',
        tags: ['revenue', 'sales', 'earnings', 'refunds'],
        fields: [
            { id: 'units', label: 'Units Sold', type: 'number', default: 1000 },
            { id: 'price', label: 'Price per Unit ($)', type: 'number', default: 49 },
            { id: 'refundRate', label: 'Refund/Discount Rate (%)', type: 'number', default: 5 }
        ],
        calculate: (i) => {
            const gross = i.units * i.price;
            const refunds = gross * (i.refundRate / 100);
            const net = gross - refunds;
            return { gross, refunds, net };
        },
        results: [
            { id: 'gross', label: 'Gross Revenue', format: 'currency' },
            { id: 'refunds', label: 'Refunds & Allowances', format: 'currency' },
            { id: 'net', label: 'Net Revenue', format: 'currency' }
        ]
    }),
    createCalculatorTool({
        id: 'fin-gross-profit',
        name: 'Gross Profit Calculator',
        icon: '<i class="fa-solid fa-percent"></i>',
        description: 'Determine gross revenues minus manufacturing and production costs.',
        tags: ['gross', 'profit', 'cogs', 'production'],
        fields: [
            { id: 'revenue', label: 'Revenues ($)', type: 'number', default: 10000 },
            { id: 'cogs', label: 'COGS ($)', type: 'number', default: 4000 }
        ],
        calculate: (i) => {
            const gp = i.revenue - i.cogs;
            const margin = i.revenue > 0 ? (gp / i.revenue) * 100 : 0;
            return { gp, margin };
        },
        results: [
            { id: 'gp', label: 'Gross Profit', format: 'currency' },
            { id: 'margin', label: 'Gross Margin', format: 'percentage' }
        ]
    }),
    createCalculatorTool({
        id: 'fin-net-profit',
        name: 'Net Profit Calculator',
        icon: '<i class="fa-solid fa-money-check-dollar"></i>',
        description: 'Calculate final take-home profits after accounting for taxes, interest, and operations.',
        tags: ['net', 'profit', 'taxes', 'interest'],
        fields: [
            { id: 'revenue', label: 'Total Revenue ($)', type: 'number', default: 100000 },
            { id: 'cogs', label: 'COGS ($)', type: 'number', default: 40000 },
            { id: 'opex', label: 'Operating Expenses ($)', type: 'number', default: 25000 },
            { id: 'interest', label: 'Interest Expense ($)', type: 'number', default: 2000 },
            { id: 'tax', label: 'Taxes ($)', type: 'number', default: 8000 }
        ],
        calculate: (i) => {
            const net = i.revenue - i.cogs - i.opex - i.interest - i.tax;
            const margin = i.revenue > 0 ? (net / i.revenue) * 100 : 0;
            return { net, margin };
        },
        results: [
            { id: 'net', label: 'Net Profit (Earnings)', format: 'currency' },
            { id: 'margin', label: 'Net Profit Margin', format: 'percentage' }
        ]
    }),
    createCalculatorTool({
        id: 'fin-margin',
        name: 'Profit Margin Calculator',
        icon: '<i class="fa-solid fa-scale-balanced"></i>',
        description: 'Find profit margin, selling price, and cost ratios for products.',
        tags: ['margin', 'markup', 'retail', 'cost'],
        fields: [
            { id: 'cost', label: 'Cost of Item ($)', type: 'number', default: 50 },
            { id: 'price', label: 'Selling Price ($)', type: 'number', default: 80 }
        ],
        calculate: (i) => {
            const profit = i.price - i.cost;
            const margin = i.price > 0 ? (profit / i.price) * 100 : 0;
            const markup = i.cost > 0 ? (profit / i.cost) * 100 : 0;
            return { profit, margin, markup };
        },
        results: [
            { id: 'profit', label: 'Gross Profit Amount', format: 'currency' },
            { id: 'margin', label: 'Profit Margin', format: 'percentage' },
            { id: 'markup', label: 'Markup Rate', format: 'percentage' }
        ]
    }),
    createCalculatorTool({
        id: 'fin-markup',
        name: 'Markup Calculator',
        icon: '<i class="fa-solid fa-arrow-trend-up"></i>',
        description: 'Calculate target retail prices based on cost and desired markup percentage.',
        tags: ['markup', 'selling price', 'retail'],
        fields: [
            { id: 'cost', label: 'Cost of Item ($)', type: 'number', default: 100 },
            { id: 'markup', label: 'Target Markup (%)', type: 'number', default: 40 }
        ],
        calculate: (i) => {
            const profit = i.cost * (i.markup / 100);
            const price = i.cost + profit;
            const margin = price > 0 ? (profit / price) * 100 : 0;
            return { profit, price, margin };
        },
        results: [
            { id: 'price', label: 'Suggested Selling Price', format: 'currency' },
            { id: 'profit', label: 'Profit Amount', format: 'currency' },
            { id: 'margin', label: 'Equivalent Profit Margin', format: 'percentage' }
        ]
    }),
    createCalculatorTool({
        id: 'fin-breakeven',
        name: 'Break-Even Calculator',
        icon: '<i class="fa-solid fa-shuffle"></i>',
        description: 'Determine the number of units you must sell to cover all business costs.',
        tags: ['breakeven', 'fixed cost', 'variable cost', 'units'],
        fields: [
            { id: 'fixed', label: 'Total Fixed Costs ($)', type: 'number', default: 20000 },
            { id: 'price', label: 'Selling Price per Unit ($)', type: 'number', default: 50 },
            { id: 'variable', label: 'Variable Cost per Unit ($)', type: 'number', default: 30 }
        ],
        calculate: (i) => {
            const contrib = i.price - i.variable;
            const units = contrib > 0 ? i.fixed / contrib : 0;
            const sales = units * i.price;
            return { contrib, units: Math.ceil(units), sales };
        },
        results: [
            { id: 'contrib', label: 'Unit Contribution Margin', format: 'currency' },
            { id: 'units', label: 'Required Break-Even Units', format: 'raw' },
            { id: 'sales', label: 'Required Break-Even Sales', format: 'currency' }
        ]
    }),

    // --- TAX & BUSINESS ---
    createCalculatorTool({
        id: 'fin-tax',
        name: 'Tax Calculator',
        icon: '<i class="fa-solid fa-hand-holding-dollar"></i>',
        description: 'Estimate net salary and corporate/income tax expenses with deductions.',
        tags: ['tax', 'income tax', 'deductions', 'corporate'],
        fields: [
            { id: 'income', label: 'Annual Income ($)', type: 'number', default: 60000 },
            { id: 'deductions', label: 'Tax Deductions ($)', type: 'number', default: 12000 },
            { id: 'rate', label: 'Average Tax Rate (%)', type: 'number', default: 22 }
        ],
        calculate: (i) => {
            const taxable = Math.max(0, i.income - i.deductions);
            const tax = taxable * (i.rate / 100);
            const net = i.income - tax;
            return { taxable, tax, net };
        },
        results: [
            { id: 'taxable', label: 'Taxable Income', format: 'currency' },
            { id: 'tax', label: 'Estimated Tax Owed', format: 'currency' },
            { id: 'net', label: 'Net Earnings After Tax', format: 'currency' }
        ]
    }),
    createCalculatorTool({
        id: 'fin-vat',
        name: 'VAT Calculator',
        icon: '<i class="fa-solid fa-receipt"></i>',
        description: 'Calculate Value Added Tax (VAT) addition or extraction ratios.',
        tags: ['vat', 'consumption', 'tax addition', 'inclusive'],
        fields: [
            { id: 'amount', label: 'Base Amount ($)', type: 'number', default: 100 },
            { id: 'rate', label: 'VAT Rate (%)', type: 'number', default: 15 }
        ],
        calculate: (i) => {
            const vat = i.amount * (i.rate / 100);
            const total = i.amount + vat;
            const extractedVat = total > 0 ? total - (total / (1 + i.rate / 100)) : 0;
            return { vat, total, extractedVat };
        },
        results: [
            { id: 'vat', label: 'VAT (Add-on)', format: 'currency' },
            { id: 'total', label: 'Gross Total (Price with VAT)', format: 'currency' },
            { id: 'extractedVat', label: 'Extracted VAT (VAT inclusive)', format: 'currency' }
        ]
    }),
    createCalculatorTool({
        id: 'fin-gst',
        name: 'GST Calculator',
        icon: '<i class="fa-solid fa-landmark"></i>',
        description: 'Calculate Goods and Services Tax (GST) addition or subtraction.',
        tags: ['gst', 'sales tax', 'business'],
        fields: [
            { id: 'price', label: 'Net Product Price ($)', type: 'number', default: 250 },
            { id: 'gstRate', label: 'GST Rate (%)', type: 'number', default: 10 }
        ],
        calculate: (i) => {
            const gst = i.price * (i.gstRate / 100);
            const total = i.price + gst;
            return { gst, total };
        },
        results: [
            { id: 'gst', label: 'GST Amount', format: 'currency' },
            { id: 'total', label: 'Total Price (Gross)', format: 'currency' }
        ]
    }),
    createCalculatorTool({
        id: 'fin-sales-tax',
        name: 'Sales Tax Calculator',
        icon: '<i class="fa-solid fa-store"></i>',
        description: 'Estimate local state or city retail sales taxes for subtotal purchases.',
        tags: ['sales tax', 'subtotal', 'retail'],
        fields: [
            { id: 'subtotal', label: 'Invoice Subtotal ($)', type: 'number', default: 125.50 },
            { id: 'taxRate', label: 'Sales Tax Rate (%)', type: 'number', default: 8.25 }
        ],
        calculate: (i) => {
            const tax = i.subtotal * (i.taxRate / 100);
            const total = i.subtotal + tax;
            return { tax, total };
        },
        results: [
            { id: 'tax', label: 'Sales Tax Amount', format: 'currency' },
            { id: 'total', label: 'Grand Total', format: 'currency' }
        ]
    }),
    createCalculatorTool({
        id: 'fin-import-tax',
        name: 'Import Tax Calculator',
        icon: '<i class="fa-solid fa-ship"></i>',
        description: 'Estimate shipping duty rates, customs clearance, and import tax rates.',
        tags: ['import', 'customs', 'duty', 'freight'],
        fields: [
            { id: 'value', label: 'Cargo Product Value ($)', type: 'number', default: 15000 },
            { id: 'shipping', label: 'Shipping & Insurance (CIF) ($)', type: 'number', default: 1200 },
            { id: 'rate', label: 'Duty Rate (%)', type: 'number', default: 6.5 }
        ],
        calculate: (i) => {
            const cif = i.value + i.shipping;
            const duty = cif * (i.rate / 100);
            const total = cif + duty;
            return { cif, duty, total };
        },
        results: [
            { id: 'cif', label: 'CIF Landed Cost', format: 'currency' },
            { id: 'duty', label: 'Customs Duty Owed', format: 'currency' },
            { id: 'total', label: 'Landed Total Cost', format: 'currency' }
        ]
    }),

    // --- PAYROLL ---
    createCalculatorTool({
        id: 'fin-payroll',
        name: 'Payroll Calculator',
        icon: '<i class="fa-solid fa-users-gear"></i>',
        description: 'Calculate employee payouts, employer overhead taxes, and benefit metrics.',
        tags: ['payroll', 'salary', 'overhead', 'benefits'],
        fields: [
            { id: 'salary', label: 'Gross Basic Salary ($)', type: 'number', default: 4000 },
            { id: 'allowances', label: 'Allowances / Stipends ($)', type: 'number', default: 500 },
            { id: 'deductions', label: 'Payroll Deductions ($)', type: 'number', default: 350 },
            { id: 'employerTax', label: 'Employer Taxes & Insurance (%)', type: 'number', default: 8.5 }
        ],
        calculate: (i) => {
            const gross = i.salary + i.allowances;
            const employerOverhead = gross * (i.employerTax / 100);
            const net = gross - i.deductions;
            const totalCost = gross + employerOverhead;
            return { gross, net, employerOverhead, totalCost };
        },
        results: [
            { id: 'gross', label: 'Gross Employee Salary', format: 'currency' },
            { id: 'net', label: 'Net Payout to Employee', format: 'currency' },
            { id: 'employerOverhead', label: 'Employer Taxes / Pension Cost', format: 'currency' },
            { id: 'totalCost', label: 'Total Employer Burden Cost', format: 'currency' }
        ]
    }),
    createCalculatorTool({
        id: 'fin-salary',
        name: 'Salary Calculator',
        icon: '<i class="fa-solid fa-briefcase"></i>',
        description: 'Convert annual, monthly, weekly, or hourly salaries to net payouts.',
        tags: ['salary', 'income', 'net wage'],
        fields: [
            { id: 'gross', label: 'Gross Annual Salary ($)', type: 'number', default: 75000 },
            { id: 'taxRate', label: 'Effective Tax Rate (%)', type: 'number', default: 24 },
            { id: 'pensionRate', label: 'Pension/Social Contribution (%)', type: 'number', default: 5 }
        ],
        calculate: (i) => {
            const tax = i.gross * (i.taxRate / 100);
            const pension = i.gross * (i.pensionRate / 100);
            const netAnnual = i.gross - tax - pension;
            const netMonthly = netAnnual / 12;
            const netWeekly = netAnnual / 52;
            return { netAnnual, netMonthly, netWeekly };
        },
        results: [
            { id: 'netAnnual', label: 'Net Annual Take-home', format: 'currency' },
            { id: 'netMonthly', label: 'Net Monthly Income', format: 'currency' },
            { id: 'netWeekly', label: 'Net Weekly Income', format: 'currency' }
        ]
    }),
    createCalculatorTool({
        id: 'fin-hourly-wage',
        name: 'Hourly Wage Calculator',
        icon: '<i class="fa-solid fa-clock"></i>',
        description: 'Convert hourly pay rates into monthly and annual equivalent incomes.',
        tags: ['wage', 'hourly', 'work hours'],
        fields: [
            { id: 'rate', label: 'Hourly Pay Rate ($)', type: 'number', default: 25 },
            { id: 'hours', label: 'Working Hours per Week', type: 'number', default: 40 },
            { id: 'weeks', label: 'Paid Weeks per Year', type: 'number', default: 52 }
        ],
        calculate: (i) => {
            const weekly = i.rate * i.hours;
            const annual = weekly * i.weeks;
            const monthly = annual / 12;
            return { weekly, monthly, annual };
        },
        results: [
            { id: 'weekly', label: 'Equivalent Weekly Pay', format: 'currency' },
            { id: 'monthly', label: 'Equivalent Monthly Pay', format: 'currency' },
            { id: 'annual', label: 'Equivalent Annual Pay', format: 'currency' }
        ]
    }),
    createCalculatorTool({
        id: 'fin-overtime',
        name: 'Overtime Calculator',
        icon: '<i class="fa-solid fa-business-time"></i>',
        description: 'Calculate regular earnings and overtime pay at multiplier rates.',
        tags: ['overtime', 'hourly', 'wages'],
        fields: [
            { id: 'rate', label: 'Hourly Rate ($)', type: 'number', default: 20 },
            { id: 'regular', label: 'Regular Hours worked', type: 'number', default: 40 },
            { id: 'ot', label: 'Overtime Hours worked', type: 'number', default: 8 },
            { id: 'otMult', label: 'Overtime Rate Multiplier (e.g. 1.5)', type: 'number', default: 1.5 }
        ],
        calculate: (i) => {
            const regPay = i.rate * i.regular;
            const otRate = i.rate * i.otMult;
            const otPay = otRate * i.ot;
            const total = regPay + otPay;
            return { regPay, otRate, otPay, total };
        },
        results: [
            { id: 'regPay', label: 'Regular Base Pay', format: 'currency' },
            { id: 'otRate', label: 'Overtime Hourly Rate', format: 'currency' },
            { id: 'otPay', label: 'Overtime Earned Pay', format: 'currency' },
            { id: 'total', label: 'Gross Total Wages', format: 'currency' }
        ]
    }),
    createCalculatorTool({
        id: 'fin-bonus',
        name: 'Bonus Calculator',
        icon: '<i class="fa-solid fa-gift"></i>',
        description: 'Estimate net bonus payouts after factoring bonus taxation rates.',
        tags: ['bonus', 'tax rate', 'net bonus'],
        fields: [
            { id: 'salary', label: 'Base Annual Salary ($)', type: 'number', default: 80000 },
            { id: 'pct', label: 'Bonus Percentage (%)', type: 'number', default: 10 },
            { id: 'taxRate', label: 'Bonus Specific Tax Rate (%)', type: 'number', default: 35 }
        ],
        calculate: (i) => {
            const gross = i.salary * (i.pct / 100);
            const tax = gross * (i.taxRate / 100);
            const net = gross - tax;
            return { gross, tax, net };
        },
        results: [
            { id: 'gross', label: 'Gross Bonus Amount', format: 'currency' },
            { id: 'tax', label: 'Bonus Tax Deductions', format: 'currency' },
            { id: 'net', label: 'Net Bonus Payout', format: 'currency' }
        ]
    }),
    createCalculatorTool({
        id: 'fin-commission',
        name: 'Commission Calculator',
        icon: '<i class="fa-solid fa-comments-dollar"></i>',
        description: 'Calculate sales agent commissions based on deal sizes and rates.',
        tags: ['commission', 'deals', 'agent', 'percentage'],
        fields: [
            { id: 'revenue', label: 'Sales Revenue Generated ($)', type: 'number', default: 25000 },
            { id: 'rate', label: 'Commission Rate (%)', type: 'number', default: 7.5 }
        ],
        calculate: (i) => {
            const commission = i.revenue * (i.rate / 100);
            return { commission };
        },
        results: [
            { id: 'commission', label: 'Commission Owed', format: 'currency' }
        ]
    }),

    // --- LOANS & INVESTMENTS ---
    createCalculatorTool({
        id: 'fin-loan',
        name: 'Loan Calculator',
        icon: '<i class="fa-solid fa-percent"></i>',
        description: 'Estimate monthly Equated Monthly Installment (EMI) loan payments.',
        tags: ['loan', 'emi', 'interest', 'mortgage'],
        fields: [
            { id: 'amount', label: 'Loan Amount ($)', type: 'number', default: 15000 },
            { id: 'rate', label: 'Annual Interest Rate (%)', type: 'number', default: 6.5 },
            { id: 'term', label: 'Loan Term (Years)', type: 'number', default: 5 }
        ],
        calculate: (i) => {
            const r = (i.rate / 100) / 12;
            const n = i.term * 12;
            let emi = 0;
            if (r > 0) {
                emi = i.amount * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
            } else {
                emi = i.amount / n;
            }
            const total = emi * n;
            const interest = total - i.amount;
            return { emi, total, interest };
        },
        results: [
            { id: 'emi', label: 'Monthly Payment (EMI)', format: 'currency' },
            { id: 'interest', label: 'Total Interest Paid', format: 'currency' },
            { id: 'total', label: 'Total Principal + Interest', format: 'currency' }
        ]
    }),
    createCalculatorTool({
        id: 'fin-interest',
        name: 'Simple Interest Calculator',
        icon: '<i class="fa-solid fa-coins"></i>',
        description: 'Calculate simple interest yield rates over years.',
        tags: ['interest', 'simple interest', 'principal'],
        fields: [
            { id: 'principal', label: 'Principal Investment ($)', type: 'number', default: 5000 },
            { id: 'rate', label: 'Annual Interest Rate (%)', type: 'number', default: 4 },
            { id: 'years', label: 'Investment Term (Years)', type: 'number', default: 3 }
        ],
        calculate: (i) => {
            const interest = i.principal * (i.rate / 100) * i.years;
            const total = i.principal + interest;
            return { interest, total };
        },
        results: [
            { id: 'interest', label: 'Accrued Simple Interest', format: 'currency' },
            { id: 'total', label: 'Total Portfolio Value', format: 'currency' }
        ]
    }),
    createCalculatorTool({
        id: 'fin-compound',
        name: 'Compound Interest Calculator',
        icon: '<i class="fa-solid fa-vault"></i>',
        description: 'Simulate compound portfolio growth over years with compounding frequencies.',
        tags: ['compound', 'growth', 'savings', 'compounding'],
        fields: [
            { id: 'principal', label: 'Principal Amount ($)', type: 'number', default: 10000 },
            { id: 'rate', label: 'Annual Interest Rate (%)', type: 'number', default: 8 },
            { id: 'years', label: 'Portfolio Term (Years)', type: 'number', default: 10 },
            { id: 'freq', label: 'Compounding Frequency', type: 'select', options: [
                { value: '12', label: 'Monthly' },
                { value: '4', label: 'Quarterly' },
                { value: '1', label: 'Yearly' }
            ]}
        ],
        calculate: (i) => {
            const f = parseInt(i.freq) || 1;
            const n = i.years * f;
            const r = (i.rate / 100) / f;
            const total = i.principal * Math.pow(1 + r, n);
            const interest = total - i.principal;
            return { interest, total };
        },
        results: [
            { id: 'interest', label: 'Total Interest Accrued', format: 'currency' },
            { id: 'total', label: 'Ending Portfolio Balance', format: 'currency' }
        ]
    }),
    createCalculatorTool({
        id: 'fin-mortgage',
        name: 'Mortgage Calculator',
        icon: '<i class="fa-solid fa-house-chimney"></i>',
        description: 'Calculate mortgage payments, down payments, and total home ownership costs.',
        tags: ['mortgage', 'home loan', 'property', 'downpayment'],
        fields: [
            { id: 'price', label: 'Property Sale Price ($)', type: 'number', default: 350000 },
            { id: 'down', label: 'Down Payment Amount ($)', type: 'number', default: 70000 },
            { id: 'rate', label: 'Mortgage Interest Rate (%)', type: 'number', default: 5.5 },
            { id: 'term', label: 'Mortgage Term (Years)', type: 'number', default: 30 }
        ],
        calculate: (i) => {
            const loan = i.price - i.down;
            const r = (i.rate / 100) / 12;
            const n = i.term * 12;
            let monthly = 0;
            if (r > 0) {
                monthly = loan * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
            } else {
                monthly = loan / n;
            }
            const totalCost = (monthly * n) + i.down;
            const totalInterest = (monthly * n) - loan;
            return { loan, monthly, totalInterest, totalCost };
        },
        results: [
            { id: 'loan', label: 'Principal Loan Amount', format: 'currency' },
            { id: 'monthly', label: 'Monthly Principal + Interest', format: 'currency' },
            { id: 'totalInterest', label: 'Total Interest Expense', format: 'currency' },
            { id: 'totalCost', label: 'Total Mortgage Life Cost', format: 'currency' }
        ]
    }),
    createCalculatorTool({
        id: 'fin-roi',
        name: 'ROI Calculator',
        icon: '<i class="fa-solid fa-chart-bar"></i>',
        description: 'Calculate Return on Investment (ROI) and net gains for operations.',
        tags: ['roi', 'investment', 'return', 'profitability'],
        fields: [
            { id: 'invested', label: 'Initial Amount Invested ($)', type: 'number', default: 12000 },
            { id: 'value', label: 'Ending Portfolio Value ($)', type: 'number', default: 15600 }
        ],
        calculate: (i) => {
            const gain = i.value - i.invested;
            const roi = i.invested > 0 ? (gain / i.invested) * 100 : 0;
            return { gain, roi };
        },
        results: [
            { id: 'gain', label: 'Capital Gain/Loss', format: 'currency' },
            { id: 'roi', label: 'Return on Investment', format: 'percentage' }
        ]
    }),
    createCalculatorTool({
        id: 'fin-sip',
        name: 'SIP Calculator',
        icon: '<i class="fa-solid fa-money-bill-trend-up"></i>',
        description: 'Simulate Systematic Investment Plan (SIP) wealth yields over compounding years.',
        tags: ['sip', 'mutual fund', 'savings', 'compounding'],
        fields: [
            { id: 'monthly', label: 'Monthly SIP Installment ($)', type: 'number', default: 300 },
            { id: 'rate', label: 'Expected Growth Rate (%)', type: 'number', default: 12 },
            { id: 'years', label: 'Investment Term (Years)', type: 'number', default: 15 }
        ],
        calculate: (i) => {
            const P = i.monthly;
            const rateFraction = (i.rate / 100) / 12;
            const n = i.years * 12;
            let total = 0;
            if (rateFraction > 0) {
                total = P * (Math.pow(1 + rateFraction, n) - 1) * (1 + rateFraction) / rateFraction;
            } else {
                total = P * n;
            }
            const invested = P * n;
            const gain = total - invested;
            return { invested, gain, total };
        },
        results: [
            { id: 'invested', label: 'Total Invested Capital', format: 'currency' },
            { id: 'gain', label: 'Compound Wealth Gain', format: 'currency' },
            { id: 'total', label: 'Total Maturity Value', format: 'currency' }
        ]
    }),
    createCalculatorTool({
        id: 'fin-savings',
        name: 'Savings Calculator',
        icon: '<i class="fa-solid fa-piggy-bank"></i>',
        description: 'Calculate savings growth with monthly deposits and interest yields.',
        tags: ['savings', 'accumulate', 'interest', 'capital'],
        fields: [
            { id: 'initial', label: 'Initial Savings Balance ($)', type: 'number', default: 2000 },
            { id: 'deposit', label: 'Monthly Deposit Amount ($)', type: 'number', default: 150 },
            { id: 'rate', label: 'Annual Interest Rate (%)', type: 'number', default: 3.5 },
            { id: 'years', label: 'Savings Term (Years)', type: 'number', default: 5 }
        ],
        calculate: (i) => {
            const r = (i.rate / 100) / 12;
            const n = i.years * 12;
            const baseGrowth = i.initial * Math.pow(1 + r, n);
            let depositGrowth = 0;
            if (r > 0) {
                depositGrowth = i.deposit * (Math.pow(1 + r, n) - 1) * (1 + r) / r;
            } else {
                depositGrowth = i.deposit * n;
            }
            const total = baseGrowth + depositGrowth;
            const invested = i.initial + (i.deposit * n);
            const gain = total - invested;
            return { invested, gain, total };
        },
        results: [
            { id: 'invested', label: 'Total Deposits Invested', format: 'currency' },
            { id: 'gain', label: 'Total Savings Interest Earned', format: 'currency' },
            { id: 'total', label: 'Final Savings Balance', format: 'currency' }
        ]
    }),

    // --- CURRENCY & FINANCE ---
    createCalculatorTool({
        id: 'fin-budget',
        name: 'Monthly Budget Planner',
        icon: '<i class="fa-solid fa-calendar-days"></i>',
        description: 'Apportion monthly incomes into housing, savings, and expense buckets.',
        tags: ['budget', 'income', 'allocations', 'expenses'],
        fields: [
            { id: 'income', label: 'Monthly Net Income ($)', type: 'number', default: 4500 },
            { id: 'housing', label: 'Housing Allocation (%)', type: 'number', default: 30 },
            { id: 'food', label: 'Food Allocation (%)', type: 'number', default: 15 },
            { id: 'util', label: 'Utilities Allocation (%)', type: 'number', default: 10 },
            { id: 'savings', label: 'Savings Allocation (%)', type: 'number', default: 20 },
            { id: 'ent', label: 'Entertainment Allocation (%)', type: 'number', default: 15 }
        ],
        calculate: (i) => {
            const housing = i.income * (i.housing / 100);
            const food = i.income * (i.food / 100);
            const util = i.income * (i.util / 100);
            const savings = i.income * (i.savings / 100);
            const ent = i.income * (i.ent / 100);
            const leftover = i.income - (housing + food + util + savings + ent);
            return { housing, food, util, savings, ent, leftover };
        },
        results: [
            { id: 'housing', label: 'Housing Budget', format: 'currency' },
            { id: 'food', label: 'Food Budget', format: 'currency' },
            { id: 'util', label: 'Utilities Budget', format: 'currency' },
            { id: 'savings', label: 'Savings & Investments', format: 'currency' },
            { id: 'ent', label: 'Leisure & Entertainment', format: 'currency' },
            { id: 'leftover', label: 'Unallocated Surplus', format: 'currency' }
        ]
    }),
    createCalculatorTool({
        id: 'fin-expenses',
        name: 'Expense Tracker',
        icon: '<i class="fa-solid fa-wallet"></i>',
        description: 'Track variable expenses against monthly budget pools.',
        tags: ['expenses', 'budget', 'spending', 'bills'],
        fields: [
            { id: 'budget', label: 'Total Budget ($)', type: 'number', default: 3000 },
            { id: 'variable', label: 'Variable Daily Expenses ($)', type: 'number', default: 850 },
            { id: 'bills', label: 'Fixed Monthly Bills ($)', type: 'number', default: 1400 }
        ],
        calculate: (i) => {
            const total = i.variable + i.bills;
            const remaining = i.budget - total;
            const pctUsed = i.budget > 0 ? (total / i.budget) * 100 : 0;
            return { total, remaining, pctUsed };
        },
        results: [
            { id: 'total', label: 'Total Outflows (Expenses)', format: 'currency' },
            { id: 'remaining', label: 'Remaining Cash Balance', format: 'currency' },
            { id: 'pctUsed', label: 'Budget Utilization Rate', format: 'percentage' }
        ]
    }),
    createCalculatorTool({
        id: 'fin-debt',
        name: 'Debt Payoff Calculator',
        icon: '<i class="fa-solid fa-credit-card"></i>',
        description: 'Calculate debt amortization term plans based on payments and interest.',
        tags: ['debt', 'payoff', 'amortization', 'interest'],
        fields: [
            { id: 'amount', label: 'Debt Balance Owed ($)', type: 'number', default: 8000 },
            { id: 'rate', label: 'Debt APR (%)', type: 'number', default: 18 },
            { id: 'payment', label: 'Monthly Payment amount ($)', type: 'number', default: 300 }
        ],
        calculate: (i) => {
            const monthlyRate = (i.rate / 100) / 12;
            let months = 0;
            let total = 0;
            let interest = 0;
            
            if (i.payment <= i.amount * monthlyRate) {
                months = "Infinite (Increase payment!)";
                total = "N/A";
                interest = "N/A";
            } else {
                if (monthlyRate > 0) {
                    months = -Math.log(1 - (i.amount * monthlyRate) / i.payment) / Math.log(1 + monthlyRate);
                } else {
                    months = i.amount / i.payment;
                }
                months = Math.ceil(months);
                total = i.payment * months;
                interest = total - i.amount;
            }
            
            return { months, interest, total };
        },
        results: [
            { id: 'months', label: 'Months to Debt Free', format: 'raw' },
            { id: 'interest', label: 'Accumulated Interest Cost', format: 'currency' },
            { id: 'total', label: 'Total Paid Life Cost', format: 'currency' }
        ]
    })
];

// Append tools to the global registry array
if (typeof TOOLS !== 'undefined') {
    TOOLS.push(...FINANCE_TOOLS);
}
