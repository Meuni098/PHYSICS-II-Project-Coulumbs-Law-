/* ═══════════════════════════════════════════════════════════
   Coulombic Field & Vector Analyst — Application Engine v2
   ═══════════════════════════════════════════════════════════ */

(() => {
    'use strict';

    // ─── Constants ───
    const K = 8.9875e9;                     // Coulomb constant (N·m²/C²)
    const PIXELS_PER_METER = 600;           // scale factor
    const FIELD_LINE_STEP = 3;              // px per integration step
    const FIELD_LINE_MAX_STEPS = 800;       // max steps per line
    const FIELD_LINE_COUNT = 14;            // lines per charge
    const MAX_LOG_ROWS = 50;
    const DOT_GRID_SPACING = 32;
    const CHARGE_RADIUS = 28;              // visual radius of charge circles

    // ─── State ───
    let charges = [];
    let focusPair = [null, null]; // pair shown in sidebar telemetry (closest or dragged)
    let dataLog = [];
    let graphPoints = [];
    let savedReadings = [];  // snapshots: { id, chargesSnapshot, solutionHTML }
    let draggingCharge = null;
    let dragOffsetX = 0;
    let dragOffsetY = 0;
    let selectedMagnitude = 5; // μC
    let showFieldLines = false;
    let showForceArrows = true;
    let showSciNotation = true;
    let isAtomicMode = false;
    let nextChargeId = 1;

    // ─── DOM Elements ───
    const canvas = document.getElementById('simulationCanvas');
    const ctx = canvas.getContext('2d');
    const graphCanvasEl = document.getElementById('graphCanvas');
    const graphCtx = graphCanvasEl.getContext('2d');
    const emptyState = document.getElementById('emptyState');
    const chargeCardsContainer = document.getElementById('chargeCardsContainer');
    const dataLogBody = document.getElementById('dataLogBody');
    const entryCount = document.getElementById('entryCount');
    const canvasOffsetEl = document.getElementById('canvasOffset');
    const physicsPanel = document.getElementById('physicsPanel');
    const bottomPanels = document.getElementById('bottomPanels');

    // Telemetry displays
    const valSeparation = document.getElementById('valSeparation');
    const valForce = document.getElementById('valForce');
    const valDirection = document.getElementById('valDirection');
    const valPotential = document.getElementById('valPotential');

    // Slider + Input
    const chargeSlider = document.getElementById('chargeSlider');
    const chargeInput = document.getElementById('chargeInput');

    // ═══════════════════ INITIALIZATION ═══════════════════

    function init() {
        resizeCanvases();
        setupEventListeners();
        addDefaultCharges();
        render();
    }

    function resizeCanvases() {
        const wrapper = document.getElementById('canvasWrapper');
        canvas.width = wrapper.clientWidth;
        canvas.height = wrapper.clientHeight;

        const gc = graphCanvasEl.parentElement;
        graphCanvasEl.width = gc.clientWidth;
        graphCanvasEl.height = gc.clientHeight;
    }

    function addDefaultCharges() {
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        charges.push({
            id: nextChargeId++,
            x: cx - 150,
            y: cy,
            charge: 5e-6,     // +5μC
            sign: 1,
        });
        charges.push({
            id: nextChargeId++,
            x: cx + 150,
            y: cy,
            charge: 3.2e-6,   // -3.2μC
            sign: -1,
        });
        updateFocusPair();
    }

    // ═══════════════════ EVENT LISTENERS ═══════════════════

    function setupEventListeners() {
        window.addEventListener('resize', () => {
            resizeCanvases();
            render();
        });

        // Canvas interactions
        canvas.addEventListener('mousedown', onCanvasMouseDown);
        canvas.addEventListener('mousemove', onCanvasMouseMove);
        canvas.addEventListener('mouseup', onCanvasMouseUp);
        canvas.addEventListener('mouseleave', onCanvasMouseUp);

        // Touch support
        canvas.addEventListener('touchstart', onTouchStart, { passive: false });
        canvas.addEventListener('touchmove', onTouchMove, { passive: false });
        canvas.addEventListener('touchend', onTouchEnd);

        // Buttons
        document.getElementById('btnAddPositive').addEventListener('click', () => addCharge(1));
        document.getElementById('btnAddNegative').addEventListener('click', () => addCharge(-1));
        document.getElementById('btnReset').addEventListener('click', resetAll);
        document.getElementById('btnClearLog').addEventListener('click', clearLog);
        document.getElementById('btnExportData').addEventListener('click', exportCSV);
        document.getElementById('btnThemeToggle').addEventListener('click', toggleTheme);
        document.getElementById('btnSaveReading').addEventListener('click', saveReading);
        document.getElementById('btnAtomic').addEventListener('click', toggleAtomicMode);

        // Features Panel toggle
        const featuresPanel = document.getElementById('featuresPanel');
        const btnToggleFeatures = document.getElementById('btnToggleFeatures');
        const btnCloseFeatures = document.getElementById('btnCloseFeatures');

        function toggleFeaturesPanel() {
            const isHidden = featuresPanel.classList.toggle('panel-hidden');
            document.body.classList.toggle('features-visible', !isHidden);
            btnToggleFeatures.classList.toggle('active', !isHidden);
            setTimeout(() => { resizeCanvases(); render(); }, 320);
        }

        btnToggleFeatures.addEventListener('click', toggleFeaturesPanel);
        btnCloseFeatures.addEventListener('click', toggleFeaturesPanel);

        // Solution overlay close
        const solutionOverlay = document.getElementById('solutionOverlay');
        document.getElementById('btnCloseSolution').addEventListener('click', () => {
            solutionOverlay.style.display = 'none';
        });
        document.getElementById('btnCloseSolutionBottom').addEventListener('click', () => {
            solutionOverlay.style.display = 'none';
        });
        solutionOverlay.addEventListener('click', (e) => {
            if (e.target === solutionOverlay) solutionOverlay.style.display = 'none';
        });

        // Slider + Input synced magnitude
        chargeSlider.addEventListener('input', () => {
            const val = parseFloat(chargeSlider.value);
            selectedMagnitude = val;
            chargeInput.value = val;
        });
        chargeInput.addEventListener('change', () => {
            let val = parseFloat(chargeInput.value);
            if (isNaN(val) || val <= 0) val = 0.1;
            if (val > 100) val = 100;
            chargeInput.value = val;
            selectedMagnitude = val;
            // Clamp slider to its max
            chargeSlider.value = Math.min(val, parseFloat(chargeSlider.max));
        });
        chargeInput.addEventListener('input', () => {
            const val = parseFloat(chargeInput.value);
            if (!isNaN(val) && val > 0 && val <= 100) {
                selectedMagnitude = val;
                chargeSlider.value = Math.min(val, parseFloat(chargeSlider.max));
            }
        });

        // View Toggles
        document.querySelector('#toggleForceArrows input').addEventListener('change', (e) => {
            showForceArrows = e.target.checked;
            render();
        });
        document.querySelector('#toggleSciNotation input').addEventListener('change', (e) => {
            showSciNotation = e.target.checked;
            render();
        });
        document.querySelector('#togglePhysicsPanel input').addEventListener('change', (e) => {
            const show = e.target.checked;
            physicsPanel.classList.toggle('panel-hidden', !show);
            document.body.classList.toggle('sidebar-hidden', !show);
            setTimeout(() => { resizeCanvases(); render(); }, 50);
        });
        document.querySelector('#toggleDataTable input').addEventListener('change', (e) => {
            const show = e.target.checked;
            bottomPanels.classList.toggle('panel-hidden', !show);
            document.body.classList.toggle('bottom-hidden', !show);
            setTimeout(() => { resizeCanvases(); render(); }, 50);
        });
    }

    // ─── Mouse Handlers ───

    function onCanvasMouseDown(e) {
        const rect = canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        const hit = findChargeAt(mx, my);
        if (hit) {
            draggingCharge = hit;
            dragOffsetX = mx - hit.x;
            dragOffsetY = my - hit.y;
            canvas.style.cursor = 'grabbing';
        }
    }

    function onCanvasMouseMove(e) {
        const rect = canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        canvasOffsetEl.textContent = `Offset: ${Math.round(mx)}, ${Math.round(my)}`;

        if (draggingCharge) {
            draggingCharge.x = clamp(mx - dragOffsetX, CHARGE_RADIUS, canvas.width - CHARGE_RADIUS);
            draggingCharge.y = clamp(my - dragOffsetY, CHARGE_RADIUS, canvas.height - CHARGE_RADIUS);
            updateFocusPair();
            render();
        } else {
            const hover = findChargeAt(mx, my);
            canvas.style.cursor = hover ? 'grab' : 'default';
        }
    }

    function onCanvasMouseUp() {
        if (draggingCharge) {
            draggingCharge = null;
            canvas.style.cursor = 'default';
        }
    }

    // ─── Touch Handlers ───

    function onTouchStart(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        const mx = touch.clientX - rect.left;
        const my = touch.clientY - rect.top;
        const hit = findChargeAt(mx, my);
        if (hit) {
            draggingCharge = hit;
            dragOffsetX = mx - hit.x;
            dragOffsetY = my - hit.y;
        }
    }

    function onTouchMove(e) {
        e.preventDefault();
        if (!draggingCharge) return;
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        const mx = touch.clientX - rect.left;
        const my = touch.clientY - rect.top;
        draggingCharge.x = clamp(mx - dragOffsetX, CHARGE_RADIUS, canvas.width - CHARGE_RADIUS);
        draggingCharge.y = clamp(my - dragOffsetY, CHARGE_RADIUS, canvas.height - CHARGE_RADIUS);
        render();
    }

    function onTouchEnd() {
        if (draggingCharge) {
            draggingCharge = null;
        }
    }

    // ═══════════════════ CHARGE MANAGEMENT ═══════════════════

    function addCharge(sign) {
        const x = 100 + Math.random() * (canvas.width - 200);
        const y = 100 + Math.random() * (canvas.height - 200);
        let chargeVal;
        if (isAtomicMode) {
            chargeVal = 1.602e-19; // Elementary charge
        } else {
            chargeVal = selectedMagnitude * 1e-6;
        }
        charges.push({
            id: nextChargeId++,
            x, y,
            charge: chargeVal,
            sign,
        });
        updateFocusPair();
        render();
    }

    function deleteCharge(id) {
        charges = charges.filter(c => c.id !== id);
        updateFocusPair();
        render();
    }

    function resetAll() {
        charges = [];
        focusPair = [null, null];
        dataLog = [];
        graphPoints = [];
        nextChargeId = 1;
        clearLog();
        addDefaultCharges();
        render();
    }

    function toggleAtomicMode() {
        isAtomicMode = !isAtomicMode;
        const btn = document.getElementById('btnAtomic');
        btn.classList.toggle('active', isAtomicMode);

        if (isAtomicMode) {
            // Set slider/input to show atomic value
            chargeSlider.disabled = true;
            chargeInput.disabled = true;
            chargeInput.value = '1.602×10⁻¹³';
        } else {
            chargeSlider.disabled = false;
            chargeInput.disabled = false;
            chargeInput.value = selectedMagnitude;
        }
    }

    // Find the closest pair of charges to show in sidebar telemetry
    function updateFocusPair() {
        if (charges.length < 2) {
            focusPair = [charges[0] || null, null];
            return;
        }
        // If dragging, pair the dragged charge with its nearest neighbor
        if (draggingCharge) {
            let nearest = null;
            let minDist = Infinity;
            for (const c of charges) {
                if (c === draggingCharge) continue;
                const d = Math.hypot(c.x - draggingCharge.x, c.y - draggingCharge.y);
                if (d < minDist) { minDist = d; nearest = c; }
            }
            focusPair = [draggingCharge, nearest];
            return;
        }
        // Otherwise pick the closest pair overall
        let best = [charges[0], charges[1]];
        let bestDist = Infinity;
        for (let i = 0; i < charges.length; i++) {
            for (let j = i + 1; j < charges.length; j++) {
                const d = Math.hypot(charges[i].x - charges[j].x, charges[i].y - charges[j].y);
                if (d < bestDist) { bestDist = d; best = [charges[i], charges[j]]; }
            }
        }
        focusPair = best;
    }

    // Compute net force vector on a single charge from all others (superposition)
    function computeNetForce(target) {
        let fx = 0, fy = 0;
        for (const other of charges) {
            if (other === target) continue;
            const dx = other.x - target.x;
            const dy = other.y - target.y;
            const distPx = Math.hypot(dx, dy);
            if (distPx < 1) continue;
            const rM = pixelsToMeters(distPx);
            const fMag = K * Math.abs(target.charge) * Math.abs(other.charge) / (rM * rM);
            const ux = dx / distPx;
            const uy = dy / distPx;
            // Attract if opposite signs, repel if same
            const attract = target.sign !== other.sign;
            if (attract) {
                fx += fMag * ux;
                fy += fMag * uy;
            } else {
                fx -= fMag * ux;
                fy -= fMag * uy;
            }
        }
        return { fx, fy, mag: Math.hypot(fx, fy) };
    }

    function findChargeAt(x, y) {
        // Reverse so topmost (latest) charge gets picked first
        for (let i = charges.length - 1; i >= 0; i--) {
            const c = charges[i];
            const dx = x - c.x;
            const dy = y - c.y;
            if (dx * dx + dy * dy <= (CHARGE_RADIUS + 8) * (CHARGE_RADIUS + 8)) return c;
        }
        return null;
    }

    // ═══════════════════ PHYSICS ═══════════════════

    function pixelsToMeters(px) { return px / PIXELS_PER_METER; }
    function metersToPixels(m) { return m * PIXELS_PER_METER; }

    function coulombForce(q1, q2, r) {
        if (r <= 0) return 0;
        return K * Math.abs(q1) * Math.abs(q2) / (r * r);
    }

    function potentialEnergy(q1, q2, r) {
        if (r <= 0) return 0;
        return K * q1 * q2 / r;
    }

    // ═══════════════════ RENDER ═══════════════════

    function render() {
        drawCanvas();
        updateChargeCards();
        updateTelemetry();
        updateEmptyState();
        drawGraph();
    }

    function drawCanvas() {
        const w = canvas.width;
        const h = canvas.height;
        const isDark = document.documentElement.dataset.theme !== 'light';

        // Clear
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = isDark ? '#0F1219' : '#ffffff';
        ctx.fillRect(0, 0, w, h);

        // Dot grid
        ctx.fillStyle = isDark ? '#1e2028' : '#d1d5db';
        for (let x = DOT_GRID_SPACING; x < w; x += DOT_GRID_SPACING) {
            for (let y = DOT_GRID_SPACING; y < h; y += DOT_GRID_SPACING) {
                ctx.beginPath();
                ctx.arc(x, y, 1, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Field lines (if enabled and 2+ charges)
        if (showFieldLines && charges.length >= 2) {
            drawFieldLines();
        }

        // Distance indicators between ALL charge pairs
        if (charges.length >= 2) {
            drawAllDistanceIndicators();
        }

        // Force arrows on EVERY charge (net force via superposition)
        if (showForceArrows && charges.length >= 2) {
            drawAllForceArrows();
        }

        // Charges
        for (const c of charges) {
            drawCharge(c);
        }
    }

    // ─── Draw Individual Charge ───

    function drawCharge(c) {
        const isDark = document.documentElement.dataset.theme !== 'light';
        const isPos = c.sign > 0;

        // Outer glow
        const grad = ctx.createRadialGradient(c.x, c.y, CHARGE_RADIUS * 0.3, c.x, c.y, CHARGE_RADIUS * 2.5);
        grad.addColorStop(0, isPos ? 'rgba(239, 68, 68, 0.12)' : 'rgba(59, 130, 246, 0.12)');
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(c.x, c.y, CHARGE_RADIUS * 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Ring
        ctx.strokeStyle = isPos
            ? (isDark ? '#EF4444' : '#DC2626')
            : (isDark ? '#3B82F6' : '#2563EB');
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(c.x, c.y, CHARGE_RADIUS, 0, Math.PI * 2);
        ctx.stroke();

        // Fill
        ctx.fillStyle = isDark
            ? (isPos ? 'rgba(239, 68, 68, 0.08)' : 'rgba(59, 130, 246, 0.08)')
            : (isPos ? 'rgba(239, 68, 68, 0.06)' : 'rgba(59, 130, 246, 0.06)');
        ctx.fill();

        // Mannequin icon
        const icoColor = isPos
            ? (isDark ? '#FCA5A5' : '#DC2626')
            : (isDark ? '#93C5FD' : '#2563EB');
        ctx.fillStyle = icoColor;
        ctx.strokeStyle = icoColor;
        ctx.lineWidth = 1.5;

        // Head
        ctx.beginPath();
        ctx.arc(c.x, c.y - 8, 5, 0, Math.PI * 2);
        ctx.fill();

        // Body
        ctx.beginPath();
        ctx.moveTo(c.x, c.y - 3);
        ctx.lineTo(c.x, c.y + 6);
        ctx.stroke();

        // Arms
        ctx.beginPath();
        ctx.moveTo(c.x - 7, c.y);
        ctx.lineTo(c.x + 7, c.y);
        ctx.stroke();

        // Legs
        ctx.beginPath();
        ctx.moveTo(c.x, c.y + 6);
        ctx.lineTo(c.x - 5, c.y + 13);
        ctx.moveTo(c.x, c.y + 6);
        ctx.lineTo(c.x + 5, c.y + 13);
        ctx.stroke();

        // Label
        const idx = charges.indexOf(c) + 1;
        ctx.font = '600 10px "Space Grotesk"';
        ctx.textAlign = 'center';
        ctx.fillStyle = icoColor;
        ctx.fillText(`q${idx}`, c.x, c.y + CHARGE_RADIUS + 14);
    }

    // ─── Field Lines ───

    function drawFieldLines() {
        const isDark = document.documentElement.dataset.theme !== 'light';
        ctx.lineWidth = 1;
        ctx.globalAlpha = isDark ? 0.3 : 0.25;

        const positives = charges.filter(c => c.sign > 0);
        const negatives = charges.filter(c => c.sign < 0);
        const sources = positives.length > 0 ? positives : negatives;
        const direction = positives.length > 0 ? 1 : -1;

        for (const src of sources) {
            for (let i = 0; i < FIELD_LINE_COUNT; i++) {
                const angle = (2 * Math.PI * i) / FIELD_LINE_COUNT;
                let px = src.x + Math.cos(angle) * (CHARGE_RADIUS + 4);
                let py = src.y + Math.sin(angle) * (CHARGE_RADIUS + 4);

                ctx.beginPath();
                ctx.moveTo(px, py);

                const isDashed = i % 2 === 0;
                ctx.setLineDash(isDashed ? [6, 4] : []);
                ctx.strokeStyle = isDark ? '#60A5FA' : '#3B82F6';

                for (let step = 0; step < FIELD_LINE_MAX_STEPS; step++) {
                    let Ex = 0, Ey = 0;
                    for (const c of charges) {
                        const dx = px - c.x;
                        const dy = py - c.y;
                        const r2 = dx * dx + dy * dy;
                        if (r2 < 4) break;
                        const r = Math.sqrt(r2);
                        const E = K * c.charge / r2;
                        Ex += E * c.sign * (dx / r);
                        Ey += E * c.sign * (dy / r);
                    }
                    const E = Math.sqrt(Ex * Ex + Ey * Ey);
                    if (E < 0.001) break;
                    px += direction * FIELD_LINE_STEP * (Ex / E);
                    py += direction * FIELD_LINE_STEP * (Ey / E);

                    if (px < -20 || px > canvas.width + 20 || py < -20 || py > canvas.height + 20) break;

                    let hitSink = false;
                    for (const c of charges) {
                        if (c === src) continue;
                        const d2 = (px - c.x) ** 2 + (py - c.y) ** 2;
                        if (d2 < (CHARGE_RADIUS * 0.7) ** 2) { hitSink = true; break; }
                    }

                    ctx.lineTo(px, py);
                    if (hitSink) break;
                }
                ctx.stroke();
            }
        }
        ctx.setLineDash([]);
        ctx.globalAlpha = 1;
    }

    // ─── Force Arrows (Net force on EVERY charge) ───

    function drawAllForceArrows() {
        for (const c of charges) {
            const net = computeNetForce(c);
            if (net.mag < 1e-15) continue;

            // Arrow length scaled logarithmically for visibility
            const arrowLen = clamp(Math.log10(net.mag + 1) * 50 + 25, 25, 180);

            const ux = net.fx / net.mag;
            const uy = net.fy / net.mag;

            const startX = c.x + ux * (CHARGE_RADIUS + 4);
            const startY = c.y + uy * (CHARGE_RADIUS + 4);
            const endX = c.x + ux * (CHARGE_RADIUS + 4 + arrowLen);
            const endY = c.y + uy * (CHARGE_RADIUS + 4 + arrowLen);

            drawArrow(
                startX, startY, endX, endY,
                c.sign > 0 ? '#EF4444' : '#3B82F6',
                2.5
            );

            // Force label near arrowhead
            if (showSciNotation) {
                const labelX = (startX + endX) / 2;
                const labelY = (startY + endY) / 2 - 14;
                drawFloatingLabel(labelX, labelY, `F = ${formatSci(net.mag, 'N')}`);
            }
        }
    }

    function drawArrow(x1, y1, x2, y2, color, width) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        const len = Math.sqrt(dx * dx + dy * dy);
        if (len < 3) return;
        const ux = dx / len;
        const uy = dy / len;
        const headLen = Math.min(12, len * 0.35);

        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.lineCap = 'round';

        // Shaft
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2 - ux * headLen, y2 - uy * headLen);
        ctx.stroke();

        // Arrowhead
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(x2 - ux * headLen - uy * headLen * 0.45, y2 - uy * headLen + ux * headLen * 0.45);
        ctx.lineTo(x2 - ux * headLen + uy * headLen * 0.45, y2 - uy * headLen - ux * headLen * 0.45);
        ctx.closePath();
        ctx.fill();
    }

    function drawFloatingLabel(x, y, text) {
        const isDark = document.documentElement.dataset.theme !== 'light';
        ctx.font = '500 10px "Geist Mono"';
        const metrics = ctx.measureText(text);
        const pad = 5;
        const w = metrics.width + pad * 2;
        const h = 18;

        ctx.fillStyle = isDark ? 'rgba(15, 18, 25, 0.85)' : 'rgba(255, 255, 255, 0.9)';
        roundRect(ctx, x - w / 2, y - h / 2, w, h, 4);
        ctx.fill();
        ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)';
        ctx.lineWidth = 0.5;
        ctx.stroke();

        ctx.fillStyle = isDark ? '#94a3b8' : '#475569';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, x, y);
    }

    // ─── Distance Indicators (between ALL pairs) ───

    function drawAllDistanceIndicators() {
        const isDark = document.documentElement.dataset.theme !== 'light';

        for (let i = 0; i < charges.length; i++) {
            for (let j = i + 1; j < charges.length; j++) {
                const c1 = charges[i];
                const c2 = charges[j];
                const dx = c2.x - c1.x;
                const dy = c2.y - c1.y;
                const dist = Math.hypot(dx, dy);
                if (dist < 1) continue;

                const isFocusPair = (focusPair[0] === c1 && focusPair[1] === c2) ||
                                    (focusPair[0] === c2 && focusPair[1] === c1);
                const alpha = isFocusPair ? 0.6 : 0.25;

                // Dashed connecting line
                const ux = dx / dist;
                const uy = dy / dist;
                const offX = -uy * 12;
                const offY = ux * 12;

                ctx.setLineDash([4, 4]);
                ctx.strokeStyle = isDark
                    ? `rgba(71, 85, 105, ${alpha})`
                    : `rgba(100, 116, 139, ${alpha * 0.7})`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(c1.x + offX, c1.y + offY);
                ctx.lineTo(c2.x + offX, c2.y + offY);
                ctx.stroke();
                ctx.setLineDash([]);

                // Distance label (only for focus pair or if <= 3 charges total)
                if (showSciNotation && (isFocusPair || charges.length <= 3)) {
                    const midX = (c1.x + c2.x) / 2 + offX;
                    const midY = (c1.y + c2.y) / 2 + offY;
                    const rMeters = pixelsToMeters(dist);
                    drawFloatingLabel(midX, midY, `r = ${rMeters.toFixed(3)} m`);
                }
            }
        }
    }

    // ═══════════════════ SIDEBAR UPDATE ═══════════════════

    function updateChargeCards() {
        let html = '';
        if (charges.length === 0) {
            html = '<div class="charge-card charge-card--empty"><p>Walang charge. Mag-add para magsimula.</p></div>';
        } else {
            // Show ALL charges in the sidebar
            charges.forEach((c, i) => {
                if (!c) return;
                const isPos = c.sign > 0;
                const idx = i + 1;
                const absCharge = Math.abs(c.charge);
                const maxCharge = 10e-6;
                const barWidth = isAtomicMode ? 5 : Math.min((absCharge / maxCharge) * 100, 100);
                const netF = computeNetForce(c);

                html += `
                <div class="charge-card charge-card--${isPos ? 'positive' : 'negative'}">
                    <div class="charge-card-header">
                        <span class="charge-card-label charge-card-label--${isPos ? 'pos' : 'neg'}">Charge ${idx} (q${idx})</span>
                        <div style="display:flex;align-items:center;gap:4px;">
                            <span class="charge-card-dot charge-card-dot--${isPos ? 'pos' : 'neg'}"></span>
                            <button class="btn-delete-charge" onclick="window.__deleteCharge(${c.id})" title="Delete this charge">
                                <span class="material-symbols-outlined">close</span>
                            </button>
                        </div>
                    </div>
                    <div class="charge-card-value">
                        <span class="charge-card-value-label">Value</span>
                        <span class="charge-card-value-num">${formatSciHTML(c.charge * c.sign)} C</span>
                    </div>
                    <div class="charge-card-value">
                        <span class="charge-card-value-label">Net F</span>
                        <span class="charge-card-value-num" style="color:var(--tertiary)">${formatSci(netF.mag, 'N')}</span>
                    </div>
                    <div class="charge-bar-track">
                        <div class="charge-bar-fill charge-bar-fill--${isPos ? 'pos' : 'neg'}" style="width:${barWidth}%"></div>
                    </div>
                </div>`;
            });
        }
        chargeCardsContainer.innerHTML = html;
    }

    // Expose delete function globally for inline onclick
    window.__deleteCharge = deleteCharge;

    function updateTelemetry() {
        const c1 = focusPair[0];
        const c2 = focusPair[1];

        if (!c1 || !c2) {
            valSeparation.textContent = '—';
            valForce.textContent = '—';
            valDirection.textContent = '—';
            valPotential.textContent = '—';
            const typeEl = document.getElementById('valInteraction');
            if (typeEl) typeEl.textContent = '—';
            return;
        }

        const dx = c2.x - c1.x;
        const dy = c2.y - c1.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const rMeters = pixelsToMeters(dist);
        const force = coulombForce(c1.charge, c2.charge, rMeters);
        const angle = Math.atan2(-dy, dx) * (180 / Math.PI);
        const pe = potentialEnergy(c1.charge * c1.sign, c2.charge * c2.sign, rMeters);

        valSeparation.textContent = rMeters.toFixed(3) + ' m';
        valForce.textContent = formatSci(force, 'N');
        valDirection.textContent = ((angle % 360 + 360) % 360).toFixed(2) + '°';
        valPotential.textContent = formatSci(pe, 'J');

        // Interaction type
        const interactionType = c1.sign === c2.sign ? 'Repulsion' : 'Attraction';
        const typeEl = document.getElementById('valInteraction');
        if (typeEl) {
            typeEl.textContent = interactionType;
            typeEl.style.color = c1.sign === c2.sign
                ? 'var(--charge-pos)'
                : 'var(--charge-neg)';
        }
    }

    function updateEmptyState() {
        emptyState.style.display = charges.length === 0 ? 'flex' : 'none';
    }

    // ═══════════════════ DATA LOG ═══════════════════

    // Save Reading button — logs ALL current charge pairs once + show solution
    function saveReading() {
        if (charges.length < 2) return;

        // Create a unique reading ID and snapshot the current charges
        const readingId = Date.now() + '_' + Math.random().toString(36).slice(2, 8);
        const chargesSnapshot = charges.map(c => ({ ...c })); // deep-clone each charge

        let solutionHTML = '';
        let pairNum = 0;

        for (let i = 0; i < charges.length; i++) {
            for (let j = i + 1; j < charges.length; j++) {
                const c1 = charges[i];
                const c2 = charges[j];
                const dx = c2.x - c1.x;
                const dy = c2.y - c1.y;
                const dist = Math.hypot(dx, dy);
                const rMeters = pixelsToMeters(dist);
                const force = coulombForce(c1.charge, c2.charge, rMeters);
                const isAttract = c1.sign !== c2.sign;
                const idx1 = charges.indexOf(c1) + 1;
                const idx2 = charges.indexOf(c2) + 1;

                const q1Val = c1.charge * c1.sign;
                const q2Val = c2.charge * c2.sign;
                const pe = potentialEnergy(q1Val, q2Val, rMeters);
                const angle = Math.atan2(-dy, dx) * (180 / Math.PI);
                const angleFinal = ((angle % 360) + 360) % 360;

                const entry = {
                    num: dataLog.length + 1,
                    pair: `q${idx1}↔q${idx2}`,
                    q1: q1Val,
                    q2: q2Val,
                    r: rMeters,
                    f: force,
                    type: isAttract ? 'attract' : 'repel',
                    readingId: readingId,
                };

                dataLog.push(entry);
                if (dataLog.length > MAX_LOG_ROWS) dataLog.shift();

                graphPoints.push({ r: rMeters, f: force, type: entry.type });
                if (graphPoints.length > 200) graphPoints.shift();

                // ── Build solution card for this pair ──
                pairNum++;
                const typeClass = isAttract ? 'solution-pair-type--attract' : 'solution-pair-type--repel';
                const typeLabel = isAttract ? 'Attraction' : 'Repulsion';

                // Format values for display
                const q1Display = formatSciSolution(q1Val);
                const q2Display = formatSciSolution(q2Val);
                const q1Abs = formatSciSolution(Math.abs(q1Val));
                const q2Abs = formatSciSolution(Math.abs(q2Val));
                const rDisplay = rMeters.toFixed(4);
                const r2Display = (rMeters * rMeters).toExponential(4);
                const productDisplay = formatSciSolution(Math.abs(q1Val) * Math.abs(q2Val));
                const numeratorVal = K * Math.abs(q1Val) * Math.abs(q2Val);
                const numeratorDisplay = formatSciSolution(numeratorVal);
                const forceDisplay = formatSciSolution(force);
                const peDisplay = formatSciSolution(pe);

                solutionHTML += `
                <div class="solution-pair-card">
                    <div class="solution-pair-header">
                        <span class="solution-pair-label">
                            <span class="material-symbols-outlined">bolt</span>
                            Pair ${pairNum}: q${idx1} ↔ q${idx2}
                        </span>
                        <span class="solution-pair-type ${typeClass}">${typeLabel}</span>
                    </div>
                    <div class="solution-pair-body">
                        <!-- Step 1: Given / Identify -->
                        <div class="solution-step">
                            <div class="solution-step-label">
                                <span class="step-num">1</span> Given / Identify
                            </div>
                            <div class="solution-step-content">
                                <span class="formula-highlight">k</span> = 8.9875 × 10<sup>9</sup> N·m²/C²<br>
                                <span class="formula-highlight">q${idx1}</span> = <span class="value-highlight">${q1Display} C</span><br>
                                <span class="formula-highlight">q${idx2}</span> = <span class="value-highlight">${q2Display} C</span><br>
                                <span class="formula-highlight">r</span> = <span class="value-highlight">${rDisplay} m</span>
                            </div>
                        </div>

                        <!-- Step 2: Formula -->
                        <div class="solution-step">
                            <div class="solution-step-label">
                                <span class="step-num">2</span> Formula (Coulomb's Law)
                            </div>
                            <div class="solution-step-content">
                                <span class="formula-highlight">F = k · |q₁ · q₂| / r²</span>
                            </div>
                        </div>

                        <!-- Step 3: Substitution -->
                        <div class="solution-step">
                            <div class="solution-step-label">
                                <span class="step-num">3</span> Substitution
                            </div>
                            <div class="solution-step-content">
                                F = (8.9875 × 10<sup>9</sup>) · |${q1Abs} × ${q2Abs}| / (${rDisplay})²
                            </div>
                        </div>

                        <!-- Step 4: Computation -->
                        <div class="solution-step">
                            <div class="solution-step-label">
                                <span class="step-num">4</span> Computation
                            </div>
                            <div class="solution-step-content">
                                |q₁ · q₂| = ${q1Abs} × ${q2Abs} = <span class="value-highlight">${productDisplay} C²</span><br>
                                r² = (${rDisplay})² = <span class="value-highlight">${r2Display} m²</span><br>
                                k · |q₁q₂| = (8.9875 × 10<sup>9</sup>)(${productDisplay}) = <span class="value-highlight">${numeratorDisplay}</span><br>
                                F = ${numeratorDisplay} / ${r2Display}
                            </div>
                        </div>

                        <div class="solution-divider"></div>

                        <!-- Step 5: Result -->
                        <div class="solution-step">
                            <div class="solution-step-label">
                                <span class="step-num">5</span> Result — Electrostatic Force
                            </div>
                            <div class="solution-step-content">
                                <span class="result-highlight">F = ${forceDisplay} N</span><br>
                                Direction: ${angleFinal.toFixed(2)}°<br>
                                Type: <strong>${typeLabel}</strong> — ${isAttract
                                    ? 'opposite signs attract (q₁ and q₂ pull toward each other)'
                                    : 'same signs repel (q₁ and q₂ push apart)'}
                            </div>
                        </div>

                        <div class="solution-divider"></div>

                        <!-- Step 6: Potential Energy -->
                        <div class="solution-step">
                            <div class="solution-step-label">
                                <span class="step-num">6</span> Electrostatic Potential Energy
                            </div>
                            <div class="solution-step-content">
                                <span class="formula-highlight">U = k · q₁ · q₂ / r</span><br>
                                U = (8.9875 × 10<sup>9</sup>)(${q1Display})(${q2Display}) / ${rDisplay}<br>
                                <span class="result-highlight ${pe >= 0 ? 'pe-positive' : 'pe-negative'}">U = ${peDisplay} J</span><br>
                                ${pe >= 0
                                    ? 'Positive U → repulsive system (energy needed to bring charges together)'
                                    : 'Negative U → attractive system (energy released when charges approach)'}
                            </div>
                        </div>
                    </div>
                </div>`;
            }
        }

        // Store the snapshot for this reading
        savedReadings.push({ id: readingId, chargesSnapshot, solutionHTML });

        renderDataLog();
        drawGraph();

        // Show solution overlay
        document.getElementById('solutionContent').innerHTML = solutionHTML;
        document.getElementById('solutionOverlay').style.display = 'flex';

        // Flash the button for feedback
        const btn = document.getElementById('btnSaveReading');
        btn.classList.remove('flash');
        void btn.offsetWidth; // trigger reflow
        btn.classList.add('flash');
    }

    // Format a number for solution display (scientific notation with HTML sup)
    function formatSciSolution(value) {
        if (value === 0) return '0';
        const abs = Math.abs(value);
        const sign = value < 0 ? '−' : '';
        if (abs >= 0.01 && abs < 1000) return `${sign}${abs.toFixed(4)}`;
        const exp = Math.floor(Math.log10(abs));
        const mantissa = abs / Math.pow(10, exp);
        return `${sign}${mantissa.toFixed(4)} × 10<sup>${exp}</sup>`;
    }

    function renderDataLog() {
        let html = '';
        for (let i = dataLog.length - 1; i >= 0; i--) {
            const e = dataLog[i];
            const isLatest = i === dataLog.length - 1;
            const typeClass = e.type === 'attract' ? 'type-badge--attract' : 'type-badge--repel';
            const typeLabel = e.type === 'attract' ? 'Attract' : 'Repel';
            html += `<tr class="data-log-row ${isLatest ? 'active-row' : ''}" onclick="window.__restoreReading('${e.readingId}')" title="Click to restore this reading">
                <td class="col-num">${String(e.num).padStart(3, '0')}</td>
                <td class="col-pair">${e.pair}</td>
                <td>${formatSciShort(e.q1)}</td>
                <td>${formatSciShort(e.q2)}</td>
                <td>${e.r.toFixed(3)}</td>
                <td class="col-f">${formatSciShort(e.f)}</td>
                <td class="col-type"><span class="type-badge ${typeClass}">${typeLabel}</span></td>
            </tr>`;
        }
        dataLogBody.innerHTML = html;
        entryCount.textContent = `${dataLog.length} Entries`;
    }

    // Restore simulation to a saved reading's state and show its solution
    function restoreReading(readingId) {
        const snapshot = savedReadings.find(s => s.id === readingId);
        if (!snapshot) return;

        // Restore charge positions from the snapshot
        charges = snapshot.chargesSnapshot.map(c => ({ ...c }));
        updateFocusPair();
        render();

        // Show the saved solution
        document.getElementById('solutionContent').innerHTML = snapshot.solutionHTML;
        document.getElementById('solutionOverlay').style.display = 'flex';
    }

    // Expose restore function globally for inline onclick
    window.__restoreReading = restoreReading;

    function clearLog() {
        dataLog = [];
        graphPoints = [];
        savedReadings = [];
        dataLogBody.innerHTML = '';
        entryCount.textContent = '0 Entries';
        drawGraph();
    }

    function exportCSV() {
        if (dataLog.length === 0) return;
        let csv = '#,Pair,q1 (C),q2 (C),r (m),F (N),Type\n';
        for (const e of dataLog) {
            csv += `${e.num},${e.pair},${e.q1.toExponential(3)},${e.q2.toExponential(3)},${e.r.toFixed(4)},${e.f.toExponential(4)},${e.type}\n`;
        }
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'coulombic_data_log.csv';
        a.click();
        URL.revokeObjectURL(url);
    }

    // ═══════════════════ GRAPH ═══════════════════

    function drawGraph() {
        const w = graphCanvasEl.width;
        const h = graphCanvasEl.height;
        const isDark = document.documentElement.dataset.theme !== 'light';

        graphCtx.clearRect(0, 0, w, h);

        // Margins
        const ml = 40, mr = 16, mt = 8, mb = 28;
        const pw = w - ml - mr;
        const ph = h - mt - mb;

        // Background
        graphCtx.fillStyle = isDark ? '#0F1219' : '#ffffff';
        graphCtx.fillRect(0, 0, w, h);

        // Determine axis ranges
        let rMin = 0.02, rMax = 0.6, fMax = 0.5;
        if (graphPoints.length > 0) {
            rMax = Math.max(0.3, ...graphPoints.map(p => p.r)) * 1.2;
            fMax = Math.max(0.1, ...graphPoints.map(p => p.f)) * 1.3;
        }

        // Grid lines
        graphCtx.strokeStyle = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)';
        graphCtx.lineWidth = 0.5;
        for (let i = 0; i <= 4; i++) {
            const y = mt + (ph * i / 4);
            graphCtx.beginPath();
            graphCtx.moveTo(ml, y);
            graphCtx.lineTo(ml + pw, y);
            graphCtx.stroke();

            const x = ml + (pw * i / 4);
            graphCtx.beginPath();
            graphCtx.moveTo(x, mt);
            graphCtx.lineTo(x, mt + ph);
            graphCtx.stroke();
        }

        // Axes
        graphCtx.strokeStyle = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)';
        graphCtx.lineWidth = 1;
        graphCtx.beginPath();
        graphCtx.moveTo(ml, mt);
        graphCtx.lineTo(ml, mt + ph);
        graphCtx.lineTo(ml + pw, mt + ph);
        graphCtx.stroke();

        // Axis labels
        graphCtx.font = '500 10px "Geist Mono"';
        graphCtx.fillStyle = isDark ? '#475569' : '#94a3b8';
        graphCtx.textAlign = 'center';
        graphCtx.fillText('r (m)', ml + pw / 2, h - 2);

        graphCtx.save();
        graphCtx.translate(10, mt + ph / 2);
        graphCtx.rotate(-Math.PI / 2);
        graphCtx.fillText('F (N)', 0, 0);
        graphCtx.restore();

        // Tick labels
        graphCtx.font = '400 9px "Geist Mono"';
        graphCtx.textAlign = 'right';
        for (let i = 0; i <= 4; i++) {
            const y = mt + ph - (ph * i / 4);
            const val = fMax * i / 4;
            graphCtx.fillText(val < 0.01 ? val.toExponential(0) : val.toFixed(2), ml - 4, y + 3);
        }
        graphCtx.textAlign = 'center';
        for (let i = 0; i <= 4; i++) {
            const x = ml + (pw * i / 4);
            const val = rMin + (rMax - rMin) * i / 4;
            graphCtx.fillText(val.toFixed(2), x, mt + ph + 14);
        }

        // Theoretical 1/r² curve (using focus pair charges)
        if (focusPair[0] && focusPair[1]) {
            const q1 = Math.abs(focusPair[0].charge);
            const q2 = Math.abs(focusPair[1].charge);
            graphCtx.setLineDash([5, 4]);
            graphCtx.strokeStyle = isDark ? 'rgba(245, 158, 11, 0.6)' : 'rgba(217, 119, 6, 0.6)';
            graphCtx.lineWidth = 1.5;
            graphCtx.beginPath();
            let first = true;
            for (let px = 0; px <= pw; px += 2) {
                const r = rMin + (rMax - rMin) * (px / pw);
                if (r <= 0.005) continue;
                const f = K * q1 * q2 / (r * r);
                const py = ph - (f / fMax) * ph;
                if (py < -20) continue;
                if (first) { graphCtx.moveTo(ml + px, mt + py); first = false; }
                else graphCtx.lineTo(ml + px, mt + py);
            }
            graphCtx.stroke();
            graphCtx.setLineDash([]);
        }

        // Data points (color-coded by type)
        for (const pt of graphPoints) {
            const px = ml + ((pt.r - rMin) / (rMax - rMin)) * pw;
            const py = mt + ph - (pt.f / fMax) * ph;
            if (px < ml || px > ml + pw || py < mt - 5) continue;

            const isAttract = pt.type === 'attract';
            graphCtx.shadowColor = isAttract
                ? (isDark ? 'rgba(59,130,246,0.5)' : 'rgba(37,99,235,0.4)')
                : (isDark ? 'rgba(239,68,68,0.5)' : 'rgba(220,38,38,0.4)');
            graphCtx.shadowBlur = 6;
            graphCtx.beginPath();
            graphCtx.arc(px, py, 3, 0, Math.PI * 2);
            graphCtx.fillStyle = isAttract
                ? (isDark ? '#60A5FA' : '#2563EB')
                : (isDark ? '#F87171' : '#DC2626');
            graphCtx.fill();
            graphCtx.shadowBlur = 0;
        }
    }

    // ═══════════════════ THEME TOGGLE ═══════════════════

    function toggleTheme() {
        const html = document.documentElement;
        const isDark = html.dataset.theme !== 'light';
        html.dataset.theme = isDark ? 'light' : 'dark';

        const icon = document.querySelector('.theme-icon');
        icon.textContent = isDark ? 'light_mode' : 'dark_mode';
        icon.style.transform = 'rotate(360deg)';
        setTimeout(() => { icon.style.transform = ''; }, 400);

        // Re-render with new theme
        setTimeout(() => render(), 50);
    }

    // Detect system preference on load
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        document.documentElement.dataset.theme = 'light';
        const icon = document.querySelector('.theme-icon');
        if (icon) icon.textContent = 'light_mode';
    }

    // ═══════════════════ UTILITIES ═══════════════════

    function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

    function roundRect(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
    }

    function formatSci(value, unit) {
        if (Math.abs(value) === 0) return `0 ${unit}`;
        const exp = Math.floor(Math.log10(Math.abs(value)));
        const mantissa = value / Math.pow(10, exp);
        if (exp === 0) return `${value.toFixed(3)} ${unit}`;
        return `${mantissa.toFixed(3)} × 10${superscriptNum(exp)} ${unit}`;
    }

    function formatSciHTML(value) {
        if (value === 0) return '0';
        const abs = Math.abs(value);
        const exp = Math.floor(Math.log10(abs));
        const mantissa = abs / Math.pow(10, exp);
        const sSign = value < 0 ? '−' : '+';
        return `${sSign}${mantissa.toFixed(2)} × 10<sup>${exp}</sup>`;
    }

    function formatSciShort(value) {
        if (value === 0) return '0';
        const sign = value >= 0 ? '+' : '−';
        const abs = Math.abs(value);
        if (abs >= 0.01 && abs < 1000) return `${sign}${abs.toFixed(3)}`;
        const exp = Math.floor(Math.log10(abs));
        const mantissa = abs / Math.pow(10, exp);
        return `${sign}${mantissa.toFixed(2)}×10${superscriptNum(exp)}`;
    }

    // Convert a number to Unicode superscript characters
    function superscriptNum(n) {
        const superDigits = {'0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹'};
        const str = Math.abs(n).toString();
        let result = n < 0 ? '⁻' : '';
        for (const ch of str) result += superDigits[ch] || ch;
        return result;
    }

    // ═══════════════════ START ═══════════════════
    window.addEventListener('DOMContentLoaded', init);
})();
